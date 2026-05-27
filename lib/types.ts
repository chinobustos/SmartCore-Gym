export type MemberStatus = 'active' | 'inactive' | 'expired';
export type PlanType = 'monthly' | 'quarterly' | 'daily';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface Member {
  id: string;
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

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface Payment {
  id: string;
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
  memberId: string;
  memberName: string;
  memberPlan: string;
  checkInTime: string;
  date: string;
}

export interface InventoryItem {
  id: string;
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
  classId: string;
  memberId: string;
  memberName: string;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'attended';
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  paymentMethod?: string;
}

