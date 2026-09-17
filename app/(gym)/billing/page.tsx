'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  Ban,
} from 'lucide-react';

export default function BillingPage() {
  const { gym, refreshGym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const calculateTrialDaysLeft = () => {
    if (!gym?.trialEndsAt) return 0;
    const now = new Date();
    const trialEnd = new Date(gym.trialEndsAt);
    const diff = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = calculateTrialDaysLeft();
  const status = gym?.subscriptionStatus || 'trialing';
  const trialExpirada = status === 'trialing' && daysLeft === 0;
  const bloqueado = status === 'past_due' || status === 'canceled' || trialExpirada;

  /**
   * Le vuelve a preguntar a Mercado Pago en que estado esta la suscripcion.
   * Es la salida para cuando la notificacion de MP no llega: sin esto el
   * gimnasio paga y se queda bloqueado sin poder hacer nada.
   */
  const syncSubscription = useCallback(
    async (silencioso = false) => {
      setSyncing(true);
      if (!silencioso) {
        setMsg('');
        setError('');
      }
      try {
        const res = await fetch('/api/mercadopago/sync', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No pudimos consultar Mercado Pago.');

        await refreshGym();

        // En el chequeo automatico al volver del checkout solo avisamos si hubo
        // novedad: un cartel de "no habia nada nuevo" que nadie pidio confunde.
        if (data.applied || !silencioso) setMsg(data.message);
      } catch (err: any) {
        if (!silencioso) setError(err.message || 'No pudimos consultar Mercado Pago.');
      } finally {
        setSyncing(false);
      }
    },
    [refreshGym]
  );

  // Vuelta del checkout. `useSearchParams` obligaria a envolver la pagina en un
  // Suspense para que compile; la query se lee igual desde el navegador.
  const yaReconcilio = useRef(false);
  useEffect(() => {
    if (yaReconcilio.current) return;
    const params = new URLSearchParams(window.location.search);

    if (params.get('reason') === 'expired') {
      setError('Tu acceso está pausado hasta que regularices la suscripción.');
    }

    if (params.get('status')) {
      yaReconcilio.current = true;
      // Mercado Pago devuelve al usuario antes de mandar la notificacion, asi
      // que preguntamos nosotros en vez de mostrarle un estado viejo.
      setMsg('Confirmando tu pago con Mercado Pago...');
      syncSubscription(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [syncSubscription]);

  const handleSubscribe = async () => {
    setLoading(true);
    setMsg('');
    setError('');
    try {
      // Sin body: el gimnasio, el email y el monto los resuelve el servidor
      // desde la sesion.
      const res = await fetch('/api/mercadopago/subscribe', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        // Ya estaba paga: el servidor aprovecho y puso la cuenta al dia.
        if (data.alreadyActive) {
          await refreshGym();
          setMsg(data.error);
          return;
        }
        throw new Error(data.error || 'Error al conectar con Mercado Pago');
      }

      if (!data.init_point) throw new Error('Mercado Pago no devolvió un link de pago.');

      // El estado de la suscripcion lo define el webhook de Mercado Pago,
      // nunca el cliente: aca solo derivamos al checkout.
      window.location.href = data.init_point;
    } catch (err: any) {
      setError(err.message || 'Error al procesar la suscripción.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCanceling(true);
    setMsg('');
    setError('');
    try {
      const res = await fetch('/api/mercadopago/cancel', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No pudimos cancelar la suscripción.');
      await refreshGym();
      setMsg(data.message);
      setConfirmCancel(false);
    } catch (err: any) {
      setError(err.message || 'No pudimos cancelar la suscripción.');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-primary" /> Suscripción
        </h1>
        <p className="text-slate-400 mt-1">
          Gestiona el estado de tu cuenta de SmartCore Gym y tu suscripción activa.
        </p>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {msg}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Estado de la Cuenta</CardTitle>
              {status === 'trialing' && !trialExpirada && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1 text-xs">
                  Prueba Gratuita (14 Días)
                </Badge>
              )}
              {trialExpirada && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 px-3 py-1 text-xs">
                  Prueba Vencida
                </Badge>
              )}
              {status === 'active' && (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1 text-xs">
                  Suscripción Activa
                </Badge>
              )}
              {status === 'past_due' && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 px-3 py-1 text-xs">
                  Pago Vencido
                </Badge>
              )}
              {status === 'canceled' && (
                <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 px-3 py-1 text-xs">
                  Suscripción Cancelada
                </Badge>
              )}
            </div>
            <CardDescription className="text-slate-400">
              Gimnasio: <strong className="text-slate-200">{gym?.name || 'Cargando...'}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'trialing' && !trialExpirada && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-amber-400" />
                  <div>
                    <h4 className="font-semibold text-amber-200">Período de Prueba Activo</h4>
                    <p className="text-xs text-amber-300/80">
                      Te quedan <strong className="text-amber-100 font-bold">{daysLeft} días</strong> de acceso completo sin restricciones.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === 'active' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-emerald-400" />
                  <div>
                    <h4 className="font-semibold text-emerald-200">Acceso Ilimitado Confirmado</h4>
                    <p className="text-xs text-emerald-300/80">
                      Tu suscripción mensual se renueva automáticamente a través de Mercado Pago.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {bloqueado && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                  <div>
                    <h4 className="font-semibold text-red-200">Operación Pausada</h4>
                    <p className="text-xs text-red-300/80">
                      Podés seguir consultando tu información, pero no cargar movimientos nuevos
                      hasta que la suscripción esté al día.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-xs block">Plan Contratado</span>
                <span className="font-semibold text-slate-100 flex items-center gap-1 mt-1">
                  <Zap className="h-4 w-4 text-primary" /> Plan Único Integral
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400 text-xs block">Vencimiento del Ciclo</span>
                <span className="font-semibold text-slate-100 flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {gym?.currentPeriodEnd
                    ? new Date(gym.currentPeriodEnd).toLocaleDateString('es-AR')
                    : gym?.trialEndsAt
                    ? new Date(gym.trialEndsAt).toLocaleDateString('es-AR')
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Salida para cuando la notificacion de MP se pierde. */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => syncSubscription(false)}
                disabled={syncing}
                className="border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-800"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Consultando...' : 'Ya pagué, verificar'}
              </Button>
              <span className="text-xs text-slate-500">
                Si pagaste y la cuenta sigue sin actualizarse, consultá a Mercado Pago desde acá.
              </span>
            </div>

            {status === 'active' && (
              <div className="flex flex-wrap items-center gap-3">
                {!confirmCancel ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmCancel(true)}
                    className="text-slate-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Cancelar suscripción
                  </Button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/5 w-full">
                    <span className="text-xs text-red-200 mr-auto">
                      Se da de baja el débito automático en Mercado Pago. ¿Confirmás?
                    </span>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      disabled={canceling}
                      className="bg-red-500 hover:bg-red-400 text-slate-950 font-semibold"
                    >
                      {canceling ? 'Cancelando...' : 'Sí, dar de baja'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setConfirmCancel(false)}
                      disabled={canceling}
                      className="text-slate-300"
                    >
                      Volver
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscribe Action Card */}
        <Card className="bg-gradient-to-b from-slate-900 to-slate-950 border-primary/30 text-slate-100 flex flex-col justify-between shadow-xl">
          <CardHeader>
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-2 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">Mercado Pago</CardTitle>
            <CardDescription className="text-slate-400">
              Suscripción mensual recurrente sin permanencia obligatoria.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="text-3xl font-extrabold text-white">
              $60.000 <span className="text-xs font-normal text-slate-400">/ mes</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Control ilimitado de socios y cobros.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Gestión de clases, asistencia y stock.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Webhook automatizado de pagos.
              </li>
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleSubscribe}
              disabled={loading || status === 'active'}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg py-6 text-base disabled:opacity-50"
            >
              {status === 'active' ? 'Suscripción activa' : loading ? 'Cargando...' : 'Suscribirme'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
