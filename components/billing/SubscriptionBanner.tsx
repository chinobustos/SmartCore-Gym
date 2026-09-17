'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { Clock, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Franja fija arriba del contenido con el estado de la suscripcion.
 *
 * Va en el layout y no en el TopBar porque en mobile el TopBar no tiene lugar
 * para un contador, y este es justamente el aviso que no queremos que se pierda.
 */
export default function SubscriptionBanner() {
  const { accessLevel, trialDaysLeft, enPrueba, graceDaysLeft } = useAuth();

  if (enPrueba) {
    // El color sube de tono a medida que se acerca el vencimiento: a 3 dias es
    // tambien cuando sale el mail, asi que los dos avisos coinciden.
    const urgente = trialDaysLeft <= 3;
    const proximo = trialDaysLeft <= 7;

    return (
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-3 gap-y-1 px-6 py-2.5 text-sm border-b',
          urgente
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : proximo
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : 'bg-slate-500/10 border-border text-muted-foreground'
        )}
      >
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          {trialDaysLeft === 1 ? (
            <>Te queda <strong className="font-bold">1 día</strong> de prueba gratuita.</>
          ) : (
            <>Te quedan <strong className="font-bold">{trialDaysLeft} días</strong> de prueba gratuita.</>
          )}
        </span>
        <Link
          href="/billing"
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:no-underline ml-auto"
        >
          Activar suscripción
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (accessLevel === 'read_only') {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-6 py-2.5 text-sm border-b bg-red-500/10 border-red-500/30 text-red-300">
        <Eye className="h-4 w-4 shrink-0" />
        <span>
          <strong className="font-bold">Modo lectura.</strong> Podés consultar y exportar tu
          información, pero no cargar movimientos nuevos.{' '}
          {graceDaysLeft > 0 && (
            <>
              Tus datos se conservan{' '}
              <strong className="font-bold">
                {graceDaysLeft === 1 ? '1 día' : `${graceDaysLeft} días`}
              </strong>{' '}
              más.
            </>
          )}
        </span>
        <Link
          href="/billing"
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:no-underline ml-auto"
        >
          Reactivar cuenta
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return null;
}
