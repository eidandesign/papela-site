import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import {
  BUCKET_FOTOS,
  CANTIDADES,
  CATEGORIAS,
  CONDICIONES_VERSION,
  EMAIL_RE,
  FOTOS,
  LIMITES,
  carpetaPostulacion,
  esUuid,
  whatsappValido,
  type FotoSubida,
} from "./config";

// Postulaciones de Creadores en Papela: validación del servidor, guardado en
// `creadores_postulaciones` (migración 20261117 del admin, service role: la
// tabla no tiene policy de insert) y aviso por correo a Papela vía Resend.
// Enviar NO es aceptación: la fila nace en estado `recibida`.

export type Postulacion = {
  id: string;
  nombre: string;
  marca: string;
  correo: string;
  whatsapp: string;
  redes: string;
  categoria: string | null;
  descripcion: string;
  precio: string | null;
  numProductos: string | null;
  portafolio: string | null;
  fotos: FotoSubida[];
  sinPromociones: boolean;
};

const limpio = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .trim()
        .slice(0, max)
    : "";

const deLista = <T extends readonly string[]>(
  v: unknown,
  lista: T,
): string | null =>
  typeof v === "string" && (lista as readonly string[]).includes(v) ? v : null;

/** Liga a su sitio o portafolio: acepta "midominio.com" (le pone https://); solo http(s). */
function saneaUrl(v: unknown): string | null {
  let t = limpio(v, LIMITES.portafolio);
  if (!t) return null;
  if (!/^https?:\/\//i.test(t)) t = `https://${t}`;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Solo fotos de la carpeta de ESTA postulación, con tipo y tamaño válidos. */
function saneaFotos(input: unknown, id: string): FotoSubida[] {
  if (!Array.isArray(input)) return [];
  const carpeta = carpetaPostulacion(id);
  const salida: FotoSubida[] = [];
  for (const a of input) {
    if (!a || typeof a !== "object") continue;
    const { path, nombre, tipo, tamano } = a as Record<string, unknown>;
    if (
      typeof path !== "string" ||
      !path.startsWith(carpeta) ||
      path.includes("..") ||
      path.length > 300
    )
      continue;
    if (
      typeof tipo !== "string" ||
      !(FOTOS.tipos as readonly string[]).includes(tipo)
    )
      continue;
    const n =
      typeof tamano === "number" && Number.isFinite(tamano) ? tamano : 0;
    if (n <= 0 || n > FOTOS.maxBytes) continue;
    if (salida.some((f) => f.path === path)) continue;
    salida.push({
      path,
      nombre: limpio(nombre, 120) || "foto",
      tipo,
      tamano: n,
    });
    if (salida.length >= FOTOS.max) break;
  }
  return salida;
}

/** Valida el cuerpo del formulario. Devuelve la postulación o el primer error legible. */
export function validaPostulacion(
  body: unknown,
): { ok: true; datos: Postulacion } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  if (!esUuid(b.id))
    return {
      ok: false,
      error:
        "No pudimos leer el formulario. Recarga la página e intenta de nuevo.",
    };

  const nombre = limpio(b.nombre, LIMITES.nombre);
  const marca = limpio(b.marca, LIMITES.marca);
  const correo = limpio(b.correo, LIMITES.correo).toLowerCase();
  const whatsapp = limpio(b.whatsapp, LIMITES.whatsapp);
  const redes = limpio(b.redes, LIMITES.redes);
  const descripcion = limpio(b.descripcion, LIMITES.descripcion);

  if (nombre.length < 2)
    return { ok: false, error: "Escribe tu nombre completo." };
  if (marca.length < 2)
    return { ok: false, error: "Escribe el nombre de tu marca o proyecto." };
  if (!EMAIL_RE.test(correo))
    return { ok: false, error: "Revisa tu correo electrónico." };
  if (!whatsappValido(whatsapp))
    return { ok: false, error: "Revisa tu número de WhatsApp (10 dígitos)." };
  if (redes.length < 2)
    return {
      ok: false,
      error: "Déjanos tu Instagram o la red donde muestras tu trabajo.",
    };
  if (descripcion.length < LIMITES.descripcionMin)
    return { ok: false, error: "Cuéntanos un poco más sobre tu proyecto." };
  if (b.aceptaPrivacidad !== true)
    return {
      ok: false,
      error: "Necesitamos que aceptes el aviso de privacidad.",
    };
  if (b.aceptaCondiciones !== true)
    return {
      ok: false,
      error: "Necesitamos que reconozcas las condiciones del programa.",
    };

  return {
    ok: true,
    datos: {
      id: b.id.toLowerCase(),
      nombre,
      marca,
      correo,
      whatsapp,
      redes,
      categoria: deLista(b.categoria, CATEGORIAS),
      descripcion,
      precio: limpio(b.precio, LIMITES.precio) || null,
      numProductos: deLista(b.numProductos, CANTIDADES),
      portafolio: saneaUrl(b.portafolio),
      fotos: saneaFotos(b.fotos, b.id),
      sinPromociones: b.sinPromociones === true,
    },
  };
}

/**
 * Guarda la postulación. Idempotente por `id` (uno por formulario): un doble
 * clic o un reintento no duplican ni pisan una postulación que el admin ya
 * movió de estado. Devuelve `nueva: false` si ya existía.
 */
export async function guardarPostulacion(
  p: Postulacion,
): Promise<{ ok: boolean; nueva: boolean }> {
  const { data, error } = await createAdminClient()
    .from("creadores_postulaciones")
    .upsert(
      {
        id: p.id,
        nombre: p.nombre,
        marca: p.marca,
        correo: p.correo,
        whatsapp: p.whatsapp,
        redes: p.redes,
        categoria: p.categoria,
        descripcion: p.descripcion,
        // Columna `rango_precios`: desde nov-2026 guarda el precio en texto libre.
        rango_precios: p.precio,
        num_productos: p.numProductos,
        portafolio: p.portafolio,
        fotos: p.fotos,
        acepta_privacidad: true,
        acepta_condiciones: true,
        condiciones_version: CONDICIONES_VERSION,
        sin_promociones: p.sinPromociones,
      },
      { onConflict: "id", ignoreDuplicates: true },
    )
    .select("id");
  if (error) {
    logger.error(
      "creadores: no se pudo guardar la postulación",
      { code: error.code },
      error,
    );
    return { ok: false, nueva: false };
  }
  return { ok: true, nueva: (data?.length ?? 0) > 0 };
}

// ── Aviso por correo ───────────────────────────────────────────────────────
// Variables de entorno (no van en el repo):
//   RESEND_API_KEY          la misma llave de envío que usan los maestros
//   CREADORES_AVISO_PARA    destinatario(s), separados por coma
//                           (si falta, usa MAESTROS_AVISO_PARA)
//   CREADORES_AVISO_COPIA   copia(s), opcional
// Nunca rompe el envío: la postulación ya quedó guardada.

const REMITENTE = "Papela Atelier <creadores@papela-atelier.com>";
const LINK_DIAS = 7;

const lista = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => EMAIL_RE.test(x));

