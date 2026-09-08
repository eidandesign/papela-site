"use client";

// Renderer ÚNICO de un Mini Site. Lo usan la página pública (/[slug]) y el
// preview del editor del admin (/mini-site-preview, vía postMessage): así lo
// que Papela ve al editar es exactamente lo que ve el cliente.
//
// Recibe el payload público ya resuelto (hrefs listos: wa.me, mailto:, tel:…),
// así que aquí NO hay lógica por tipo de bloque más allá del ícono y del
// layout (texto / fila de redes / botón). mode="preview" desactiva la
// navegación y las analíticas.

import { useEffect, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import type { BlockType, MiniSitePublic, MiniSitePublicBlock, SocialType } from "@/lib/mini-sites";
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
};

function iconoDe(type: BlockType, size?: number): ReactNode {
  return (ICONS[type] ?? ICONS.link)(size);
}

const SOCIAL_LABEL: Record<SocialType, string> = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok" };

// ── Branding "Creado con Papela" (componente aparte: en el futuro se apaga por plan) ──

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
        Creado con <span className="font-serif text-[15px]">Papela</span>
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

export function MiniSiteBlockRenderer({
  block,
  site,
  mode,
}: {
  block: MiniSitePublicBlock;
  site: MiniSitePublic;
  mode: MiniSiteMode;
}) {
  const t = templateDe(site.template);
  const onClick = clickDeBloque(site, block.id, mode);

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

// ── Página completa ──────────────────────────────────────────────────────────

export default function MiniSiteRenderer({ site, mode = "public" }: { site: MiniSitePublic; mode?: MiniSiteMode }) {
  const t = templateDe(site.template);

  useEffect(() => {
    if (mode !== "public") return;
    trackMiniSite({ miniSiteId: site.id, type: "page_view" });
  }, [mode, site.id]);

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
              <MiniSiteBlockRenderer key={fila.block.id} block={fila.block} site={site} mode={mode} />
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
