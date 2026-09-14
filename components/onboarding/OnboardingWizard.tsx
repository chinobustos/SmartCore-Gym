'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardList,
  SquareCheck as CheckSquare,
  Package,
  Wallet,
  BadgePercent,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Zap,
  TrendingUp,
  ShieldCheck,
  QrCode,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/AuthContext';

export interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  href?: string;
  description: string;
  highlights: string[];
  proTip?: string;
  previewData?: {
    type: 'kpi' | 'members' | 'membership' | 'classes' | 'attendance' | 'inventory' | 'finances' | 'portal';
    title: string;
    items: Array<{ label: string; value: string; extra?: string; color?: string }>;
  };
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'welcome',
    title: '¡Te damos la bienvenida a SmartCore Gym!',
    subtitle: 'La plataforma integral para potenciar y automatizar tu centro deportivo',
    badge: 'Inicio & Bienvenida',
    icon: Sparkles,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    description:
      'Has iniciado tu período de prueba gratuita de 14 días con acceso total. Este breve recorrido te mostrará cómo cada módulo del sistema te ayudará a ahorrar tiempo, fidelizar a tus socios y maximizar la rentabilidad de tu gimnasio.',
    highlights: [
      'Gestión integral de socios, cobros y asistencias en un solo lugar',
      'Control financiero con balances y flujo de caja en tiempo real',
      'Acceso móvil para tus socios con carnet digital QR',
      'Automatización de vencimientos y recordatorios de pago'
    ],
    proTip: 'Puedes volver a abrir este tour en cualquier momento desde el botón "Guía de Módulos" en la barra superior.'
  },
  {
    id: 'dashboard',
    title: 'Dashboard: Tu Panel de Control Central',
    subtitle: 'Monitoreo en tiempo real de los indicadores clave de tu negocio',
    badge: 'Módulo 1 / 8',
    icon: LayoutDashboard,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    href: '/dashboard',
    description:
      'El Dashboard te brinda un resumen ejecutivo instantáneo: cuántos socios activos tienes, el total recaudado en el mes, la concurrencia del día y quiénes tienen pagos vencidos que requieren atención.',
    highlights: [
      'KPIs esenciales con porcentajes de crecimiento semanal',
      'Gráfico de asistencia horaria y semanal para medir horas pico',
      'Feed de actividad reciente en vivo (altas, renovaciones y pagos)',
      'Distribución de socios por tipo de plan y estado de suscripción'
    ],
    proTip: 'Revisa el Dashboard al abrir cada mañana para planificar el flujo de personas y cobros del día.',
    previewData: {
      type: 'kpi',
      title: 'Métricas en Vivo del Dashboard',
      items: [
        { label: 'Socios Activos', value: '142 socios', extra: '+8.2%', color: 'text-emerald-400' },
        { label: 'Ingresos del Mes', value: '$1.840.000', extra: '+12.5%', color: 'text-blue-400' },
        { label: 'Asistencia Hoy', value: '48 ingresos', extra: 'Pico a las 19hs', color: 'text-amber-400' },
        { label: 'Pagos Vencidos', value: '3 alertas', extra: 'Requieren aviso', color: 'text-rose-400' }
      ]
    }
  },
  {
    id: 'members',
    title: 'Miembros: Padrón y Fichas de Socios',
    subtitle: 'Administra los perfiles, contactos y estados de tus clientes',
    badge: 'Módulo 2 / 8',
    icon: Users,
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    href: '/members',
    description:
      'Registra nuevos clientes con su DNI, teléfono y correo en segundos. Visualiza de un vistazo su plan actual, fecha de alta, historial de cuotas y estado (Activo, Inactivo o Vencido).',
    highlights: [
      'Alta rápida de socios con asignación automática de plan',
      'Buscador instantáneo por nombre o número de DNI',
      'Filtros dinámicos por estado para segmentar socios al día vs vencidos',
      'Asignación de carnet digital con código QR para el socio'
    ],
    proTip: 'Usa el botón "Nuevo Socio" para cargar a tus primeros clientes o importar tu lista actual.',
    previewData: {
      type: 'members',
      title: 'Ficha de Ejemplo de Socio',
      items: [
        { label: 'Socio', value: 'Agustina Pérez', extra: 'DNI: 38.452.190', color: 'text-foreground font-semibold' },
        { label: 'Plan Actual', value: 'Plan Mensual', extra: 'Vence: 28 de este mes', color: 'text-blue-400' },
        { label: 'Estado', value: 'Activo / Al día', extra: '✓ Asistencia regular', color: 'text-emerald-400' }
      ]
    }
  },
  {
    id: 'memberships',
    title: 'Membresías & Pagos: Cobranzas y Planes',
    subtitle: 'Control total de planes, renovaciones y estados de cuotas',
    badge: 'Módulo 3 / 8',
    icon: CreditCard,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
    href: '/memberships',
    description:
      'Configura tus planes de entrenamiento (Pase Diario, Mensual, Trimestral o Anual). El sistema lleva el registro de los pagos recibidos, emite recibos y avisa cuándo una cuota está próxima a vencer.',
    highlights: [
      'Soporte para múltiples planes y modalidades de pago',
      'Opción de renovación automática para mayor retención de clientes',
      'Semáforo de estados: Pagado (Verde), Pendiente (Amarillo) y Vencido (Rojo)',
      'Registro de pagos en Efectivo, Transferencia o Mercado Pago'
    ],
    proTip: 'Al cobrar una cuota, el ingreso se imputa automáticamente al módulo de Finanzas sin doble trabajo.',
    previewData: {
      type: 'membership',
      title: 'Planes Habituales del Gimnasio',
      items: [
        { label: 'Plan Mensual Libre', value: '$12.000 / mes', extra: 'Acceso total a sala y máquinas' },
        { label: 'Plan Trimestral Pro', value: '$30.000 / trimestre', extra: '15% de ahorro para el socio' },
        { label: 'Pase Diario', value: '$1.500 / día', extra: 'Ideal para visitantes o pruebas' }
      ]
    }
  },
  {
    id: 'classes',
    title: 'Clases & Agenda: Turnos y Actividades Grupales',
    subtitle: 'Cronograma semanal, instructores y reservas de cupos',
    badge: 'Módulo 4 / 8',
    icon: ClipboardList,
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    href: '/classes',
    description:
      'Organiza las clases de tu gimnasio (CrossFit, Spinning, Funcional, Yoga, Boxeo, etc.). Define el día, horario, duración, profesor a cargo y cupo máximo de personas para evitar sobrecupos.',
    highlights: [
      'Gestión de cupos en tiempo real para cada actividad',
      'Inscripción de socios con 1 solo clic y control de lista de asistentes',
      'Códigos de colores por tipo de disciplina para visualización intuitiva',
      'Cancelación de reservas y liberación de cupos automática'
    ],
    proTip: 'Tus socios pueden ver los horarios disponibles y consultar sus clases desde el portal.',
    previewData: {
      type: 'classes',
      title: 'Ejemplo de Grilla de Clases',
      items: [
        { label: 'CrossFit WOD', value: '18:00 - 19:00 hs', extra: 'Cupo: 18 / 20 inscriptos', color: 'text-purple-400' },
        { label: 'Spinning Power', value: '19:15 - 20:00 hs', extra: 'Cupo: 15 / 15 (Completo)', color: 'text-pink-400' },
        { label: 'Entrenamiento Funcional', value: '20:15 - 21:15 hs', extra: 'Cupo: 12 / 25 inscriptos', color: 'text-cyan-400' }
      ]
    }
  },
  {
    id: 'attendance',
    title: 'Asistencia: Check-in y Control de Accesos',
    subtitle: 'Ingresos rápidos en recepción por DNI o código QR',
    badge: 'Módulo 5 / 8',
    icon: CheckSquare,
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    href: '/attendance',
    description:
      'La herramienta indispensable para el mostrador de recepción. Permite registrar la entrada de cualquier socio en menos de 2 segundos buscando su DNI o escaneando su QR, validando al instante si tiene la cuota al día.',
    highlights: [
      'Check-in ultra veloz con teclado numérico o pistola lectora QR',
      'Alerta visual inmediata si el socio tiene la membresía vencida',
      'Historial cronológico con hora exacta de entrada',
      'Estadísticas de afluencia para conocer las horas de mayor tráfico'
    ],
    proTip: 'Coloca una tablet o notebook en recepción con esta pantalla abierta para agilizar el ingreso en horas pico.',
    previewData: {
      type: 'attendance',
      title: 'Registro de Entradas en Vivo',
      items: [
        { label: '18:42 hs', value: 'Tomás Ruiz (DNI: 39.120.441)', extra: '✓ Plan Mensual - Acceso Permitido', color: 'text-emerald-400' },
        { label: '18:35 hs', value: 'Sofía Ramírez (DNI: 40.899.201)', extra: '✓ Plan Trimestral - Acceso Permitido', color: 'text-emerald-400' },
        { label: '18:20 hs', value: 'Marcos Benítez (DNI: 35.772.900)', extra: '⚠ Cuota Vencida - Requiere Pago', color: 'text-rose-400' }
      ]
    }
  },
  {
    id: 'inventory',
    title: 'Inventario: Tienda y Stock de Productos',
    subtitle: 'Venta de suplementos, bebidas e indumentaria deportiva',
    badge: 'Módulo 6 / 8',
    icon: Package,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    href: '/inventory',
    description:
      'Multiplica los ingresos de tu gimnasio con la tienda interna. Controla las existencias de proteínas, creatina, bebidas isotónicas, barras energéticas y accesorios con alertas automáticas cuando el stock esté bajo.',
    highlights: [
      'Catálogo categorizado por suplementos, bebidas y accesorios',
      'Botones rápidos para sumar stock (+1) o registrar ventas (-1)',
      'Alertas de stock mínimo para reponer mercadería a tiempo',
      'Cada venta registra automáticamente un ingreso en el módulo de Finanzas'
    ],
    proTip: 'Mantener un stock surtido de bebidas y proteínas fraccionadas es una de las fuentes de mayor ganancia neta en un gimnasio.',
    previewData: {
      type: 'inventory',
      title: 'Productos en Tienda',
      items: [
        { label: 'Whey Protein 1kg (Vainilla)', value: '$24.500', extra: 'Stock: 18 un. (Óptimo)' },
        { label: 'Bebida Isotónica 500ml', value: '$1.800', extra: 'Stock: 4 un. (¡Stock Bajo!)', color: 'text-amber-400' },
        { label: 'Creatina Monohidratada 300g', value: '$19.000', extra: 'Stock: 12 un. (Óptimo)' }
      ]
    }
  },
  {
    id: 'finances',
    title: 'Finanzas: Caja, Ingresos y Egresos',
    subtitle: 'Visión transparente de la salud económica de tu negocio',
    badge: 'Módulo 7 / 8',
    icon: Wallet,
    color: 'text-indigo-400',
    bgGradient: 'from-indigo-500/20 via-blue-500/10 to-transparent',
    href: '/finances',
    description:
      'Olvídate de las planillas de cálculo desordenadas. Finanzas centraliza automáticamente todos los ingresos por cuotas y tienda, permitiéndote además cargar gastos fijos (alquiler, sueldos, servicios) para calcular el beneficio neto real.',
    highlights: [
      'Cálculo automático de Ingresos, Egresos y Balance Neto del mes',
      'Desglose por método de pago: Efectivo, Transferencia, Mercado Pago y Débito',
      'Registro rápido de gastos operativos con categorías personalizables',
      'Historial completo de transacciones auditables'
    ],
    proTip: 'Registra tus gastos mensuales de servicios y mantenimiento para obtener tu margen de ganancia neto real.',
    previewData: {
      type: 'finances',
      title: 'Resumen de Flujo de Caja',
      items: [
        { label: 'Total Ingresos del Mes', value: '+$1.840.000', extra: 'Cuotas + Ventas tienda', color: 'text-emerald-400 font-semibold' },
        { label: 'Total Gastos y Servicios', value: '-$620.000', extra: 'Alquiler + Servicios + Stock', color: 'text-rose-400 font-semibold' },
        { label: 'Ganancia Neta Real', value: '+$1.220.000', extra: 'Margen operativo del 66%', color: 'text-cyan-400 font-bold' }
      ]
    }
  },
  {
    id: 'portal',
    title: 'Suscripción & Portal Móvil del Socio',
    subtitle: 'Tu cuenta SaaS y la experiencia digital de tus clientes',
    badge: 'Módulo 8 / 8',
    icon: Smartphone,
    color: 'text-teal-400',
    bgGradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    href: '/billing',
    description:
      'Gestiona la suscripción de tu software en la sección de Facturación. Además, tus socios pueden ingresar al portal `/member` para tener su carnet digital QR, ver el estado de su cuota y chequear el horario de clases.',
    highlights: [
      '14 días de prueba gratuita completa sin compromiso',
      'Integración oficial con Mercado Pago para cobros recurrentes de tu plan SaaS',
      'Portal del Socio (`/member`): carnet digital sin necesidad de imprimir credenciales de plástico',
      'Soporte técnico directo y actualizaciones continuas del sistema'
    ],
    proTip: 'Puedes imprimir un QR en la recepción para que los socios abran su portal desde el celular.',
    previewData: {
      type: 'portal',
      title: 'Ventajas del Portal Digital',
      items: [
        { label: 'Carnet Digital QR', value: 'En el smartphone del socio', extra: 'Cero costos de credenciales físicas' },
        { label: 'Plan SaaS SmartCore', value: 'Período de Prueba Activo', extra: 'Soporte prioritario incluido' }
      ]
    }
  },
  {
    id: 'finish',
    title: '¡Todo listo para transformar tu Gimnasio!',
    subtitle: 'Comienza ahora configurando los primeros datos de tu centro',
    badge: 'Primeros Pasos',
    icon: Zap,
    color: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 via-blue-500/10 to-transparent',
    description:
      '¡Felicitaciones! Ya conoces la potencia de cada módulo de SmartCore Gym. Para aprovechar al máximo tus primeros minutos, te sugerimos realizar estas 3 acciones clave:',
    highlights: [
      '1. Cargar tus primeros socios en el módulo de Miembros',
      '2. Publicar tus clases grupales en la Agenda',
      '3. Cargar productos al Inventario de tu tienda'
    ],
    proTip: '¡Estamos a tu disposición para ayudarte a escalar tu gimnasio al siguiente nivel!'
  }
];

