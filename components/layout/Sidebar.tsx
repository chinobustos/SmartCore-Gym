'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, LayoutDashboard, Users, CreditCard, ClipboardList, SquareCheck as CheckSquare, Package, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/finances', icon: Wallet, label: 'Finanzas' },
  { href: '/members', icon: Users, label: 'Miembros' },
  { href: '/memberships', icon: CreditCard, label: 'Membresías' },
  { href: '/classes', icon: ClipboardList, label: 'Clases' },
  { href: '/attendance', icon: CheckSquare, label: 'Asistencia' },
  { href: '/inventory', icon: Package, label: 'Inventario' },
];


export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useGym();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out flex-shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-border', sidebarCollapsed && 'justify-center px-0')}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary flex-shrink-0">
          <Dumbbell className="w-4 h-4 text-primary-foreground" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <span className="font-bold text-foreground text-lg leading-none">GymOS</span>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Pro Edition</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                sidebarCollapsed && 'justify-center px-0'
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-primary')} />
              {!sidebarCollapsed && <span>{label}</span>}
              {!sidebarCollapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : (
            <span className="flex items-center gap-2 text-sm">
              <ChevronLeft className="w-4 h-4" />
              Colapsar
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
