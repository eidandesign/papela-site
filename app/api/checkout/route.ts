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
    const { horarioId, claseNombre, actividad, tipoClaseId, paqueteId, fechaHora, duracion } = body;

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
    // Paquete: el alumno paga el paquete completo (+ su inscripción anual) y
    // aparta su PRIMERA clase en este horario. Precio y paquete se leen del
    // admin (service role: paquetes_clase no es legible por anon y trae la
    // ganancia de Papela) — nunca del cliente.
    let paquete: { id: string; nombre: string; precio: number; inscripcion: number; sesiones: number } | null = null;
    if ((tipoClaseId && typeof tipoClaseId === "string") || (paqueteId && typeof paqueteId === "string")) {
      const adminClient = createAdminClient();
      const { data: clase } = await adminClient
        .from("clases")
        .select("tipos_clase, paquetes_clase")
        .eq("id", horario.clase_id)
        .single();
      const tipos = (clase?.tipos_clase ?? []) as { id: string; precio: number }[];
      const tipo = tipos.find((t) => t.id === tipoClaseId);
      if (tipo) precio = tipo.precio;

      if (paqueteId && typeof paqueteId === "string") {
        const paquetes = (clase?.paquetes_clase ?? []) as {
          id: string; tipoId?: string; nombre: string; precio: number; inscripcion?: number; sesiones?: number;
        }[];
        const pq = paquetes.find((x) => x.id === paqueteId);
        // El paquete tiene que ser de ESTA maestra y, si es de una clase, de la
        // clase de este horario (no se aparta un paquete de arcilla en la clase de arte).
        if (!pq || (pq.tipoId && tipoClaseId && pq.tipoId !== tipoClaseId)) {
          return NextResponse.json({ error: "Paquete no disponible" }, { status: 400 });
        }
        paquete = {
          id: pq.id,
          nombre: pq.nombre,
          precio: Number(pq.precio) || 0,
          inscripcion: Math.max(0, Number(pq.inscripcion) || 0),
          sesiones: Number(pq.sesiones) || 0,
        };
        precio = paquete.precio;
      }
    }

    if (!precio || precio <= 0) {
      return NextResponse.json({ error: "Este horario no tiene un precio configurado" }, { status: 400 });
    }

    const tituloClase = actividad ? `${actividad} con ${claseNombre}` : `Clase con ${claseNombre}`;
    const items = paquete
      ? [
          {
            id: `paquete:${paquete.id}`,
            title: `${paquete.nombre} — ${tituloClase}`,
            description: `${paquete.sesiones ? `${paquete.sesiones} clases · ` : ""}primera clase: ${fechaHora}`,
            quantity: 1,
            unit_price: paquete.precio,
            currency_id: "MXN",
          },
        ]
      : [
          {
            id: horarioId,
            title: tituloClase,
            description: `${fechaHora} · ${duracion} min`,
            quantity: 1,
            unit_price: precio,
            currency_id: "MXN",
          },
        ];

    const baseUrl = SITE_URL;

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items,
        // El webhook lo usa para anotar la reserva como paquete y registrar la
        // inscripción (vigencia anual). MercadoPago devuelve las llaves en snake_case.
        ...(paquete
          ? {
              metadata: {
                paquete_id: paquete.id,
                paquete_nombre: paquete.nombre,
                paquete_sesiones: paquete.sesiones,
                // La inscripción se paga en Papela: solo se avisa para la nota.
                inscripcion_por_pagar: paquete.inscripcion,
              },
            }
          : {}),
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
