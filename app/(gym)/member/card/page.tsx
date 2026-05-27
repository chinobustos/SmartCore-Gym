'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, QrCode, CreditCard, ShieldCheck, MapPin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DigitalCardPage() {
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
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg">Carnet Digital</h1>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 flex flex-col space-y-8"
      >
        {/* The Card */}
        <motion.div 
          variants={itemVariants}
          className="relative aspect-[1.6/1] w-full rounded-[2.5rem] bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 text-white shadow-2xl overflow-hidden border border-white/10"
        >
          {/* Logo & Chip */}
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-black text-xl tracking-tighter">GymOS</span>
            </div>
            <div className="w-12 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/20 flex items-center justify-center">
                <div className="w-8 h-0.5 bg-yellow-500/40 mb-1" />
                <div className="w-8 h-0.5 bg-yellow-500/40" />
            </div>
          </div>

          {/* Member Name */}
          <div className="space-y-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Miembro Premium</p>
            <h2 className="text-2xl font-bold tracking-tight">Juan Ignacio Pérez</h2>
          </div>

          {/* Card Info */}
          <div className="mt-auto flex justify-between items-end">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">ID Socio</p>
              <p className="font-mono text-sm tracking-widest">#0045-8821</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Vence</p>
              <p className="font-mono text-sm">12/05/2024</p>
            </div>
          </div>

          {/* Decorative gradients */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
        </motion.div>

        {/* QR Code Section */}
        <motion.div 
          variants={itemVariants}
          className="gym-card flex flex-col items-center p-10 space-y-6"
        >
          <div className="p-4 bg-white rounded-3xl shadow-inner border border-secondary">
            <QrCode className="w-48 h-48 text-black" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-lg">Código de Acceso</p>
            <p className="text-sm text-muted-foreground">Escanea este código en la entrada</p>
          </div>
        </motion.div>

        {/* Location Info */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 px-4 py-3 bg-secondary/50 rounded-2xl border border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sede Central</p>
            <p className="text-sm font-semibold">Av. Principal 123, Ciudad</p>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div variants={itemVariants}>
          <Button variant="outline" className="w-full h-14 rounded-2xl gap-2 font-bold border-2">
            <CreditCard className="w-5 h-5" />
            Gestionar Pagos
          </Button>
        </motion.div>
      </motion.div>
      <MemberNavbar />
    </div>
  );
}

import MemberNavbar from '@/components/layout/MemberNavbar';
