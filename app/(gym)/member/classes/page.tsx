'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, Users, Clock, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import MemberNavbar from '@/components/layout/MemberNavbar';

const CLASSES = [
  { id: 1, name: 'CrossFit', instructor: 'Marcos R.', time: '08:00', duration: '60 min', capacity: 20, enrolled: 15, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 2, name: 'Yoga Flow', instructor: 'Elena S.', time: '09:30', duration: '45 min', capacity: 15, enrolled: 15, color: 'text-emerald-500', bg: 'bg-emerald-500/10', full: true },
  { id: 3, name: 'Spinning', instructor: 'David G.', time: '18:00', duration: '50 min', capacity: 25, enrolled: 10, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 4, name: 'Power Lifting', instructor: 'Marcos R.', time: '19:30', duration: '90 min', capacity: 10, enrolled: 8, color: 'text-red-500', bg: 'bg-red-500/10' },
];

export default function MemberClassesPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg">Reservar Clases</h1>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
          <Search className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
        {['Hoy', 'Mañana', 'Lun 15', 'Mar 16', 'Mie 17'].map((day, i) => (
          <Button key={i} variant={i === 0 ? 'default' : 'secondary'} className="rounded-full px-6 h-10 flex-shrink-0 text-xs font-bold">
            {day}
          </Button>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {CLASSES.map((cls, i) => (
          <motion.div 
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="gym-card p-5 flex items-center gap-4 relative overflow-hidden group"
          >
            <div className={`w-14 h-14 rounded-2xl ${cls.bg} flex items-center justify-center flex-shrink-0`}>
              <Calendar className={`w-7 h-7 ${cls.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg tracking-tight truncate">{cls.name}</h3>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{cls.time}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls.instructor}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {cls.duration}</span>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex-1 max-w-[120px] h-1 bg-secondary rounded-full overflow-hidden mr-4">
                        <div 
                            className={`h-full ${cls.full ? 'bg-red-500' : 'bg-primary'}`} 
                            style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }} 
                        />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{cls.enrolled}/{cls.capacity} cupos</span>
                </div>
            </div>

            <div className="flex-shrink-0">
                {cls.full ? (
                    <Button disabled variant="outline" size="sm" className="rounded-xl h-9 text-xs">Agotado</Button>
                ) : (
                    <Button size="sm" className="rounded-xl h-9 text-xs px-5">Reservar</Button>
                )}
            </div>

            {/* Hover effect */}
            <div className={`absolute left-0 top-0 w-1 h-full ${cls.color.replace('text-', 'bg-')} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </motion.div>
        ))}
      </motion.div>

      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex gap-3 items-center">
        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-xs font-medium">Tienes <b>1 reserva</b> pendiente para hoy a las 18:00 hs.</p>
      </div>

      <MemberNavbar />
    </div>
  );
}
