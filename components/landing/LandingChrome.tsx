"use client";

import Link from "next/link";

/** Marca: la misma mancuerna del icono de la PWA, para que el sistema se reconozca. */
function Mark({ size = 30 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg shrink-0"
      style={{ width: size, height: size, background: "var(--primary)" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 512 512" width={size * 0.62} height={size * 0.62} fill="#fff">
        <rect x="140" y="236" width="232" height="40" rx="20" />
        <rect x="108" y="196" width="48" height="120" rx="18" />
        <rect x="356" y="196" width="48" height="120" rx="18" />
        <rect x="72" y="216" width="32" height="80" rx="14" />
        <rect x="408" y="216" width="32" height="80" rx="14" />
      </svg>
    </span>
  );
}

export function LandingNav() {
  return (
    <header className="px-6 sm:px-10 lg:px-16 pt-7">
      <nav className="mx-auto max-w-[1320px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SmartCore Gym, inicio">
          <Mark />
          <span className="display text-[1.0625rem]" style={{ letterSpacing: "-0.02em" }}>
            SmartCore
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-white"
            style={{ color: "var(--ink)" }}
          >
            Ingresar
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--primary)" }}
          >
            Empezar gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="px-6 sm:px-10 lg:px-16 pb-12 pt-10 border-t" style={{ borderColor: "var(--rule)" }}>
      <div className="mx-auto max-w-[1320px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <Mark size={24} />
          <span className="mono text-[11px]" style={{ color: "var(--muted)" }}>
            SmartCore Gym · Hecho en Argentina
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login" className="mono text-[11px] hover:underline" style={{ color: "var(--muted)" }}>
            Ingresar
          </Link>
          <Link href="/register" className="mono text-[11px] hover:underline" style={{ color: "var(--muted)" }}>
            Crear cuenta
          </Link>
        </div>
      </div>
    </footer>
  );
}
