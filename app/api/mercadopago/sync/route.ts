import { NextResponse } from 'next/server';
import { findPreapprovalsByGym, MercadoPagoError } from '@/lib/mercadopago';
import { resolveSessionGym } from '@/lib/server-auth';
import {
  applyPreapprovalToGym,
  createAdminClient,
  logWebhookEvent,
  pickRelevantPreapproval,
} from '@/lib/subscription';

// Usa la service role key: nunca Edge.
export const runtime = 'nodejs';

/**
 * "Ya pagué, revisá": vuelve a preguntarle a Mercado Pago en que estado esta la
 * suscripcion del gimnasio y baja la respuesta a la base.
 *
 * Existe porque las notificaciones de MP se pierden. Sin esta ruta, un webhook
 * que no llega deja al gimnasio pagando y bloqueado, sin ninguna salida que no
 * sea que alguien toque la base a mano.
 */
export async function POST() {
  const auth = await resolveSessionGym();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { gymId } = auth.session;

  try {
    const admin = createAdminClient();
    const preapprovals = await findPreapprovalsByGym(gymId);
    const preapproval = pickRelevantPreapproval(preapprovals);

    if (!preapproval) {
      await logWebhookEvent(admin, {
        topic: 'manual_sync',
        gym_id: gymId,
        outcome: 'unresolved',
        detail: 'Mercado Pago no tiene ninguna suscripcion para este gym',
      });
      return NextResponse.json({
        found: false,
        message: 'No encontramos ninguna suscripción a tu nombre en Mercado Pago.',
      });
    }

    const result = await applyPreapprovalToGym(admin, preapproval);

    await logWebhookEvent(admin, {
      topic: 'manual_sync',
      mp_data_id: preapproval.id,
      mp_preapproval_id: preapproval.id,
      mp_status: preapproval.status,
      gym_id: gymId,
      applied_status: result.status,
      outcome: result.applied ? 'applied' : 'ignored',
      detail: result.detail,
    });

    return NextResponse.json({
      found: true,
      applied: result.applied,
      status: result.status,
      mpStatus: preapproval.status,
      message: result.applied
        ? 'Listo, tu suscripción quedó al día.'
        : preapproval.status === 'pending'
        ? 'Tu suscripción todavía figura como pendiente en Mercado Pago. Si acabás de pagar, probá de nuevo en un minuto.'
        : 'Consultamos Mercado Pago y no había nada nuevo para aplicar.',
    });
  } catch (error: any) {
    const status = error instanceof MercadoPagoError ? error.status : 500;
    console.error('[sync] Error reconciliando la suscripcion:', error);
    return NextResponse.json(
      { error: error?.message || 'No pudimos consultar Mercado Pago.' },
      { status }
    );
  }
}
