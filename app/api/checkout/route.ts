import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { horarioId, claseNombre, fechaHora, duracion } = body;

    if (!horarioId || typeof horarioId !== "string") {
      return NextResponse.json({ error: "horarioId inválido" }, { status: 400 });
    }

    // Fetch authoritative price from DB — never trust client-supplied price
    const supabase = await createClient();
    const { data: horario, error: dbError } = await supabase
      .from("clases_horarios")
      .select("precio")
      .eq("id", horarioId)
      .single();

    if (dbError || !horario) {
      return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 });
    }

    const baseUrl = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: horarioId,
            title: `Clase con ${claseNombre}`,
            description: `${fechaHora} · ${duracion} min`,
            quantity: 1,
            unit_price: horario.precio,
            currency_id: "MXN",
          },
        ],
        back_urls: {
          success: `${baseUrl}/clases/pago/gracias`,
          failure: `${baseUrl}/clases/pago/error`,
          pending: `${baseUrl}/clases/pago/pendiente`,
        },
        auto_return: "approved",
        external_reference: horarioId,
      },
    });

    return NextResponse.json({ checkoutUrl: result.init_point });
  } catch (error) {
    console.error("MP error:", error);
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }
}
