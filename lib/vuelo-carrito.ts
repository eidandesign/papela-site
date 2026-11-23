"use client";

// Efecto "el producto vuela al carrito" (nov-2026): al agregar desde una
// tarjeta, un clon redondo de la foto sale de la imagen del producto y viaja
// en arco hasta la bolsita del navbar (el elemento con [data-carrito-destino],
// puesto en CartButton). Puro DOM + Web Animations API — sin estado de React,
// se limpia solo al terminar. El arco sale de animar X y Y con easings
// distintos en dos capas anidadas (cada una necesita su propio transform).
//
// No hace nada (y no truena) cuando: no hay carrito visible en la página
// (p. ej. checkout encapsulado), el usuario pide reduced motion, o corre en
// SSR. El conteo del carrito ya da su propio feedback (pulso del badge).

export function volarAlCarrito(origenEl: HTMLElement, imagen: string | null) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const destino = document.querySelector<HTMLElement>("[data-carrito-destino]");
  if (!destino || !("animate" in origenEl)) return;

  // La foto de la tarjeta si existe; si no, el propio botón.
  const desdeEl = origenEl.closest<HTMLElement>("[data-producto-imagen]") ?? origenEl;
  const desde = desdeEl.getBoundingClientRect();
  const hasta = destino.getBoundingClientRect();
  if (desde.width === 0 || hasta.width === 0) return;

  const LADO = 56;
  const x0 = desde.left + desde.width / 2 - LADO / 2;
  const y0 = desde.top + desde.height / 2 - LADO / 2;
  const dx = hasta.left + hasta.width / 2 - LADO / 2 - x0;
  const dy = hasta.top + hasta.height / 2 - LADO / 2 - y0;

  // Capa exterior: mueve en X. Capa interior: mueve en Y + encoge.
  const ext = document.createElement("div");
  ext.style.cssText = `position:fixed;left:${x0}px;top:${y0}px;width:${LADO}px;height:${LADO}px;z-index:100060;pointer-events:none;will-change:transform;`;
  const int = document.createElement("div");
  int.style.cssText =
    "width:100%;height:100%;border-radius:9999px;overflow:hidden;background:var(--color-cremita-2);border:1px solid var(--color-border);box-shadow:0 6px 18px rgba(0,0,0,.18);will-change:transform,opacity;";
  if (imagen) {
    const img = document.createElement("img");
    img.src = imagen;
    img.alt = "";
    img.style.cssText = "width:100%;height:100%;object-fit:cover;";
    int.appendChild(img);
  }
  ext.appendChild(int);
  document.body.appendChild(ext);

  const DUR = 600;
  const vueloX = ext.animate(
    [{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }],
    { duration: DUR, easing: "cubic-bezier(0.3,0.1,0.65,1)", fill: "forwards" },
  );
  int.animate(
    [
      { transform: "translateY(0) scale(1)", opacity: 1 },
      { transform: `translateY(${dy * 0.35}px) scale(0.75)`, opacity: 1, offset: 0.45 },
      { transform: `translateY(${dy}px) scale(0.25)`, opacity: 0.25 },
    ],
    { duration: DUR, easing: "cubic-bezier(0.5,0,0.75,0.6)", fill: "forwards" },
  );
  const limpia = () => ext.remove();
  vueloX.onfinish = limpia;
  vueloX.oncancel = limpia;
  // Red de seguridad por si las animaciones se interrumpen (p. ej. bfcache).
  setTimeout(limpia, DUR + 400);
}
