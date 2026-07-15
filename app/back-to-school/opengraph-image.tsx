import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

// Imagen de preview del link de /back-to-school — la que aparece al compartir
// por WhatsApp/redes. Recrea el hero real (fondo verde pizarrón, niños de
// fieltro, título) como imagen estática — no el video/canvas de la avioneta.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Back to School — Etiquetas escolares personalizadas Papela Atelier";

async function cargarFuente(archivo: string): Promise<ArrayBuffer> {
  const buf = await readFile(join(process.cwd(), "public/fonts", archivo));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function cargarImagenBase64(ruta: string): Promise<string> {
  const buf = await readFile(join(process.cwd(), "public", ruta));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

export default async function Image() {
  const [italic, ninos, logo] = await Promise.all([
    cargarFuente("PPEditorialNew-Italic.otf"),
    cargarImagenBase64("images/back-to-school/hero-ninos.png"),
    cargarImagenBase64("site/logo.png"),
  ]);

  const CREMITA = "rgb(243,230,207)";
  const VERDE = "#12535C";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#263834",
        }}
      >
        {/* Viñeta sutil, igual que el hero real */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "radial-gradient(120% 100% at 30% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        {/* Logo — isotipo circular real, versión cremita para fondo oscuro */}
        <img
          src={logo}
          width={184}
          height={186}
          style={{ position: "absolute", top: 40, right: 56 }}
        />

        {/* Niños — fieltro, bleed al borde inferior derecho */}
        <img
          src={ninos}
          width={620}
          height={465}
          style={{ position: "absolute", right: -10, bottom: -15, objectFit: "contain" }}
        />

        {/* Texto — centrado; jerarquía invertida: "Etiquetas, útiles..." es el
            título grande y "Todo lo que necesitas..." pasa a subtítulo chico. */}
        <div
          style={{
            position: "absolute",
            left: 64,
            top: 0,
            bottom: 0,
            width: 660,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 32,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "rgba(243,230,207,0.7)",
              fontFamily: "sans-serif",
              textAlign: "center",
              marginBottom: 22,
            }}
          >
            Back to School
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              lineHeight: 1.15,
              color: CREMITA,
              fontFamily: "Editorial",
              fontStyle: "italic",
              textAlign: "center",
              maxWidth: 640,
            }}
          >
            Etiquetas, útiles y personalización para el regreso a clases.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 34,
              alignItems: "center",
              background: CREMITA,
              color: VERDE,
              borderRadius: 9999,
              padding: "18px 34px",
              fontSize: 48,
              fontWeight: 700,
              fontFamily: "sans-serif",
              alignSelf: "center",
            }}
          >
            Me interesa →
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Editorial", data: italic, weight: 400, style: "italic" }] }
  );
}
