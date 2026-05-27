-- Schema for SIST. GYN Gym Management System

-- Members Table
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL, -- 'monthly', 'quarterly', 'daily'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'expired'
  startDate DATE DEFAULT CURRENT_DATE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT, -- Initials or URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memberId UUID REFERENCES members(id) ON DELETE CASCADE,
  memberName TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  dueDate DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'paid', 'pending', 'overdue'
  plan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  minStock INTEGER NOT NULL DEFAULT 5,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unidades',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  memberId UUID REFERENCES members(id) ON DELETE SET NULL,
  memberName TEXT NOT NULL,
  memberPlan TEXT NOT NULL,
  checkInTime TEXT NOT NULL, -- Format HH:mm
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'income', 'expense'
  category TEXT NOT NULL,
  paymentMethod TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  instructor TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  duration TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  enrolled INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classId UUID REFERENCES classes(id) ON DELETE CASCADE,
  memberId UUID REFERENCES members(id) ON DELETE CASCADE,
  memberName TEXT NOT NULL,
  bookingDate DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'attended'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

