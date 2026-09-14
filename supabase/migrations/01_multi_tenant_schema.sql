-- Migration: 01_multi_tenant_schema.sql
-- Enables Multi-Tenancy, Gyms, User Profiles, and RLS Policies for SmartCore Gym

-- 1. Gyms Table
CREATE TABLE IF NOT EXISTS gyms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  rubro TEXT,
  opening_hours JSONB,
  mp_preapproval_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trialing', -- 'trialing', 'active', 'past_due', 'canceled'
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Profiles Table (linking auth.users to gyms)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner',
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper function to get gym_id of current authenticated user
CREATE OR REPLACE FUNCTION public.current_user_gym_id()
RETURNS UUID AS $$
  SELECT gym_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Add gym_id column to operational tables if not already present

DO $$
BEGIN
  -- members
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='gym_id') THEN
    ALTER TABLE members ADD COLUMN gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;
  END IF;

  -- payments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='gym_id') THEN
    ALTER TABLE payments ADD COLUMN gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;
  END IF;

  -- inventory
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory' AND column_name='gym_id') THEN
    ALTER TABLE inventory ADD COLUMN gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;
  END IF;

  -- attendance
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='gym_id') THEN
    ALTER TABLE attendance ADD COLUMN gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;
  END IF;

  -- transactions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='gym_id') THEN
    ALTER TABLE transactions ADD COLUMN gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;
  END IF;

  -- classes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='gym_id') THEN
    ALTER TABLE classes ADD COLUMN gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;
  END IF;

  -- bookings
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='gym_id') THEN
    ALTER TABLE bookings ADD COLUMN gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Enable Row Level Security (RLS) on all tables

ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Gyms policies
DROP POLICY IF EXISTS "Users can view their own gym" ON gyms;
CREATE POLICY "Users can view their own gym" ON gyms
  FOR SELECT USING (id = public.current_user_gym_id());

DROP POLICY IF EXISTS "Users can update their own gym" ON gyms;
CREATE POLICY "Users can update their own gym" ON gyms
  FOR UPDATE USING (id = public.current_user_gym_id());

-- User profile policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Operational tables RLS policies (members, payments, inventory, attendance, transactions, classes, bookings)
DROP POLICY IF EXISTS "Gym members isolation" ON members;
CREATE POLICY "Gym members isolation" ON members FOR ALL USING (gym_id = public.current_user_gym_id());

DROP POLICY IF EXISTS "Gym payments isolation" ON payments;
CREATE POLICY "Gym payments isolation" ON payments FOR ALL USING (gym_id = public.current_user_gym_id());

DROP POLICY IF EXISTS "Gym inventory isolation" ON inventory;
CREATE POLICY "Gym inventory isolation" ON inventory FOR ALL USING (gym_id = public.current_user_gym_id());

DROP POLICY IF EXISTS "Gym attendance isolation" ON attendance;
CREATE POLICY "Gym attendance isolation" ON attendance FOR ALL USING (gym_id = public.current_user_gym_id());

DROP POLICY IF EXISTS "Gym transactions isolation" ON transactions;
CREATE POLICY "Gym transactions isolation" ON transactions FOR ALL USING (gym_id = public.current_user_gym_id());

DROP POLICY IF EXISTS "Gym classes isolation" ON classes;
CREATE POLICY "Gym classes isolation" ON classes FOR ALL USING (gym_id = public.current_user_gym_id());

DROP POLICY IF EXISTS "Gym bookings isolation" ON bookings;
CREATE POLICY "Gym bookings isolation" ON bookings FOR ALL USING (gym_id = public.current_user_gym_id());
