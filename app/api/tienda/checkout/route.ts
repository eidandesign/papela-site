import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { randomUUID } from "crypto";
import { COSTO_ENVIO } from "@/lib/stores/cartStore";
import { logger } from "@/lib/logger";
import { gaClientId } from "@/lib/ga4";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { expiracionPreferencia } from "@/lib/mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

interface CartItemInput {
  productoId: string;
  cantidad: number;
  variacionId?: string | null;
  variacionNombre?: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function textoCorto(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
}

/** Dirección de envío: objeto plano, máximo 12 campos de texto de hasta 200 caracteres. */
function saneaDireccion(v: unknown): Record<string, string> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>).slice(0, 12)) {
    if (!/^[a-zA-Z_]{1,30}$/.test(k)) continue;
    const t = textoCorto(val, 200);
    if (t) out[k] = t;
  }
  return Object.keys(out).length > 0 ? out : null;
}

export async function POST(req: NextRequest) {
  // 8 intentos de checkout por IP cada 5 minutos
  if (!(await rateLimit(`tienda-checkout:${getClientIp(req)}`, 8, 5 * 60_000))) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en unos minutos." }, { status: 429 });
  }

  // El pedido real pesa unos cientos de bytes; un cuerpo enorme solo busca
  // llenar tienda_pedidos (cada intento inserta una fila con service role).
  if (Number(req.headers.get("content-length") ?? 0) > 20_000) {
    return NextResponse.json({ error: "Solicitud demasiado grande" }, { status: 413 });
  }

  try {
    const body = await req.json();
    const { items, tipoEnvio, sinPromociones } = body as {
      items: CartItemInput[];
      tipoEnvio: "recoger" | "envio";
      sinPromociones?: boolean;
    };
    // Datos del comprador: solo texto corto. La dirección se guarda como jsonb,
    // así que se copian únicamente llaves conocidas con valores de texto.
    const compradorNombre = textoCorto(body?.compradorNombre, 100);
    const compradorTelefono = textoCorto(body?.compradorTelefono, 30);
    // Correo para la confirmación del pedido (y la guía). Obligatorio desde
    // nov-2026: el del pagador en MercadoPago puede ser viejo o no existir.
    const compradorEmail = textoCorto(body?.compradorEmail, 160)?.toLowerCase() ?? null;
    if (!compradorEmail || !EMAIL_RE.test(compradorEmail)) {
      return NextResponse.json({ error: "Escribe un correo válido para mandarte la confirmación" }, { status: 400 });
    }
    const direccionEnvio = saneaDireccion(body?.direccionEnvio);

    // Basic validation
    if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
      return NextResponse.json({ error: "Items inválidos" }, { status: 400 });
    }
    if (tipoEnvio !== "recoger" && tipoEnvio !== "envio") {
      return NextResponse.json({ error: "tipoEnvio inválido" }, { status: 400 });
    }
    for (const item of items) {
      if (!item || typeof item.productoId !== "string" || !UUID_RE.test(item.productoId)) {
        return NextResponse.json({ error: "productoId inválido" }, { status: 400 });
      }
      if (item.variacionId != null && (typeof item.variacionId !== "string" || item.variacionId.length > 80)) {
        return NextResponse.json({ error: "Variación inválida" }, { status: 400 });
      }
      if (!Number.isInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > 20) {
        return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
      }
    }

    // Fetch authoritative prices + stock from DB. Service role: la inserción en
    // tienda_pedidos requiere bypassar RLS ("service only").
    const supabase = createAdminClient();
    const ids = items.map((i) => i.productoId);
    const { data: productos, error: dbError } = await supabase
      .from("productos")
      .select("id, nombre, precio, stock, imagen_url, atributos")
      .in("id", ids)
      // Solo lo que la tienda en línea vende: nada de inventario de mostrador
      // (Papelería, Mercería…) ni productos en la papelera.
      .eq("categoria", "Tienda")
      .is("deleted_at", null);

    if (dbError || !productos) {
      return NextResponse.json({ error: "Error consultando productos" }, { status: 500 });
    }

    // Check all products exist and have stock
    const productoMap = new Map(productos.map((p) => [p.id, p]));

    // El stock es a nivel producto (suma de variaciones). Validamos la cantidad
    // TOTAL por producto, sumando todas sus líneas de variación, para no sobrevender.
    const cantidadPorProducto = new Map<string, number>();
    for (const item of items) {
      cantidadPorProducto.set(
        item.productoId,
        (cantidadPorProducto.get(item.productoId) ?? 0) + item.cantidad
      );
    }
    for (const [productoId, cantidadTotal] of cantidadPorProducto) {
      const prod = productoMap.get(productoId);
      if (!prod) {
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
      }
      const attrs = prod.atributos as { unidad_venta?: string; variaciones?: unknown[] } | null;
      // Lo que se vende por metro solo se despacha en mostrador.
      if (attrs?.unidad_venta === "metro") {
        return NextResponse.json({ error: `No disponible en línea: ${prod.nombre}` }, { status: 409 });
      }
      // Con variaciones, el stock y el precio viven en cada una: la línea debe decir cuál.
      if (
        Array.isArray(attrs?.variaciones) &&
        attrs.variaciones.length > 0 &&
        items.some((i) => i.productoId === productoId && !i.variacionId)
      ) {
        return NextResponse.json({ error: `Elige una opción de: ${prod.nombre}` }, { status: 400 });
      }
      if (prod.stock < cantidadTotal) {
        return NextResponse.json({ error: `Stock insuficiente para: ${prod.nombre}` }, { status: 409 });
      }
    }

    // Validación por variación: el stock real vive en atributos.variaciones.
    type VariacionDB = { id: string; stock?: number; nombre?: string; precio?: number | null };
    const variacionDe = (productoId: string, variacionId?: string | null): VariacionDB | null => {
      if (!variacionId) return null;
      const prod = productoMap.get(productoId);
      const lista = (prod?.atributos as { variaciones?: VariacionDB[] } | null)?.variaciones;
      return (Array.isArray(lista) ? lista : []).find((x) => x.id === variacionId) ?? null;
    };
    const cantidadPorVariacion = new Map<string, number>(); // key = productoId::variacionId
    for (const item of items) {
      if (!item.variacionId) continue;
      const k = `${item.productoId}::${item.variacionId}`;
      cantidadPorVariacion.set(k, (cantidadPorVariacion.get(k) ?? 0) + item.cantidad);
    }
    for (const [k, cant] of cantidadPorVariacion) {
      const sep = k.indexOf("::");
      const productoId = k.slice(0, sep);
      const variacionId = k.slice(sep + 2);
      const prod = productoMap.get(productoId);
      const v = variacionDe(productoId, variacionId);
      if (!v) {
        return NextResponse.json({ error: `Variación no encontrada para: ${prod?.nombre ?? "el producto"}` }, { status: 404 });
      }
      if ((v.stock ?? 0) < cant) {
        return NextResponse.json({ error: `Stock insuficiente para: ${prod?.nombre}${v.nombre ? ` · ${v.nombre}` : ""}` }, { status: 409 });
      }
    }

    const mpItems: {
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      currency_id: string;
      picture_url?: string;
    }[] = [];
    const orderItems: {
      productoId: string;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
      variacionId?: string | null;
      variacionNombre?: string | null;
    }[] = [];

    for (const item of items) {
      const prod = productoMap.get(item.productoId)!;
      // Nombre y precio de la variación salen SIEMPRE de la base: lo que mande
      // el navegador no cuenta. Una variación puede costar distinto que la
      // principal; si no trae precio propio, hereda el del producto.
      const v = variacionDe(item.productoId, item.variacionId);
      const variacionNombre = typeof v?.nombre === "string" && v.nombre.trim() ? v.nombre.trim().slice(0, 120) : null;
      const precioV = Number(v?.precio);
      const precioUnitario = v && Number.isFinite(precioV) && precioV > 0 ? precioV : Number(prod.precio);
      if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
        return NextResponse.json({ error: `No disponible en línea: ${prod.nombre}` }, { status: 409 });
      }
      const nombreCompleto = variacionNombre ? `${prod.nombre} · ${variacionNombre}` : prod.nombre;
      mpItems.push({
        id: prod.id,
        title: nombreCompleto,
        quantity: item.cantidad,
        unit_price: precioUnitario,
        currency_id: "MXN",
        ...(prod.imagen_url ? { picture_url: prod.imagen_url } : {}),
      });
      orderItems.push({
        productoId: prod.id,
        nombre: nombreCompleto,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
        variacionId: v ? v.id : null,
        variacionNombre,
      });
    }

    // Add shipping as a separate item if needed
    if (tipoEnvio === "envio") {
      mpItems.push({
        id: "envio-nacional",
        title: "Envío nacional",
        quantity: 1,
        unit_price: COSTO_ENVIO,
        currency_id: "MXN",
      });
    }

    const externalReference = `tienda:${randomUUID()}`;

    // Save pending order so webhook can decrement stock
    const montoTotal =
      orderItems.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0) +
      (tipoEnvio === "envio" ? COSTO_ENVIO : 0);

    const pedido: Record<string, unknown> = {
      external_reference: externalReference,
      estado: "pendiente",
      tipo_envio: tipoEnvio,
      items: orderItems,
      monto_total: montoTotal,
      comprador_nombre: compradorNombre,
      comprador_email: compradorEmail,
      comprador_telefono: compradorTelefono,
      direccion_envio: direccionEnvio,
    };
    // `sin_promociones` (migración 20261017_privacidad_sin_promociones del
    // admin) solo viaja cuando el cliente la marcó; si la columna aún no existe
    // se reintenta sin ella para no perder la venta (y se deja rastro).
    let { error: insertError } = await supabase
      .from("tienda_pedidos")
      .insert(sinPromociones === true ? { ...pedido, sin_promociones: true } : pedido);
    if (insertError && sinPromociones === true && insertError.code === "PGRST204") {
      logger.error("tienda checkout: falta la columna sin_promociones — aplicar migración", { externalReference });
      ({ error: insertError } = await supabase.from("tienda_pedidos").insert(pedido));
    }
    if (insertError) {
      // No mandamos al cliente a pagar un pedido que no se registró: sin el
      // pedido, el webhook no podría descontar stock ni marcarlo pagado.
      logger.error("tienda checkout: no se pudo guardar el pedido", { externalReference }, insertError);
      return NextResponse.json({ error: "No se pudo crear el pedido. Intenta de nuevo." }, { status: 500 });
    }

    // Create MercadoPago preference
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: `${SITE_URL}/tienda/pago/gracias`,
          failure: `${SITE_URL}/tienda/pago/error`,
          pending: `${SITE_URL}/tienda/pago/pendiente`,
        },
        auto_return: "approved",
        notification_url: `${SITE_URL}/api/webhooks/mercadopago`,
        external_reference: externalReference,
        // Prellena el correo en MercadoPago (el cliente puede cambiarlo allá;
        // la confirmación igual va al que escribió aquí).
        payer: { email: compradorEmail, ...(compradorNombre ? { name: compradorNombre } : {}) },
        ...expiracionPreferencia(),
        // El webhook lo reenvía a GA4 para atribuir la compra.
        ...(gaClientId(req) ? { metadata: { ga_client_id: gaClientId(req) } } : {}),
      },
    });

    return NextResponse.json({
      checkoutUrl: result.init_point,
      analitica: {
        item_name: orderItems.length > 1 ? `${orderItems[0].nombre} y ${orderItems.length - 1} más` : orderItems[0].nombre,
        value: montoTotal,
      },
    });
  } catch (error) {
    logger.error("tienda checkout failed", {}, error);
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }
}
