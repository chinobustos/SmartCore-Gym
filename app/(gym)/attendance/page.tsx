'use client';

import { useState } from 'react';
import { Search, CircleCheck as CheckCircle2, Clock, Users } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import type { Member } from '@/lib/types';
import { cn } from '@/lib/utils';

const PLAN_LABELS: Record<string, string> = { daily: 'Pase Diario', monthly: 'Mensual', quarterly: 'Trimestral' };

export default function AttendancePage() {
  const { members, attendance, checkIn, isLoading } = useGym();
  const [search, setSearch] = useState('');
  const [activityCount, setActivityCount] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }


  const today = '2024-04-13';
  const todayAttendance = attendance.filter(a => a.date === today);

  const searchResults = search.length > 1
    ? members.filter(m =>
      m.status === 'active' &&
      (m.name.toLowerCase().includes(search.toLowerCase()) || m.dni.includes(search))
    ).slice(0, 5)
    : [];

  const handleCheckIn = (member: Member) => {
    const alreadyIn = todayAttendance.some(a => a.memberId === member.id);
    if (alreadyIn) return;
    checkIn({
      memberId: member.id,
      memberName: member.name,
      memberPlan: PLAN_LABELS[member.plan],
      checkInTime: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      date: today,
    });
    setCheckedIn(member.id);
    setSearch('');
    setTimeout(() => setCheckedIn(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="gym-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-primary/15">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">Check-in Rápido</h2>
            <p className="text-xs text-muted-foreground">Buscá al socio por nombre o DNI</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Nombre del socio o número de DNI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-secondary border border-border rounded-xl text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            autoFocus
          />
        </div>

        {checkedIn && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-emerald-400/10 border border-emerald-400/30 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-400">Check-in registrado exitosamente</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {searchResults.map(member => {
              const alreadyIn = todayAttendance.some(a => a.memberId === member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => handleCheckIn(member)}
                  disabled={alreadyIn}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left',
                    alreadyIn
                      ? 'bg-secondary/50 border-border opacity-60 cursor-not-allowed'
                      : 'bg-secondary border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">DNI {member.dni} · {PLAN_LABELS[member.plan]}</p>
                    </div>
                  </div>
                  {alreadyIn ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Ya registrado
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
                      Check-in
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="gym-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Asistencia de Hoy</span>
          </div>
          <span className="text-sm font-semibold text-primary">{todayAttendance.length} ingresos</span>
        </div>
        {todayAttendance.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No hay registros de asistencia para hoy.</div>
        ) : (
          <div className="divide-y divide-border/50">
            {todayAttendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {record.memberName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{record.memberName}</p>
                    <p className="text-xs text-muted-foreground">{record.memberPlan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium">{record.checkInTime}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
