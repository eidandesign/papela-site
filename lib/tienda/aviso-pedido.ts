import "server-only";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import { NEGOCIO, DIRECCION_LINEA } from "@/lib/negocio";
import { SITE_URL } from "@/lib/site";
import { TZ } from "@/lib/fecha";
import { waHref } from "@/lib/whatsapp";

// Avisos por correo cuando un pedido de la tienda en línea queda PAGADO.
// Lo llama el webhook de MercadoPago solo la vez que reclamó el pago
// (`nuevo`), así que un reintento de MP no duplica correos; además cada envío
// lleva `Idempotency-Key` por payment_id.
//
//   1. Al cliente: confirmación con su pedido, total y qué sigue (recoger o envío).
//   2. A Papela: aviso con el pedido, datos de contacto, dirección y un botón
//      para escribirle al cliente por WhatsApp.
//
// Variables de entorno (no van en el repo):
//   RESEND_API_KEY        la misma llave de envío de maestros/creadores
//   PEDIDOS_AVISO_PARA    destinatario(s) del aviso interno, separados por coma
//                         (si falta, usa MAESTROS_AVISO_PARA; si tampoco, hola@)
//   PEDIDOS_AVISO_COPIA   copia(s), opcional
//
// Nunca rompe el webhook: el pedido ya quedó pagado y con stock descontado.

const REMITENTE = "Papela Atelier <pedidos@papela-atelier.com>";
const ADMIN_URL = "https://admin.papela-atelier.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const lista = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => EMAIL_RE.test(x));

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const pesos = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

type ItemPedido = {
  nombre?: string;
  cantidad?: number;
  precio_unitario?: number;
};

type Pedido = {
  id: string;
  external_reference: string;
  items: ItemPedido[] | null;
  tipo_envio: "recoger" | "envio" | string;
  monto_total: number | null;
  comprador_nombre: string | null;
  comprador_email: string | null;
  comprador_telefono: string | null;
  direccion_envio: Record<string, string> | null;
  created_at: string;
};

/** Número corto y legible para el cliente: últimos 6 del uuid de la referencia. */
export function folioPedido(externalReference: string): string {
  return externalReference.replace(/^tienda:/, "").replace(/-/g, "").slice(-6).toUpperCase();
}

function telefonoWa(tel: string | null): string | null {
  const d = (tel ?? "").replace(/\D/g, "");
  if (d.length === 10) return `52${d}`;
  if (d.length === 12 && d.startsWith("52")) return d;
  if (d.length === 13 && d.startsWith("521")) return `52${d.slice(3)}`;
  return null;
}

function direccionTexto(d: Record<string, string> | null): string | null {
  if (!d) return null;
  const linea1 = [d.calle, d.colonia].filter(Boolean).join(", ");
  const linea2 = [d.cp, d.ciudad, d.estado].filter(Boolean).join(", ");
  const extra = d.referencias ?? d.notas;
  return [linea1, linea2, extra].filter(Boolean).join("\n") || null;
}

