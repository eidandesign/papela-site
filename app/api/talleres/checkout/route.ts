import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { logger } from "@/lib/logger";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tallerId, cantidad, nombreUsuario, emailUsuario, telefonoUsuario } = body;

    if (!tallerId || typeof tallerId !== "string") {
      return NextResponse.json({ error: "tallerId inválido" }, { status: 400 });
    }
    if (!cantidad || typeof cantidad !== "number" || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }
    // Validate buyer PII server-side (the form is client-validated, but the endpoint is public)
    if (typeof nombreUsuario !== "string" || nombreUsuario.trim().length < 2 || nombreUsuario.length > 100) {
      return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
    }
    if (typeof emailUsuario !== "string" || !EMAIL_RE.test(emailUsuario) || emailUsuario.length > 150) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }
    if (telefonoUsuario != null && (typeof telefonoUsuario !== "string" || telefonoUsuario.length > 30)) {
      return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: taller, error: dbError } = await supabase
      .from("talleres")
      .select("titulo, precio, cupo_total, fecha, hora_inicio")
      .eq("id", tallerId)
      .eq("activo", true)
      .single();

    if (dbError || !taller) {
      return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
    }

    if (cantidad > (taller.cupo_total ?? 1)) {
      return NextResponse.json({ error: "La cantidad supera el cupo disponible" }, { status: 400 });
    }

    const baseUrl = SITE_URL;
    const fechaHora = taller.fecha && taller.hora_inicio
      ? `${taller.fecha} ${taller.hora_inicio}`
      : taller.fecha ?? "";

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: tallerId,
            title: taller.titulo,
            description: `${cantidad} ${cantidad === 1 ? "persona" : "personas"} · ${fechaHora}`,
            quantity: cantidad,
            unit_price: taller.precio,
            currency_id: "MXN",
          },
        ],
        payer: {
          name: nombreUsuario,
          email: emailUsuario,
          phone: telefonoUsuario ? { number: telefonoUsuario } : undefined,
        },
        back_urls: {
          success: `${baseUrl}/talleres/pago/gracias`,
          failure: `${baseUrl}/talleres/pago/error`,
          pending: `${baseUrl}/talleres/pago/pendiente`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        external_reference: `taller:${tallerId}`,
      },
    });

    return NextResponse.json({ checkoutUrl: result.init_point });
  } catch (error) {
    logger.error("talleres checkout failed", {}, error);
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }
}
