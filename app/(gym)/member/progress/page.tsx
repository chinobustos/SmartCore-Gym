'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, TrendingUp, Calendar, Award, Target, Flame, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ProgressPage() {
  const router = useRouter();

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

  const ACHIEVEMENTS = [
    { id: 1, name: 'Primer Mes', icon: Award, color: 'bg-emerald-400', earned: true },
    { id: 2, name: '10 Entrenamientos', icon: Flame, color: 'bg-orange-500', earned: true },
    { id: 3, name: 'Madrugador', icon: Target, color: 'bg-blue-400', earned: false },
    { id: 4, name: 'Fuerza Bruta', icon: Zap, color: 'bg-purple-500', earned: false },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg">Mi Progreso</h1>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" />
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Streak Info */}
        <motion.div variants={itemVariants} className="flex items-center justify-around p-6 gym-card bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <div className="text-center">
                <p className="text-3xl font-black text-orange-500">12</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Racha Actual</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
                <p className="text-3xl font-black text-foreground">24</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Este Mes</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
                <p className="text-3xl font-black text-emerald-500">85%</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asistencia</p>
            </div>
        </motion.div>

        {/* Strength Chart Section */}
        <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Volumen de Carga</h2>
                <select className="bg-transparent text-xs font-bold outline-none border-none">
                    <option>Sentadilla</option>
                    <option>Press Banca</option>
                    <option>Peso Muerto</option>
                </select>
            </div>
            <div className="gym-card p-6 h-48 flex items-end justify-between gap-2">
                {[30, 45, 35, 60, 55, 80, 75, 95].map((val, i) => (
                    <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                        className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-lg relative group"
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {val} kg
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>

        {/* Attendance Calendar (Simplified) */}
        <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-400" /> Calendario de Asistencia</h2>
            </div>
            <div className="gym-card p-4 grid grid-cols-7 gap-2 text-center">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                    <span key={d} className="text-[10px] font-bold text-muted-foreground mb-2">{d}</span>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                    const attended = [2, 3, 5, 6, 7, 9, 10, 12, 13, 14, 16, 17, 19, 20, 21].includes(i + 1);
                    return (
                        <div 
                            key={i} 
                            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors
                                ${attended ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20' : 'bg-secondary text-muted-foreground'}
                            `}
                        >
                            {i + 1}
                        </div>
                    );
                })}
            </div>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="font-bold flex items-center gap-2"><Award className="w-5 h-5 text-amber-400" /> Logros y Medallas</h2>
                <Button variant="ghost" size="sm" className="text-xs gap-1">Ver todos <ChevronRight className="w-3 h-3" /></Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {ACHIEVEMENTS.map((ach) => (
                    <div key={ach.id} className="flex flex-col items-center gap-2">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${ach.earned ? ach.color : 'bg-secondary grayscale opacity-50'}`}>
                            <ach.icon className={`w-7 h-7 ${ach.earned ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight">{ach.name}</span>
                    </div>
                ))}
            </div>
        </motion.div>
      </motion.div>

      {/* Navigation Bar (Mobile Style) */}
      <div className="fixed bottom-6 left-6 right-6 h-16 bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex items-center justify-around px-2 z-50">
        {[
          { icon: Zap, label: 'Hoy', active: false, onClick: () => router.push('/member') },
          { icon: TrendingUp, label: 'Progreso', active: true, onClick: () => {} },
          { icon: Calendar, label: 'Clases', active: false, onClick: () => {} },
          { icon: Award, label: 'Logros', active: false, onClick: () => {} },
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={item.onClick}
            className={`flex flex-col items-center gap-1 transition-colors ${item.active ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
