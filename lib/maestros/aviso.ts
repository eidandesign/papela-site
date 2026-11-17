import "server-only";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import { BUCKET_ARCHIVOS, CAMPOS_FICHA, CAMPOS_PRESTADOR, MODALIDADES, type ArchivoSubido, type DatosContrato } from "./campos";

// Aviso por correo cuando un maestro envía su propuesta desde
// /colabora/maestros/solicitud. Va por la API de Resend (dominio
// papela-atelier.com verificado) — sin SDK, un fetch.
//
// Variables de entorno (no van en el repo):
//   RESEND_API_KEY        llave de Resend con permiso de envío
//   MAESTROS_AVISO_PARA   destinatario(s), separados por coma
//   MAESTROS_AVISO_COPIA  copia(s), separados por coma (opcional)
//
// Nunca rompe el envío de la propuesta: la propuesta ya quedó guardada en
// `maestros_solicitudes` (Admin → Maestros); si el correo falla se deja rastro.

const REMITENTE = "Papela Atelier <maestros@papela-atelier.com>";
const ADMIN_URL = "https://admin.papela-atelier.com/admin/maestros";
const LINK_DIAS = 7;

const lista = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x));

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function fila(label: string, valor: string | null | undefined, href?: string): string {
  if (!valor) return "";
  const v = esc(valor).replace(/\n/g, "<br>");
  const contenido = href ? `<a href="${esc(href)}" style="color:#12535C">${v}</a>` : v;
  return `<tr><td style="padding:6px 16px 6px 0;color:#6E645F;font-size:14px;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;color:#403C3C;font-size:15px">${contenido}</td></tr>`;
}

export async function avisarPropuesta(
  solicitudId: string,
  datos: DatosContrato,
  extra: { portafolio: string | null; archivos: ArchivoSubido[] },
): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const para = lista(process.env.MAESTROS_AVISO_PARA);
  const copia = lista(process.env.MAESTROS_AVISO_COPIA);
  if (!key || para.length === 0) {
    logger.warn("maestros: aviso por correo sin configurar (RESEND_API_KEY / MAESTROS_AVISO_PARA)");
    return;
  }

  const v = datos.valores;
  const modalidad = MODALIDADES.find((m) => m.value === datos.modalidad)?.label ?? datos.modalidad;

  // Los archivos viven en un bucket privado: el correo lleva ligas firmadas
  // que vencen en 7 días (después se abren desde Admin → Maestros).
  let ligas: { nombre: string; url: string | null }[] = extra.archivos.map((a) => ({ nombre: a.nombre, url: null }));
  if (extra.archivos.length > 0) {
    try {
      const { data } = await createAdminClient()
        .storage.from(BUCKET_ARCHIVOS)
        .createSignedUrls(extra.archivos.map((a) => a.path), LINK_DIAS * 24 * 60 * 60);
      const porPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
      ligas = extra.archivos.map((a) => ({ nombre: a.nombre, url: porPath.get(a.path) ?? null }));
    } catch (error) {
      logger.error("maestros: no se pudieron firmar los archivos del aviso", {}, error);
    }
  }

  const datosHtml = CAMPOS_PRESTADOR.map((c) =>
    fila(
      c.label,
      v[c.id] ? `${c.prefijo ?? ""}${v[c.id]}` : null,
      c.id === "instagram" && v[c.id] ? `https://instagram.com/${v[c.id]}` : c.id === "correo" && v[c.id] ? `mailto:${v[c.id]}` : undefined,
    ),
  ).join("");
  const actividadHtml = CAMPOS_FICHA[datos.modalidad]
    .filter((c) => !c.soloPdf)
    .map((c) => fila(c.label, v[c.id]))
    .join("");
  const trabajoHtml =
    fila("Página o portafolio", extra.portafolio, extra.portafolio ?? undefined) +
    ligas.map((l, i) => fila(i === 0 ? "Archivos" : "", l.nombre, l.url ?? undefined)).join("");

  const seccion = (titulo: string, cuerpo: string) =>
    cuerpo
      ? `<h2 style="font-family:Georgia,serif;font-weight:normal;color:#4A3B31;font-size:20px;margin:28px 0 8px">${esc(titulo)}</h2><table style="border-collapse:collapse">${cuerpo}</table>`
      : "";

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#F0EFEB">
  <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8C482A;margin:0 0 8px">Colaboración maestros</p>
  <h1 style="font-family:Georgia,serif;font-weight:normal;color:#12535C;font-size:28px;margin:0">Nueva propuesta de ${esc(v.nombre ?? "un maestro")}</h1>
  <p style="color:#403C3C;font-size:15px;margin:8px 0 0">Quiere impartir <strong>${esc(modalidad)}</strong>.</p>
  ${seccion("Sus datos", datosHtml)}
  ${seccion(datos.modalidad === "talleres" ? "Su taller" : "Su clase", actividadHtml)}
  ${seccion("Su trabajo", trabajoHtml)}
  <p style="margin:32px 0 0"><a href="${ADMIN_URL}" style="display:inline-block;background:#12535C;color:#F3E6CF;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px">Ver en Admin → Maestros</a></p>
  <p style="color:#6E645F;font-size:12px;margin:24px 0 0">Las ligas de los archivos vencen en ${LINK_DIAS} días; después ábrelos desde el admin. Responde este correo para escribirle al maestro.</p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        // Un reenvío de la misma propuesta (doble clic, reintento) no duplica el correo.
        "Idempotency-Key": `maestros-${solicitudId}`,
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: para,
        ...(copia.length ? { cc: copia } : {}),
        ...(v.correo ? { reply_to: v.correo } : {}),
        subject: `Nueva propuesta de maestro: ${v.nombre ?? "sin nombre"} · ${modalidad}`,
        html,
      }),
    });
    if (!res.ok) {
      logger.error("maestros: Resend rechazó el aviso", { status: res.status, cuerpo: (await res.text()).slice(0, 300) });
    }
  } catch (error) {
    logger.error("maestros: no se pudo enviar el aviso por correo", {}, error);
  }
}
