// Niveles de acceso de un gimnasio segun el estado de su suscripcion.
//
// Esta logica esta duplicada en SQL (`gym_access_level()`, migracion 05) y no
// por descuido: la base es la que manda, porque el cliente habla directo con
// PostgREST y cualquier control que viva solo aca se saltea. Estas funciones
// son para que la interfaz se anticipe y muestre un mensaje decente en vez de
// dejar que Postgres devuelva un error crudo. Si cambia una, cambia la otra.

export type AccessLevel = 'full' | 'read_only' | 'locked';

/** Dias que el gimnasio conserva sus datos despues de caer en modo lectura. */
export const GRACE_DAYS = 60;

/** A cuantos dias del vencimiento avisamos por mail. */
export const TRIAL_REMINDER_DAYS = 3;

export interface SubscriptionSnapshot {
  subscriptionStatus?: string | null;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
}

const MS_POR_DIA = 1000 * 60 * 60 * 24;

function parse(fecha?: string | null): Date | null {
  if (!fecha) return null;
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Cuando empezo a correr el reloj del bloqueo.
 *
 * Para el que nunca pago es el fin de la prueba; para el que pago y se cayo,
 * la fecha hasta la que estaba al dia. Se deriva en vez de guardarse en una
 * columna para que no dependa de que un job haya corrido: si el cron falla una
 * semana, la fecha no se corre.
 */
export function bloqueoDesde(gym: SubscriptionSnapshot | null | undefined): Date | null {
  if (!gym) return null;
  return parse(gym.currentPeriodEnd) ?? parse(gym.trialEndsAt);
}

export function accessLevelFor(
  gym: SubscriptionSnapshot | null | undefined,
  ahora: Date = new Date()
): AccessLevel {
  if (!gym) return 'locked';

  if (gym.subscriptionStatus === 'active') return 'full';

  const trialEnd = parse(gym.trialEndsAt);
  if (gym.subscriptionStatus === 'trialing' && trialEnd && trialEnd > ahora) {
    return 'full';
  }

  const desde = bloqueoDesde(gym);
  if (!desde) return 'locked';

  const finDeGracia = new Date(desde.getTime() + GRACE_DAYS * MS_POR_DIA);
  return finDeGracia > ahora ? 'read_only' : 'locked';
}

/** Dias enteros que faltan para que termine la prueba. 0 si ya vencio. */
export function trialDaysLeft(
  gym: SubscriptionSnapshot | null | undefined,
  ahora: Date = new Date()
): number {
  const trialEnd = parse(gym?.trialEndsAt);
  if (!trialEnd) return 0;
  return Math.max(0, Math.ceil((trialEnd.getTime() - ahora.getTime()) / MS_POR_DIA));
}

/** Dias que faltan para que se cierre el acceso y se pierda la vista de los datos. */
export function graceDaysLeft(
  gym: SubscriptionSnapshot | null | undefined,
  ahora: Date = new Date()
): number {
  const desde = bloqueoDesde(gym);
  if (!desde) return 0;
  const fin = new Date(desde.getTime() + GRACE_DAYS * MS_POR_DIA);
  return Math.max(0, Math.ceil((fin.getTime() - ahora.getTime()) / MS_POR_DIA));
}

/** True mientras el gimnasio este en prueba y todavia le queden dias. */
export function enPruebaVigente(
  gym: SubscriptionSnapshot | null | undefined,
  ahora: Date = new Date()
): boolean {
  return gym?.subscriptionStatus === 'trialing' && trialDaysLeft(gym, ahora) > 0;
}
