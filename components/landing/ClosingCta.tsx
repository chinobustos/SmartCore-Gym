"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

export default function ClosingCta() {
  return (
    <section className="screen px-6 sm:px-10 lg:px-16 py-24 sm:py-32">
      <Reveal>
        <div className="mx-auto max-w-[760px] text-center">
          <h2 className="display text-[clamp(2.1rem,5vw,3.4rem)]">
            Empezá con los socios que ya tenés.
          </h2>
          <p className="mt-6 text-[1.0625rem] leading-relaxed mx-auto max-w-[46ch]" style={{ color: "var(--muted)" }}>
            Catorce días para cargar tu gimnasio y ver si te sirve. Si no te
            convence, no hacés nada y listo.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--ink)" }}
            >
              Crear mi gimnasio
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-7 py-4 rounded-xl font-semibold border transition-colors hover:bg-white"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
