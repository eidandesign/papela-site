import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { horarioId, claseNombre, fechaHora, precio, duracion } = body;

    const baseUrl = req.headers.get("origin") || "http://localhost:3000";

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: horarioId,
            title: `Clase con ${claseNombre}`,
            description: `${fechaHora} · ${duracion} min`,
            quantity: 1,
            unit_price: precio,
            currency_id: "MXN",
          },
        ],
        back_urls: {
          success: `https://papela-site.vercel.app/clases/pago/gracias`,
          failure: `https://papela-site.vercel.app/clases/pago/error`,
          pending: `https://papela-site.vercel.app/clases/pago/pendiente`,
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
