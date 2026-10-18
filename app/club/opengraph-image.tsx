import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

// Imagen de preview del link de la tarjeta del Club Creativo — la que aparece
// al compartir /club/<token> por WhatsApp. Vive en el segmento /club (no en
// /club/[token]) a propósito: SIN params ni fetch, Next la pre-renderiza UNA
// vez en el build y la sirve como archivo estático desde el CDN. La versión
// anterior se generaba al vuelo por miembro (nombre + nº de socio leídos del
// admin): tardaba 1–3 s en frío, nunca se cacheaba y WhatsApp abandonaba el
// preview antes de recibirla — el link llegaba pelón. El nombre del miembro
// sigue personalizado en el TÍTULO del preview (generateMetadata de la página).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// ⚠️ Peso: WhatsApp descarta imágenes de preview de más de ~300 KB. Por eso el
// fondo es plano y los stickers van sin sombra (degradados y sombras suaves
// disparan el PNG). Al tocar el diseño, medir: curl -s localhost:3001/club/opengraph-image | wc -c
export const alt = "Club Creativo Papela — Papela Coins (cashback) y coleccionables";

const CREMITA = "rgb(243,230,207)";
const TERRA = "#C4704A";
const GREEN = "#12535C";
// Nota: solo PP Editorial está en public/fonts; lo marcado "sans-serif" cae a ella.

async function archivo(ruta: string): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), "public", ruta));
  } catch {
    return null;
  }
}

async function fuente(nombre: string): Promise<ArrayBuffer | null> {
  const buf = await archivo(`fonts/${nombre}`);
  return buf ? (buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer) : null;
}

async function sticker(nombre: string): Promise<string | null> {
  const buf = await archivo(`images/club/preview/${nombre}.png`);
  return buf ? `data:image/png;base64,${buf.toString("base64")}` : null;
}

function Pill({ icono, titulo, detalle, serif }: { icono: React.ReactNode; titulo: string; detalle: string; serif: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 24px 10px 10px",
        borderRadius: 9999,
        background: "rgba(243,230,207,0.12)",
        border: "2px solid rgba(243,230,207,0.28)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 54,
          height: 54,
          overflow: "hidden",
          borderRadius: 9999,
          background: CREMITA,
          marginRight: 16,
          flexShrink: 0,
        }}
      >
        {icono}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 28, fontFamily: serif, color: CREMITA, lineHeight: 1.1 }}>{titulo}</div>
        <div style={{ display: "flex", fontSize: 19, color: "rgba(243,230,207,0.78)", fontFamily: "sans-serif", marginTop: 2 }}>
          {detalle}
        </div>
      </div>
    </div>
  );
}

export default async function Image() {
  const [regular, ultrabold, estrellita, arcoiris, colibri] = await Promise.all([
    fuente("PPEditorialNew-Regular.otf"),
    fuente("PPEditorialNew-Ultrabold.otf"),
    sticker("estrellita"),
    sticker("arcoiris"),
    sticker("colibri"),
  ]);
  const fonts = [
    regular && { name: "Editorial", data: regular, weight: 400 as const, style: "normal" as const },
    ultrabold && { name: "EditorialBold", data: ultrabold, weight: 700 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[];
  const serif = fonts.some((f) => f.name === "Editorial") ? "Editorial" : "serif";
  const serifBold = fonts.some((f) => f.name === "EditorialBold") ? "EditorialBold" : "serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 36,
          background: "#f3e7cf",
        }}
      >
        {/* Pase (tarjeta verde) */}
        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: 40,
            background: GREEN,
            overflow: "hidden",
            
          }}
        >
          {/* Círculos decorativos */}
          <div style={{ position: "absolute", top: -170, right: -110, width: 440, height: 440, borderRadius: 9999, background: "rgba(196,112,74,0.30)" }} />
          <div style={{ position: "absolute", bottom: -200, left: -150, width: 480, height: 480, borderRadius: 9999, background: "rgba(243,230,207,0.09)" }} />
          <div style={{ position: "absolute", bottom: 40, right: 300, width: 160, height: 160, borderRadius: 9999, background: "rgba(243,230,207,0.07)" }} />

          {/* Columna de texto */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 700,
              height: "100%",
              padding: "50px 0 46px 64px",
              color: CREMITA,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 24,
                letterSpacing: 8,
                textTransform: "uppercase",
                fontFamily: "sans-serif",
                fontWeight: 600,
              }}
            >
              <div style={{ display: "flex", width: 12, height: 12, borderRadius: 9999, background: TERRA, marginRight: 16 }} />
              Club Creativo
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 66, fontFamily: serifBold, lineHeight: 1.0, letterSpacing: -1 }}>
                Tu pase de miembro
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 26, gap: 12, width: 590 }}>
                <Pill
                  serif={serif}
                  titulo="Papela Coins"
                  detalle="Cashback en cada compra"
                  icono={<div style={{ display: "flex", fontSize: 32, fontFamily: serifBold, color: TERRA, lineHeight: 1 }}>$</div>}
                />
                <Pill
                  serif={serif}
                  titulo="Coleccionables sorpresa"
                  detalle="Llena tu álbum y gana premios"
                  icono={estrellita ? <img src={estrellita} width={46} height={46} /> : <div style={{ display: "flex", fontSize: 30, fontFamily: serifBold, color: GREEN, lineHeight: 1 }}>*</div>}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline" }}>
              <div style={{ display: "flex", fontSize: 32, fontFamily: serif }}>Papela Atelier</div>
              <div style={{ display: "flex", fontSize: 20, color: "rgba(243,230,207,0.65)", fontFamily: "sans-serif", marginLeft: 16 }}>
                papela-atelier.com
              </div>
            </div>
          </div>

          {/* Stickers de arcilla del álbum, en abanico */}
          <div style={{ position: "absolute", top: 0, right: 0, width: 440, height: "100%", display: "flex" }}>
            {arcoiris && (
              <img
                src={arcoiris}
                width={270}
                height={180}
                style={{ position: "absolute", left: 40, top: 262, transform: "rotate(-8deg)" }}
              />
            )}
            {colibri && (
              <img
                src={colibri}
                width={220}
                height={220}
                style={{ position: "absolute", left: 212, top: 326, transform: "rotate(9deg)" }}
              />
            )}
            {estrellita && (
              <img
                src={estrellita}
                width={230}
                height={230}
                style={{ position: "absolute", left: 140, top: 50, transform: "rotate(10deg)" }}
              />
            )}
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) },
  );
}
