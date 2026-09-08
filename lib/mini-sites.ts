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
  | "socials";

export type SocialType = "instagram" | "facebook" | "tiktok";

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
};

export type MiniSitePublic = {
  id: string;
  slug: string;
  url: string;
  businessName: string;
  description: string;
  logoUrl: string;
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

/**
 * Analíticas ligeras (page_view / block_click). Fire-and-forget: sendBeacon
 * sobrevive a la navegación y nunca bloquea abrir el link. Falla en silencio.
 */
export function trackMiniSite(payload: { miniSiteId: string; blockId?: string; type: "page_view" | "block_click" }) {
  try {
    const url = `${MINI_SITES_API}/track`;
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      // text/plain evita el preflight CORS y es lo que acepta sendBeacon cross-origin.
      if (navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }))) return;
    }
    fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
  } catch {
    /* silencioso */
  }
}
