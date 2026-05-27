'use client';

import { useState } from 'react';
import { X, Loader2, Dumbbell, Users, Clock, Calendar } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import { cn } from '@/lib/utils';
import type { GymClass } from '@/lib/types';

interface CreateClassModalProps {
  onClose: () => void;
}

const PRESET_COLORS = [
  { name: 'Rojo', value: 'bg-rose-500' },
  { name: 'Azul', value: 'bg-blue-500' },
  { name: 'Verde', value: 'bg-emerald-500' },
  { name: 'Naranja', value: 'bg-orange-500' },
  { name: 'Púrpura', value: 'bg-purple-500' },
  { name: 'Gris', value: 'bg-zinc-500' },
];

const PRESET_CATEGORIES = ['Musculación', 'Cardio', 'Yoga', 'CrossFit', 'Zumba', 'Pilates'];
const PRESET_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function CreateClassModal({ onClose }: CreateClassModalProps) {
  const { addClass } = useGym();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    category: PRESET_CATEGORIES[0],
    day: PRESET_DAYS[0],
    time: '08:00',
    duration: '60 min',
    capacity: 20,
    color: PRESET_COLORS[0].value,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const newClass: Omit<GymClass, 'id'> = {
        name: formData.name,
        instructor: formData.instructor,
        category: formData.category,
        day: formData.day,
        time: formData.time,
        duration: formData.duration,
        capacity: Number(formData.capacity),
        color: formData.color,
        description: formData.description,
        enrolled: 0,
      };

      await addClass(newClass);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la clase');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-xl rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Crear Nueva Clase</h2>
            <p className="text-sm text-muted-foreground mt-1">Configura los detalles de la nueva actividad</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Nombre de la Clase</label>
              <div className="relative">
                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ej: Cross Training"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Profesor / Instructor</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={formData.instructor}
                  onChange={e => setFormData(p => ({ ...p, instructor: e.target.value }))}
                  placeholder="Nombre del instructor"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Categoría</label>
              <select
                value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              >
                {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Día</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={formData.day}
                  onChange={e => setFormData(p => ({ ...p, day: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                >
                  {PRESET_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Horario</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Duración</label>
                <select
                  value={formData.duration}
                  onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                >
                  <option value="30 min">30 min</option>
                  <option value="45 min">45 min</option>
                  <option value="60 min">60 min</option>
                  <option value="90 min">90 min</option>
                  <option value="120 min">120 min</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Cupo Máximo</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={e => setFormData(p => ({ ...p, capacity: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Color de Identificación</label>
            <div className="flex gap-3 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, color: c.value }))}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all ring-offset-2 ring-offset-background",
                    c.value,
                    formData.color === c.value ? "ring-2 ring-primary scale-110" : "hover:scale-110 opacity-70"
                  )}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Descripción (Opcional)</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              placeholder="Detalles sobre qué llevar, nivel de intensidad, etc."
              className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none h-20"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary transition-colors text-muted-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Clase'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
