"use client";

import { IdCard, CalendarCheck, Dumbbell, TrendingUp } from "lucide-react";
import Reveal from "./Reveal";

const ACCESOS = [
  { icon: IdCard, titulo: "Carnet digital", detalle: "Su credencial en el celular, siempre encima." },
  { icon: CalendarCheck, titulo: "Reserva de clases", detalle: "Se anota solo, sin escribirte por WhatsApp." },
  { icon: Dumbbell, titulo: "Su rutina", detalle: "La rutina asignada, a mano en cada ejercicio." },
  { icon: TrendingUp, titulo: "Su progreso", detalle: "Asistencia y evolución a lo largo del tiempo." },
];

export default function MemberPortal() {
  return (
    <section className="screen band-ink px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
      <div className="mx-auto max-w-[1320px] grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20">
        <Reveal>
          <p className="eyebrow">No es solo para vos</p>
          <h2 className="display mt-4 text-[clamp(1.9rem,4vw,2.9rem)]">
            Tus socios también entran.
          </h2>
          <p className="mt-6 text-[1.0625rem] leading-relaxed" style={{ color: "#a9c2b8" }}>
            Cada socio tiene su propio acceso. Menos consultas en el mostrador,
            menos mensajes fuera de hora, y un gimnasio que se siente más
            profesional desde el primer día.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-9">
          {ACCESOS.map((acceso, i) => (
            <Reveal key={acceso.titulo} delay={i * 0.08}>
              <div className="flex gap-4">
                <acceso.icon
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: "var(--primary)" }}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-semibold text-[0.9375rem]">{acceso.titulo}</h3>
                  <p className="text-sm leading-relaxed mt-1.5" style={{ color: "#8fa9a0" }}>
                    {acceso.detalle}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