const ONBOARDING_STORAGE_KEY_PREFIX = 'smartcore_gym_onboarding_completed_v1';

// La marca de "tour completado" se guarda por gimnasio: si dos dueños comparten
// el mismo navegador, cada uno ve su propio recorrido inicial.
const storageKeyFor = (gymId: string) => ONBOARDING_STORAGE_KEY_PREFIX + '_' + gymId;

export default function OnboardingWizard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { gym } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  // Ref y no state: marcar la inicialización no debe volver a disparar el efecto
  // ni cancelar el timer de apertura automática.
  const hasInitializedRef = useRef(false);

  // Apertura: ?tour=true fuerza el recorrido; si no, se abre una sola vez por gimnasio
  useEffect(() => {
    if (hasInitializedRef.current) return;

    if (searchParams.get('tour') === 'true') {
      hasInitializedRef.current = true;
      setIsOpen(true);
      setCurrentStepIndex(0);
      // Limpia el parámetro de la URL sin recargar la página
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete('tour');
      const nextQuery = nextParams.toString() ? '?' + nextParams.toString() : '';
      router.replace(pathname + nextQuery);
      return;
    }

    // Sin el gimnasio cargado todavía no sabemos qué clave consultar: esperamos.
    if (!gym?.id) return;

    hasInitializedRef.current = true;
    if (localStorage.getItem(storageKeyFor(gym.id))) return;

    // Auto-apertura en la primera visita
    const timer = setTimeout(() => {
      setIsOpen(true);
      setCurrentStepIndex(0);
    }, 700);
    return () => clearTimeout(timer);
  }, [searchParams, pathname, router, gym?.id]);

  // Listen to custom event for re-triggering from TopBar
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const stepIndex = customEvent.detail?.stepIndex ?? 0;
      setCurrentStepIndex(stepIndex);
      setIsOpen(true);
    };

    window.addEventListener('open-onboarding-wizard', handleOpenEvent);
    return () => window.removeEventListener('open-onboarding-wizard', handleOpenEvent);
  }, []);

  const currentStep = WIZARD_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  const handleNext = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const markCompleted = () => {
    setIsCompleted(true);
    setIsOpen(false);
  };

  const handleComplete = markCompleted;
  const handleSkip = markCompleted;

  const handleNavigateToModule = (href?: string) => {
    if (!href) return;
    setIsOpen(false);
    router.push(href);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    },
    [isOpen, currentStepIndex]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // La marca se escribe recién cuando conocemos el gimnasio: apenas terminado el
  // registro el tour puede cerrarse antes de que AuthContext termine de cargarlo.
  useEffect(() => {
    if (isCompleted && gym?.id) {
      localStorage.setItem(storageKeyFor(gym.id), 'true');
    }
  }, [isCompleted, gym?.id]);

  // Bloquea el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const StepIcon = currentStep.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-wizard-title"
          >
            {/* Top Header Background Glow */}
            <div
              className={`absolute top-0 left-0 right-0 h-40 bg-gradient-to-b ${currentStep.bgGradient} pointer-events-none transition-all duration-500`}
            />

            {/* Wizard Header Bar */}
            <div className="relative px-6 pt-5 pb-3 border-b border-border/80 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-secondary border border-border shadow-sm ${currentStep.color}`}>
                  <StepIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {currentStep.badge}
                    </span>
                    {gym?.name && (
                      <span className="text-xs text-muted-foreground hidden sm:inline-block">
                        • {gym.name}
                      </span>
                    )}
                  </div>
                  <h2 id="onboarding-wizard-title" className="text-lg font-bold text-foreground mt-0.5 line-clamp-1">
                    {currentStep.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSkip}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors hidden sm:block"
                >
                  Saltar tour
                </button>
                <button
                  onClick={handleSkip}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Cerrar tour"
                  aria-label="Cerrar tour"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Wizard Step Navigation Dots / Indicators */}
            <div className="px-6 py-2.5 bg-secondary/50 border-b border-border/60 flex items-center justify-between overflow-x-auto scrollbar-thin">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {WIZARD_STEPS.map((s, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isPast = idx < currentStepIndex;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStepIndex(idx)}
                      title={s.title}
                      aria-label={"Paso " + (idx + 1) + ": " + s.title}
                      aria-current={isActive ? 'step' : undefined}
                      className={`h-2 transition-all duration-300 rounded-full ${
                        isActive
                          ? 'w-8 bg-primary shadow-sm'
                          : isPast
                          ? 'w-3 bg-emerald-500/80 hover:bg-emerald-500'
                          : 'w-2 bg-muted hover:bg-muted-foreground/40'
                      }`}
                    />
                  );
                })}
              </div>

              <span className="text-xs font-medium text-muted-foreground ml-4 flex-shrink-0">
                Paso {currentStepIndex + 1} de {WIZARD_STEPS.length}
              </span>
            </div>

            {/* Wizard Main Content Body */}
            <div className="p-6 overflow-y-auto scrollbar-thin flex-1 relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Subtitle & Main Explanation */}
                  <div>
                    <p className="text-sm font-medium text-primary mb-1">{currentStep.subtitle}</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {currentStep.description}
                    </p>
                  </div>

                  {/* Grid: Highlights & Module Interactive Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Key Highlights */}
                    <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        Funcionalidades Principales
                      </h4>
                      <ul className="space-y-2.5">
                        {currentStep.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/90 leading-snug">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column: Live Mockup / Visual Preview Card */}
                    {currentStep.previewData ? (
                      <div className="p-4 rounded-xl bg-secondary/80 border border-border shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-primary" />
                              {currentStep.previewData.title}
                            </h4>
                            {currentStep.href && (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-semibold">
                                {currentStep.href}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            {currentStep.previewData.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-lg bg-card border border-border/60 flex items-center justify-between text-xs"
                              >
                                <div className="min-w-0 pr-2">
                                  <p className="text-muted-foreground truncate">{item.label}</p>
                                  {item.extra && (
                                    <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">{item.extra}</p>
                                  )}
                                </div>
                                <span className={`font-semibold flex-shrink-0 ${item.color || 'text-foreground'}`}>
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {currentStep.href && (
                          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">¿Quieres probarlo ahora?</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNavigateToModule(currentStep.href)}
                              className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
                            >
                              Ir a {currentStep.title.split(':')[0]} <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : isLastStep ? (
                      /* Action box for final step */
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" />
                            Atajos Recomendados
                          </h4>
                          <div className="space-y-2">
                            <button
                              onClick={() => handleNavigateToModule('/members')}
                              className="w-full p-2.5 rounded-lg bg-card border border-border hover:border-primary/50 text-left flex items-center justify-between transition-colors group"
                            >
                              <div>
                                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                  1. Registrar tu primer Socio
                                </p>
                                <p className="text-[11px] text-muted-foreground">Carga los primeros clientes de tu gimnasio</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                            </button>

                            <button
                              onClick={() => handleNavigateToModule('/classes')}
                              className="w-full p-2.5 rounded-lg bg-card border border-border hover:border-primary/50 text-left flex items-center justify-between transition-colors group"
                            >
                              <div>
                                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                  2. Crear tu grilla de Clases
                                </p>
                                <p className="text-[11px] text-muted-foreground">Programa horarios, profes y cupos</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                            </button>

                            <button
                              onClick={() => handleNavigateToModule('/inventory')}
                              className="w-full p-2.5 rounded-lg bg-card border border-border hover:border-primary/50 text-left flex items-center justify-between transition-colors group"
                            >
                              <div>
                                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                                  3. Cargar tu primer Producto
                                </p>
                                <p className="text-[11px] text-muted-foreground">Carga bebidas, suplementos y accesorios a tu tienda</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-secondary border border-border flex flex-col justify-center items-center text-center">
                        <div className="p-4 rounded-full bg-primary/10 text-primary mb-3">
                          <StepIcon className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-medium text-foreground">Gestión Inteligente y Ágil</p>
                        <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                          Diseñado para simplificar la administración diaria de tu centro deportivo.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pro Tip Box */}
                  {currentStep.proTip && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/80">
                        <strong className="text-primary font-semibold">Consejo Pro: </strong>
                        {currentStep.proTip}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Wizard Footer Controls */}
            <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between z-10">
              <div>
                {!isFirstStep ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    className="text-xs border-border text-foreground hover:bg-secondary"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Anterior
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Saltar recorrido
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isLastStep ? (
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 text-xs px-4"
                  >
                    {isFirstStep ? 'Comenzar recorrido' : 'Siguiente Módulo'}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    size="sm"
                    className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs px-5 shadow-lg shadow-emerald-500/20"
                  >
                    ¡Empezar a usar SmartCore Gym!
                    <CheckCircle2 className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Utility function to open the onboarding wizard from anywhere
export function triggerOnboardingWizard(stepIndex = 0) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('open-onboarding-wizard', { detail: { stepIndex } })
    );
  }
}
