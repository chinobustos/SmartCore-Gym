"use client";

import {
  LayoutDashboard,
  Users,
  Tag,
  CalendarDays,
  ClipboardCheck,
  Package,
  Wallet,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import Reveal from "./Reveal";

/**
 * Cada modulo dice que reemplaza. Eso es informacion real sobre el contenido
 * — el cuaderno o la planilla que el gimnasio deja de usar — y ordena mejor
 * que numerarlos 01 / 02 / 03, porque los modulos no son una secuencia.
 */
interface Modulo {
  icon: LucideIcon;
  nombre: string;
  reemplaza: string;
  detalle: string;
}

const MODULOS: Modulo[] = [
  {
    icon: LayoutDashboard,
    nombre: "Dashboard",
    reemplaza: "el cálculo mental",
    detalle: "Socios activos, ingresos del mes y vencimientos próximos en una sola pantalla.",
  },
  {
    icon: Users,
    nombre: "Socios",
    reemplaza: "las fichas de cartón",
    detalle: "Ficha de cada socio con plan, contacto, estado y su historial.",
  },
  {
    icon: Tag,
    nombre: "Membresías",
    reemplaza: "la lista de precios del mostrador",
    detalle: "Creá los planes que quieras: precio, duración y beneficios de cada uno.",
  },
  {
    icon: CalendarDays,
    nombre: "Clases",
    reemplaza: "el pizarrón de horarios",
    detalle: "Agenda de actividades con cupos y reservas de los socios.",
  },
  {
    icon: ClipboardCheck,
    nombre: "Asistencia",
    reemplaza: "la planilla de la entrada",
    detalle: "Check-in rápido en el mostrador y registro de quién vino y cuándo.",
  },
  {
    icon: Package,
    nombre: "Inventario",
    reemplaza: "el conteo de la heladera",
    detalle: "Stock de la tienda y ventas descontadas automáticamente.",
  },
  {
    icon: Wallet,
    nombre: "Finanzas",
    reemplaza: "el cuaderno de caja",
    detalle: "Ingresos y egresos por categoría, exportables a Excel.",
  },
  {
    icon: CreditCard,
    nombre: "Suscripción",
    reemplaza: "las llamadas para cobrar",
    detalle: "Tu propio plan de SmartCore, con débito automático por Mercado Pago.",
  },
];

export default function Modules() {
  return (
    <section className="screen px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px]">
        <Reveal>
          <p className="eyebrow">Ocho módulos, un sistema</p>
          <h2 className="display mt-4 text-[clamp(1.9rem,4vw,2.9rem)] max-w-[18ch]">
            Todo lo que hoy vive en papeles sueltos.
          </h2>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "var(--rule)" }}>
          {MODULOS.map((modulo, i) => (
            <Reveal key={modulo.nombre} delay={(i % 4) * 0.06}>
              <article
                className="h-full p-6 transition-colors duration-300 hover:bg-[var(--paper)] group"
                style={{ background: "var(--surface)" }}
              >
                <modulo.icon
                  className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5"
                  style={{ color: "var(--primary)" }}
                  aria-hidden="true"
                />
                <h3 className="display mt-4 text-lg" style={{ letterSpacing: "-0.02em" }}>
                  {modulo.nombre}
                </h3>
                <p className="mono text-[10.5px] mt-1.5 uppercase tracking-[0.1em]" style={{ color: "var(--primary)" }}>
                  reemplaza {modulo.reemplaza}
                </p>
                <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
                  {modulo.detalle}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
