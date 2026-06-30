import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { randomUUID } from "crypto";
import { COSTO_ENVIO } from "@/lib/stores/cartStore";
import { logger } from "@/lib/logger";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

interface CartItemInput {
  productoId: string;
  cantidad: number;
  variacionId?: string | null;
  variacionNombre?: string | null;
}

export async function POST(req: NextRequest) {
  // 8 intentos de checkout por IP cada 5 minutos
  if (!rateLimit(`tienda-checkout:${getClientIp(req)}`, 8, 5 * 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en unos minutos." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { items, tipoEnvio, compradorNombre, compradorTelefono, direccionEnvio } = body as {
      items: CartItemInput[];
      tipoEnvio: "recoger" | "envio";
      compradorNombre?: string;
      compradorTelefono?: string;
      direccionEnvio?: Record<string, string> | null;
    };

    // Basic validation
    if (!Array.isArray(items) || items.length === 0 || items.length > 30) {
      return NextResponse.json({ error: "Items inválidos" }, { status: 400 });
    }
    if (tipoEnvio !== "recoger" && tipoEnvio !== "envio") {
      return NextResponse.json({ error: "tipoEnvio inválido" }, { status: 400 });
    }
    for (const item of items) {
      if (typeof item.productoId !== "string" || !item.productoId) {
        return NextResponse.json({ error: "productoId inválido" }, { status: 400 });
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
      .in("id", ids);

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
        return NextResponse.json({ error: `Producto no encontrado: ${productoId}` }, { status: 404 });
      }
      if (prod.stock < cantidadTotal) {
        return NextResponse.json({ error: `Stock insuficiente para: ${prod.nombre}` }, { status: 409 });
      }
    }

    // Validación por variación: el stock real vive en atributos.variaciones.
    type VariacionDB = { id: string; stock?: number; nombre?: string };
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
      const variaciones = ((prod?.atributos as { variaciones?: VariacionDB[] } | null)?.variaciones) ?? [];
      const v = variaciones.find((x) => x.id === variacionId);
      if (!v) {
        return NextResponse.json({ error: `Variación no encontrada para: ${prod?.nombre ?? productoId}` }, { status: 404 });
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
      const nombreCompleto = item.variacionNombre
        ? `${prod.nombre} · ${item.variacionNombre}`
        : prod.nombre;
      // Precio autoritativo del producto base (las variaciones comparten precio).
      mpItems.push({
        id: prod.id,
        title: nombreCompleto,
        quantity: item.cantidad,
        unit_price: prod.precio,
        currency_id: "MXN",
        ...(prod.imagen_url ? { picture_url: prod.imagen_url } : {}),
      });
      orderItems.push({
        productoId: prod.id,
        nombre: nombreCompleto,
        cantidad: item.cantidad,
        precio_unitario: prod.precio,
        variacionId: item.variacionId ?? null,
        variacionNombre: item.variacionNombre ?? null,
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

    const { error: insertError } = await supabase.from("tienda_pedidos").insert({
      external_reference: externalReference,
      estado: "pendiente",
      tipo_envio: tipoEnvio,
      items: orderItems,
      monto_total: montoTotal,
      comprador_nombre: compradorNombre ?? null,
      comprador_telefono: compradorTelefono ?? null,
      direccion_envio: direccionEnvio ?? null,
    });
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
      },
    });

    return NextResponse.json({ checkoutUrl: result.init_point });
  } catch (error) {
    logger.error("tienda checkout failed", {}, error);
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }
}
