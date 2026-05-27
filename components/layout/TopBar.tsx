'use client';

import { Bell, Search, User, LogOut } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import { useAuth } from '@/lib/context/AuthContext';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Resumen ejecutivo del gimnasio' },
  '/finances': { title: 'Finanzas', subtitle: 'Historial de transferencias y movimientos' },
  '/members': { title: 'Miembros', subtitle: 'Gestión de socios y perfiles' },
  '/memberships': { title: 'Membresías', subtitle: 'Planes y pagos' },
  '/attendance': { title: 'Asistencia', subtitle: 'Check-in rápido de socios' },
  '/inventory': { title: 'Inventario', subtitle: 'Control de stock de suplementos' },
};

export default function TopBar() {
  const { globalSearch, setGlobalSearch } = useGym();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const page = pageTitles[pathname] ?? { title: 'GymOS', subtitle: '' };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-white sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-foreground">{page.title}</h1>
        <p className="text-xs text-muted-foreground">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar socios, clases..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
          />
        </div>

        <button className="relative p-2 rounded-lg bg-secondary hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="flex items-center gap-4 pl-3 border-l border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground leading-none">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{user?.role === 'admin' ? 'Administrador' : 'Gerente'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
