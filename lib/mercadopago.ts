// Utilities for Mercado Pago Subscriptions (Preapproval)

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

const MP_API = 'https://api.mercadopago.com';

export interface CreateSubscriptionParams {
  gymId: string;
  gymName: string;
  email: string;
  amount?: number;
  currency?: string;
  backUrl?: string;
}

export interface CreateSubscriptionResult {
  init_point: string;
  id: string;
}

/**
 * Crea una suscripcion (preapproval) para un gimnasio concreto.
 *
 * Usamos `/preapproval` y no `/preapproval_plan` a proposito: el plan es una
 * plantilla y las suscripciones que nacen de el no heredan nuestro
 * `external_reference`, asi que el webhook no tendria forma de saber que
 * gimnasio activar. La preapproval directa si lo lleva.
 */
export async function createSubscription({
  gymId,
  gymName,
  email,
  amount = 15000,
  currency = 'ARS',
  backUrl,
}: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
  // Sin token no simulamos nada: el estado de la suscripcion solo puede
  // cambiarlo el webhook de Mercado Pago.
  if (!MP_ACCESS_TOKEN) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado.');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const body = {
    reason: `Suscripción Mensual SmartCore Gym - ${gymName}`,
    external_reference: gymId,
    payer_email: email,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: amount,
      currency_id: currency,
    },
    back_url: backUrl || `${siteUrl}/billing?status=success`,
    status: 'pending',
  };

  const response = await fetch(`${MP_API}/preapproval`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('[mercadopago] Error creando la preapproval:', response.status, data);
    throw new Error(data?.message || 'Error al comunicarse con Mercado Pago.');
  }

  if (!data?.init_point) {
    console.error('[mercadopago] Respuesta sin init_point:', data);
    throw new Error('Mercado Pago no devolvió un link de pago.');
  }

  return {
    init_point: data.init_point,
    id: data.id,
  };
}
