-- Migration: 04_subscription_enforcement.sql
--
-- Hasta aca el cobro era voluntario. La policy "Users can update their own gym"
-- era `FOR UPDATE USING (id = current_user_gym_id())` sin WITH CHECK y sin
-- grants por columna: Postgres reutiliza USING como WITH CHECK, y esa expresion
-- sigue siendo verdadera despues de cambiar cualquier otra columna. O sea que
-- el dueño de un gimnasio podia, desde el navegador y con la anon key:
--
--   patch /rest/v1/gyms?id=eq.<su gym>  {"subscription_status": "active"}
--   patch /rest/v1/gyms?id=eq.<su gym>  {"trial_ends_at": "2030-01-01"}
--
-- y no pagar nunca. Lo mismo pasaba en `users`: podia moverse el `gym_id` a
-- otro gimnasio, que ademas de romper el aislamiento entre inquilinos le servia
-- para colgarse de una suscripcion ajena.
--
-- Ademas el unico control de suscripcion vivia en el middleware de Next, que
-- solo redirige la navegacion. Los datos se leen y escriben directo contra
-- PostgREST desde el browser (lib/context/GymContext.tsx), y la RLS filtraba
-- por gym_id y nada mas: un gimnasio vencido seguia operando con la pestaña ya
-- abierta o con la PWA instalada.
--
-- Esta migracion mueve el candado a la base, que es el unico lugar donde el
-- cliente no puede saltearlo.

-- ---------------------------------------------------------------------------
-- 1. Quien esta al dia
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER por el mismo motivo que `current_user_gym_id()`: corre como
-- el dueño de las tablas, que no esta sujeto a RLS, asi que puede responder sin
-- depender de las policies que despues la van a llamar.
CREATE OR REPLACE FUNCTION public.gym_is_active(target_gym_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.gyms g
    WHERE g.id = target_gym_id
      AND (
        g.subscription_status = 'active'
        -- La prueba gratis cuenta como al dia solo mientras no vencio.
        OR (g.subscription_status = 'trialing' AND g.trial_ends_at > NOW())
      )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_gym_is_active()
RETURNS BOOLEAN AS $$
  SELECT public.gym_is_active(public.current_user_gym_id());
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ---------------------------------------------------------------------------
-- 2. `gyms`: el estado de la suscripcion solo lo escribe el webhook
-- ---------------------------------------------------------------------------

-- Supabase le da todos los privilegios a `anon` y `authenticated` sobre las
-- tablas de `public`. Los sacamos y devolvemos solo las columnas de perfil.
-- `subscription_status`, `trial_ends_at`, `current_period_end` y
-- `mp_preapproval_id` quedan fuera: los escribe la service role key, que vive
-- nada mas que en el servidor.
REVOKE UPDATE, INSERT, DELETE ON public.gyms FROM anon, authenticated;
GRANT UPDATE (name, logo_url, rubro, opening_hours) ON public.gyms TO authenticated;

DROP POLICY IF EXISTS "Users can update their own gym" ON public.gyms;
CREATE POLICY "Users can update their own gym" ON public.gyms
  FOR UPDATE
  USING (id = public.current_user_gym_id())
  -- Explicito, aunque el grant por columna ya impide tocar `id`: sin WITH CHECK
  -- Postgres reutiliza el USING y la intencion deja de leerse en el codigo.
  WITH CHECK (id = public.current_user_gym_id());

-- El SELECT queda abierto a proposito: /billing necesita leer el gimnasio
-- justamente cuando la suscripcion esta vencida.

-- ---------------------------------------------------------------------------
-- 3. `users`: nadie se cambia de gimnasio ni se asciende de rol
-- ---------------------------------------------------------------------------

REVOKE UPDATE, INSERT, DELETE ON public.users FROM anon, authenticated;
GRANT UPDATE (full_name) ON public.users TO authenticated;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Tablas operativas: se leen siempre, se escriben solo al dia
-- ---------------------------------------------------------------------------

-- El corte es a proposito solo sobre la escritura. Un gimnasio vencido tiene
-- que poder entrar a ver y exportar lo suyo; lo que no puede es seguir
-- operando. Bloquear tambien la lectura seria retenerle los datos.
DO $$
DECLARE
  t    TEXT;
  pol  RECORD;
  expr_aislamiento TEXT := 'gym_id = public.current_user_gym_id()';
  expr_al_dia      TEXT := 'gym_id = public.current_user_gym_id() AND public.current_gym_is_active()';
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

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    -- Las policies viejas eran una sola `FOR ALL` por tabla, con nombres que no
    -- siguen un patron unico ("Gym members isolation", "Gym plans isolation").
    -- Las barremos por catalogo en vez de adivinar el nombre.
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING (%s)',
      t || '_select', t, expr_aislamiento);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (%s)',
      t || '_insert', t, expr_al_dia);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE USING (%s) WITH CHECK (%s)',
      t || '_update', t, expr_al_dia, expr_al_dia);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE USING (%s)',
      t || '_delete', t, expr_al_dia);

    RAISE NOTICE 'Policies de % reescritas', t;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 5. Registro de lo que manda Mercado Pago
-- ---------------------------------------------------------------------------

-- Sin esto, cuando un cobro no se aplica en produccion no queda mas rastro que
-- un console.log que ya se fue del buffer.
CREATE TABLE IF NOT EXISTS public.mp_webhook_events (
  id                BIGSERIAL PRIMARY KEY,
  topic             TEXT,
  mp_data_id        TEXT,
  mp_preapproval_id TEXT,
  mp_status         TEXT,
  -- Sin clave foranea a proposito: uno de los casos que mas importa registrar
  -- es justamente el `external_reference` que no corresponde a ningun gym, y
  -- una FK haria fallar el INSERT precisamente ahi.
  gym_id            UUID,
  applied_status    TEXT,
  -- 'applied' | 'ignored' | 'invalid_signature' | 'unresolved' | 'error'
  outcome           TEXT NOT NULL,
  detail            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mp_webhook_events_gym_idx
  ON public.mp_webhook_events (gym_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mp_webhook_events_created_idx
  ON public.mp_webhook_events (created_at DESC);

ALTER TABLE public.mp_webhook_events ENABLE ROW LEVEL SECURITY;

-- Sin policies y sin grants: es una bitacora de servidor. La service role key
-- ignora la RLS, y nadie mas tiene por que leerla.
REVOKE ALL ON public.mp_webhook_events FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.mp_webhook_events_id_seq FROM anon, authenticated;

-- PostgREST cachea el esquema: sin esto sigue sirviendo los permisos viejos.
NOTIFY pgrst, 'reload schema';
