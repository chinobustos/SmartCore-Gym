export type MemberStatus = 'active' | 'inactive' | 'expired';
export type PlanType = 'monthly' | 'quarterly' | 'daily';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

export interface Gym {
  id: string;
  name: string;
  logoUrl?: string;
  rubro?: string;
  openingHours?: Record<string, string>;
  mpPreapprovalId?: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string;
  currentPeriodEnd?: string;
  createdAt?: string;
}

export interface GymUser {
  id: string;
  gymId: string;
  role: 'owner' | 'staff';
  fullName?: string;
  createdAt?: string;
}

export interface Member {
  id: string;
  gym_id?: string;
  name: string;
  dni: string;
  plan: PlanType;
  status: MemberStatus;
  startDate: string;
  email: string;
  phone: string;
  avatar: string;
  autoRenew: boolean;
}

/**
 * Plan de membresia que el gimnasio ofrece a sus socios.
 * La duracion se guarda en dias para poder calcular vencimientos;
 * el texto que se muestra ("30 dias") se deriva de ahi.
 */
export interface Plan {
  id: string;
  gymId?: string;
  name: string;
  durationDays: number;
  price: number;
  features: string[];
  popular?: boolean;
}

/** Campos que el usuario completa al crear o editar un plan. */
export type PlanInput = Omit<Plan, 'id' | 'gymId'>;

export interface Payment {
  id: string;
  gym_id?: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: PaymentStatus;
  plan: string;
  autoRenew?: boolean;
  paymentLink?: string;
}

export interface AttendanceRecord {
  id: string;
  gym_id?: string;
  memberId: string;
  memberName: string;
  memberPlan: string;
  checkInTime: string;
  date: string;
}

export interface InventoryItem {
  id: string;
  gym_id?: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  unit: string;
}

export interface WeeklyAttendance {
  day: string;
  count: number;
}

export interface GymClass {
  id: string;
  gym_id?: string;
  name: string;
  instructor: string;
  day: string;
  time: string;
  duration: string;
  capacity: number;
  enrolled: number;
  category: string;
  description?: string;
  color: string;
}

export interface Booking {
  id: string;
  gym_id?: string;
  classId: string;
  memberId: string;
  memberName: string;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'attended';
}

export interface Transaction {
  id: string;
  gym_id?: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  paymentMethod?: string;
}


