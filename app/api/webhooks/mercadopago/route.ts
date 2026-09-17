import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPreapproval, getPreapprovalFromAuthorizedPayment, type Preapproval } from '@/lib/mercadopago';
import { applyPreapprovalToGym, createAdminClient, logWebhookEvent } from '@/lib/subscription';

// Este webhook necesita Node (crypto) y la service role key: nunca Edge.
export const runtime = 'nodejs';

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Valida la firma del header `x-signature` de Mercado Pago.
 *
 * MP manda: x-signature: ts=<timestamp>,v1=<hmac>
 * El manifest a firmar es: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 * (los segmentos cuyo valor no llega se omiten por completo).
 *
 * `null` = firma valida. Si no, devuelve el motivo, que se loguea. Distinguir
 * "no vino firma" de "no coincide" importa: se arreglan distinto y desde
 * afuera los dos se veian igual.
 */
function checkSignature(request: Request, dataId: string | null): string | null {
  const signature = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id');

  if (!signature) return 'la notificacion no trae header x-signature';

  const parts = signature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split('=', 2);
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return `x-signature sin ts o v1 (recibido: "${signature}")`;

  // MP exige el id en minusculas cuando es alfanumerico.
  let manifest = '';
  if (dataId) manifest += `id:${dataId.toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${ts};`;

  const expected = crypto.createHmac('sha256', MP_WEBHOOK_SECRET).update(manifest).digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(v1, 'utf8');
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return null;

  // Ni el manifest ni los hashes son secretos: el secreto es la clave con la
  // que se calculan, y esa no se loguea. De los hashes alcanza el prefijo.
  return (
    `hash distinto | manifest="${manifest}" | ` +
    `esperado=${expected.slice(0, 12)}... | recibido=${v1.slice(0, 12)}... | ` +
    `x-request-id=${requestId ? 'presente' : 'ausente'}`
  );
}

export async function POST(request: Request) {
  // Fallar cerrado: sin credenciales no procesamos nada.
  if (!MP_WEBHOOK_SECRET || !MP_ACCESS_TOKEN || !SERVICE_ROLE_KEY) {
    console.error('[mp-webhook] Faltan MERCADOPAGO_WEBHOOK_SECRET / MERCADOPAGO_ACCESS_TOKEN / SUPABASE_SERVICE_ROLE_KEY');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const url = new URL(request.url);
  const body = await request.json().catch(() => ({} as any));

  // El id llega por query (?data.id=) o en el body, segun el tipo de notificacion.
  const dataId: string | null =
    url.searchParams.get('data.id') || url.searchParams.get('id') || body?.data?.id || body?.id || null;

  const topic: string =
    body?.type || body?.topic || url.searchParams.get('type') || url.searchParams.get('topic') || '';

  const admin = createAdminClient();

  const signatureError = checkSignature(request, dataId);
  if (signatureError) {
    console.warn('[mp-webhook] Firma invalida, notificacion descartada:', signatureError);
    // Se registra: una firma que falla siempre suele ser el secreto mal
    // copiado, y sin rastro no hay forma de notarlo desde afuera.
    await logWebhookEvent(admin, {
      topic,
      mp_data_id: dataId,
      outcome: 'invalid_signature',
      detail: signatureError,
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (!dataId) {
    console.warn('[mp-webhook] Notificacion sin id', { topic });
    await logWebhookEvent(admin, { topic, outcome: 'ignored', detail: 'notificacion sin id' });
    return NextResponse.json({ received: true });
  }

  // Resolver la preapproval. El body de MP NO trae external_reference:
  // hay que ir a buscarlo a la API con el id de la notificacion.
  let preapproval: Preapproval | null = null;

  if (topic === 'subscription_preapproval') {
    preapproval = await getPreapproval(dataId);
  } else if (topic === 'subscription_authorized_payment') {
    // Cobro recurrente: primero la cuota, de ahi salimos a la suscripcion.
    preapproval = await getPreapprovalFromAuthorizedPayment(dataId);
  } else {
    // Eventos que no nos interesan: 200 para que MP no reintente.
    await logWebhookEvent(admin, {
      topic,
      mp_data_id: dataId,
      outcome: 'ignored',
      detail: 'topic fuera de alcance',
    });
    return NextResponse.json({ received: true, ignored: topic });
  }

  if (!preapproval) {
    await logWebhookEvent(admin, {
      topic,
      mp_data_id: dataId,
      outcome: 'unresolved',
      detail: 'no se pudo resolver la preapproval en la API de MP',
    });
    return NextResponse.json({ received: true, resolved: false });
  }

  try {
    const result = await applyPreapprovalToGym(admin, preapproval);

    await logWebhookEvent(admin, {
      topic,
      mp_data_id: dataId,
      mp_preapproval_id: preapproval.id,
      mp_status: preapproval.status,
      gym_id: preapproval.external_reference ?? null,
      applied_status: result.status,
      outcome: result.applied ? 'applied' : 'ignored',
      detail: result.detail,
    });

    if (result.applied) {
      console.log('[mp-webhook] Gym actualizado', {
        gymId: preapproval.external_reference,
        status: result.status,
      });
    }

    return NextResponse.json({ received: true, applied: result.applied });
  } catch (err: any) {
    console.error('[mp-webhook] Error aplicando la notificacion:', err);
    await logWebhookEvent(admin, {
      topic,
      mp_data_id: dataId,
      mp_preapproval_id: preapproval.id,
      mp_status: preapproval.status,
      gym_id: preapproval.external_reference ?? null,
      outcome: 'error',
      detail: err?.message ?? String(err),
    });
    // 500 a proposito: que MP reintente, porque el cobro es real y todavia no
    // quedo asentado.
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
