/**
 * Service worker de SmartCore Gym.
 *
 * Criterio deliberado: SOLO se cachean assets estaticos de build y la pagina
 * de fallback offline. Nunca HTML de paginas autenticadas ni respuestas de
 * API.
 *
 * El motivo es que la app es multi-tenant y muchas veces corre en una tablet
 * compartida en el mostrador: cachear una pagina renderizada con los datos de
 * un gimnasio significaria poder servirsela despues a otro usuario del mismo
 * dispositivo. La navegacion siempre va a la red.
 */

const VERSION = "v1";
const STATIC_CACHE = `smartcore-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

/** Assets inmutables del build y los iconos: seguros de cachear. */
function isCacheableAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET: nunca interceptamos escrituras.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Nada de otros origenes (Supabase, Mercado Pago, fuentes).
  if (url.origin !== self.location.origin) return;

  // Las rutas de API pasan derecho a la red, siempre.
  if (url.pathname.startsWith("/api/")) return;

  if (isCacheableAsset(url)) {
    // Cache-first: los assets de /_next/static/ llevan hash en el nombre,
    // asi que un cambio genera una URL nueva y no hay riesgo de servir viejo.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Navegacion: siempre a la red. Si no hay conexion, fallback offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r || Response.error()))
    );
  }
});
