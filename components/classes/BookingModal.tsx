'use client';

import { useState } from 'react';
import { X, Calendar, User, CheckCircle2 } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import type { GymClass, Member } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BookingModalProps {
    gymClass: GymClass;
    onClose: () => void;
}

export default function BookingModal({ gymClass, onClose }: BookingModalProps) {
    const { members, bookClass } = useGym();
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const activeMembers = members.filter(m => m.status === 'active');

    const handleBooking = async () => {
        if (!selectedMemberId) return;

        setIsSubmitting(true);
        const member = members.find(m => m.id === selectedMemberId);

        await bookClass({
            classId: gymClass.id,
            memberId: selectedMemberId,
            memberName: member?.name || 'Desconocido',
            bookingDate: new Date().toISOString().split('T')[0],
            status: 'confirmed'
        });

        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(onClose, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="gym-card w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <h3 className="text-lg font-bold text-foreground">Reservar Clase</h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                            <div className="w-16 h-16 bg-emerald-400/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-foreground">¡Reserva Exitosa!</p>
                                <p className="text-sm text-muted-foreground">El socio ha sido anotado en la clase.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={cn("p-4 rounded-xl border border-border bg-secondary/30", gymClass.color + "/10")}>
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 rounded-full", gymClass.color)}></div>
                                    <p className="font-bold text-foreground">{gymClass.name}</p>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {gymClass.day} {gymClass.time}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3 h-3" />
                                        {gymClass.instructor}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Seleccionar Socio</label>
                                <select
                                    value={selectedMemberId}
                                    onChange={(e) => setSelectedMemberId(e.target.value)}
                                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                >
                                    <option value="">Buscar socio activo...</option>
                                    {activeMembers.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.dni})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-muted-foreground italic">Solo se muestran socios con membresía activa.</p>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleBooking}
                                    disabled={!selectedMemberId || isSubmitting}
                                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                                >
                                    {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
