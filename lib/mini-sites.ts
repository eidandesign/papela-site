import { cache } from "react";

// Mini Sites — páginas digitales de clientes de Papela (papela-atelier.com/<slug>).
// Los datos viven en el ADMIN (papela-admin): este módulo solo consume su API
// pública y define el CONTRATO del payload (mismo shape que construye
// lib/mini-sites/public-payload.ts del admin con toPublicPayload()).
// Si el contrato cambia, cambia en los dos lados.

// En dev el endpoint vive en el admin local; en producción, en el deployado.
export const MINI_SITES_API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/public/mini-sites"
    : "https://admin.papela-atelier.com/api/public/mini-sites";

// Orígenes que pueden mandar borradores a /mini-site-preview por postMessage.
export const PREVIEW_ALLOWED_ORIGINS = ["https://admin.papela-atelier.com"];
export const PREVIEW_MSG_READY = "papela-mini-site-preview:ready";
export const PREVIEW_MSG_RENDER = "papela-mini-site-preview:render";

export type BlockType =
  | "link"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "phone"
  | "email"
  | "location"
  | "pdf"
  | "text"
  | "socials"
  | "menu";

export type SocialType = "instagram" | "facebook" | "tiktok";

// ── Bloque `menu` (restaurantes) — espejo de lib/mini-sites/menu.ts del admin ──
// Llega YA saneado: platillos con nombre, precio número o null (sin precio, no
// $0), etiquetas del whitelist, secciones con al menos un platillo. Los
// platillos `disponible: false` SÍ viajan: se pintan atenuados como "Agotado".
export type MenuTag = "picante" | "vegetariano" | "vegano" | "sin_gluten" | "nuevo" | "favorito";
export type MiniSiteMenuItem = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number | null;
  tags: MenuTag[];
  disponible: boolean;
  /** Foto del platillo (https). "" o ausente = sin foto. */
  imagen?: string;
  /** Ingredientes adicionales / opciones a elegir. Ausente en payloads anteriores a los extras. */
  extras?: MiniSiteMenuExtraGrupo[];
};
/** Opción de un grupo de extras: `precio` es lo que SUMA al platillo (null = sin costo). */
export type MiniSiteMenuExtraOpcion = { id: string; nombre: string; precio: number | null; disponible: boolean };
/** "¿Queso extra? Opcional · elige hasta 1". `max` ya viene acotado a 1..nº de opciones. */
export type MiniSiteMenuExtraGrupo = { id: string; nombre: string; obligatorio: boolean; max: number; opciones: MiniSiteMenuExtraOpcion[] };
export type MiniSiteMenuSeccion = { id: string; nombre: string; items: MiniSiteMenuItem[] };
/** Subpaquete: varias cosas a un precio, con foto ancha y lista de lo que incluye. */
export type MiniSiteMenuPaquete = {
  id: string;
  nombre: string;
  descripcion: string;
  incluye: string[];
  precio: number | null;
  imagen: string;
  disponible: boolean;
};
/** Paquete = la promoción ("Miércoles de Kilotes") con sus opciones a distinto precio. */
export type MiniSiteMenuPaqueteGrupo = { id: string; nombre: string; items: MiniSiteMenuPaquete[] };
export type MiniSiteMenu = {
  secciones: MiniSiteMenuSeccion[];
  /** Los payloads anteriores a los paquetes no lo traen. */
  paquetes?: MiniSiteMenuPaqueteGrupo[];
};

/** Cómo se pinta un bloque con link: botón con texto o solo el ícono. */
export type DisplayMode = "full" | "icon";

export type MiniSitePublicBlock = {
  id: string;
  type: BlockType;
  title: string;
  subtitle: string;
  href: string | null;
  /** "icon" = solo el ícono; los consecutivos se agrupan en una fila. Los payloads viejos no lo traen → "full". */
  displayMode?: DisplayMode;
  content?: string;
  links?: { type: SocialType; href: string }[];
  /** Solo `menu`. Los payloads anteriores al bloque no lo traen. */
  menu?: MiniSiteMenu;
};

export type MiniSitePublic = {
  id: string;
  slug: string;
  url: string;
  businessName: string;
  description: string;
  logoUrl: string;
  /** Foto o video ancho de portada, detrás del logo. "" o ausente = sin portada. */
  coverUrl?: string;
  /** Si `coverUrl` es foto o video. Ausente (payloads viejos) = foto. */
  coverType?: "image" | "video";
  template: string;
  colors: { primary: string; background: string; text: string };
  showPapelaBranding: boolean;
  blocks: MiniSitePublicBlock[];
};

export type MiniSiteLookup = { status: "published"; site: MiniSitePublic } | { status: "disabled" } | null;