function tablaItems(p: Pedido): string {
  const filas = (p.items ?? [])
    .map((it) => {
      const cant = Number(it.cantidad) || 1;
      const unit = Number(it.precio_unitario) || 0;
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;color:#403C3C;font-size:15px">${esc(it.nombre ?? "Producto")}<br><span style="color:#6E645F;font-size:13px">${cant} × ${pesos(unit)}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #E8DCC8;color:#403C3C;font-size:15px;text-align:right;white-space:nowrap">${pesos(cant * unit)}</td>
      </tr>`;
    })
    .join("");
  const subtotal = (p.items ?? []).reduce((a, it) => a + (Number(it.cantidad) || 1) * (Number(it.precio_unitario) || 0), 0);
  const total = Number(p.monto_total) || subtotal;
  const envio = Math.max(0, Math.round((total - subtotal) * 100) / 100);
  const filaTotal = (label: string, valor: string, fuerte = false) =>
    `<tr><td style="padding:6px 0;color:${fuerte ? "#12535C" : "#6E645F"};font-size:${fuerte ? 17 : 14}px${fuerte ? ";font-weight:bold" : ""}">${label}</td><td style="padding:6px 0;text-align:right;color:${fuerte ? "#12535C" : "#403C3C"};font-size:${fuerte ? 17 : 14}px${fuerte ? ";font-weight:bold" : ""}">${valor}</td></tr>`;
  return `<table style="width:100%;border-collapse:collapse">${filas}
    ${filaTotal("Subtotal", pesos(subtotal))}
    ${p.tipo_envio === "envio" ? filaTotal("Envío", pesos(envio)) : filaTotal("Entrega", "Recoger en tienda · gratis")}
    ${filaTotal("Total pagado", `${pesos(total)} MXN`, true)}
  </table>`;
}

function marco(eyebrow: string, titulo: string, cuerpo: string): string {
  return `<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:28px 24px;background:#F0EFEB">
  <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8C482A;margin:0 0 8px">${esc(eyebrow)}</p>
  <h1 style="font-family:Georgia,serif;font-weight:normal;font-style:italic;color:#12535C;font-size:30px;line-height:1.15;margin:0 0 16px">${titulo}</h1>
  ${cuerpo}
</div>`;
}

const parrafo = (html: string) => `<p style="color:#403C3C;font-size:15px;line-height:1.5;margin:0 0 14px">${html}</p>`;
const subtitulo = (t: string) =>
  `<h2 style="font-family:Georgia,serif;font-weight:normal;color:#403C3C;font-size:20px;margin:28px 0 8px">${esc(t)}</h2>`;
const boton = (href: string, texto: string, color = "#12535C") =>
  `<a href="${esc(href)}" style="display:inline-block;background:${color};color:#F3E6CF;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;margin:4px 8px 4px 0">${esc(texto)}</a>`;

export function correoCliente(p: Pedido, folio: string, incidencia: string | null): { subject: string; html: string } {
  const nombre = (p.comprador_nombre ?? "").split(" ")[0] || "";
  const horario = NEGOCIO.horario.map((h) => `${h.dias}: ${h.abre}–${h.cierra}`).join("<br>");
  const queSigue =
    p.tipo_envio === "envio"
      ? parrafo("Estamos preparando tu paquete con mucho cariño. Cuando salga te mandaremos la paquetería y el número de guía para que lo rastrees.") +
        (direccionTexto(p.direccion_envio)
          ? `${subtitulo("Lo enviaremos a")}${parrafo(esc(direccionTexto(p.direccion_envio)!).replace(/\n/g, "<br>"))}`
          : "")
      : parrafo("Te avisaremos en cuanto tu pedido esté listo para recoger. Al llegar, solo menciona tu número de pedido.") +
        `${subtitulo("Dónde recoger")}${parrafo(`${esc(DIRECCION_LINEA)}<br><a href="${esc(NEGOCIO.comoLlegarUrl)}" style="color:#12535C">Cómo llegar</a>`)}${parrafo(`<span style="color:#6E645F;font-size:14px">${horario}</span>`)}`;

  const aviso = incidencia
    ? parrafo(
        `<strong>Una nota:</strong> vamos a confirmar la disponibilidad de uno de tus productos y te escribiremos muy pronto. Si algo no estuviera disponible, te ofreceremos un cambio o el reembolso.`,
      )
    : "";

  const html = marco(
    `Pedido N.º ${folio}`,
    `¡Gracias por tu compra${nombre ? `, ${esc(nombre)}` : ""}!`,
    parrafo("Recibimos tu pago y tu pedido ya está en nuestras manos.") +
      aviso +
      subtitulo("Tu pedido") +
      tablaItems(p) +
      subtitulo("Qué sigue") +
      queSigue +
      `<p style="margin:24px 0 0">${boton(waHref(`Hola Papela 🌿 tengo una duda sobre mi pedido N.º ${folio}`), "Escríbenos por WhatsApp", "#0F7F5A")}</p>` +
      `<p style="color:#6E645F;font-size:12px;line-height:1.5;margin:28px 0 0">Papela Atelier · ${esc(DIRECCION_LINEA)} · ${esc(NEGOCIO.telefono)}<br>Puedes responder este correo si necesitas algo. <a href="${SITE_URL}/terminos" style="color:#6E645F">Términos, cambios y devoluciones</a>.</p>`,
  );
  return { subject: `Recibimos tu pedido N.º ${folio} · Papela Atelier`, html };
}

export function correoPapela(p: Pedido, folio: string, paymentId: string, incidencia: string | null): { subject: string; html: string } {
  const fila = (label: string, valor: string | null, href?: string) =>
    valor
      ? `<tr><td style="padding:6px 16px 6px 0;color:#6E645F;font-size:14px;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;color:#403C3C;font-size:15px">${href ? `<a href="${esc(href)}" style="color:#12535C">${esc(valor).replace(/\n/g, "<br>")}</a>` : esc(valor).replace(/\n/g, "<br>")}</td></tr>`
      : "";
  const wa = telefonoWa(p.comprador_telefono);
  const fecha = new Date(p.created_at).toLocaleString("es-MX", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" });
  const entrega = p.tipo_envio === "envio" ? "Envío a domicilio" : "Recoger en tienda";
  const alerta = incidencia
    ? `<div style="background:#F6D9CF;border-radius:12px;padding:12px 16px;margin:0 0 16px;color:#8C482A;font-size:15px"><strong>⚠️ Revisar:</strong> ${esc(incidencia)}</div>`
    : "";

  const html = marco(
    `Tienda en línea · ${entrega}`,
    `Nuevo pedido pagado N.º ${folio}`,
    alerta +
      tablaItems(p) +
      subtitulo("Cliente") +
      `<table style="border-collapse:collapse">
        ${fila("Nombre", p.comprador_nombre)}
        ${fila("Correo", p.comprador_email, p.comprador_email ? `mailto:${p.comprador_email}` : undefined)}
        ${fila("Teléfono", p.comprador_telefono, wa ? `https://wa.me/${wa}` : undefined)}
        ${fila("Entrega", entrega)}
        ${p.tipo_envio === "envio" ? fila("Dirección", direccionTexto(p.direccion_envio)) : ""}
        ${fila("Fecha", fecha)}
        ${fila("Pago MercadoPago", `#${paymentId}`)}
      </table>` +
      `<p style="margin:24px 0 0">${wa ? boton(waHref(`Hola ${(p.comprador_nombre ?? "").split(" ")[0]} 🌿 te escribimos de Papela Atelier por tu pedido N.º ${folio}.`, wa), "Escribir al cliente por WhatsApp", "#0F7F5A") : ""}${boton(ADMIN_URL, "Abrir el admin")}</p>` +
      `<p style="color:#6E645F;font-size:12px;margin:24px 0 0">Responde este correo para escribirle al cliente.</p>`,
  );
  return {
    subject: `${incidencia ? "⚠️ " : ""}Nuevo pedido N.º ${folio} · ${pesos(Number(p.monto_total) || 0)} · ${entrega}`,
    html,
  };
}

async function enviar(key: string, idem: string, body: Record<string, unknown>, etiqueta: string): Promise<void> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": idem },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      logger.error(`pedidos: Resend rechazó el correo (${etiqueta})`, { status: res.status, cuerpo: (await res.text()).slice(0, 300) });
    }
  } catch (error) {
    logger.error(`pedidos: no se pudo enviar el correo (${etiqueta})`, {}, error);
  }
}

/**
 * Manda la confirmación al cliente y el aviso a Papela de un pedido recién pagado.
 * `emailRespaldo` = correo del pagador en MP, por si el pedido no lo trae.
 */
export async function avisarPedidoPagado(opts: {
  externalReference: string;
  paymentId: string;
  incidencia: string | null;
  emailRespaldo?: string | null;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    logger.warn("pedidos: avisos por correo sin configurar (RESEND_API_KEY)");
    return;
  }

  let pedido: Pedido | null = null;
  try {
    const { data, error } = await createAdminClient()
      .from("tienda_pedidos")
      .select("id, external_reference, items, tipo_envio, monto_total, comprador_nombre, comprador_email, comprador_telefono, direccion_envio, created_at")
      .eq("external_reference", opts.externalReference)
      .maybeSingle();
    if (error) throw error;
    pedido = data as Pedido | null;
  } catch (error) {
    logger.error("pedidos: no se pudo leer el pedido para los avisos", { externalReference: opts.externalReference }, error);
    return;
  }
  if (!pedido) return;

  const folio = folioPedido(pedido.external_reference);
  const emailCliente = [pedido.comprador_email, opts.emailRespaldo].find((e) => e && EMAIL_RE.test(e)) ?? null;
  const internos = lista(process.env.PEDIDOS_AVISO_PARA || process.env.MAESTROS_AVISO_PARA);
  const para = internos.length ? internos : [NEGOCIO.email];
  const copia = lista(process.env.PEDIDOS_AVISO_COPIA);

  const envios: Promise<void>[] = [];

  if (emailCliente) {
    const c = correoCliente(pedido, folio, opts.incidencia);
    envios.push(
      enviar(key, `pedido-cliente-${opts.paymentId}`, { from: REMITENTE, to: [emailCliente], reply_to: NEGOCIO.email, subject: c.subject, html: c.html }, "cliente"),
    );
  } else {
    logger.warn("pedidos: pedido pagado sin correo del cliente — no se mandó confirmación", { folio });
  }

  const a = correoPapela(pedido, folio, opts.paymentId, opts.incidencia);
  envios.push(
    enviar(
      key,
      `pedido-papela-${opts.paymentId}`,
      {
        from: REMITENTE,
        to: para,
        ...(copia.length ? { cc: copia } : {}),
        ...(emailCliente ? { reply_to: emailCliente } : {}),
        subject: a.subject,
        html: a.html,
      },
      "papela",
    ),
  );

  await Promise.all(envios);
}
