'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ArrowRight, ArrowLeft, Check, Sparkles, Building2, Clock, ShieldCheck, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    gymName: '',
    rubro: 'Fitness & Musculación',
    logoUrl: '',
    openDays: 'Lunes a Sábado',
    openHours: '07:00 a 22:00 hs',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.fullName) {
        setErrorMsg('Por favor completa todos los campos del usuario.');
        return;
      }
      if (formData.password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.gymName) {
        setErrorMsg('Ingresa el nombre de tu gimnasio.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          gymName: formData.gymName,
          rubro: formData.rubro,
          logoUrl: formData.logoUrl,
          openingHours: {
            dias: formData.openDays,
            horarios: formData.openHours,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al completar el registro.');
      }

      // Automatically sign in user
      await login(formData.email, formData.password);
      router.push('/dashboard?tour=true');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado durante el registro.');
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="flex items-center gap-2 mb-8 z-10">
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
          <Dumbbell className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SmartCore Gym
          </h1>
          <p className="text-xs text-slate-400">Plataforma SaaS para Gestión de Gimnasios</p>
        </div>
      </div>

      {/* Wizard Card Container */}
      <Card className="w-full max-w-xl bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl z-10">
        <CardHeader>
          {/* Progress Indicators */}
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300 ${
                    step === i
                      ? 'bg-primary text-slate-950 font-bold ring-4 ring-primary/20 shadow-lg'
                      : step > i
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {step > i ? <Check className="h-5 w-5" /> : i}
                </div>
                {i < 4 && (
                  <div
                    className={`h-1 w-12 sm:w-16 mx-1 sm:mx-2 rounded transition-colors duration-300 ${
                      step > i ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <CardTitle className="text-xl text-white font-semibold">
            {step === 1 && 'Paso 1: Creación de Cuenta'}
            {step === 2 && 'Paso 2: Datos de tu Gimnasio'}
            {step === 3 && 'Paso 3: Horarios y Configuración'}
            {step === 4 && 'Paso 4: ¡Prueba Gratuita de 14 Días!'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {step === 1 && 'Ingresa tus credenciales de administrador principal'}
            {step === 2 && 'Personaliza la información de tu centro deportivo'}
            {step === 3 && 'Define la disponibilidad para tus clientes'}
            {step === 4 && 'Comienza inmediatamente sin ingresar tarjeta de crédito'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-200">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="fullName"
                      placeholder="Ej: Juan Pérez"
                      className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-primary"
                      value={formData.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@tugimnasio.com"
                      className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-primary"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-primary"
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gymName" className="text-slate-200">Nombre del Gimnasio</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="gymName"
                      placeholder="Ej: Smart Fitness Center"
                      className="pl-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-primary"
                      value={formData.gymName}
                      onChange={e => handleChange('gymName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rubro" className="text-slate-200">Especialidad / Rubro Principal</Label>
                  <select
                    id="rubro"
                    className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-100 focus:border-primary focus:outline-none"
                    value={formData.rubro}
                    onChange={e => handleChange('rubro', e.target.value)}
                  >
                    <option value="Fitness & Musculación">Fitness & Musculación</option>
                    <option value="CrossFit / Funcional">CrossFit / Entrenamiento Funcional</option>
                    <option value="Artes Marciales / Boxeo">Artes Marciales / Boxeo</option>
                    <option value="Estudio de Yoga & Pilates">Estudio de Yoga & Pilates</option>
                    <option value="Centro Deportivo Multidisciplinario">Centro Deportivo Multidisciplinario</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl" className="text-slate-200">URL del Logo (Opcional)</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://..."
                    className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-primary"
                    value={formData.logoUrl}
                    onChange={e => handleChange('logoUrl', e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openDays" className="text-slate-200">Días de Apertura</Label>
                  <Input
                    id="openDays"
                    placeholder="Ej: Lunes a Sábado"
                    className="bg-slate-950 border-slate-800 text-slate-100 focus:border-primary"
                    value={formData.openDays}
                    onChange={e => handleChange('openDays', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openHours" className="text-slate-200">Horario Habitual</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="openHours"
                      placeholder="Ej: 07:00 a 22:00 hs"
                      className="pl-10 bg-slate-950 border-slate-800 text-slate-100 focus:border-primary"
                      value={formData.openHours}
                      onChange={e => handleChange('openHours', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4 text-center py-2">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white">¡Todo listo para despegar!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Tu gimnasio <span className="font-semibold text-primary">{formData.gymName || 'SmartGym'}</span> comenzará con <strong className="text-emerald-400">14 días de prueba gratuita completa</strong>.
                </p>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left space-y-2 max-w-md mx-auto text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Acceso ilimitado a Socios, Clases, Inventario y Finanzas.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Sin cobros automáticos ni tarjeta requerida.</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-800/80 pt-4">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={loading} className="border-slate-800 text-slate-300 hover:bg-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" /> Atrás
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => router.push('/login')} className="text-slate-400 hover:text-white">
              ¿Ya tienes cuenta? Ingresar
            </Button>
          )}

          {step < 4 ? (
            <Button onClick={handleNext} className="bg-primary text-slate-950 font-semibold hover:bg-primary/90">
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400">
              {loading ? 'Creando Gimnasio...' : 'Comenzar 14 días gratis'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
