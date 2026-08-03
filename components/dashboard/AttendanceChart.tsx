'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import type { AttendanceRecord } from '@/lib/types';
// Removed mock data import; component now receives attendance records as prop

export default function AttendanceChart({ attendance }: { attendance: AttendanceRecord[] }) {
  // Generate last 7 days labels in YYYY-MM-DD format
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyAttendance = dates.map(day => ({
    day,
    count: attendance.filter(a => a.date === day).length,
  }));

  const maxCount = Math.max(...weeklyAttendance.map(d => d.count), 0);

  return (
    <div className="gym-card p-5 h-64">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Asistencia Semanal</h3>
          <p className="text-xs text-muted-foreground">Cantidad de ingresos por día</p>
        </div>
        <span className="text-xs bg-primary/15 text-primary px-2 py-1 rounded-full font-medium">Esta semana</span>
      </div>
      <ResponsiveContainer width="100%" height="75%">
        <BarChart data={weeklyAttendance} barSize={28} barCategoryGap="30%">
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={28} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {weeklyAttendance.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.count === maxCount && maxCount > 0 ? 'hsl(160, 84%, 39%)' : 'hsl(222, 47%, 88%)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
