"use client";

// Renderer ÚNICO de un Mini Site. Lo usan la página pública (/[slug]) y el
// preview del editor del admin (/mini-site-preview, vía postMessage): así lo
// que Papela ve al editar es exactamente lo que ve el cliente.
//
// Recibe el payload público ya resuelto (hrefs listos: wa.me, mailto:, tel:…),
// así que aquí NO hay lógica por tipo de bloque más allá del ícono y del
// layout (texto / fila de redes / botón / menú). mode="preview" desactiva la
// navegación y las analíticas (el menú sí se abre, para revisarlo en el editor).

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import type { BlockType, MenuTag, MiniSiteMenu, MiniSiteMenuItem, MiniSitePublic, MiniSitePublicBlock, SocialType } from "@/lib/mini-sites";
import { trackMiniSite } from "@/lib/mini-sites";

export type MiniSiteMode = "public" | "preview";

// ── Templates: solo diferencias visuales. Agregar uno = una entrada aquí
//    (+ su metadata en el admin, lib/mini-sites/templates.ts). ───────────────
type TemplateStyle = {
  button: "outline" | "solid" | "light";
  radius: string;
  headingFont: "sans" | "serif";
  logoShape: "round" | "rounded";
  logoSize: number;
  shadow: boolean;
  titleSize: string;
};

const TEMPLATES: Record<string, TemplateStyle> = {
  minimal: { button: "outline", radius: "14px", headingFont: "sans", logoShape: "round", logoSize: 88, shadow: false, titleSize: "26px" },
  editorial: { button: "solid", radius: "4px", headingFont: "serif", logoShape: "rounded", logoSize: 96, shadow: false, titleSize: "34px" },
  color: { button: "light", radius: "16px", headingFont: "sans", logoShape: "round", logoSize: 96, shadow: false, titleSize: "28px" },
  creative: { button: "solid", radius: "999px", headingFont: "sans", logoShape: "round", logoSize: 120, shadow: true, titleSize: "28px" },
};

function templateDe(id: string): TemplateStyle {
  return TEMPLATES[id] ?? TEMPLATES.minimal;
}

// El color va a parar DENTRO de un bloque <style>, donde un valor con "}" o
// "<" podría romper la regla e inyectar CSS. El admin ya valida el hex al
// guardar; esto es el cinturón por si el payload llega por otro lado.
const HEX_RE = /^#[0-9a-f]{6}$/i;

function hexSeguro(v: string, fallback: string): string {
  return HEX_RE.test((v ?? "").trim()) ? v.trim() : fallback;
}

// Texto legible sobre un color de fondo (luminancia relativa, WCAG).
function textoSobre(hex: string): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return "#FFFFFF";
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.4 ? "#1F1D1D" : "#FFFFFF";
}

// ── Íconos (SVG inline, sin dependencias) ───────────────────────────────────

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const ICONS: Record<BlockType, (size?: number) => ReactNode> = {
  link: (s) => (
    <Svg size={s}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  ),
  whatsapp: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  instagram: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  facebook: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97H15.83c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  ),
  tiktok: (s = 20) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.84 1.56V6.78a4.85 4.85 0 01-1.07-.09z" />
    </svg>
  ),
  phone: (s) => (
    <Svg size={s}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </Svg>
  ),
  email: (s) => (
    <Svg size={s}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  ),
  location: (s) => (
    <Svg size={s}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  ),
  pdf: (s) => (
    <Svg size={s}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </Svg>
  ),
  text: (s) => (
    <Svg size={s}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </Svg>
  ),
  socials: (s) => (
    <Svg size={s}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
    </Svg>
  ),
  menu: (s) => (
    <Svg size={s}>
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M9 7h7M9 11h5" />
    </Svg>
  ),
};

function iconoDe(type: BlockType, size?: number): ReactNode {
  return (ICONS[type] ?? ICONS.link)(size);
}

const SOCIAL_LABEL: Record<SocialType, string> = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok" };

// ── Branding "Creado en Papela Atelier" (componente aparte: en el futuro se apaga por plan) ──

export function PapelaBranding({ color }: { color: string }) {
  return (
    // mt-auto: con poco contenido el crédito se va hasta abajo del viewport
    // (el <main> es flex-1); con mucho, queda después de los botones.
    <footer className="mt-auto pt-10 text-center">
      <a
        href="https://www.papela-atelier.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[12px] tracking-wide opacity-60 hover:opacity-100 transition-opacity"
        style={{ color }}
      >
        Creado en <span className="font-serif text-[15px]">Papela Atelier</span>
      </a>
    </footer>
  );
}

// ── Bloques ──────────────────────────────────────────────────────────────────

