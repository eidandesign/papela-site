/* Service worker de /publicidad (pantalla de la tienda). Alcance: solo
   /publicidad. Si se cae el Wi-Fi, la pantalla sigue con lo último que tenía:
   la página (navegación), la última lista de la API y los medios ya vistos.
   Los videos van con Range requests (206) y no se cachean aquí: el navegador
   los conserva en su caché HTTP normal. */
const VERSION = "publicidad-v1";
const CACHE = `papela-${VERSION}`;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add(new Request("/publicidad", { cache: "reload" })).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("papela-publicidad-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function esApi(url) {
  return url.pathname.startsWith("/api/public/publicidad");
}
function esMedio(req, url) {
  return req.destination === "image" || /\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(url.pathname) || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/");
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Navegación a /publicidad: red primero, caché si no hay red.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put("/publicidad", copia)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("/publicidad")),
    );
    return;
  }

  // API: red primero (versión fresca), última respuesta si no hay red.
  if (esApi(url)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req)),
    );
    return;
  }

  // Imágenes, fuentes y chunks: caché primero (nombres inmutables).
  if (esMedio(req, url)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok && res.status === 200) {
              const copia = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
            }
            return res;
          }),
      ),
    );
  }
});
