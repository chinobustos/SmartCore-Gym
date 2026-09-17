// Resuelve "quien es el que llama" en una route handler, a partir de la cookie
// de sesion y nunca del body. Antes `/api/mercadopago/subscribe` aceptaba el
// gymId que le mandaran: cualquiera podia generar suscripciones contra nuestra
// cuenta de Mercado Pago a nombre de un gimnasio ajeno.

import { createClient } from '@/utils/supabase/server';

export interface SessionGym {
  userId: string;
  email: string;
  gymId: string;
  gymName: string;
  subscriptionStatus: string;
  mpPreapprovalId: string | null;
}

export type SessionGymResult =
  | { ok: true; session: SessionGym }
  | { ok: false; status: number; error: string };

/**
 * La identidad sale de la sesion y el gimnasio de la tabla `users`, que el
 * usuario ya no puede reescribir (migracion 04). Se lee con la anon key y la
 * RLS puesta: si la policy no lo deja ver, nosotros tampoco.
 */
export async function resolveSessionGym(): Promise<SessionGymResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, status: 401, error: 'Necesitás iniciar sesión.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('gym_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile?.gym_id) {
    return { ok: false, status: 403, error: 'Tu cuenta no está vinculada a ningún gimnasio.' };
  }

  const { data: gym, error: gymError } = await supabase
    .from('gyms')
    .select('id, name, subscription_status, mp_preapproval_id')
    .eq('id', profile.gym_id)
    .maybeSingle();

  if (gymError || !gym) {
    return { ok: false, status: 404, error: 'No encontramos el gimnasio de tu cuenta.' };
  }

  return {
    ok: true,
    session: {
      userId: user.id,
      email: user.email || '',
      gymId: gym.id,
      gymName: gym.name,
      subscriptionStatus: gym.subscription_status,
      mpPreapprovalId: gym.mp_preapproval_id ?? null,
    },
  };
}
