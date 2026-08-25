import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Comparte tu creación (Dopamina): recibe nombre + instagram + nota + foto,
// guarda la foto en el bucket `laboratorio` (respaldo permanente, público) y
// manda todo por email a Papela vía Resend para compartirla en redes.
//
// La foto viene YA comprimida del cliente (canvas → JPEG ~1600px). El límite
// duro de 4.4MB existe porque el body de una function en Vercel topa en 4.5MB.
//
// Envs:
//   RESEND_API_KEY     — sin ella la foto igual se guarda en el bucket, pero el
//                        email no sale (queda logueado con la URL para rescatarla)
//   DOPAMINA_EMAIL_TO  — destino (default hola@papela-atelier.com)
//   RESEND_FROM        — remitente verificado en Resend

const MAX_FOTO_BYTES = 4.4 * 1024 * 1024;
const TIPOS_OK: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(req: NextRequest) {
  // 3 envíos por IP cada 10 minutos (una persona comparte 1-2 veces)
  if (!rateLimit(`dopamina-comparte:${getClientIp(req)}`, 3, 10 * 60_000)) {
    return NextResponse.json({ error: "Demasiados envíos. Intenta en unos minutos." }, { status: 429 });
  }

  try {
    const form = await req.formData();

    // Honeypot: campo invisible que solo llenan los bots
    if (typeof form.get("web") === "string" && (form.get("web") as string) !== "") {
      return NextResponse.json({ ok: true });
    }

    const nombre = String(form.get("nombre") ?? "").trim();
    const instagram = String(form.get("instagram") ?? "").trim().replace(/^@+/, "");
    const nota = String(form.get("nota") ?? "").trim();
    const reto = String(form.get("reto") ?? "").trim();
    const foto = form.get("foto");

    if (nombre.length < 2 || nombre.length > 80) {
      return NextResponse.json({ error: "Cuéntanos tu nombre" }, { status: 400 });
    }
    if (instagram.length > 60 || (instagram && !/^[a-zA-Z0-9._]+$/.test(instagram))) {
      return NextResponse.json({ error: "Usuario de Instagram inválido" }, { status: 400 });
    }
    if (nota.length > 600 || reto.length > 300) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    if (!(foto instanceof File) || !TIPOS_OK[foto.type]) {
      return NextResponse.json({ error: "Sube una foto (JPG, PNG o WebP)" }, { status: 400 });
    }
    if (foto.size === 0 || foto.size > MAX_FOTO_BYTES) {
      return NextResponse.json({ error: "La foto pesa demasiado" }, { status: 400 });
    }

    const buffer = Buffer.from(await foto.arrayBuffer());

    // 1) Respaldo en el bucket: aunque el email falle, la foto no se pierde.
    const supabase = createAdminClient();
    const path = `comparte/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${TIPOS_OK[foto.type]}`;
    const { error: upError } = await supabase.storage
      .from("laboratorio")
      .upload(path, buffer, { contentType: foto.type, cacheControl: "31536000" });
    if (upError) {
      logger.error("dopamina comparte: upload al bucket falló", { path }, upError);
      return NextResponse.json({ error: "No se pudo subir tu foto. Intenta de nuevo." }, { status: 500 });
    }
    const { data: pub } = supabase.storage.from("laboratorio").getPublicUrl(path);
    const fotoUrl = pub.publicUrl;

    // 2) Email a Papela con los datos + la foto adjunta.
    const apiKey = process.env.RESEND_API_KEY;
    const destino = process.env.DOPAMINA_EMAIL_TO ?? "hola@papela-atelier.com";
    const remitente = process.env.RESEND_FROM ?? "Dopamina · Papela <dopamina@papela-atelier.com>";

    if (!apiKey) {
      // Sin proveedor configurado: la foto ya está a salvo en el bucket; se
      // loguea la URL para rescatarla desde los logs de Vercel.
      logger.error("dopamina comparte: falta RESEND_API_KEY, email no enviado", { fotoUrl, nombre, instagram });
      return NextResponse.json({ ok: true });
    }

    const html = `
      <div style="font-family: sans-serif; color: #403c3c; max-width: 560px;">
        <h2 style="color: #12535c;">Nueva creación de Dopamina 🎨</h2>
        <p><strong>Nombre:</strong> ${esc(nombre)}</p>
        <p><strong>Instagram:</strong> ${instagram ? `<a href="https://instagram.com/${esc(instagram)}">@${esc(instagram)}</a>` : "—"}</p>
        ${reto ? `<p><strong>Reto:</strong> ${esc(reto)}</p>` : ""}
        ${nota ? `<p><strong>Nota:</strong> ${esc(nota)}</p>` : ""}
        <p><a href="${fotoUrl}">Ver la foto en tamaño completo</a> (también va adjunta)</p>
        <img src="${fotoUrl}" alt="Creación de ${esc(nombre)}" style="max-width: 100%; border-radius: 12px; margin-top: 8px;" />
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: remitente,
        to: [destino],
        reply_to: undefined,
        subject: `Dopamina: creación de ${nombre}${instagram ? ` (@${instagram})` : ""}`,
        html,
        attachments: [
          { filename: `creacion-${nombre.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase()}.${TIPOS_OK[foto.type]}`, content: buffer.toString("base64") },
        ],
      }),
    });

    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      // La foto quedó en el bucket: se avisa en logs con la URL, y al usuario
      // no se le falla (su parte ya está hecha).
      logger.error("dopamina comparte: Resend rechazó el email", { status: res.status, detalle: detalle.slice(0, 300), fotoUrl });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("dopamina comparte: request falló", {}, error as Error);
    return NextResponse.json({ error: "No se pudo enviar. Intenta de nuevo." }, { status: 500 });
  }
}
