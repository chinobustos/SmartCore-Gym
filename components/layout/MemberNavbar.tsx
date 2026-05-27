'use client';

import { Play, TrendingUp, Calendar, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function MemberNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Play, label: 'Hoy', href: '/member', active: pathname === '/member' },
    { icon: TrendingUp, label: 'Progreso', href: '/member/progress', active: pathname === '/member/progress' },
    { icon: Calendar, label: 'Clases', href: '/member/classes', active: pathname === '/member/classes' },
    { icon: User, label: 'Perfil', href: '/member/profile', active: pathname === '/member/profile' },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 h-16 bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex items-center justify-around px-2 z-50">
      {navItems.map((item, i) => (
        <button
          key={i}
          onClick={() => router.push(item.href)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all duration-300",
            item.active ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon className={cn("w-5 h-5", item.active && "fill-primary/20")} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          {item.active && (
            <motion.div 
                layoutId="active-pill"
                className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" 
            />
          )}
        </button>
      ))}
    </div>
  );
}

// Note: I need motion for the pill, so I'll wrap it in motion.div
import { motion } from 'framer-motion';
