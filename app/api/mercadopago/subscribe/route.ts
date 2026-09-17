import { NextResponse } from 'next/server';
import {
  createSubscription,
  findPreapprovalsByGym,
  getPreapproval,
  MercadoPagoError,
  SUBSCRIPTION_AMOUNT,
  SUBSCRIPTION_CURRENCY,
} from '@/lib/mercadopago';
import { resolveSessionGym } from '@/lib/server-auth';
import { applyPreapprovalToGym, createAdminClient } from '@/lib/subscription';

// Escribe `mp_preapproval_id` con la service role key: nunca Edge.
export const runtime = 'nodejs';

export async function POST() {
  // El gimnasio sale de la sesion. El body no se lee: el monto, el mail y el
  // gymId son todos del servidor, asi que no hay nada que el cliente pueda
  // inclinar a su favor.
  const auth = await resolveSessionGym();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { gymId, gymName, email } = auth.session;

  if (!email) {
    return NextResponse.json(
      { error: 'Tu cuenta no tiene un email asociado para facturar.' },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();

    // Antes de crear nada, mirar que tiene el gimnasio en Mercado Pago. Sin
    // esto, dos clics generaban dos suscripciones y el gimnasio terminaba
    // pagando dos veces.
    const existentes = await findPreapprovalsByGym(gymId);

    const autorizada = existentes.find((p) => p.status === 'authorized');
    if (autorizada) {
      // La base se habia quedado atras (webhook perdido): la ponemos al dia
      // ahora y le evitamos al usuario un pago que ya hizo.
      await applyPreapprovalToGym(admin, autorizada);
      return NextResponse.json(
        {
          error: 'Ya tenés una suscripción activa. Actualizamos el estado de tu cuenta.',
          alreadyActive: true,
        },
        { status: 409 }
      );
    }

    // Un checkout abandonado deja una preapproval `pending` viva. Reusamos su
    // link en vez de dejar basura acumulada en la cuenta de MP.
    const pendiente = existentes.find((p) => p.status === 'pending');
    if (pendiente) {
      const completa = await getPreapproval(pendiente.id);
      if (completa?.init_point) {
        await applyPreapprovalToGym(admin, completa);
        return NextResponse.json({ init_point: completa.init_point, id: completa.id, reused: true });
      }
    }

    const subscription = await createSubscription({
      gymId,
      gymName,
      email,
      amount: SUBSCRIPTION_AMOUNT,
      currency: SUBSCRIPTION_CURRENCY,
    });

    // Guardar el id apenas se crea, sin esperar al webhook: si la notificacion
    // se pierde, este es el unico rastro de que el gimnasio inicio un pago.
    const { error } = await admin
      .from('gyms')
      .update({ mp_preapproval_id: subscription.id })
      .eq('id', gymId);

    if (error) {
      // No abortamos: la suscripcion ya existe en MP y el usuario tiene que
      // poder pagarla. El webhook la va a resolver igual por external_reference.
      console.error('[subscribe] No se pudo guardar el mp_preapproval_id:', error.message);
    }

    return NextResponse.json(subscription);
  } catch (error: any) {
    const status = error instanceof MercadoPagoError ? error.status : 500;
    console.error('[subscribe] Error generando la suscripcion:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar la suscripción.' },
      { status }
    );
  }
}
