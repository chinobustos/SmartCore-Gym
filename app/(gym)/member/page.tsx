'use client';

import { motion } from 'framer-motion';
import { Play, QrCode, Calendar, TrendingUp, Clock, CreditCard, ChevronRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import MemberNavbar from '@/components/layout/MemberNavbar';

export default function MemberDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
      className="max-w-md mx-auto space-y-6 pb-24"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hola, {user?.name?.split(' ')[0] || 'Socio'} 👋</h1>
          <p className="text-muted-foreground text-sm">¿Listo para entrenar hoy?</p>
        </div>
        <button 
          onClick={() => router.push('/member/profile')}
          className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 hover:scale-105 transition-transform"
        >
          <Award className="w-6 h-6 text-primary" />
        </button>
      </motion.div>

      {/* Main Action: Continue Workout */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-7 text-primary-foreground shadow-xl shadow-primary/20"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
              Rutina de Hoy
            </div>
            <span className="text-white/70 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> 45-60 min
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-5">Pecho y Tríceps (A)</h2>
          <Button 
            onClick={() => router.push('/member/workout')}
            className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-2xl h-14 gap-2 shadow-lg"
          >
            <Play className="w-5 h-5 fill-current" />
            Continuar Entrenamiento
          </Button>
        </div>
        
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button 
          variants={itemVariants}
          onClick={() => router.push('/member/card')}
          className="flex flex-col items-center justify-center p-5 rounded-[2rem] bg-card border border-border hover:border-primary/50 hover:bg-secondary/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <QrCode className="w-6 h-6 text-blue-400" />
          </div>
          <span className="font-bold text-sm">Acceso QR</span>
          <span className="text-[10px] text-muted-foreground font-medium">Entrada rápida</span>
        </motion.button>

        <motion.button 
          variants={itemVariants}
          onClick={() => router.push('/member/classes')}
          className="flex flex-col items-center justify-center p-5 rounded-[2rem] bg-card border border-border hover:border-primary/50 hover:bg-secondary/30 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="font-bold text-sm">Clases</span>
          <span className="text-[10px] text-muted-foreground font-medium">Reservar cupo</span>
        </motion.button>
      </div>

      {/* Membership Status */}
      <motion.div variants={itemVariants} className="gym-card p-6 rounded-[2rem]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">Plan Trimestral</p>
              <p className="text-xs text-muted-foreground">Vence en 12 días</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl font-bold border-2">
            Renovar
          </Button>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '75%' }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-primary"
          />
        </div>
      </motion.div>

      {/* Recent Progress Preview */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Tu Progreso</h3>
          <button 
            onClick={() => router.push('/member/progress')}
            className="text-xs text-primary font-bold flex items-center gap-1"
          >
            Ver más <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="gym-card p-5 rounded-[2rem] flex items-center justify-between bg-gradient-to-br from-card to-secondary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold">Volumen Semanal</p>
              <p className="text-xs text-emerald-400 font-black">+15% vs anterior</p>
            </div>
          </div>
          <div className="flex gap-1 items-end h-10">
            {[4, 6, 5, 8, 7, 9, 10].map((h, i) => (
              <div key={i} className="w-1.5 bg-primary/30 rounded-full" style={{ height: `${h * 10}%` }} />
            ))}
          </div>
        </div>
      </motion.div>

      <MemberNavbar />
    </motion.div>
  );
}
