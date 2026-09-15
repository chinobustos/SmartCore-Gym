"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Retraso en segundos, para escalonar elementos de una misma fila. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}

/**
 * Entrada al aparecer en viewport, con IntersectionObserver + transicion CSS.
 *
 * No usa framer-motion a proposito: framer-motion anima sobre
 * requestAnimationFrame, que el navegador congela en pestañas en segundo
 * plano. Una seccion animada asi puede quedarse en opacity 0 y la pagina se
 * ve vacia. Las transiciones CSS no dependen de rAF.
 *
 * Si el JS no corre, el <noscript> de la landing muestra todo igual.
 */
export default function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sin IntersectionObserver mostramos directamente en vez de esconder.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
