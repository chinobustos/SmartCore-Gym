'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Check, CircleAlert as AlertCircle, Clock, CreditCard, Star, RefreshCcw, ExternalLink, Plus, Pencil, Tag, FileDown } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import { EmptyState } from '@/components/ui/EmptyState';
import PlanFormDialog, { formatDuration } from '@/components/memberships/PlanFormDialog';
import { exportToExcel, datedFilename, EXCEL_FORMAT } from '@/lib/export/excel';
import type { PaymentStatus, Plan } from '@/lib/types';
import { cn, generatePaymentLink } from '@/lib/utils';

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; style: string; icon: typeof Check }> = {
  paid: { label: 'Pagado', style: 'bg-emerald-400/15 text-emerald-400', icon: Check },
  pending: { label: 'Pendiente', style: 'bg-amber-400/15 text-amber-400', icon: Clock },
  overdue: { label: 'Vencido', style: 'bg-red-400/15 text-red-400', icon: AlertCircle },
};

export default function MembershipsPage() {
  const { payments, plans, toggleAutoRenew } = useGym();

  // `null` = cerrado. `{ plan: undefined }` = creando. `{ plan }` = editando.
  const [dialog, setDialog] = useState<{ plan?: Plan } | null>(null);
  const [exporting, setExporting] = useState(false);

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending').length;
  const overdue = payments.filter(p => p.status === 'overdue').length;

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link de pago copiado al portapapeles');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToExcel(
        [
          {
            name: 'Planes',
            rows: plans,
            columns: [
              { header: 'Nombre', value: p => p.name },
              { header: 'Precio', value: p => p.price, format: EXCEL_FORMAT.currencyARS },
              { header: 'Duración (días)', value: p => p.durationDays },
              { header: 'Beneficios', value: p => p.features.join(', '), width: 50 },
              { header: 'Popular', value: p => (p.popular ? 'Sí' : 'No') },
            ],
          },
          {
            name: 'Pagos',
            rows: payments,
            columns: [
              { header: 'Socio', value: p => p.memberName },
              { header: 'Plan', value: p => p.plan },
              { header: 'Monto', value: p => p.amount, format: EXCEL_FORMAT.currencyARS },
              { header: 'Fecha', value: p => (p.date ? new Date(p.date) : null), format: EXCEL_FORMAT.date },
              { header: 'Vencimiento', value: p => (p.dueDate ? new Date(p.dueDate) : null), format: EXCEL_FORMAT.date },
              { header: 'Estado', value: p => PAYMENT_STATUS[p.status as PaymentStatus]?.label ?? p.status },
              { header: 'Auto-renovación', value: p => (p.autoRenew ? 'Activada' : 'Manual') },
            ],
          },
        ],
        datedFilename('membresias')
      );
      toast.success('Planilla descargada');
    } catch (error) {
      console.error('[export] Error exportando membresías:', error);
      toast.error('No se pudo generar la planilla');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Ingresos Cobrados', value: `$${(totalRevenue / 1000).toFixed(0)}K`, sub: 'Este período', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Pagos Pendientes', value: String(pending), sub: 'Socios', color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Pagos Vencidos', value: String(overdue), sub: 'Requieren atención', color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map(s => (
          <div key={s.label} className="gym-card p-4 flex items-center gap-4">
            <div className={cn('p-3 rounded-xl', s.bg)}>
              <CreditCard className={cn('w-5 h-5', s.color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h2 className="text-base font-semibold text-foreground">Planes Disponibles</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-secondary text-foreground border border-border hover:bg-muted disabled:opacity-60 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              {exporting ? 'Generando...' : 'Exportar a Excel'}
            </button>
            <button
              onClick={() => setDialog({})}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Plan
            </button>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="gym-card">
            <EmptyState
              icon={Tag}
              title="Todavía no tenés planes"
              description="Creá los planes y membresías que ofrece tu gimnasio. Podés definir el precio, la duración y los beneficios de cada uno."
              actionLabel="Crear el primero"
              onAction={() => setDialog({})}
            />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={cn('gym-card p-5 relative', plan.popular && 'border-primary/40')}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    <Star className="w-3 h-3" /> Popular
                  </span>
                </div>
              )}
              <div className="mb-4">
                <p className="font-bold text-foreground text-base">{plan.name}</p>
                <p className="text-xs text-muted-foreground">{formatDuration(plan.durationDays)}</p>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-foreground">${plan.price.toLocaleString('es-AR')}</span>
                <span className="text-xs text-muted-foreground ml-1">ARS</span>
              </div>
              <ul className="space-y-2 mb-5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setDialog({ plan })}
                aria-label={`Editar ${plan.name}`}
                className={cn(
                  'w-full py-2.5 rounded-lg text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1.5',
                  plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-foreground hover:bg-muted border border-border'
                )}
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </button>
            </div>
          ))}
        </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Registro de Pagos</h2>
        <div className="gym-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Socio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vencimiento</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Auto-Renov.</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const s = PAYMENT_STATUS[p.status];
                  return (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-foreground">{p.memberName}</td>
                      <td className="px-4 py-4 text-muted-foreground">{p.plan}</td>
                      <td className="px-4 py-4 font-semibold text-foreground">${p.amount.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(p.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', s.style)}>
                          <s.icon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button 
                          onClick={() => toggleAutoRenew(p.memberId)}
                          className="flex items-center gap-2 hover:bg-secondary p-1 rounded transition-colors group"
                        >
                          <RefreshCcw className={cn('w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500', p.autoRenew ? 'text-primary' : 'text-muted-foreground opacity-30')} />
                          <span className={cn('text-xs', p.autoRenew ? 'text-primary font-medium' : 'text-muted-foreground')}>
                            {p.autoRenew ? 'Activado' : 'Manual'}
                          </span>
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {p.status !== 'paid' && (
                          <button
                            onClick={() => handleCopyLink(p.paymentLink || generatePaymentLink(p.memberId, p.amount))}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Link de Pago
                          </button>
                        )}
                        {p.status === 'paid' && (
                          <span className="text-[10px] text-muted-foreground font-medium italic">Sin acciones</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {dialog && (
          <PlanFormDialog
            key={dialog.plan?.id ?? 'new'}
            plan={dialog.plan}
            onClose={() => setDialog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

