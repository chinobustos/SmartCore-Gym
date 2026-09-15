"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * El elemento con el que se recuerda la pagina: el mostrador.
 *
 * En vez de describir lo que hace el sistema, lo ejecuta: a los 2.6s una cuota
 * vencida pasa a "AL DIA", que es exactamente el momento que el dueño de un
 * gimnasio quiere que ocurra.
 *
 * Las filas se renderizan visibles desde el arranque; lo unico animado es el
 * cambio de estado. Si el JS no corre, el panel igual se lee entero — animar
 * la entrada con opacity dejaria el hero en blanco cuando el navegador frena
 * los frames de una pestaña en segundo plano.
 */

type Estado = "vencido" | "por-vencer" | "al-dia";

interface Socio {
  nombre: string;
  plan: string;
  dias: string;
  estado: Estado;
}

const SOCIOS: Socio[] = [
  { nombre: "Martín González", plan: "Mensual", dias: "venció hace 6 días", estado: "vencido" },
  { nombre: "Camila Herrera", plan: "Trimestral", dias: "venció hace 2 días", estado: "vencido" },
  { nombre: "Lucía Moreno", plan: "Mensual", dias: "vence mañana", estado: "por-vencer" },
  { nombre: "Diego Torres", plan: "Mensual", dias: "vence en 9 días", estado: "al-dia" },
  { nombre: "Valentina López", plan: "Mensual", dias: "vence en 21 días", estado: "al-dia" },
];

const TAG: Record<Estado, { label: string; fg: string; bg: string }> = {
  vencido: { label: "VENCIDO", fg: "#e0452e", bg: "rgba(224,69,46,0.10)" },
  "por-vencer": { label: "POR VENCER", fg: "#8a5a0c", bg: "rgba(214,158,46,0.16)" },
  "al-dia": { label: "AL DÍA", fg: "#07724f", bg: "rgba(16,183,127,0.12)" },
};

export default function CounterPanel() {
  const reduceMotion = useReducedMotion();
  const [cobrado, setCobrado] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setTimeout(() => setCobrado(true), 2600);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  const socios = SOCIOS.map((s, i) =>
    i === 0 && cobrado ? { ...s, estado: "al-dia" as Estado, dias: "vence en 30 días" } : s
  );

  const vencidos = socios.filter(s => s.estado === "vencido").length;

  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-[0_24px_60px_-28px_rgba(10,31,25,0.45)]"
      style={{ background: "var(--surface)", borderColor: "var(--rule)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: "var(--rule)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
          <span className="mono text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--muted)" }}>
            Vencimientos de hoy
          </span>
        </div>
        <span
          className="mono text-[11px] px-2 py-1 rounded-md font-medium transition-colors duration-500"
          style={{
            color: vencidos ? "var(--alert)" : "var(--deep)",
            background: vencidos ? "rgba(224,69,46,0.10)" : "rgba(16,183,127,0.12)",
          }}
        >
          {vencidos} {vencidos === 1 ? "pendiente" : "pendientes"}
        </span>
      </div>

      <ul>
        {socios.map(socio => {
          const tag = TAG[socio.estado];
          return (
            <li
              key={socio.nombre}
              className="flex items-center justify-between gap-4 px-5 py-3.5 border-b last:border-b-0"
              style={{ borderColor: "rgba(215,221,218,0.7)" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
                  {socio.nombre}
                </p>
                <p className="mono text-[11px] mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                  {socio.plan} · {socio.dias}
                </p>
              </div>
              <motion.span
                key={socio.estado}
                initial={reduceMotion ? false : { scale: 0.88 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mono text-[10px] font-medium px-2 py-1 rounded shrink-0 tracking-wider"
                style={{ color: tag.fg, background: tag.bg }}
              >
                {tag.label}
              </motion.span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
