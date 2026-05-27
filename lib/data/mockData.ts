import type { Member, Plan, Payment, AttendanceRecord, InventoryItem, WeeklyAttendance, GymClass, Booking, Transaction } from '@/lib/types';

export const mockMembers: Member[] = [
  { id: '1', name: 'Carlos Mendoza', dni: '28543210', plan: 'monthly', status: 'active', startDate: '2024-01-15', email: 'carlos.m@email.com', phone: '+54 9 11 5555-1234', avatar: 'CM', autoRenew: true },
  { id: '2', name: 'Laura Fernández', dni: '31098765', plan: 'quarterly', status: 'active', startDate: '2024-02-01', email: 'laura.f@email.com', phone: '+54 9 11 5555-2345', avatar: 'LF', autoRenew: true },
  { id: '3', name: 'Martín González', dni: '25678901', plan: 'monthly', status: 'expired', startDate: '2023-11-10', email: 'martin.g@email.com', phone: '+54 9 11 5555-3456', avatar: 'MG', autoRenew: false },
  { id: '4', name: 'Sofía Ramírez', dni: '33456789', plan: 'daily', status: 'active', startDate: '2024-04-05', email: 'sofia.r@email.com', phone: '+54 9 11 5555-4567', avatar: 'SR', autoRenew: false },
  { id: '5', name: 'Diego Torres', dni: '29012345', plan: 'quarterly', status: 'inactive', startDate: '2024-01-20', email: 'diego.t@email.com', phone: '+54 9 11 5555-5678', avatar: 'DT', autoRenew: false },
  { id: '6', name: 'Valentina López', dni: '34567890', plan: 'monthly', status: 'active', startDate: '2024-03-12', email: 'vale.l@email.com', phone: '+54 9 11 5555-6789', avatar: 'VL', autoRenew: true },
  { id: '7', name: 'Rodrigo Sánchez', dni: '27890123', plan: 'monthly', status: 'active', startDate: '2024-02-28', email: 'rodri.s@email.com', phone: '+54 9 11 5555-7890', avatar: 'RS', autoRenew: true },
  { id: '8', name: 'Camila Herrera', dni: '32345678', plan: 'quarterly', status: 'active', startDate: '2024-01-08', email: 'cami.h@email.com', phone: '+54 9 11 5555-8901', avatar: 'CH', autoRenew: false },
  { id: '9', name: 'Federico Álvarez', dni: '26789012', plan: 'monthly', status: 'expired', startDate: '2023-12-01', email: 'fede.a@email.com', phone: '+54 9 11 5555-9012', avatar: 'FA', autoRenew: false },
  { id: '10', name: 'Lucía Moreno', dni: '35678901', plan: 'daily', status: 'active', startDate: '2024-04-10', email: 'lucia.m@email.com', phone: '+54 9 11 5555-0123', avatar: 'LM', autoRenew: false },
  { id: '11', name: 'Tomás Ruiz', dni: '30123456', plan: 'monthly', status: 'active', startDate: '2024-03-20', email: 'tomas.r@email.com', phone: '+54 9 11 5555-1111', avatar: 'TR', autoRenew: true },
  { id: '12', name: 'Agustina Pérez', dni: '28901234', plan: 'quarterly', status: 'active', startDate: '2024-02-14', email: 'agus.p@email.com', phone: '+54 9 11 5555-2222', avatar: 'AP', autoRenew: true },
];

export const mockPlans: Plan[] = [
  { id: '1', name: 'Pase Diario', type: 'daily', duration: '1 día', price: 1500, features: ['Acceso completo 1 día', 'Vestuarios', 'Área cardio'] },
  { id: '2', name: 'Membresía Mensual', type: 'monthly', duration: '30 días', price: 12000, features: ['Acceso ilimitado', 'Vestuarios', 'Área cardio', 'Sala de pesas', 'Clases grupales'], popular: true },
  { id: '3', name: 'Plan Trimestral', type: 'quarterly', duration: '90 días', price: 30000, features: ['Acceso ilimitado', 'Vestuarios', 'Área cardio', 'Sala de pesas', 'Clases grupales', 'Evaluación física', '2 sesiones con entrenador'] },
];

