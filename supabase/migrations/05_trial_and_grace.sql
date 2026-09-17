-- Migration: 05_trial_and_grace.sql
--
-- La 04 dejo dos estados: se escribe o no se escribe. Falta el tercero. El
-- gimnasio que no paga entra en **modo lectura** y conserva sus datos 60 dias;
-- pasado ese plazo se le cierra el acceso, pero no se borra nada.
--
-- El reloj de los 60 dias se deriva, no se guarda:
--
--   inicio = coalesce(current_period_end, trial_ends_at)
--
-- Para el que nunca pago es el fin de la prueba; para el que pago y se cayo, la
-- fecha hasta la que estaba al dia. Derivarlo en vez de escribirlo en una
-- columna lo vuelve inmune a que un job no haya corrido: si el cron se cae una
-- semana, la fecha limite no se corre para adelante.
--
-- La misma logica esta en `lib/access.ts`, para que la interfaz se anticipe.
-- Si cambia una, cambia la otra. La que manda es esta.

-- ---------------------------------------------------------------------------
-- 1. Los tres niveles de acceso
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.gym_access_level(target_gym_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (
      SELECT CASE
        WHEN g.subscription_status = 'active' THEN 'full'
        WHEN g.subscription_status = 'trialing' AND g.trial_ends_at > NOW() THEN 'full'
        WHEN COALESCE(g.current_period_end, g.trial_ends_at) + INTERVAL '60 days' > NOW()
          THEN 'read_only'
        ELSE 'locked'
      END
      FROM public.gyms g
      WHERE g.id = target_gym_id
    ),
    -- Gimnasio inexistente: se trata como cerrado, nunca como abierto.
    'locked'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_gym_access_level()
RETURNS TEXT AS $$
  SELECT public.gym_access_level(public.current_user_gym_id());
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- 2. La lectura se corta recien al cerrarse el acceso
-- ---------------------------------------------------------------------------

-- Solo se tocan las policies de SELECT. Las de escritura las puso la 04 y ya
-- exigen `current_gym_is_active()`, que es exactamente el nivel 'full'.
--
-- `gyms` y `users` quedan legibles en cualquier nivel a proposito: sin eso, el
-- gimnasio cerrado no puede ni abrir /billing para volver a pagar.
DO $$
DECLARE
  t   TEXT;
  expr_lectura TEXT :=
    'gym_id = public.current_user_gym_id() AND public.current_gym_access_level() <> ''locked''';
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'members', 'payments', 'inventory', 'attendance',
    'transactions', 'classes', 'bookings', 'membership_plans'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      RAISE NOTICE 'Tabla % ausente, se saltea', t;
      CONTINUE;
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING (%s)',
      t || '_select', t, expr_lectura);

    RAISE NOTICE 'Lectura de % acotada al acceso vigente', t;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. El aviso por mail sale una sola vez
-- ---------------------------------------------------------------------------

ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS trial_reminder_sent_at TIMESTAMPTZ;

-- El cron solo puede escribir esta columna con la service role key: la 04 ya
-- le saco el UPDATE sobre `gyms` a anon y authenticated, y no se lo devolvemos.

-- ---------------------------------------------------------------------------
-- 4. A quien hay que avisarle hoy
-- ---------------------------------------------------------------------------

-- Devuelve el mail del dueño, que vive en `auth.users` y no en `public.users`.
-- SECURITY DEFINER porque el esquema `auth` no es accesible de otra forma.
-- `DISTINCT ON` para que un gimnasio con mas de un dueño reciba un solo aviso.
CREATE OR REPLACE FUNCTION public.gyms_needing_trial_reminder(days_before INT DEFAULT 3)
RETURNS TABLE (
  gym_id        UUID,
  gym_name      TEXT,
  email         TEXT,
  trial_ends_at TIMESTAMPTZ,
  days_left     INT
) AS $$
  SELECT DISTINCT ON (g.id)
    g.id,
    g.name,
    au.email::TEXT,
    g.trial_ends_at,
    CEIL(EXTRACT(EPOCH FROM (g.trial_ends_at - NOW())) / 86400)::INT
  FROM public.gyms g
  JOIN public.users pu ON pu.gym_id = g.id
  JOIN auth.users au   ON au.id = pu.id
  WHERE g.subscription_status = 'trialing'
    AND g.trial_ends_at > NOW()
    AND g.trial_ends_at <= NOW() + (days_before || ' days')::INTERVAL
    AND g.trial_reminder_sent_at IS NULL
    AND au.email IS NOT NULL
  ORDER BY g.id, (pu.role = 'owner') DESC, pu.created_at ASC;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Expone mails: solo la service role key, nunca el navegador.
REVOKE ALL ON FUNCTION public.gyms_needing_trial_reminder(INT) FROM PUBLIC, anon, authenticated;

-- PostgREST cachea el esquema y las firmas de las funciones RPC.
NOTIFY pgrst, 'reload schema';
