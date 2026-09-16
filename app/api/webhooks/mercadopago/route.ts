import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Este webhook necesita Node (crypto) y la service role key: nunca Edge.
export const runtime = 'nodejs';

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const MP_API = 'https://api.mercadopago.com';

/**
 * Valida la firma del header `x-signature` de Mercado Pago.
 *
 * MP manda: x-signature: ts=<timestamp>,v1=<hmac>
 * El manifest a firmar es: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 * (los segmentos cuyo valor no llega se omiten por completo).
 */
/**
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

async function mpFetch(path: string) {
  const res = await fetch(`${MP_API}${path}`, {
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error('[mp-webhook] MP API error', path, res.status, await res.text().catch(() => ''));
    return null;
  }
  return res.json();
}

/** Traduce el status de la preapproval de MP a nuestro subscription_status. */
function mapStatus(mpStatus: string): 'active' | 'past_due' | 'canceled' | null {
  switch (mpStatus) {
    case 'authorized':
      return 'active';
    case 'paused':
      return 'past_due';
    case 'cancelled':
      return 'canceled';
    default:
      // 'pending' u otros: todavia no hay nada que aplicar.
      return null;
  }
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

  const signatureError = checkSignature(request, dataId);
  if (signatureError) {
    console.warn('[mp-webhook] Firma invalida, notificacion descartada:', signatureError);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const topic: string = body?.type || body?.topic || url.searchParams.get('type') || url.searchParams.get('topic') || '';

  if (!dataId) {
    console.warn('[mp-webhook] Notificacion sin id', { topic });
    return NextResponse.json({ received: true });
  }

  // Resolver la preapproval. El body de MP NO trae external_reference:
  // hay que ir a buscarlo a la API con el id de la notificacion.
  let preapproval: any = null;

  if (topic === 'subscription_preapproval') {
    preapproval = await mpFetch(`/preapproval/${dataId}`);
  } else if (topic === 'subscription_authorized_payment') {
    // Cobro recurrente: primero la cuota, de ahi salimos a la suscripcion.
    const authorizedPayment = await mpFetch(`/authorized_payments/${dataId}`);
    const preapprovalId = authorizedPayment?.preapproval_id;
    if (preapprovalId) preapproval = await mpFetch(`/preapproval/${preapprovalId}`);
  } else {
    // Eventos que no nos interesan: 200 para que MP no reintente.
    return NextResponse.json({ received: true, ignored: topic });
  }

  if (!preapproval) {
    return NextResponse.json({ received: true, resolved: false });
  }

  const gymId: string | undefined = preapproval.external_reference;
  const status = mapStatus(preapproval.status);

  if (!gymId || !status) {
    console.warn('[mp-webhook] Sin gym_id o status no accionable', {
      gymId,
      mpStatus: preapproval.status,
    });
    return NextResponse.json({ received: true, applied: false });
  }

  // Service role: el webhook no tiene sesion, y la RLS de `gyms` exige
  // id = current_user_gym_id(). Con la anon key el UPDATE matchea 0 filas.
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('gyms')
    .update({
      subscription_status: status,
      mp_preapproval_id: preapproval.id,
      current_period_end: preapproval.next_payment_date ?? null,
    })
    .eq('id', gymId)
    .select('id');

  if (error) {
    console.error('[mp-webhook] Error actualizando el gym', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (!data || data.length === 0) {
    console.warn('[mp-webhook] Ningun gym coincide con external_reference', gymId);
    return NextResponse.json({ received: true, applied: false });
  }

  console.log('[mp-webhook] Gym actualizado', { gymId, status });
  return NextResponse.json({ received: true, applied: true });
}