export const mockPayments: Payment[] = [
  { id: '1', memberId: '1', memberName: 'Carlos Mendoza', amount: 12000, date: '2024-04-01', dueDate: '2024-05-01', status: 'paid', plan: 'Mensual', autoRenew: true },
  { id: '2', memberId: '2', memberName: 'Laura Fernández', amount: 30000, date: '2024-02-01', dueDate: '2024-05-01', status: 'paid', plan: 'Trimestral', autoRenew: true },
  { id: '3', memberId: '3', memberName: 'Martín González', amount: 12000, date: '2024-03-10', dueDate: '2024-04-10', status: 'overdue', plan: 'Mensual', autoRenew: false, paymentLink: 'https://mpago.la/s/simulated-link-1' },
  { id: '4', memberId: '4', memberName: 'Sofía Ramírez', amount: 1500, date: '2024-04-05', dueDate: '2024-04-06', status: 'paid', plan: 'Diario', autoRenew: false },
  { id: '5', memberId: '5', memberName: 'Diego Torres', amount: 12000, date: '2024-03-20', dueDate: '2024-04-20', status: 'pending', plan: 'Mensual', autoRenew: false, paymentLink: 'https://mpago.la/s/simulated-link-2' },
  { id: '6', memberId: '6', memberName: 'Valentina López', amount: 12000, date: '2024-04-01', dueDate: '2024-05-01', status: 'paid', plan: 'Mensual', autoRenew: true },
  { id: '7', memberId: '7', memberName: 'Rodrigo Sánchez', amount: 12000, date: '2024-03-28', dueDate: '2024-04-28', status: 'paid', plan: 'Mensual', autoRenew: true },
  { id: '8', memberId: '8', memberName: 'Camila Herrera', amount: 30000, date: '2024-01-08', dueDate: '2024-04-08', status: 'overdue', plan: 'Trimestral', autoRenew: false, paymentLink: 'https://mpago.la/s/simulated-link-3' },
  { id: '9', memberId: '9', memberName: 'Federico Álvarez', amount: 12000, date: '2024-03-01', dueDate: '2024-04-01', status: 'overdue', plan: 'Mensual', autoRenew: false, paymentLink: 'https://mpago.la/s/simulated-link-4' },
  { id: '10', memberId: '10', memberName: 'Lucía Moreno', amount: 1500, date: '2024-04-10', dueDate: '2024-04-11', status: 'paid', plan: 'Diario', autoRenew: false },
];



export const mockAttendance: AttendanceRecord[] = [
  { id: 'a1', memberId: '1', memberName: 'Carlos Mendoza', memberPlan: 'Mensual', checkInTime: '08:15', date: '2024-04-13' },
  { id: 'a2', memberId: '2', memberName: 'Laura Fernández', memberPlan: 'Trimestral', checkInTime: '09:30', date: '2024-04-13' },
  { id: 'a3', memberId: '6', memberName: 'Valentina López', memberPlan: 'Mensual', checkInTime: '10:05', date: '2024-04-13' },
  { id: 'a4', memberId: '7', memberName: 'Rodrigo Sánchez', memberPlan: 'Mensual', checkInTime: '11:22', date: '2024-04-13' },
  { id: 'a5', memberId: '8', memberName: 'Camila Herrera', memberPlan: 'Trimestral', checkInTime: '07:45', date: '2024-04-13' },
  { id: 'a6', memberId: '12', memberName: 'Agustina Pérez', memberPlan: 'Trimestral', checkInTime: '17:10', date: '2024-04-12' },
  { id: 'a7', memberId: '11', memberName: 'Tomás Ruiz', memberPlan: 'Mensual', checkInTime: '18:30', date: '2024-04-12' },
  { id: 'a8', memberId: '4', memberName: 'Sofía Ramírez', memberPlan: 'Diario', checkInTime: '09:00', date: '2024-04-12' },
];

export const mockInventory: InventoryItem[] = [
  { id: 'i1', name: 'Proteína Whey Gold Standard', category: 'Proteínas', stock: 15, minStock: 5, price: 45000, unit: 'unidades' },
  { id: 'i2', name: 'Creatina Monohidrato', category: 'Creatinas', stock: 8, minStock: 5, price: 18000, unit: 'unidades' },
  { id: 'i3', name: 'Agua Mineral 500ml', category: 'Bebidas', stock: 3, minStock: 20, price: 800, unit: 'cajas' },
  { id: 'i4', name: 'Pre-Workout C4', category: 'Pre-Entreno', stock: 6, minStock: 3, price: 28000, unit: 'unidades' },
  { id: 'i5', name: 'BCAA Aminoácidos', category: 'Aminoácidos', stock: 12, minStock: 4, price: 22000, unit: 'unidades' },
  { id: 'i6', name: 'Proteína Vegana', category: 'Proteínas', stock: 4, minStock: 3, price: 38000, unit: 'unidades' },
  { id: 'i7', name: 'Isotónica Gatorade', category: 'Bebidas', stock: 2, minStock: 10, price: 1200, unit: 'cajas' },
  { id: 'i8', name: 'Multivitamínico Sport', category: 'Vitaminas', stock: 9, minStock: 4, price: 15000, unit: 'unidades' },
];

