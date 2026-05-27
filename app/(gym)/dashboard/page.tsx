'use client';

import { motion } from 'framer-motion';


import { Users, DollarSign, TrendingUp, UserCheck, Activity, CircleAlert as AlertCircle } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import { useGym } from '@/lib/context/GymContext';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/formatters';

export default function DashboardPage() {
  const { members, attendance, payments, isLoading } = useGym();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="gym-card p-5 flex flex-col space-y-2">
              <Skeleton className="w-1/3 h-5" />
              <Skeleton className="w-2/3 h-7" />
            </div>
          ))}
        </div>
        {/* Attendance chart placeholder */}
        <div className="h-64 bg-secondary rounded-xl animate-pulse" />
        {/* Recent activity placeholder */}
        <div className="gym-card p-5">
          <Skeleton className="w-1/4 h-5 mb-4" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-full h-4" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeMembers = members.filter(m => m.status === 'active').length;
  const expiredMembers = members.filter(m => m.status === 'expired').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;
  const monthlyRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const todayAttendance = attendance.filter(a => a.date === '2024-04-13').length;


  const recentActivity = [
    { icon: UserCheck, text: 'Agustina Pérez renovó su membresía trimestral', time: 'Hace 15 min', color: 'text-emerald-400' },
    { icon: AlertCircle, text: 'Federico Álvarez tiene un pago vencido', time: 'Hace 1h', color: 'text-red-400' },
    { icon: Users, text: 'Sofía Ramírez hizo check-in', time: 'Hace 2h', color: 'text-blue-400' },
    { icon: TrendingUp, text: 'Nuevo socio registrado: Tomás Ruiz', time: 'Hace 3h', color: 'text-emerald-400' },
    { icon: AlertCircle, text: 'Stock bajo: Agua Mineral 500ml', time: 'Hace 5h', color: 'text-amber-400' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: "Socios Activos", value: String(activeMembers), icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10", change: "8.2%", positive: true },
          { title: "Ingresos del Mes", value: formatCurrency(monthlyRevenue).replace(",00", ""), icon: DollarSign, color: "text-blue-400", bg: "bg-blue-400/10", change: "12.5%", positive: true },
          { title: "Asistencia Hoy", value: String(todayAttendance), icon: Activity, color: "text-amber-400", bg: "bg-amber-400/10", change: "5.1%", positive: true },
          { title: "Pagos Vencidos", value: String(overduePayments), icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", change: "2.0%", positive: false },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changePositive={stat.positive}
              icon={stat.icon}
              iconColor={stat.color}
              iconBg={stat.bg}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <AttendanceChart />
        </motion.div>

        <motion.div variants={itemVariants} className="gym-card p-5">
          <h3 className="font-semibold text-foreground mb-1">Actividad Reciente</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimos eventos del sistema</p>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-secondary flex-shrink-0">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground leading-snug">{item.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="gym-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Estado de Socios</h3>
          <div className="space-y-3">
            {[
              { label: 'Activos', count: activeMembers, total: members.length, color: 'bg-emerald-400' },
              { label: 'Inactivos', count: members.filter(m => m.status === 'inactive').length, total: members.length, color: 'bg-amber-400' },
              { label: 'Vencidos', count: expiredMembers, total: members.length, color: 'bg-red-400' },
            ].map(({ label, count, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{count} / {total}</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / (total || 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="gym-card p-5">
          <h3 className="font-semibold text-foreground mb-4">Distribución de Planes</h3>
          <div className="space-y-3">
            {[
              { label: 'Mensual', count: members.filter(m => m.plan === 'monthly').length, color: 'bg-blue-400' },
              { label: 'Trimestral', count: members.filter(m => m.plan === 'quarterly').length, color: 'bg-emerald-400' },
              { label: 'Pase Diario', count: members.filter(m => m.plan === 'daily').length, color: 'bg-amber-400' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / (members.length || 1)) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${color} rounded-full`} 
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
