"use client";

import Reveal from "./Reveal";

/**
 * Antes / ahora. La columna izquierda usa la voz del dueño del gimnasio;
 * la derecha dice que hace el sistema, sin adjetivos de venta.
 */
const FILAS = [
  {
    antes: "«¿Este ya pagó el mes?»",
    ahora: "Cada socio tiene su estado de cuota y su fecha de vencimiento a la vista.",
  },
  {
    antes: "«Se me pasó cobrarle a tres.»",
    ahora: "Los vencimientos del día te esperan en la pantalla de inicio, sin buscarlos.",
  },
  {
    antes: "«No sé cuánto entró en marzo.»",
    ahora: "Ingresos y egresos quedan registrados, y los exportás a Excel cuando los necesites.",
  },
  {
    antes: "«Hace rato que no veo a Lucía.»",
    ahora: "La asistencia queda registrada en cada check-in, socio por socio.",
  },
];

export default function Problem() {
  return (
    <section className="screen px-6 sm:px-10 lg:px-16 py-20 sm:py-28" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-[1320px]">
        <Reveal>
          <p className="eyebrow">Lo que resuelve</p>
          <h2 className="display mt-4 text-[clamp(1.9rem,4vw,2.9rem)] max-w-[20ch]">
            Un gimnasio no se cae por falta de socios. Se cae por falta de registro.
          </h2>
        </Reveal>

        <ul className="mt-14 divide-y" style={{ borderColor: "var(--rule)" }}>
          {FILAS.map((fila, i) => (
            <Reveal as="li" key={fila.antes} delay={i * 0.07}>
              <div
                className="grid sm:grid-cols-[1fr_1.15fr] gap-3 sm:gap-10 py-7 border-t"
                style={{ borderColor: "var(--rule)" }}
              >
                <p
                  className="text-[1.0625rem] italic"
                  style={{ color: "var(--alert)" }}
                >
                  {fila.antes}
                </p>
                <p className="text-[1.0625rem] leading-relaxed" style={{ color: "var(--ink)" }}>
                  {fila.ahora}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
