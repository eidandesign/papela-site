import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

// Imagen de preview del link de la tarjeta del Club Creativo — la que aparece
// al compartir /club/<token> por WhatsApp. Se genera al vuelo con el NOMBRE y
// el nº de socio del miembro (datos leídos del admin), con la marca Papela.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Club Creativo Papela — Pase de miembro";

const CLUB_API = "https://admin.papela-atelier.com/api/public/club";
const SITE = "https://www.papela-atelier.com";

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

  let nombre = "Miembro Papela";
  let numero = "";
  try {
    const res = await fetch(`${CLUB_API}/${token}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const d = await res.json();
      if (typeof d?.nombre === "string" && d.nombre.trim()) nombre = d.nombre.trim();
      if (typeof d?.numero === "string") numero = d.numero;
    }
  } catch {
    /* tarjeta genérica si el admin no responde */
  }

  const [regular, ultrabold] = await Promise.all([
    cargarFuente("PPEditorialNew-Regular.otf"),
    cargarFuente("PPEditorialNew-Ultrabold.otf"),
  ]);
  const fonts = [
    regular && { name: "Editorial", data: regular, weight: 400 as const, style: "normal" as const },
    ultrabold && { name: "EditorialBold", data: ultrabold, weight: 700 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[];

  const serif = fonts.some((f) => f.name === "EditorialBold") ? "EditorialBold" : "sans-serif";
  const serifLight = fonts.some((f) => f.name === "Editorial") ? "Editorial" : "sans-serif";

  // El tamaño del nombre se adapta a su longitud para no desbordar la tarjeta.
  const n = nombre.length;
  const nombreSize = n <= 14 ? 108 : n <= 22 ? 82 : n <= 30 ? 62 : 48;

  const CREMITA = "rgb(243,230,207)";
  const TERRA = "#C4704A";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 44,
          background: "linear-gradient(135deg, #f6ecd6 0%, #efe1c4 100%)",
          fontFamily: serifLight,
        }}
      >
        {/* Pase (tarjeta verde) */}
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
          {/* Círculos decorativos */}
          <div
            style={{
              position: "absolute",
              top: -160,
              right: -120,
              width: 420,
              height: 420,
              borderRadius: 9999,
              background: "rgba(196,112,74,0.28)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -180,
              left: -140,
              width: 460,
              height: 460,
              borderRadius: 9999,
              background: "rgba(243,230,207,0.10)",
            }}
          />

          {/* Encabezado */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 26,
                letterSpacing: 8,
                color: CREMITA,
                textTransform: "uppercase",
                fontFamily: "sans-serif",
                fontWeight: 600,
              }}
            >
              <div style={{ display: "flex", width: 12, height: 12, borderRadius: 9999, background: TERRA, marginRight: 16 }} />
              Club Creativo
            </div>
            <div style={{ display: "flex", fontSize: 34, fontFamily: serif, color: CREMITA }}>
              Papela Atelier
            </div>
          </div>

          {/* Nombre del miembro */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "rgba(243,230,207,0.65)",
                fontFamily: "sans-serif",
                marginBottom: 14,
              }}
            >
              Pase de miembro
            </div>
            <div style={{ display: "flex", fontSize: nombreSize, fontFamily: serif, lineHeight: 1.02 }}>
              {nombre}
            </div>
          </div>

          {/* Pie */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              width: "100%",
            }}
          >
            {numero ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 20,
                    letterSpacing: 5,
                    textTransform: "uppercase",
                    color: "rgba(243,230,207,0.6)",
                    fontFamily: "sans-serif",
                    marginBottom: 6,
                  }}
                >
                  Socio N.º
                </div>
                <div style={{ display: "flex", fontSize: 38, fontFamily: serif, letterSpacing: 4 }}>
                  {numero}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex" }} />
            )}
            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: "rgba(243,230,207,0.7)",
                fontFamily: "sans-serif",
              }}
            >
              🎨 Junta coleccionables · gana premios
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) },
  );
}
