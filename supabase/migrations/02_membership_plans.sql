-- Planes de membresia por gimnasio.
-- Reemplaza los planes hardcodeados que vivian en lib/data/mockData.ts:
-- cada gimnasio define los suyos.

CREATE TABLE IF NOT EXISTS membership_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id        UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  price         NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  features      TEXT[] NOT NULL DEFAULT '{}',
  popular       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS membership_plans_gym_id_idx ON membership_plans (gym_id);

ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

-- Mismo patron que members/payments/inventory: FOR ALL con USING.
-- Postgres reutiliza la expresion de USING como WITH CHECK cuando esta no
-- se declara, de modo que el INSERT tambien queda cubierto.
DROP POLICY IF EXISTS "Gym plans isolation" ON membership_plans;
CREATE POLICY "Gym plans isolation" ON membership_plans
  FOR ALL USING (gym_id = public.current_user_gym_id());
