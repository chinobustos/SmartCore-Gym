// Estado de la suscripcion de un gimnasio: lo unico que puede cambiarlo es el
// servidor, con la service role key. Lo comparten el webhook de Mercado Pago y
// la ruta de reconciliacion manual, para que las dos apliquen exactamente el
// mismo criterio.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Preapproval } from '@/lib/mercadopago';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

/**
 * Cliente con service role: el webhook no tiene sesion, y despues de la
 * migracion 04 ni siquiera un usuario logueado puede escribir las columnas de
 * suscripcion. Solo se usa en el servidor.
 */
export function createAdminClient(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Traduce el status de la preapproval de MP a nuestro subscription_status. */
export function mapStatus(mpStatus: string | undefined): SubscriptionStatus | null {
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

/**
 * De todas las preapprovals de un gimnasio, la que manda.
 *
 * Un gimnasio puede acumular varias (un checkout abandonado deja una `pending`
 * para siempre). Vale la mejor: una suscripcion viva no puede quedar tapada
 * por el resto.
 */
const PRIORITY: Record<string, number> = {
  authorized: 4,
  paused: 3,
  pending: 2,
  cancelled: 1,
};

export function pickRelevantPreapproval(list: Preapproval[]): Preapproval | null {
  if (!list.length) return null;
  return [...list].sort(
    (a, b) => (PRIORITY[b.status] ?? 0) - (PRIORITY[a.status] ?? 0)
  )[0];
}

export interface ApplyResult {
  applied: boolean;
  status: SubscriptionStatus | null;
  detail?: string;
}

/**
 * Baja a la base lo que dice Mercado Pago sobre una preapproval.
 *
 * Es idempotente a proposito: escribe estados absolutos, no incrementos, asi
 * que los reintentos de MP y una reconciliacion manual simultanea pueden
 * pisarse sin dejar nada raro.
 */
export async function applyPreapprovalToGym(
  admin: SupabaseClient,
  preapproval: Preapproval
): Promise<ApplyResult> {
  const gymId = preapproval.external_reference;
  if (!gymId) {
    return { applied: false, status: null, detail: 'la preapproval no trae external_reference' };
  }

  const { data: gym, error: readError } = await admin
    .from('gyms')
    .select('id, subscription_status, trial_ends_at')
    .eq('id', gymId)
    .maybeSingle();

  if (readError) {
    throw new Error(`No se pudo leer el gym ${gymId}: ${readError.message}`);
  }
  if (!gym) {
    return { applied: false, status: null, detail: `ningun gym coincide con ${gymId}` };
  }

  let status = mapStatus(preapproval.status);

  // Dar de baja una suscripcion durante la prueba gratis no deberia cortar la
  // prueba: el gimnasio pago cero y todavia le quedan dias.
  const trialEnd = gym.trial_ends_at ? new Date(gym.trial_ends_at) : null;
  const trialVigente =
    gym.subscription_status === 'trialing' && !!trialEnd && trialEnd > new Date();

  if (status === 'canceled' && trialVigente) {
    status = null;
  }

  // Aunque el estado no cambie (una preapproval `pending` es lo normal apenas
  // se crea), guardamos el id: es el hilo para reconciliar despues.
  const patch: Record<string, unknown> = { mp_preapproval_id: preapproval.id };

  if (status) {
    patch.subscription_status = status;
    patch.current_period_end = preapproval.next_payment_date ?? null;
  }

  const { error: writeError } = await admin.from('gyms').update(patch).eq('id', gymId);

  if (writeError) {
    throw new Error(`No se pudo actualizar el gym ${gymId}: ${writeError.message}`);
  }

  return {
    applied: !!status,
    status,
    detail: status ? undefined : `status ${preapproval.status} sin efecto`,
  };
}

export interface WebhookEvent {
  topic?: string | null;
  mp_data_id?: string | null;
  mp_preapproval_id?: string | null;
  mp_status?: string | null;
  gym_id?: string | null;
  applied_status?: string | null;
  outcome: 'applied' | 'ignored' | 'invalid_signature' | 'unresolved' | 'error';
  detail?: string | null;
}

/**
 * Deja constancia de la notificacion. Nunca tira: perder la bitacora no puede
 * hacer que le devolvamos un error a Mercado Pago y dispare reintentos.
 */
export async function logWebhookEvent(admin: SupabaseClient, event: WebhookEvent) {
  try {
    const { error } = await admin.from('mp_webhook_events').insert([event]);
    if (error) console.error('[mp-webhook] No se pudo registrar el evento:', error.message);
  } catch (err) {
    console.error('[mp-webhook] No se pudo registrar el evento:', err);
  }
}
