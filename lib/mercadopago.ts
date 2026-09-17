// Utilities for Mercado Pago Subscriptions (Preapproval)

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

const MP_API = 'https://api.mercadopago.com';

/** Precio unico del plan, en pesos. Se fija aca y nunca llega desde el cliente. */
export const SUBSCRIPTION_AMOUNT = 60000;
export const SUBSCRIPTION_CURRENCY = 'ARS';

/** Lo que devuelve MP en `/preapproval`, recortado a lo que usamos. */
export interface Preapproval {
  id: string;
  status: string;
  external_reference?: string;
  next_payment_date?: string | null;
  init_point?: string;
  payer_email?: string;
}

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

export class MercadoPagoError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = 'MercadoPagoError';
    this.status = status;
  }
}

function assertToken() {
  if (!MP_ACCESS_TOKEN) {
    throw new MercadoPagoError('MERCADOPAGO_ACCESS_TOKEN no está configurado.', 500);
  }
}

/**
 * Llama a la API de MP. Devuelve `null` cuando la respuesta no es 2xx, para
 * que quien llama decida si eso es un error o simplemente "no existe": el
 * webhook prefiere seguir y devolver 200, las rutas de usuario prefieren
 * cortar. El detalle siempre queda en el log.
 */
export async function mpFetch<T = any>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T | null> {
  assertToken();

  const res = await fetch(`${MP_API}${path}`, {
    method: init?.method || 'GET',
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('[mercadopago] API error', init?.method || 'GET', path, res.status, detail);
    return null;
  }

  return (await res.json().catch(() => null)) as T | null;
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
  amount = SUBSCRIPTION_AMOUNT,
  currency = SUBSCRIPTION_CURRENCY,
  backUrl,
}: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
  // Sin token no simulamos nada: el estado de la suscripcion solo puede
  // cambiarlo el webhook de Mercado Pago.
  assertToken();

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
    back_url: backUrl || `${siteUrl}/billing?status=pending`,
    status: 'pending',
  };

  const data = await mpFetch<any>('/preapproval', { method: 'POST', body });

  if (!data) {
    throw new MercadoPagoError('Error al comunicarse con Mercado Pago.');
  }

  if (!data.init_point) {
    console.error('[mercadopago] Respuesta sin init_point:', data);
    throw new MercadoPagoError('Mercado Pago no devolvió un link de pago.');
  }

  return {
    init_point: data.init_point,
    id: data.id,
  };
}

/** Trae una preapproval por id. `null` si MP no la reconoce. */
export function getPreapproval(id: string): Promise<Preapproval | null> {
  return mpFetch<Preapproval>(`/preapproval/${encodeURIComponent(id)}`);
}

/**
 * Todas las preapprovals de un gimnasio, de la mas nueva a la mas vieja.
 *
 * Es la red de seguridad de todo el flujo: el `external_reference` es el unico
 * hilo que une un cobro de MP con una fila nuestra, asi que mientras se pueda
 * preguntar por el, un webhook perdido no deja al gimnasio colgado.
 */
export async function findPreapprovalsByGym(gymId: string): Promise<Preapproval[]> {
  const data = await mpFetch<{ results?: Preapproval[] }>(
    `/preapproval/search?external_reference=${encodeURIComponent(gymId)}&sort=date_created&criteria=desc&limit=20`
  );
  return data?.results ?? [];
}

/** Cobro recurrente -> la suscripcion de la que salio. */
export async function getPreapprovalFromAuthorizedPayment(
  authorizedPaymentId: string
): Promise<Preapproval | null> {
  const payment = await mpFetch<{ preapproval_id?: string }>(
    `/authorized_payments/${encodeURIComponent(authorizedPaymentId)}`
  );
  if (!payment?.preapproval_id) return null;
  return getPreapproval(payment.preapproval_id);
}

/** Da de baja la suscripcion en MP. Devuelve la preapproval ya actualizada. */
export async function cancelPreapproval(id: string): Promise<Preapproval | null> {
  return mpFetch<Preapproval>(`/preapproval/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: { status: 'cancelled' },
  });
}
