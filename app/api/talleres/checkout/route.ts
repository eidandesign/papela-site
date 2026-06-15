import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

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
    if (!cantidad || typeof cantidad !== "number" || cantidad < 1 || cantidad > 20) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
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

    const baseUrl = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
        payer: emailUsuario ? {
          name: nombreUsuario,
          email: emailUsuario,
          phone: telefonoUsuario ? { number: telefonoUsuario } : undefined,
        } : undefined,
        back_urls: {
          success: `${baseUrl}/talleres/pago/gracias`,
          failure: `${baseUrl}/talleres/pago/error`,
          pending: `${baseUrl}/talleres/pago/pendiente`,
        },
        auto_return: "approved",
        external_reference: `taller:${tallerId}`,
      },
    });

    return NextResponse.json({ checkoutUrl: result.init_point });
  } catch (error) {
    console.error("MP talleres checkout error:", error);
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }
}
