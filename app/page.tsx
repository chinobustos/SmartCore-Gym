import type { Metadata } from 'next';

import { archivo, chivo, chivoMono } from './fonts';
import '@/components/landing/landing.css';

import { LandingNav, LandingFooter } from '@/components/landing/LandingChrome';
import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import Modules from '@/components/landing/Modules';
import MemberPortal from '@/components/landing/MemberPortal';
import Integrations from '@/components/landing/Integrations';
import ClosingCta from '@/components/landing/ClosingCta';

export const metadata: Metadata = {
  title: 'SmartCore Gym — Sabé quién debe sin abrir una planilla',
  description:
    'Sistema de gestión para gimnasios: socios, cuotas, clases, asistencia, inventario y finanzas. Cobros automáticos por Mercado Pago. 14 días de prueba.',
};

export default function LandingPage() {
  return (
    <main
      data-landing
      className={`${archivo.variable} ${chivo.variable} ${chivoMono.variable} min-h-screen`}
    >
      {/* Sin JavaScript no hay IntersectionObserver: el contenido tiene que
          verse igual, no quedarse en opacity 0. */}
      <noscript>
        <style>{`[data-landing] .reveal{opacity:1;transform:none}`}</style>
      </noscript>

      <LandingNav />
      <Hero />
      <Problem />
      <Modules />
      <MemberPortal />
      <Integrations />
      <ClosingCta />
      <LandingFooter />
    </main>
  );
}
