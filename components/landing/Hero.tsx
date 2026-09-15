import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CounterPanel from "./CounterPanel";

/**
 * Server component a proposito: el contenido principal de la pagina no
 * necesita JavaScript para existir ni para verse. La entrada es CSS (.rise),
 * que avanza aunque la pestaña este en segundo plano.
 */
export default function Hero() {
  return (
    <section className="screen screen-first px-6 sm:px-10 lg:px-16 pt-14 pb-20 sm:pt-20 sm:pb-28">
      <div className="mx-auto max-w-[1320px] grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        <div>
          <p className="eyebrow rise">Software de gestión para gimnasios</p>

          <h1 className="display rise rise-1 mt-5 text-[clamp(2.6rem,6.2vw,4.4rem)]">
            Controlá todo 
           <br />
            tu gimnasio
            <br />
            <span style={{ color: "var(--primary)" }}>sin tocar una planilla.</span>
          </h1>

          <p
            className="rise rise-2 mt-7 text-[1.0625rem] leading-relaxed max-w-[44ch]"
            style={{ color: "var(--muted)" }}
          >
            SmartCore reúne socios, cuotas, clases, asistencia e inventario en un
            solo lugar. Cada vencimiento aparece al entrar, antes de que se te
            pase.
          </p>

          <div className="rise rise-3 mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[0.9375rem] text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--ink)" }}
            >
              Probar 14 días gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-[0.9375rem] border transition-colors hover:bg-white"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            >
              Ingresar
            </Link>
          </div>

          <p className="mono rise rise-4 mt-5 text-[11px]" style={{ color: "var(--muted)" }}>
            Sin tarjeta para empezar · Se instala en el celular o la tablet
          </p>
        </div>

        <div className="rise rise-2">
          <CounterPanel />
        </div>
      </div>
    </section>
  );
}