function estiloBoton(t: TemplateStyle, colors: MiniSitePublic["colors"]): CSSProperties {
  const base: CSSProperties = {
    borderRadius: t.radius,
    boxShadow: t.shadow ? "0 6px 18px rgba(0,0,0,.12)" : undefined,
  };
  if (t.button === "outline") {
    return { ...base, border: `2px solid ${colors.primary}`, color: colors.primary, background: "transparent" };
  }
  if (t.button === "light") {
    return { ...base, background: "rgba(255,255,255,.94)", color: colors.primary, border: "2px solid transparent" };
  }
  return { ...base, background: colors.primary, color: textoSobre(colors.primary), border: `2px solid ${colors.primary}` };
}

/**
 * Click de cualquier link de bloque: en preview no navega; en público registra
 * el click y deja que la navegación siga su curso normal.
 */
function clickDeBloque(site: MiniSitePublic, blockId: string, mode: MiniSiteMode) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (mode === "preview") {
      e.preventDefault();
      return;
    }
    trackMiniSite({ miniSiteId: site.id, blockId, type: "block_click" });
  };
}

/**
 * Bloque en modo "solo ícono": botón redondo sin texto. El título sigue vivo
 * como `aria-label` y como tooltip — quien no ve el ícono necesita saber a
 * dónde lleva.
 */
export function MiniSiteIconBlock({ block, site, mode }: { block: MiniSitePublicBlock; site: MiniSitePublic; mode: MiniSiteMode }) {
  const t = templateDe(site.template);
  const externo = !!block.href && /^https?:/i.test(block.href);
  return (
    <a
      href={block.href ?? "#"}
      target={externo ? "_blank" : undefined}
      rel={externo ? "noopener noreferrer" : undefined}
      onClick={clickDeBloque(site, block.id, mode)}
      aria-label={block.title}
      title={block.title}
      className="w-14 h-14 flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
      style={estiloBoton({ ...t, radius: "999px" }, site.colors)}
    >
      {iconoDe(block.type, 24)}
    </a>
  );
}

// ── Menú (restaurantes) ──────────────────────────────────────────────────────
// En el home el menú es UN BOTÓN (como los demás bloques): tocarlo abre la
// vista del menú a página completa, con un botón flotante abajo para regresar. En
// público la vista vive en el hash (#menu-<id>): el botón físico de "atrás"
// del teléfono también regresa al home y el link con hash abre el menú
// directo. En preview es solo estado (el iframe no navega).
//
// Dentro de la vista: si hay más de una sección, una fila de chips se queda
// pegada arriba y salta por anclas. Los platillos entran en cascada (.ms-rise,
// tope a los 8 primeros) y respetan prefers-reduced-motion. Un platillo
// agotado se atenúa y se marca, nunca se esconde. Cada renglón sigue el orden de
// las apps de delivery (título · precio debajo · descripción, foto a la derecha)
// y la foto se abre en grande al tocarla.

const MENU_TAG_LABEL: Record<MenuTag, { label: string; emoji: string }> = {
  picante: { label: "Picante", emoji: "🌶️" },
  vegetariano: { label: "Vegetariano", emoji: "🥬" },
  vegano: { label: "Vegano", emoji: "🌱" },
  sin_gluten: { label: "Sin gluten", emoji: "🌾" },
  nuevo: { label: "Nuevo", emoji: "✨" },
  favorito: { label: "Favorito", emoji: "⭐" },
};