function esc(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

function fila(
  label: string,
  valor: string | null | undefined,
  href?: string,
): string {
  if (!valor) return "";
  const v = esc(valor).replace(/\n/g, "<br>");
  const contenido = href
    ? `<a href="${esc(href)}" style="color:#12535C">${v}</a>`
    : v;
  return `<tr><td style="padding:6px 16px 6px 0;color:#6E645F;font-size:14px;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;color:#403C3C;font-size:15px">${contenido}</td></tr>`;
}

export async function avisarPostulacion(p: Postulacion): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const para = lista(
    process.env.CREADORES_AVISO_PARA || process.env.MAESTROS_AVISO_PARA,
  );
  const copia = lista(process.env.CREADORES_AVISO_COPIA);
  if (!key || para.length === 0) {
    logger.warn(
      "creadores: aviso por correo sin configurar (RESEND_API_KEY / CREADORES_AVISO_PARA)",
    );
    return;
  }

  // Las fotos viven en un bucket privado: ligas firmadas que vencen en 7 días.
  let ligas: { nombre: string; url: string | null }[] = p.fotos.map((f) => ({
    nombre: f.nombre,
    url: null,
  }));
  if (p.fotos.length > 0) {
    try {
      const { data } = await createAdminClient()
        .storage.from(BUCKET_FOTOS)
        .createSignedUrls(
          p.fotos.map((f) => f.path),
          LINK_DIAS * 24 * 60 * 60,
        );
      const porPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
      ligas = p.fotos.map((f) => ({
        nombre: f.nombre,
        url: porPath.get(f.path) ?? null,
      }));
    } catch (error) {
      logger.error(
        "creadores: no se pudieron firmar las fotos del aviso",
        {},
        error,
      );
    }
  }

  const tel = p.whatsapp.replace(/\D/g, "");
  const datos =
    fila("Nombre", p.nombre) +
    fila("Correo", p.correo, `mailto:${p.correo}`) +
    fila(
      "WhatsApp",
      p.whatsapp,
      `https://wa.me/${tel.length === 10 ? `52${tel}` : tel}`,
    ) +
    fila("Redes", p.redes) +
    fila("Sitio o portafolio", p.portafolio, p.portafolio ?? undefined);
  const proyecto =
    fila("Marca", p.marca) +
    fila("Categoría", p.categoria) +
    fila("Precio", p.precio) +
    fila("Productos", p.numProductos) +
    fila("Descripción", p.descripcion);
  const fotos = ligas
    .map((l, i) => fila(i === 0 ? "Fotos" : "", l.nombre, l.url ?? undefined))
    .join("");

  const seccion = (titulo: string, cuerpo: string) =>
    cuerpo
      ? `<h2 style="font-family:Georgia,serif;font-weight:normal;color:#422526;font-size:20px;margin:28px 0 8px">${esc(titulo)}</h2><table style="border-collapse:collapse">${cuerpo}</table>`
      : "";

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#F0EFEB">
  <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8C482A;margin:0 0 8px">Creadores en Papela</p>
  <h1 style="font-family:Georgia,serif;font-weight:normal;color:#12535C;font-size:28px;margin:0">Nueva postulación: ${esc(p.marca)}</h1>
  <p style="color:#403C3C;font-size:15px;margin:8px 0 0">De ${esc(p.nombre)}. Quedó en estado <strong>Recibida</strong>.</p>
  ${seccion("El proyecto", proyecto)}
  ${seccion("Contacto", datos)}
  ${seccion("Fotos", fotos)}
  <p style="color:#6E645F;font-size:12px;margin:24px 0 0">Las ligas de las fotos vencen en ${LINK_DIAS} días. Responde este correo para escribirle al creador. Enviar la postulación no implica aceptación.</p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `creadores-${p.id}`,
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: para,
        ...(copia.length ? { cc: copia } : {}),
        reply_to: p.correo,
        subject: `Nueva postulación de creador: ${p.marca} · ${p.nombre}`,
        html,
      }),
    });
    if (!res.ok) {
      logger.error("creadores: Resend rechazó el aviso", {
        status: res.status,
        cuerpo: (await res.text()).slice(0, 300),
      });
    }
  } catch (error) {
    logger.error("creadores: no se pudo enviar el aviso por correo", {}, error);
  }
}
