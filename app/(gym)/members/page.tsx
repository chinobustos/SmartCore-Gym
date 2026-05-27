'use client';

import { useState } from 'react';
import { UserPlus, Search, Filter } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import AddMemberModal from '@/components/members/AddMemberModal';
import type { MemberStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  expired: 'Vencido',
};

const STATUS_STYLES: Record<MemberStatus, string> = {
  active: 'bg-emerald-400/15 text-emerald-400',
  inactive: 'bg-amber-400/15 text-amber-400',
  expired: 'bg-red-400/15 text-red-400',
};

const PLAN_LABELS: Record<string, string> = {
  daily: 'Pase Diario',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
};

type FilterStatus = 'all' | MemberStatus;

import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { formatShortDate } from '@/lib/utils/formatters';

export default function MembersPage() {
  const { members, isLoading, globalSearch, setGlobalSearch } = useGym();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showModal, setShowModal] = useState(false);

  // Combine local and global search
  const activeSearch = search || globalSearch;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="gym-card p-5 space-y-4">
           {[...Array(5)].map((_, i) => (
             <Skeleton key={i} className="h-12 w-full" />
           ))}
        </div>
      </div>
    );
  }

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      m.dni.includes(activeSearch) || m.email.toLowerCase().includes(activeSearch.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'expired', label: 'Vencidos' },
  ];

  return (
    <div className="space-y-5">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI..."
              value={activeSearch}
              onChange={e => {
                setSearch(e.target.value);
                if (globalSearch) setGlobalSearch('');
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-secondary border border-border rounded-lg p-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  statusFilter === opt.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0 shadow-lg shadow-primary/10"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Socio
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="gym-card overflow-hidden"
      >
        {filtered.length === 0 ? (
          <EmptyState 
            icon={Search}
            title="No se encontraron socios"
            description="Probá ajustando los filtros o la búsqueda."
            actionLabel="Ver todos"
            onAction={() => { setSearch(''); setStatusFilter('all'); }}
            className="py-20"
          />
        ) : (
          <>
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{filtered.length} socios encontrados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Socio</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">DNI</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inicio</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(member => (
                    <tr key={member.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground font-mono text-sm">{member.dni}</td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400">
                          {PLAN_LABELS[member.plan]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', STATUS_STYLES[member.status])}>
                          {STATUS_LABELS[member.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {formatShortDate(member.startDate)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-sm">{member.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && <AddMemberModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
