'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Dumbbell, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirection is handled in the login function
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground">SmartCore Gym</span>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bienvenido de nuevo
            </h1>
            <p className="text-muted-foreground text-sm">
              Ingresa tus credenciales para acceder al panel de administración.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartcoregym.com"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Contraseña</label>
                  <a href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 hover:scale-[1.01] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Ingresar al sistema
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Datos de prueba: admin@smartcoregym.com / admin123
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Hero Image / Pattern */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 relative overflow-hidden items-center justify-center">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-zinc-950 to-zinc-950 opacity-80" />
        
        <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl rounded-full bg-primary/40" />
        <div className="absolute bottom-0 left-0 p-32 opacity-10 blur-3xl rounded-full bg-primary/30" />
        
        <div className="relative z-10 w-full max-w-lg p-12 text-zinc-300">
          <Dumbbell className="w-16 h-16 text-primary mb-8" />
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-6">
            Lleva tu gimnasio al siguiente nivel.
          </h2>
          <p className="text-lg text-zinc-400 font-medium">
            SmartCore Gym es la plataforma todo-en-uno que simplifica la gestión de socios, membresías, clases e inventario en un solo lugar.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="border-l-2 border-primary/50 pl-4">
              <p className="text-2xl font-bold text-white">+500</p>
              <p className="text-xs text-zinc-500 font-medium mt-1">Gimnasios Activos</p>
            </div>
            <div className="border-l-2 border-primary/50 pl-4">
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-xs text-zinc-500 font-medium mt-1">Uptime Garantizado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