// Mismo regex que el admin: minúsculas, números y guiones internos.
export const MINI_SITE_SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Segmentos raíz que SÍ son páginas de este sitio (app/*). Un path de un solo
// segmento que no esté aquí es un Mini Site (o un 404 de Mini Site). Mantener
// en sync al agregar una página raíz — y agregarla también a la lista de slugs
// reservados del admin (lib/mini-sites/reserved-slugs.ts).
export const SITE_ROOT_SEGMENTS = new Set([
  "api",
  "back-to-school",
  "clases",
  "club",
  "club-creativo",
  "cotizacion",
  "links",
  "mini-site-preview",
  "nosotros",
  "personaliza",
  "privacidad",
  "productos",
  "satisfaccion-clases",
  "satisfaccion-talleres",
  "servicios",
  "talleres",
  "terminos",
  "tienda",
]);

/** "/cocina-lorena" → true · "/talleres" → false · "/talleres/x" → false */
export function isMiniSitePath(pathname: string | null): boolean {
  if (!pathname) return false;
  const m = pathname.match(/^\/([^/]+)\/?$/);
  if (!m) return false;
  const seg = m[1].toLowerCase();
  return !SITE_ROOT_SEGMENTS.has(seg) && MINI_SITE_SLUG_RE.test(seg);
}

/**
 * Lee el Mini Site del admin. `cache` dedupe entre generateMetadata y la página.
 * Devuelve null si no existe o está en borrador (→ 404).
 */
export const fetchMiniSite = cache(async (slug: string): Promise<MiniSiteLookup> => {
  const s = slug.toLowerCase();
  if (!MINI_SITE_SLUG_RE.test(s)) return null;
  try {
    const res = await fetch(`${MINI_SITES_API}/${s}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.status === "disabled") return { status: "disabled" };
    if (data?.status === "published" && data.site) return { status: "published", site: data.site as MiniSitePublic };
    return null;
  } catch {
    return null;
  }
});

// ── Analíticas (pestaña "Data" del admin) ───────────────────────────────────
// Eventos que entiende POST /api/public/mini-sites/track del admin. Todo es
// fire-and-forget: sendBeacon sobrevive a la navegación y nunca bloquea abrir
// un link; cualquier fallo se traga en silencio.
export type MiniSiteEvento =
  | { type: "page_view" }
  | { type: "block_click"; blockId: string; action?: BlockType | SocialType }
  | { type: "menu_open"; blockId: string }
  | { type: "item_view"; blockId: string; itemId: string; itemName: string; category: string }
  | { type: "item_click"; blockId: string; itemId: string; itemName: string; category: string; action: "foto" | "agregar" | "opciones" }
  | { type: "search"; blockId: string; term: string; results: number }
  | { type: "order"; blockId: string; action: "pedido_whatsapp" | "pedido_copiado" };

const VISITANTE_KEY = "papela-ms-visitante";

/**
 * Id ANÓNIMO del navegador (uuid aleatorio en localStorage): solo sirve para
 * estimar visitantes únicos y cuántos hicieron una acción. No identifica a
 * nadie. Sin storage (modo privado) cada visita cuenta como alguien nuevo.
 */
function visitante(): string | undefined {
  try {
    let v = window.localStorage.getItem(VISITANTE_KEY);
    if (!v || !/^[0-9a-f-]{36}$/i.test(v)) {
      v = crypto.randomUUID();
      window.localStorage.setItem(VISITANTE_KEY, v);
    }
    return v;
  } catch {
    return undefined;
  }
}

function enviar(miniSiteId: string, events: MiniSiteEvento[]) {
  if (!events.length) return;
  try {
    const url = `${MINI_SITES_API}/track`;
    const body = JSON.stringify({ miniSiteId, visitorId: visitante(), events });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      // text/plain evita el preflight CORS y es lo que acepta sendBeacon cross-origin.
      if (navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }))) return;
    }
    fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
  } catch {
    /* silencioso */
  }
}

/** Un evento suelto (visita, botón, abrir menú, pedido, búsqueda…). */
export function trackMiniSite(miniSiteId: string, evento: MiniSiteEvento) {
  enviar(miniSiteId, [evento]);
}

// Platillos vistos: pueden ser decenas por visita, así que se juntan y se
// mandan de un jalón (cada pocos segundos, al llenar el lote o al salir de la
// página) en vez de un request por platillo.
const cola: { miniSiteId: string; evento: MiniSiteEvento }[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function vaciarColaMiniSite() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  const porSitio = new Map<string, MiniSiteEvento[]>();
  for (const { miniSiteId, evento } of cola.splice(0)) porSitio.set(miniSiteId, [...(porSitio.get(miniSiteId) ?? []), evento]);
  for (const [id, evs] of porSitio) for (let i = 0; i < evs.length; i += 40) enviar(id, evs.slice(i, i + 40));
}

export function encolarMiniSite(miniSiteId: string, evento: MiniSiteEvento) {
  cola.push({ miniSiteId, evento });
  if (cola.length >= 40) vaciarColaMiniSite();
  else if (!timer) timer = setTimeout(vaciarColaMiniSite, 5000);
}

if (typeof window !== "undefined") {
  // pagehide/visibilitychange: el último momento seguro para mandar lo pendiente en móvil.
  window.addEventListener("pagehide", vaciarColaMiniSite);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") vaciarColaMiniSite();
  });
}
