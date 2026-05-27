"use client";

import { useRouter, useParams } from 'next/navigation';
import { useGym } from '@/lib/context/GymContext';
import { Calendar, Users, X, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ClassDetailPage() {
  const router = useRouter();
  const { id } = useParams(); // class id from URL
  const {
    classes,
    bookings,
    members,
    cancelBooking,
    bookClass,
    isLoading,
  } = useGym();

  const gymClass = classes.find((c) => c.id === id);

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto p-6">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!gymClass) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2 className="text-2xl font-semibold">Clase no encontrada</h2>
        <button
          onClick={() => router.push('/classes')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  // Inscriptions for this class
  const classBookings = bookings.filter((b) => b.classId === gymClass.id);
  const bookedMembers = classBookings.map((b) => members.find((m) => m.id === b.memberId)).filter(Boolean);

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      toast.success('Reserva cancelada');
    } catch (e) {
      toast.error('Error al cancelar');
    }
  };

  const handleReserve = async (memberId: string) => {
    try {
      await bookClass({ classId: gymClass.id, memberId, date: new Date().toISOString() });
      toast.success('Socio inscrito');
    } catch (e) {
      toast.error('Error al inscribir');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{gymClass.name}</h1>
          <p className="text-muted-foreground mt-1">{gymClass.category}</p>
        </div>
        <button
          onClick={() => router.push('/classes')}
          className="text-sm text-primary hover:underline"
        >
          ← Volver
        </button>
      </div>

      {/* Info block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{gymClass.day} • {gymClass.time} ({gymClass.duration})</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Instructor: {gymClass.instructor}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Capacidad: {gymClass.enrolled} / {gymClass.capacity}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Booking list */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Participantes ({bookedMembers.length})</h2>
        {bookedMembers.length === 0 ? (
          <p className="text-muted-foreground">Aún no hay socios inscritos.</p>
        ) : (
          <table className="w-full table-auto border border-border rounded-xl overflow-hidden">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Socio</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">DNI</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bookedMembers.map((member) => {
                const booking = classBookings.find((b) => b.memberId === member!.id);
                return (
                  <tr key={member!.id} className="border-b border-border/50 hover:bg-secondary/20">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {member!.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member!.name}</p>
                          <p className="text-xs text-muted-foreground">{member!.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground font-mono text-sm">{member!.dni}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleCancel(booking!.id)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-rose-500 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Reservation form */}
      <div className="gym-card p-5">
        <h2 className="font-semibold text-foreground mb-3">Inscribir nuevo socio</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <select
            className="flex-1 min-w-[200px] px-4 py-2 bg-secondary border border-border rounded"
            defaultValue=""
            id="member-select"
          >
            <option disabled value="">Seleccionar socio</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>${m.name} – {m.dni}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const select = document.getElementById('member-select') as HTMLSelectElement;
              if (select && select.value) {
                handleReserve(select.value);
                select.value = '';
              }
            }}
            className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Inscribir
          </button>
        </div>
      </div>
    </div>
  );
}
