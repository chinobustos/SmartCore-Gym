'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, AlertTriangle, Clock, Calendar, Sparkles } from 'lucide-react';

export default function BillingPage() {
  const { gym, gymId, user } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const handleSubscribe = async () => {
    setLoading(true);
    setMsg('');
    setError('');
    try {
      const res = await fetch('/api/mercadopago/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId: gymId || gym?.id,
          gymName: gym?.name || 'Mi Gimnasio',
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al conectar con Mercado Pago');

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
              {status === 'trialing' && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1 text-xs">
                  Prueba Gratuita (14 Días)
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
            </div>
            <CardDescription className="text-slate-400">
              Gimnasio: <strong className="text-slate-200">{gym?.name || 'Cargando...'}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'trialing' && (
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

            {status === 'past_due' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                  <div>
                    <h4 className="font-semibold text-red-200">Acceso Bloqueado por Falta de Pago</h4>
                    <p className="text-xs text-red-300/80">
                      Suscribe tu cuenta para reactivar el uso de todas las herramientas operativas.
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
              $15.000 <span className="text-xs font-normal text-slate-400">/ mes</span>
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
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg py-6 text-base"
            >
              {loading ? 'Cargando...' : 'Suscribirme'}
            </Button>
          </CardFooter>

        </Card>
      </div>
    </div>
  );
}
