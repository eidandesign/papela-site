import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

// Imagen de preview del link de la cotización — la que aparece al compartir
// /cotizacion/<token> por WhatsApp. Se genera al vuelo con el FOLIO, el
// nombre del proyecto y el cliente (datos leídos del admin), con la marca
// Papela: portada verde + ribbon, igual que la primera página del documento.
// NO muestra importes: el preview se renderiza solo en cualquier chat al que
// se reenvíe el link, así que el dinero se ve únicamente al abrir la página.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Cotización — Papela Atelier";

// En dev el endpoint vive en el admin local; en producción, en el deployado.
const COTIZACION_API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/public/cotizacion"
    : "https://admin.papela-atelier.com/api/public/cotizacion";
const SITE = "https://www.papela-atelier.com";

const CREMITA = "rgb(243,230,207)";

// Ribbon de marca (mismo trazo del hero del home y de la portada). Satori no
// renderiza SVG inline de forma fiable, así que va como data URI en un <img>.
const RIBBON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-67 133 1526 294" fill="none"><path d="M864.984 271.314C876.502 294.712 907.345 334.037 995.323 300.643C1104.1 259.357 1331.53 279.964 1457.77 390.325M864.984 271.314C862.261 265.785 860.617 261.143 859.555 258.563C856.233 250.495 861.138 246.328 865.113 247.716C867.789 248.648 870.875 251.417 869.083 258.563C867.993 262.897 866.624 267.156 864.984 271.314ZM864.984 271.314C779.94 487.307 -39.135 506.19 -66.2061 133.911" stroke="#F3E6CF" stroke-opacity="0.45" stroke-width="6" stroke-linecap="round"/></svg>`;
const RIBBON_URI = `data:image/svg+xml;utf8,${encodeURIComponent(RIBBON_SVG)}`;

// Carga la fuente PP Editorial: filesystem (build local/traced) y, si falla,
// fetch al asset público. Si ambas fallan, la imagen usa la fuente por defecto.
async function cargarFuente(archivo: string): Promise<ArrayBuffer | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public/fonts", archivo));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  } catch {
    /* sigue con fetch */
  }
  try {
    const res = await fetch(`${SITE}/fonts/${archivo}`);
    if (res.ok) return await res.arrayBuffer();
  } catch {
    /* sin fuente custom */
  }
  return null;
}

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let proyecto = "Tu proyecto";
  let cliente = "";
  let folio = "";
  try {
    const res = await fetch(`${COTIZACION_API}/${token}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const d = await res.json();
      if (typeof d?.proyecto === "string" && d.proyecto.trim()) proyecto = d.proyecto.trim();
      if (typeof d?.cliente === "string") cliente = d.cliente.trim();
      if (typeof d?.folio === "string") folio = d.folio;
    }
  } catch {
    /* preview genérico si el admin no responde */
  }

  const [regular, ultrabold] = await Promise.all([
    cargarFuente("PPEditorialNew-Regular.otf"),
    cargarFuente("PPEditorialNew-Ultrabold.otf"),
  ]);
  const fonts = [
    regular && { name: "Editorial", data: regular, weight: 400 as const, style: "normal" as const },
    ultrabold && { name: "EditorialBold", data: ultrabold, weight: 700 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[];

  const serif = fonts.some((f) => f.name === "Editorial") ? "Editorial" : "sans-serif";
  const serifBold = fonts.some((f) => f.name === "EditorialBold") ? "EditorialBold" : "sans-serif";

  // El tamaño del título se adapta al largo del nombre del proyecto.
  const p = proyecto.length;
  const proyectoSize = p <= 18 ? 92 : p <= 30 ? 72 : p <= 46 ? 56 : 44;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 44,
          background: "linear-gradient(135deg, #f6ecd6 0%, #efe1c4 100%)",
          fontFamily: serif,
        }}
      >
        {/* Portada (tarjeta verde) */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: 72,
            borderRadius: 40,
            background: "linear-gradient(150deg, #12535C 0%, #0d3f47 100%)",
            color: CREMITA,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(13,63,71,0.35)",
          }}
        >
          {/* Ribbon de marca, al pie de la tarjeta. <img> nativo: esto lo
              renderiza satori (next/og), no el DOM — next/image no aplica. */}
          <img
            src={RIBBON_URI}
            alt=""
            width={1112}
            height={214}
            style={{ position: "absolute", left: 0, right: 0, bottom: -46, width: "100%" }}
          />

          {/* Encabezado */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 24,
                letterSpacing: 8,
                textTransform: "uppercase",
                fontFamily: "sans-serif",
                fontWeight: 600,
                color: CREMITA,
              }}
            >
              Cotización{folio ? ` · ${folio}` : ""}
            </div>
            <div style={{ display: "flex", fontSize: 32, fontFamily: serifBold, color: CREMITA }}>
              Papela Atelier
            </div>
          </div>

          {/* Proyecto + cliente */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {cliente ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                  color: "rgba(243,230,207,0.65)",
                  fontFamily: "sans-serif",
                  marginBottom: 16,
                }}
              >
                Preparada para {cliente}
              </div>
            ) : (
              <div style={{ display: "flex" }} />
            )}
            <div style={{ display: "flex", fontSize: proyectoSize, fontFamily: serif, lineHeight: 1.05 }}>
              {proyecto}
            </div>
          </div>

          {/* Pie */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%" }}>
            <div style={{ display: "flex", fontSize: 22, color: "rgba(243,230,207,0.7)", fontFamily: "sans-serif" }}>
              ✨ Detalle, tiempos de entrega y descarga en PDF
            </div>
            <div style={{ display: "flex", fontSize: 22, color: "rgba(243,230,207,0.55)", fontFamily: "sans-serif" }}>
              papela-atelier.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) },
  );
}
