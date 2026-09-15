"use client";

import { RefreshCcw, ShieldCheck, Smartphone } from "lucide-react";
import Reveal from "./Reveal";

/**
 * Copy deliberadamente concreta: se nombra lo que la persona controla y
 * reconoce ("el débito le sale de su cuenta"), no la implementación.
 */
const PIEZAS = [
  {
    icon: RefreshCcw,
    titulo: "Tu plan, por Mercado Pago",
    detalle:
      "Pagás SmartCore con débito automático: autorizás una vez y se renueva solo cada mes. Si un pago falla, te avisa antes de cortarte el acceso.",
  },
  {
    icon: ShieldCheck,
    titulo: "Tus datos, separados de los demás",
    detalle:
      "Cada gimnasio queda aislado a nivel de base de datos, no por una condición en el código. Nadie puede ver los socios ni los números de otro gimnasio.",
  },
  {
    icon: Smartphone,
    titulo: "Se instala como una app",
    detalle:
      "Andá al sitio desde la tablet del mostrador o tu celular y agregala a la pantalla de inicio. Queda con su ícono, sin pasar por ninguna tienda.",
  },
];

export default function Integrations() {
  return (
    <section className="screen px-6 sm:px-10 lg:px-16 py-20 sm:py-28" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-[1320px]">
        <Reveal>
          <p className="eyebrow">Cómo funciona por debajo</p>
          <h2 className="display mt-4 text-[clamp(1.9rem,4vw,2.9rem)] max-w-[16ch]">
            Lo que te ahorra tiempo y lo que te cuida.
          </h2>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-10 lg:gap-14">
          {PIEZAS.map((pieza, i) => (
            <Reveal key={pieza.titulo} delay={i * 0.09}>
              <div
                className="pt-6 border-t"
                style={{ borderColor: "var(--ink)", borderTopWidth: "2px" }}
              >
                <pieza.icon className="w-5 h-5" style={{ color: "var(--primary)" }} aria-hidden="true" />
                <h3 className="display mt-4 text-xl" style={{ letterSpacing: "-0.02em" }}>
                  {pieza.titulo}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed mt-3" style={{ color: "var(--muted)" }}>
                  {pieza.detalle}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
