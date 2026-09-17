'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const CLAVE_SESION = 'smartcore:trial-ended-dismissed';

/**
 * Se abre cuando la prueba termino y la cuenta quedo en modo lectura.
 *
 * Es cerrable a proposito. Si fuera bloqueante, el modo lectura no serviria de
 * nada: la promesa es que el cliente pueda seguir viendo y exportando lo suyo,
 * y un modal que no se cierra lo impide. Vuelve a aparecer en la sesion
 * siguiente, que es insistencia suficiente.
 */
export default function TrialEndedDialog() {
  const { accessLevel, gym } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (accessLevel !== 'read_only') return;

    let yaCerrado = false;
    try {
      yaCerrado = sessionStorage.getItem(CLAVE_SESION) === '1';
    } catch {
      // Navegacion privada o storage bloqueado: mostrarlo es el lado correcto
      // para equivocarse.
    }

    if (!yaCerrado) setAbierto(true);
  }, [accessLevel]);

  const cerrar = (open: boolean) => {
    setAbierto(open);
    if (!open) {
      try {
        sessionStorage.setItem(CLAVE_SESION, '1');
      } catch {
        // Si no se puede recordar, reaparece. Es molesto, no roto.
      }
    }
  };

  const suscribirse = async () => {
    setCargando(true);
    try {
      const res = await fetch('/api/mercadopago/subscribe', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyActive) {
          toast.success(data.error);
          router.refresh();
          return;
        }
        throw new Error(data.error || 'No pudimos conectar con Mercado Pago.');
      }

      if (!data.init_point) throw new Error('Mercado Pago no devolvió un link de pago.');
      window.location.href = data.init_point;
    } catch (err: any) {
      toast.error(err.message || 'No pudimos iniciar la suscripción.');
    } finally {
      setCargando(false);
    }
  };

  if (accessLevel !== 'read_only') return null;

  return (
    <Dialog open={abierto} onOpenChange={cerrar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-2 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl">Se terminó tu prueba gratuita</DialogTitle>
          <DialogDescription>
            {gym?.name ? `${gym.name} pasó a ` : 'Tu cuenta pasó a '}
            modo lectura: podés seguir consultando y exportando toda tu información, pero no
            cargar socios, cobrar ni registrar ingresos.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-primary/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 text-slate-100">
          <div className="text-3xl font-extrabold text-white">
            $60.000 <span className="text-xs font-normal text-slate-400">/ mes</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Sin permanencia. Se cancela cuando quieras.</p>

          <ul className="text-xs text-slate-300 space-y-2 mt-4">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              Control ilimitado de socios y cobros.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              Gestión de clases, asistencia y stock.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              Recuperás la carga de datos al instante.
            </li>
          </ul>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="ghost" onClick={() => cerrar(false)} disabled={cargando}>
            Seguir en modo lectura
          </Button>
          <Button
            onClick={suscribirse}
            disabled={cargando}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
          >
            {cargando ? 'Cargando...' : 'Activar suscripción'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
