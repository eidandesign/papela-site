import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { logger } from "@/lib/logger";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { horarioId, claseNombre, actividad, tipoClaseId, fechaHora, duracion } = body;

    if (!horarioId || typeof horarioId !== "string") {
      return NextResponse.json({ error: "horarioId inválido" }, { status: 400 });
    }

    // Fetch authoritative price from DB — never trust client-supplied price.
    // El horario ya no siempre trae precio propio (ver 545c948 en papela-admin:
    // "el precio real siempre sale de tipos_clase"); si el cliente eligió un
    // tipo, ese precio manda. clases_horarios.precio queda como fallback para
    // los horarios legacy que sí lo tienen.
    const supabase = await createClient();
    const { data: horario, error: dbError } = await supabase
      .from("clases_horarios")
      .select("precio, clase_id")
      .eq("id", horarioId)
      .single();

    if (dbError || !horario) {
      return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 });
    }

    let precio = horario.precio;
    if (tipoClaseId && typeof tipoClaseId === "string") {
      const adminClient = createAdminClient();
      const { data: clase } = await adminClient
        .from("clases")
        .select("tipos_clase")
        .eq("id", horario.clase_id)
        .single();
      const tipos = (clase?.tipos_clase ?? []) as { id: string; precio: number }[];
      const tipo = tipos.find((t) => t.id === tipoClaseId);
      if (tipo) precio = tipo.precio;
    }

    if (!precio || precio <= 0) {
      return NextResponse.json({ error: "Este horario no tiene un precio configurado" }, { status: 400 });
    }

    const baseUrl = SITE_URL;

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: horarioId,
            title: actividad
              ? `${actividad} con ${claseNombre}`
              : `Clase con ${claseNombre}`,
            description: `${fechaHora} · ${duracion} min`,
            quantity: 1,
            unit_price: precio,
            currency_id: "MXN",
          },
        ],
        back_urls: {
          success: `${baseUrl}/clases/pago/gracias`,
          failure: `${baseUrl}/clases/pago/error`,
          pending: `${baseUrl}/clases/pago/pendiente`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        external_reference: horarioId,
      },
    });

    return NextResponse.json({ checkoutUrl: result.init_point });
  } catch (error) {
    logger.error("clases checkout failed", {}, error);
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }
}
