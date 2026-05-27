'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, User, Ruler, Weight, Activity, Camera, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function BiometricsPage() {
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

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg">Perfil Biométrico</h1>
        <Button variant="ghost" size="icon" className="rounded-full bg-primary/10">
          <Plus className="w-5 h-5 text-primary" />
        </Button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Profile Pic & Basic Info */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4">
            <div className="relative">
                <div className="w-32 h-32 rounded-[2.5rem] bg-secondary flex items-center justify-center overflow-hidden border-4 border-card shadow-xl">
                    <User className="w-16 h-16 text-muted-foreground/30" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <Camera className="w-5 h-5" />
                </button>
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold">Juan Ignacio Pérez</h2>
                <p className="text-sm text-muted-foreground">Socio #00458821</p>
            </div>
        </motion.div>

        {/* Biometrics Grid */}
        <div className="grid grid-cols-2 gap-4">
            {[
                { label: 'Peso Actual', value: '78.5', unit: 'kg', icon: Weight, color: 'text-blue-400' },
                { label: 'Grasa Corporal', value: '18.2', unit: '%', icon: Activity, color: 'text-emerald-400' },
                { label: 'Masa Muscular', value: '38.4', unit: 'kg', icon: Ruler, color: 'text-amber-400' },
                { label: 'Altura', value: '182', unit: 'cm', icon: User, color: 'text-purple-400' },
            ].map((stat, i) => (
                <motion.div key={i} variants={itemVariants} className="gym-card p-5 space-y-3">
                    <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black">{stat.value} <span className="text-xs font-normal text-muted-foreground">{stat.unit}</span></p>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Progress Photos Section */}
        <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="font-bold">Fotos de Progreso</h2>
                <Button variant="ghost" size="sm" className="text-xs gap-1">Ver álbum <ChevronRight className="w-3 h-3" /></Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[3/4] bg-secondary rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
                        <Plus className="w-6 h-6 text-muted-foreground/50" />
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">Subir</span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-center text-muted-foreground italic">Tus fotos son 100% privadas y solo visibles para ti.</p>
        </motion.div>

        {/* Edit Button */}
        <motion.div variants={itemVariants}>
            <Button className="w-full h-14 rounded-2xl font-bold">
                Actualizar Medidas
            </Button>
        </motion.div>
      </motion.div>
      <MemberNavbar />
    </div>
  );
}

import MemberNavbar from '@/components/layout/MemberNavbar';