export const weeklyAttendance: WeeklyAttendance[] = [
  { day: 'Lun', count: 42 },
  { day: 'Mar', count: 38 },
  { day: 'Mié', count: 55 },
  { day: 'Jue', count: 47 },
  { day: 'Vie', count: 61 },
  { day: 'Sáb', count: 73 },
  { day: 'Dom', count: 29 },
];

export const mockClasses: GymClass[] = [
  {
    id: 'c1',
    name: 'Yoga Flow',
    instructor: 'Elena Paz',
    day: 'Lunes',
    time: '08:00',
    duration: '60 min',
    capacity: 15,
    enrolled: 12,
    category: 'Bienestar',
    color: 'bg-emerald-400',
  },
  {
    id: 'c2',
    name: 'Crossfit WOD',
    instructor: 'Marcos Ruda',
    day: 'Lunes',
    time: '18:00',
    duration: '60 min',
    capacity: 20,
    enrolled: 18,
    category: 'Intenso',
    color: 'bg-red-400',
  },
  {
    id: 'c3',
    name: 'Zumba Party',
    instructor: 'Sofía Ritmo',
    day: 'Martes',
    time: '19:00',
    duration: '50 min',
    capacity: 30,
    enrolled: 25,
    category: 'Cardio',
    color: 'bg-pink-400',
  },
  {
    id: 'c4',
    name: 'Spinning PRO',
    instructor: 'Juan Pedal',
    day: 'Miércoles',
    time: '07:00',
    duration: '45 min',
    capacity: 12,
    enrolled: 12,
    category: 'Cardio',
    color: 'bg-blue-400',
  },
];

export const mockBookings: Booking[] = [
  { id: 'b1', classId: 'c1', memberId: '1', memberName: 'Carlos Mendoza', bookingDate: '2024-04-13', status: 'confirmed' },
  { id: 'b2', classId: 'c1', memberId: '2', memberName: 'Laura Fernández', bookingDate: '2024-04-13', status: 'confirmed' },
  { id: 'b3', classId: 'c2', memberId: '6', memberName: 'Valentina López', bookingDate: '2024-04-13', status: 'confirmed' },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', amount: 12000, date: '2024-04-01T10:30:00Z', description: 'Pago Membresía - Carlos Mendoza', type: 'income', category: 'Membresías', paymentMethod: 'Mercado Pago' },
  { id: 't2', amount: 30000, date: '2024-04-02T15:45:00Z', description: 'Pago Membresía Trimestral - Laura Fernández', type: 'income', category: 'Membresías', paymentMethod: 'Transferencia' },
  { id: 't3', amount: 45000, date: '2024-04-03T09:00:00Z', description: 'Compra Lote Proteínas', type: 'expense', category: 'Inventario', paymentMethod: 'Tarjeta de Crédito' },
  { id: 't4', amount: 1500, date: '2024-04-05T18:20:00Z', description: 'Pase Diario - Sofía Ramírez', type: 'income', category: 'Pase Diario', paymentMethod: 'Efectivo' },
  { id: 't5', amount: 35000, date: '2024-04-08T11:15:00Z', description: 'Pago Servicios (Luz, Agua)', type: 'expense', category: 'Servicios', paymentMethod: 'Transferencia' },
  { id: 't6', amount: 12000, date: '2024-04-10T14:00:00Z', description: 'Pago Membresía - Valentina López', type: 'income', category: 'Membresías', paymentMethod: 'Mercado Pago' },
  { id: 't7', amount: 15000, date: '2024-04-11T16:30:00Z', description: 'Mantenimiento Equipos', type: 'expense', category: 'Mantenimiento', paymentMethod: 'Efectivo' },
  { id: 't8', amount: 1500, date: '2024-04-12T08:10:00Z', description: 'Pase Diario - Lucía Moreno', type: 'income', category: 'Pase Diario', paymentMethod: 'Mercado Pago' },
];

