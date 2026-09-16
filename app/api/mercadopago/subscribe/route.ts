import { NextResponse } from 'next/server';
import { createSubscription } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    const { gymId, gymName, email } = await request.json();

    if (!gymId || !gymName || !email) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos para iniciar la suscripción.' },
        { status: 400 }
      );
    }

    const subscription = await createSubscription({
      gymId,
      gymName,
      email,
      amount: 60000, // Precio de suscripción mensual
      currency: 'ARS',
    });

    return NextResponse.json(subscription);
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar la preferencia de suscripción.' },
      { status: 500 }
    );
  }
}
