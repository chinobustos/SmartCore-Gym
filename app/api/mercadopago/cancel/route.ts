import { NextResponse } from 'next/server';
import { cancelPreapproval, findPreapprovalsByGym, MercadoPagoError } from '@/lib/mercadopago';
import { resolveSessionGym } from '@/lib/server-auth';
import { applyPreapprovalToGym, createAdminClient, logWebhookEvent } from '@/lib/subscription';

// Usa la service role key: nunca Edge.
export const runtime = 'nodejs';

/**
 * Da de baja la suscripcion del gimnasio que hace el pedido.
 *
 * El id no se acepta por parametro: se resuelve desde la sesion y se confirma
 * contra Mercado Pago que la preapproval sea de este gimnasio, asi nadie puede
 * cancelar la de otro.
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
    const vigente = preapprovals.find(
      (p) => p.status === 'authorized' || p.status === 'paused' || p.status === 'pending'
    );

    if (!vigente) {
      return NextResponse.json(
        { error: 'No encontramos ninguna suscripción activa para dar de baja.' },
        { status: 404 }
      );
    }

    const cancelada = await cancelPreapproval(vigente.id);

    if (!cancelada) {
      return NextResponse.json(
        { error: 'Mercado Pago rechazó la baja. Probá de nuevo en unos minutos.' },
        { status: 502 }
      );
    }

    const result = await applyPreapprovalToGym(admin, cancelada);

    await logWebhookEvent(admin, {
      topic: 'manual_cancel',
      mp_data_id: cancelada.id,
      mp_preapproval_id: cancelada.id,
      mp_status: cancelada.status,
      gym_id: gymId,
      applied_status: result.status,
      outcome: result.applied ? 'applied' : 'ignored',
      detail: result.detail,
    });

    return NextResponse.json({
      canceled: true,
      status: result.status,
      message: result.applied
        ? 'Tu suscripción quedó dada de baja.'
        : 'Dimos de baja la suscripción. Tu prueba gratuita sigue vigente hasta que venza.',
    });
  } catch (error: any) {
    const status = error instanceof MercadoPagoError ? error.status : 500;
    console.error('[cancel] Error cancelando la suscripcion:', error);
    return NextResponse.json(
      { error: error?.message || 'No pudimos cancelar la suscripción.' },
      { status }
    );
  }
}
