'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { weeklyAttendance } from '@/lib/data/mockData';

export default function AttendanceChart() {
  const maxCount = Math.max(...weeklyAttendance.map(d => d.count));

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
                fill={entry.count === maxCount ? 'hsl(160, 84%, 39%)' : 'hsl(222, 47%, 88%)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
