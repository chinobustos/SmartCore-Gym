import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changePositive: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export default function StatsCard({ title, value, change, changePositive, icon: Icon, iconColor, iconBg }: StatsCardProps) {
  return (
    <div className="gym-card p-5 flex items-start justify-between hover:border-primary/30 transition-colors">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        <p className={cn('text-xs font-medium', changePositive ? 'text-emerald-400' : 'text-red-400')}>
          {changePositive ? '+' : ''}{change} vs. mes anterior
        </p>
      </div>
      <div className={cn('p-3 rounded-xl', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>
    </div>
  );
}
