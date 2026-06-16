import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { randomUUID } from "crypto";
import { COSTO_ENVIO } from "@/lib/stores/cartStore";
import { logger } from "@/lib/logger";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

interface CartItemInput {
  productoId: string;
  cantidad: number;
}

export async function POST(req: NextRequest) {
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

    // Fetch authoritative prices + stock from DB
    const supabase = await createClient();
    const ids = items.map((i) => i.productoId);
    const { data: productos, error: dbError } = await supabase
      .from("productos")
      .select("id, nombre, precio, stock, imagen_url")
      .in("id", ids);

    if (dbError || !productos) {
      return NextResponse.json({ error: "Error consultando productos" }, { status: 500 });
    }

    // Check all products exist and have stock
    const productoMap = new Map(productos.map((p) => [p.id, p]));
    const mpItems: {
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      currency_id: string;
      picture_url?: string;
    }[] = [];
    const orderItems: { productoId: string; nombre: string; cantidad: number; precio_unitario: number }[] = [];

    for (const item of items) {
      const prod = productoMap.get(item.productoId);
      if (!prod) {
        return NextResponse.json({ error: `Producto no encontrado: ${item.productoId}` }, { status: 404 });
      }
      if (prod.stock < item.cantidad) {
        return NextResponse.json({ error: `Stock insuficiente para: ${prod.nombre}` }, { status: 409 });
      }
      mpItems.push({
        id: prod.id,
        title: prod.nombre,
        quantity: item.cantidad,
        unit_price: prod.precio,
        currency_id: "MXN",
        ...(prod.imagen_url ? { picture_url: prod.imagen_url } : {}),
      });
      orderItems.push({
        productoId: prod.id,
        nombre: prod.nombre,
        cantidad: item.cantidad,
        precio_unitario: prod.precio,
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

    await supabase.from("tienda_pedidos").insert({
      external_reference: externalReference,
      estado: "pendiente",
      tipo_envio: tipoEnvio,
      items: orderItems,
      monto_total: montoTotal,
      comprador_nombre: compradorNombre ?? null,
      comprador_telefono: compradorTelefono ?? null,
      direccion_envio: direccionEnvio ?? null,
    });

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
