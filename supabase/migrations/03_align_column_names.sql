-- Migration: 03_align_column_names.sql
--
-- `schema.sql` declaro las columnas en camelCase pero sin comillas, y Postgres
-- pliega los identificadores sin comillas a minusculas: en la base quedaron
-- `memberid`, `duedate`, `paymentmethod`. El cliente de Supabase las pide con
-- el nombre que declara `lib/types.ts`, y PostgREST distingue mayusculas, asi
-- que cada lectura devolvia `undefined` y cada escritura fallaba:
--
--   select=memberName   -> 400  column payments.memberName does not exist
--   patch paymentMethod -> 400  Could not find the 'paymentMethod' column
--
-- No se noto porque la base todavia esta vacia. Esta migracion renombra las
-- columnas al camelCase que el codigo espera, entre comillas para que esta vez
-- si se respete. Es solo metadata: indices, claves foraneas y policies siguen
-- apuntando a la misma columna.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('members',      'startdate',     'startDate'),
      ('payments',     'memberid',      'memberId'),
      ('payments',     'membername',    'memberName'),
      ('payments',     'duedate',       'dueDate'),
      ('attendance',   'memberid',      'memberId'),
      ('attendance',   'membername',    'memberName'),
      ('attendance',   'memberplan',    'memberPlan'),
      ('attendance',   'checkintime',   'checkInTime'),
      ('inventory',    'minstock',      'minStock'),
      ('bookings',     'classid',       'classId'),
      ('bookings',     'memberid',      'memberId'),
      ('bookings',     'membername',    'memberName'),
      ('bookings',     'bookingdate',   'bookingDate'),
      ('transactions', 'paymentmethod', 'paymentMethod')
    ) AS t(tbl, old_name, new_name)
  LOOP
    -- Idempotente: solo renombra si la vieja existe y la nueva todavia no.
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.tbl AND column_name = r.old_name
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.tbl AND column_name = r.new_name
    ) THEN
      EXECUTE format('ALTER TABLE public.%I RENAME COLUMN %I TO %I', r.tbl, r.old_name, r.new_name);
      RAISE NOTICE 'Renombrada %.% -> %', r.tbl, r.old_name, r.new_name;
    END IF;
  END LOOP;
END $$;

-- `autoRenew` nunca llego a crearse en la base. La pantalla de Membresias la
-- lee en la tabla de pagos y la escribe desde el toggle "Auto-Renov.".
ALTER TABLE members  ADD COLUMN IF NOT EXISTS "autoRenew" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS "autoRenew" BOOLEAN NOT NULL DEFAULT false;

-- PostgREST cachea el esquema: sin esto sigue respondiendo con los nombres viejos.
NOTIFY pgrst, 'reload schema';
