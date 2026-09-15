"use client";

import { useEffect } from "react";

/**
 * Registra el service worker que habilita la instalacion como PWA.
 * No renderiza nada.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // En desarrollo el SW interfiere con el hot reload de Next.
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(error => {
        console.error("[pwa] No se pudo registrar el service worker:", error);
      });
    };

    // Esperamos al load para no competir con la carga inicial.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