/** $85 · $85.50 — sin decimales cuando el precio es entero. */
function fmtPrecio(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function menuPublicable(block: MiniSitePublicBlock): block is MiniSitePublicBlock & { menu: MiniSiteMenu } {
  return block.type === "menu" && !!block.menu && block.menu.secciones.length > 0;
}

/** El radio de los templates es para botones; en una lista alta un radio de 999px hace un arco. */
function radioDeLista(t: TemplateStyle): string {
  return t.radius === "999px" ? "20px" : t.radius;
}

/** Botón del menú en el home: mismo lenguaje que los demás bloques, pero abre la vista en vez de navegar. */
function MenuBoton({ block, site, t, onAbrir }: { block: MiniSitePublicBlock & { menu: MiniSiteMenu }; site: MiniSitePublic; t: TemplateStyle; onAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="group flex items-center gap-3 w-full min-h-[52px] px-4 py-3 font-semibold text-[15px] text-left transition-transform hover:-translate-y-[1px] active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
      style={estiloBoton(t, site.colors)}
    >
      <span className="shrink-0 w-6 flex items-center justify-center">{iconoDe("menu")}</span>
      <span className="flex-1 text-center min-w-0">
        <span className="block truncate">{block.title || "Menú"}</span>
        {block.subtitle && <span className="block text-[12px] font-normal opacity-80 truncate">{block.subtitle}</span>}
      </span>
      <span className="shrink-0 w-6 flex items-center justify-center opacity-70" aria-hidden="true">
        <Svg size={18}>
          <path d="m9 6 6 6-6 6" />
        </Svg>
      </span>
    </button>
  );
}

/**
 * Foto de un platillo en grande. Diálogo accesible: foco al botón de cerrar al
 * abrir y de regreso a la miniatura al cerrar, Escape, clic fuera; bloquea el
 * scroll del fondo mientras está abierto.
 */
function FotoPlatilloDialog({ item, site, onClose }: { item: MiniSiteMenuItem; site: MiniSitePublic; onClose: () => void }) {
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      previo?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="ms-fade fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.nombre}
        className="ms-pop relative w-full max-w-[440px] flex flex-col overflow-hidden"
        style={{ background: hexSeguro(site.colors.background, "#FFFFFF"), color: site.colors.text, borderRadius: "20px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={cerrarRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-black/55 text-white hover:bg-black/70 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
        >
          <Svg size={20}>
            <path d="M18 6 6 18M6 6l12 12" />
          </Svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imagen} alt={item.nombre} className={`w-full aspect-square object-cover bg-black/5 ${item.disponible ? "" : "grayscale"}`} />
        <div className="px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[18px] font-semibold leading-snug">{item.nombre}</p>
            {item.precio !== null && (
              <span className="shrink-0 whitespace-nowrap tabular-nums text-[18px] font-semibold">
                {item.disponible ? fmtPrecio(item.precio) : <s>{fmtPrecio(item.precio)}</s>}
              </span>
            )}
          </div>
          {item.descripcion && <p className="mt-1 text-[14px] leading-snug opacity-80">{item.descripcion}</p>}
          {!item.disponible && (
            <span className="mt-2 inline-flex items-center rounded-full border border-current px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">Agotado</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Vista del menú a página completa (reemplaza al home mientras está abierta). */
function MenuVista({
  block,
  site,
  mode,
  onVolver,
}: {
  block: MiniSitePublicBlock & { menu: MiniSiteMenu };
  site: MiniSitePublic;
  mode: MiniSiteMode;
  onVolver: () => void;
}) {
  const t = templateDe(site.template);
  const menu = block.menu;
  const varias = menu.secciones.length > 1;
  const fondo = hexSeguro(site.colors.background, "#FFFFFF");
  const primario = hexSeguro(site.colors.primary, "#12535C");
  const [foto, setFoto] = useState<MiniSiteMenuItem | null>(null);
  // El encabezado pegajoso se COMPACTA al hacer scroll (logo y título más
  // chicos, sin el nombre del negocio) y la sección visible marca su chip.
  const [compacto, setCompacto] = useState(false);
  const [activa, setActiva] = useState<string | null>(menu.secciones[0]?.id ?? null);
  const headerRef = useRef<HTMLElement>(null);
  const chipsRef = useRef<HTMLUListElement>(null);
  // Mientras dura el salto suave a una sección (tocar un chip) el scroll-spy
  // se calla: si en medio del salto cambiara el chip activo, la fila de chips
  // haría su propio scroll suave y Chrome CANCELA el de la página.
  const saltandoRef = useRef<number | null>(null);
  // `medir` vive dentro del efecto del scroll; este ref lo expone para que el
  // animador del salto lo llame al terminar (y el chip activo se re-evalúe).
  const medirRef = useRef<() => void>(() => {});
  const anclaDe = (secId: string) => `menu-${block.id}-${secId}`;
  const radio = radioDeLista(t);
  const serif = t.headingFont === "serif";
  let indice = 0;

  // Scroll: compactar el encabezado y detectar la sección activa (la última
  // cuyo inicio ya pasó bajo el encabezado). Throttle con rAF.
  useEffect(() => {
    let raf = 0;
    const medir = () => {
      raf = 0;
      setCompacto(window.scrollY > 32);
      if (!varias || saltandoRef.current) return;
      const limite = (headerRef.current?.getBoundingClientRect().bottom ?? 0) + 24;
      let actual = menu.secciones[0]?.id ?? null;
      for (const sec of menu.secciones) {
        const el = document.getElementById(anclaDe(sec.id));
        if (el && el.getBoundingClientRect().top <= limite) actual = sec.id;
      }
      // Al fondo de la página la última sección quizá nunca alcanza el
      // encabezado (es corta): si ya no hay más scroll, ella es la activa.
      const alFondo = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (alFondo) actual = menu.secciones[menu.secciones.length - 1].id;
      setActiva(actual);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    medirRef.current = medir;
    window.addEventListener("scroll", onScroll, { passive: true });
    medir();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (saltandoRef.current) window.clearTimeout(saltandoRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varias, menu.secciones, block.id]);

  // El chip activo se mantiene a la vista dentro de su fila (sin mover la página).
  useEffect(() => {
    if (saltandoRef.current) return; // irA ya lo centró, al instante
    centrarChip(activa, "smooth");
  }, [activa]);

  function centrarChip(secId: string | null, behavior: ScrollBehavior) {
    const ul = chipsRef.current;
    const chip = secId ? ul?.querySelector<HTMLElement>(`[data-chip="${secId}"]`) : null;
    if (!ul || !chip) return;
    const destino = chip.offsetLeft - (ul.clientWidth - chip.offsetWidth) / 2;
    ul.scrollTo({ left: Math.max(0, destino), behavior });
  }

  // Escape regresa al home (si no hay una foto abierta, que se cierra primero).
  useEffect(() => {
    if (mode !== "public") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !foto) onVolver();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, foto, onVolver]);

  function irA(secId: string) {
    // Centrar el chip AL INSTANTE (no suave) antes de mover la página: dos
    // scrolls suaves a la vez se cancelan entre sí en Chrome.
    centrarChip(secId, "auto");
    setActiva(secId);
    const el = document.getElementById(anclaDe(secId));
    if (!el) return;
    // Red de seguridad por si la animación no llega a su último frame
    // (pestaña en segundo plano): el detector no puede quedarse mudo.
    if (saltandoRef.current) window.clearTimeout(saltandoRef.current);
    saltandoRef.current = window.setTimeout(terminarSalto, 1500);
    // Al llegar, el encabezado ya estará COMPACTO (cualquier scroll > 32px lo
    // compacta). Como el encabezado va en el flujo, al encogerse TODO el
    // contenido sube esa diferencia: si ahora está expandido hay que
    // descontarla, y el margen final es la altura compacta — con la actual el
    // título quedaría escondido debajo.
    const alto = headerRef.current?.getBoundingClientRect().height ?? altoCompacto;
    const encoge = compacto ? 0 : Math.max(0, alto - altoCompacto);
    const top = el.getBoundingClientRect().top + window.scrollY - encoge - altoCompacto - 8;
    animarScroll(Math.max(0, top));
  }

  // Desplazamiento propio (rAF + ease-out) en vez de `behavior: "smooth"`: el
  // suave del navegador se cancela con cualquier otro scroll programático
  // que ocurra en medio (y al compactarse el encabezado los hay), y el salto
  // se quedaba a la mitad. Respeta prefers-reduced-motion (salta directo).
  function terminarSalto() {
    if (saltandoRef.current) window.clearTimeout(saltandoRef.current);
    saltandoRef.current = null;
    medirRef.current();
  }

  function animarScroll(destino: number) {
    const inicio = window.scrollY;
    const delta = destino - inicio;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducido || Math.abs(delta) < 2) {
      window.scrollTo({ top: destino, behavior: "instant" });
      terminarSalto();
      return;
    }
    const duracion = Math.min(700, 320 + Math.abs(delta) * 0.12);
    const t0 = performance.now();
    const paso = (ahora: number) => {
      const p = Math.min(1, (ahora - t0) / duracion);
      const e = 1 - Math.pow(1 - p, 3);
      window.scrollTo({ top: inicio + delta * e, behavior: "instant" });
      if (p < 1) requestAnimationFrame(paso);
      else terminarSalto();
    };
    requestAnimationFrame(paso);
  }

  // Medidas del encabezado compacto (padding 10 + logo 40 + título 6+17 +
  // padding 8 + línea 1, más la fila de chips 4+40+12). Si cambias el layout
  // de arriba, cambia esto.
  const altoCompacto = 10 + 40 + 6 + 17 + 8 + 1 + (varias ? 56 : 0);
  const logoTam = compacto ? 40 : 68;
  const chipActivoStyle: CSSProperties = { background: primario, color: textoSobre(primario), border: `1.5px solid ${primario}` };
  const chipStyle: CSSProperties = { background: "rgba(127,127,127,.10)", color: site.colors.text, border: "1.5px solid rgba(127,127,127,.18)" };

  return (
    <div className="ms-view min-h-screen w-full font-sans flex flex-col" style={{ background: fondo, color: site.colors.text, minHeight: "100dvh" }}>
      <style>{`html,body{background:${fondo};}`}</style>

      {/* Encabezado pegajoso: logo centrado + "Menú" debajo; se compacta al bajar. */}
      <header ref={headerRef} className="sticky top-0 z-30 backdrop-blur-md" style={{ background: `${fondo}E8` }}>
        <div className="mx-auto w-full max-w-[520px] px-5 flex flex-col items-center text-center" style={{ paddingTop: compacto ? 10 : 22, paddingBottom: compacto ? 8 : 12, transition: "padding .3s cubic-bezier(.22,1,.36,1)" }}>
          <div
            className="ms-hero-logo shrink-0 rounded-full overflow-hidden flex items-center justify-center font-serif"
            style={{
              width: logoTam,
              height: logoTam,
              transition: "width .3s cubic-bezier(.22,1,.36,1), height .3s cubic-bezier(.22,1,.36,1)",
              boxShadow: `0 0 0 2px ${fondo}, 0 0 0 4px ${primario}`,
              background: site.logoUrl ? "#fff" : primario,
              color: textoSobre(primario),
              fontSize: logoTam * 0.42,
            }}
            aria-hidden="true"
          >
            {site.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              site.businessName.trim().charAt(0).toUpperCase() || "·"
            )}
          </div>
          <p
            className="ms-hero-line text-[11px] uppercase tracking-[.22em] opacity-60 overflow-hidden"
            style={{ maxHeight: compacto ? 0 : 20, marginTop: compacto ? 0 : 10, opacity: compacto ? 0 : 0.6, transition: "max-height .3s, margin .3s, opacity .2s" }}
          >
            {site.businessName}
          </p>
          <h1
            className={`ms-hero-line leading-none ${serif ? "font-serif font-normal" : "font-sans font-bold"}`}
            style={{ fontSize: compacto ? 17 : serif ? 32 : 26, marginTop: compacto ? 6 : 4, transition: "font-size .3s cubic-bezier(.22,1,.36,1), margin .3s" }}
          >
            {block.title || "Menú"}
          </h1>
        </div>

        {varias && (
          <nav aria-label="Secciones del menú" className="mx-auto w-full max-w-[520px]">
            <ul ref={chipsRef} className="ms-chips flex gap-2 overflow-x-auto px-5 pb-3 pt-1">
              {menu.secciones.map((sec, i) => {
                const esActiva = sec.id === activa;
                return (
                  <li key={sec.id} data-chip={sec.id} className="ms-chip-in shrink-0" style={{ animationDelay: `${0.12 + i * 0.05}s` }}>
                    <a
                      href={`#${anclaDe(sec.id)}`}
                      aria-current={esActiva ? "true" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        irA(sec.id);
                      }}
                      className="inline-flex items-center h-10 px-[18px] rounded-full text-[14px] font-semibold whitespace-nowrap transition-[transform,background-color,color] duration-200 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
                      style={esActiva ? chipActivoStyle : chipStyle}
                    >
                      {sec.nombre || `Sección ${i + 1}`}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        {/* Línea de cierre en degradado: separa el encabezado del contenido sin un borde duro. */}
        <div aria-hidden="true" className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${primario}66, transparent)` }} />
      </header>

      <main className="mx-auto w-full max-w-[520px] px-5 pt-6 pb-28 flex flex-1 flex-col">
        <div className="flex flex-col gap-8">
          {menu.secciones.map((sec, i) => (
            <section key={sec.id} id={anclaDe(sec.id)} aria-label={sec.nombre || `Sección ${i + 1}`} className="ms-sec-in" style={{ animationDelay: `${Math.min(i, 3) * 0.08}s` }}>
              {(sec.nombre || varias) && (
                <div className="flex items-center gap-3 mb-3 px-1">
                  <h2 className={`leading-tight ${serif ? "font-serif font-normal text-[26px]" : "font-sans font-bold text-[21px]"}`}>{sec.nombre || `Sección ${i + 1}`}</h2>
                  <span aria-hidden="true" className="flex-1 h-px" style={{ background: "rgba(127,127,127,.22)" }} />
                  <span className="text-[11px] font-semibold tabular-nums opacity-50">{sec.items.length}</span>
                </div>
              )}
              <ul className="flex flex-col overflow-hidden" style={{ borderRadius: radio, background: "rgba(127,127,127,.07)", boxShadow: "inset 0 0 0 1px rgba(127,127,127,.12)" }}>
                {sec.items.map((item) => {
                  const orden = indice++;
                  return (
                    <li
                      key={item.id}
                      className={`ms-rise px-4 py-4 border-b last:border-b-0 flex items-start gap-4 ${item.disponible ? "" : "opacity-50"}`}
                      style={{ animationDelay: `${0.1 + Math.min(orden, 8) * 0.05}s`, borderColor: "rgba(127,127,127,.14)" }}
                    >
                      {/* Orden tipo app de delivery: título, precio debajo, descripción; la foto a la derecha. */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-semibold leading-snug">{item.nombre}</p>
                        {item.precio !== null && (
                          <p className="mt-1 tabular-nums text-[15px] font-semibold" style={{ color: item.disponible ? primario : undefined }}>
                            {item.disponible ? fmtPrecio(item.precio) : <s>{fmtPrecio(item.precio)}</s>}
                          </p>
                        )}
                        {item.descripcion && <p className="mt-1.5 text-[14px] leading-snug opacity-70">{item.descripcion}</p>}
                        {(item.tags.length > 0 || !item.disponible) && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {!item.disponible && (
                              <span className="inline-flex items-center rounded-full border border-current px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">Agotado</span>
                            )}
                            {item.tags.map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "rgba(127,127,127,.12)" }}>
                                <span aria-hidden="true">{MENU_TAG_LABEL[tag].emoji}</span>
                                {MENU_TAG_LABEL[tag].label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {item.imagen && (
                        <button
                          type="button"
                          onClick={() => setFoto(item)}
                          aria-label={`Ver foto de ${item.nombre}`}
                          className="ms-thumb shrink-0 w-[92px] h-[92px] rounded-2xl overflow-hidden bg-white/40 cursor-zoom-in focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
                          style={{ boxShadow: "0 0 0 1px rgba(127,127,127,.18), 0 8px 20px rgba(0,0,0,.14)" }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imagen}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            width={92}
                            height={92}
                            className={`w-full h-full object-cover transition-transform duration-500 ${item.disponible ? "" : "grayscale"}`}
                          />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {site.showPapelaBranding && <PapelaBranding color={site.colors.text} />}
      </main>

      {/* Regreso flotante abajo, centrado: siempre al alcance del pulgar. */}
      <button
        type="button"
        onClick={onVolver}
        aria-label="Volver a la página principal"
        className="ms-back-in fixed left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 h-12 pl-4 pr-5 rounded-full text-[14px] font-semibold transition-transform hover:scale-[1.04] active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
        style={{
          ...estiloBoton({ ...t, radius: "999px", shadow: true, button: t.button === "outline" ? "solid" : t.button }, site.colors),
          bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
          boxShadow: "0 10px 30px rgba(0,0,0,.28)",
        }}
      >
        <Svg size={20}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </Svg>
        Volver
      </button>

      {foto && <FotoPlatilloDialog item={foto} site={site} onClose={() => setFoto(null)} />}
    </div>
  );
}

export function MiniSiteBlockRenderer({
  block,
  site,
  mode,
  onAbrirMenu,
}: {
  block: MiniSitePublicBlock;
  site: MiniSitePublic;
  mode: MiniSiteMode;
  /** Lo pasa la página completa; sin él, un bloque de menú no se pinta. */
  onAbrirMenu?: (blockId: string) => void;
}) {
  const t = templateDe(site.template);
  const onClick = clickDeBloque(site, block.id, mode);

  if (block.type === "menu") {
    if (!menuPublicable(block) || !onAbrirMenu) return null;
    return <MenuBoton block={block} site={site} t={t} onAbrir={() => onAbrirMenu(block.id)} />;
  }

  if (block.type === "text") {
    return (
      <section
        className="w-full px-5 py-4 text-[15px] leading-relaxed"
        style={{ borderRadius: t.radius, background: "rgba(127,127,127,.08)", color: site.colors.text }}
      >
        {block.title && <h2 className="font-semibold mb-1">{block.title}</h2>}
        {(block.content ?? "").split(/\n+/).map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </section>
    );
  }

  if (block.type === "socials") {
    return (
      <section className="w-full text-center py-1">
        {block.title && (
          <p className="text-[13px] uppercase tracking-widest opacity-70 mb-3" style={{ color: site.colors.text }}>
            {block.title}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          {(block.links ?? []).map((l) => (
            <a
              key={l.type}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClick}
              aria-label={SOCIAL_LABEL[l.type]}
              className="w-12 h-12 flex items-center justify-center transition-transform hover:scale-105"
              style={estiloBoton({ ...t, radius: "999px" }, site.colors)}
            >
              {iconoDe(l.type, 22)}
            </a>
          ))}
        </div>
      </section>
    );
  }

  const externo = !!block.href && /^https?:/i.test(block.href);
  return (
    <a
      href={block.href ?? "#"}
      target={externo ? "_blank" : undefined}
      rel={externo ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className="group flex items-center gap-3 w-full min-h-[52px] px-4 py-3 font-semibold text-[15px] transition-transform hover:-translate-y-[1px] active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
      style={estiloBoton(t, site.colors)}
    >
      <span className="shrink-0 w-6 flex items-center justify-center">{iconoDe(block.type)}</span>
      <span className="flex-1 text-center min-w-0">
        <span className="block truncate">{block.title}</span>
        {block.subtitle && <span className="block text-[12px] font-normal opacity-80 truncate">{block.subtitle}</span>}
      </span>
      <span className="shrink-0 w-6" aria-hidden="true" />
    </a>
  );
}

// ── Filas ────────────────────────────────────────────────────────────────────
// Los bloques en "solo ícono" que quedan SEGUIDOS se pintan en una misma fila
// (como la fila de redes). Basta con moverlos juntos en el editor para armar
// una fila; separarlos con un botón de texto en medio hace dos filas.

type Fila = { kind: "bloque"; block: MiniSitePublicBlock } | { kind: "iconos"; blocks: MiniSitePublicBlock[] };

export function agruparEnFilas(blocks: MiniSitePublicBlock[]): Fila[] {
  const filas: Fila[] = [];
  for (const b of blocks) {
    if (b.displayMode !== "icon") {
      filas.push({ kind: "bloque", block: b });
      continue;
    }
    const ultima = filas[filas.length - 1];
    if (ultima && ultima.kind === "iconos") ultima.blocks.push(b);
    else filas.push({ kind: "iconos", blocks: [b] });
  }
  return filas;
}

// ── Menú abierto ↔ hash ─────────────────────────────────────────────────────
// En público, "qué menú está abierto" NO es estado de React: es el hash de la
// URL, leído con useSyncExternalStore. Así el botón físico de atrás (popstate),
// un link con #menu-<id> y el botón del home convergen en la misma fuente, y
// la hidratación no choca (en el servidor el hash es "" → home).

const HASH_MENU_RE = /^#menu-([A-Za-z0-9_-]+)$/;
const oyentesHash = new Set<() => void>();

function suscribirHash(cb: () => void) {
  oyentesHash.add(cb);
  window.addEventListener("popstate", cb);
  window.addEventListener("hashchange", cb);
  return () => {
    oyentesHash.delete(cb);
    window.removeEventListener("popstate", cb);
    window.removeEventListener("hashchange", cb);
  };
}
/** pushState/replaceState no disparan popstate: avisar a mano. */
function avisarHash() {
  oyentesHash.forEach((cb) => cb());
}
const leerHash = () => window.location.hash;
const leerHashServidor = () => "";

/** Id del bloque de menú que pide el hash, si existe en el sitio. */
function menuDelHash(site: MiniSitePublic, hash: string): string | null {
  const m = HASH_MENU_RE.exec(hash);
  if (!m) return null;
  const b = site.blocks.find((x) => x.id === m[1]);
  return b && menuPublicable(b) ? b.id : null;
}

// ── Página completa ──────────────────────────────────────────────────────────

export default function MiniSiteRenderer({ site, mode = "public" }: { site: MiniSitePublic; mode?: MiniSiteMode }) {
  const t = templateDe(site.template);
  // Público: el menú abierto vive en el hash. Preview (iframe del editor): solo estado.
  const hash = useSyncExternalStore(suscribirHash, leerHash, leerHashServidor);
  const [menuPreview, setMenuPreview] = useState<string | null>(null);
  const menuAbierto = mode === "public" ? menuDelHash(site, hash) : menuPreview;
  // Dónde iba el scroll del home al abrir el menú, para regresar al mismo lugar.
  const scrollHome = useRef(0);

  useEffect(() => {
    if (mode !== "public") return;
    trackMiniSite({ miniSiteId: site.id, type: "page_view" });
  }, [mode, site.id]);

  // Al abrir: arriba del todo. Al cerrar: de vuelta a donde iba el home.
  // Instantáneo a propósito: el sitio tiene scroll suave global y un cambio de
  // vista no debe "viajar" — además, un scroll suave se cancela con cualquier
  // otro scroll programático que ocurra en medio.
  useEffect(() => {
    if (menuAbierto) window.scrollTo({ top: 0, behavior: "instant" });
    else if (scrollHome.current) window.scrollTo({ top: scrollHome.current, behavior: "instant" });
  }, [menuAbierto]);

  const abrirMenu = useCallback(
    (id: string) => {
      scrollHome.current = window.scrollY;
      if (mode === "public") {
        window.history.pushState({ papelaMenu: id }, "", `#menu-${id}`);
        avisarHash();
        trackMiniSite({ miniSiteId: site.id, blockId: id, type: "block_click" });
        return;
      }
      setMenuPreview(id);
    },
    [mode, site.id],
  );

  const volverAlHome = useCallback(() => {
    if (mode === "public") {
      // Si el menú se abrió desde este home, "atrás" lo cierra y deja el
      // historial limpio; si se llegó directo por el link con hash, no hay a
      // dónde regresar: se limpia el hash en su lugar.
      if (window.history.state?.papelaMenu) {
        window.history.back();
        return;
      }
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      avisarHash();
      return;
    }
    setMenuPreview(null);
  }, [mode]);

  const bloqueMenu = menuAbierto ? site.blocks.find((b) => b.id === menuAbierto) : undefined;
  if (bloqueMenu && menuPublicable(bloqueMenu)) {
    return <MenuVista key={bloqueMenu.id} block={bloqueMenu} site={site} mode={mode} onVolver={volverAlHome} />;
  }

  // 100dvh (no 100vh): en móvil la barra del navegador se esconde y se muestra,
  // y con 100vh el fondo se quedaba corto justo en ese movimiento. La clase
  // min-h-screen queda de respaldo para navegadores sin dvh.
  const fondo = hexSeguro(site.colors.background, "#FCFAF7");

  return (
    <div className="min-h-screen w-full font-sans flex flex-col" style={{ background: fondo, color: site.colors.text, minHeight: "100dvh" }}>
      {/* El fondo también en html/body: si no, el rebote del scroll en iOS y
          cualquier hueco dejan ver el color del sitio de Papela, no el del cliente. */}
      <style>{`html,body{background:${fondo};}`}</style>
      <main className={`mx-auto w-full max-w-[520px] px-5 pb-8 flex flex-1 flex-col items-center ${site.coverUrl ? "pt-5" : "pt-12"}`}>
        <header className="flex flex-col items-center text-center mb-8 w-full">
          {/* Portada tipo Facebook: foto ancha arriba y el logo montado encima
              (por eso el margen negativo y el z-10). Sin portada, el encabezado
              queda exactamente como antes. */}
          {site.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.coverUrl}
              alt=""
              className="w-full object-cover"
              style={{ aspectRatio: "5 / 2", borderRadius: t.radius === "999px" ? "24px" : t.radius }}
            />
          )}
          <div
            className="relative z-10 flex flex-col items-center"
            style={site.coverUrl ? { marginTop: -t.logoSize / 2 } : undefined}
          >
          {site.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.logoUrl}
              alt=""
              width={t.logoSize}
              height={t.logoSize}
              className={`object-cover mb-4 ${t.logoShape === "round" ? "rounded-full" : "rounded-2xl"}`}
              style={{
                width: t.logoSize,
                height: t.logoSize,
                // Sobre una foto el logo necesita separarse del fondo: aro del
                // color de la página, igual que la foto de perfil de Facebook.
                boxShadow: [site.coverUrl ? `0 0 0 5px ${fondo}` : "", t.shadow ? "0 10px 30px rgba(0,0,0,.15)" : ""].filter(Boolean).join(", ") || undefined,
                background: "#fff",
              }}
            />
          ) : (
            <div
              className={`flex items-center justify-center mb-4 font-serif ${t.logoShape === "round" ? "rounded-full" : "rounded-2xl"}`}
              style={{
              width: t.logoSize,
              height: t.logoSize,
              background: site.colors.primary,
              color: textoSobre(site.colors.primary),
              fontSize: t.logoSize * 0.42,
              boxShadow: site.coverUrl ? `0 0 0 5px ${fondo}` : undefined,
            }}
              aria-hidden="true"
            >
              {site.businessName.trim().charAt(0).toUpperCase() || "·"}
            </div>
          )}
          </div>
          <h1 className={`${t.headingFont === "serif" ? "font-serif font-normal" : "font-sans font-bold"} leading-tight`} style={{ fontSize: t.titleSize }}>
            {site.businessName}
          </h1>
          {site.description && <p className="mt-2 text-[15px] leading-relaxed opacity-80 max-w-[400px] whitespace-pre-line">{site.description}</p>}
        </header>

        <div className="w-full flex flex-col gap-3">
          {agruparEnFilas(site.blocks).map((fila) =>
            fila.kind === "bloque" ? (
              <MiniSiteBlockRenderer key={fila.block.id} block={fila.block} site={site} mode={mode} onAbrirMenu={abrirMenu} />
            ) : (
              <div key={`iconos-${fila.blocks[0].id}`} className="flex flex-wrap items-center justify-center gap-3 py-1">
                {fila.blocks.map((b) => (
                  <MiniSiteIconBlock key={b.id} block={b} site={site} mode={mode} />
                ))}
              </div>
            ),
          )}
          {site.blocks.length === 0 && mode === "preview" && (
            <p className="text-center text-sm opacity-60 py-6">Agrega bloques para ver aquí los botones.</p>
          )}
        </div>

        {site.showPapelaBranding && <PapelaBranding color={site.colors.text} />}
      </main>
    </div>
  );
}
