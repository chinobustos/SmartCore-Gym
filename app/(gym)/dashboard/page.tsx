'use client';

import { motion } from 'framer-motion';


import { Users, DollarSign, TrendingUp, UserCheck, Activity, CircleAlert as AlertCircle } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import { useGym } from '@/lib/context/GymContext';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/formatters';

export default function DashboardPage() {
  const { members, attendance, payments, inventory, isLoading } = useGym();

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

  // Obtener fecha actual en formato YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceCount = attendance ? attendance.filter(a => a.date === todayStr).length : 0;

  // Generar actividad reciente real a partir de los datos del gimnasio
  const recentActivity: Array<{ icon: any; text: string; time: string; color: string }> = [];

  // Pagos vencidos
  payments
    .filter(p => p.status === 'overdue')
    .slice(0, 2)
    .forEach(p => {
      recentActivity.push({
        icon: AlertCircle,
        text: `${p.memberName} tiene una cuota vencida (${p.plan})`,
        time: p.dueDate || 'Pendiente',
        color: 'text-rose-400',
      });
    });

  // Asistencias recientes
  attendance
    .slice(0, 3)
    .forEach(a => {
      recentActivity.push({
        icon: Users,
        text: `${a.memberName} ingresó al gimnasio`,
        time: a.checkInTime ? `${a.checkInTime} hs` : (a.date || 'Hoy'),
        color: 'text-blue-400',
      });
    });

  // Socios registrados recientemente
  members
    .slice(-3)
    .reverse()
    .forEach(m => {
      recentActivity.push({
        icon: TrendingUp,
        text: `Nuevo socio registrado: ${m.name}`,
        time: m.startDate || 'Reciente',
        color: 'text-emerald-400',
      });
    });

  // Alertas de stock bajo
  inventory
    .filter(i => i.stock <= i.minStock)
    .slice(0, 2)
    .forEach(i => {
      recentActivity.push({
        icon: AlertCircle,
        text: `Stock bajo: ${i.name} (${i.stock} ${i.unit || 'un.'})`,
        time: 'Alerta',
        color: 'text-amber-400',
      });
    });

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
          { title: "Socios Activos", value: String(activeMembers), icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10", change: "+0%", positive: true },
          { title: "Ingresos del Mes", value: formatCurrency(monthlyRevenue).replace(",00", ""), icon: DollarSign, color: "text-blue-400", bg: "bg-blue-400/10", change: "+0%", positive: true },
          { title: "Asistencia Hoy", value: String(todayAttendanceCount), icon: Activity, color: "text-amber-400", bg: "bg-amber-400/10", change: "+0%", positive: true },
          { title: "Pagos Vencidos", value: String(overduePayments), icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10", change: "0%", positive: false },
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
          <AttendanceChart attendance={attendance} />
        </motion.div>

        {/* Render recent activity section; show placeholder when no activity or no members */}
        <motion.div variants={itemVariants} className="gym-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Actividad Reciente</h3>
            <p className="text-xs text-muted-foreground mb-4">Últimos eventos del sistema</p>
            {recentActivity.length > 0 ? (
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
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-foreground">Sin actividad reciente</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  A medida que registres socios, cobros o entradas en recepción, los eventos aparecerán aquí en vivo.
                </p>
              </div>
            )}
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
