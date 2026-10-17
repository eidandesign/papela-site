import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { logger } from "@/lib/logger";
import { gaClientId } from "@/lib/ga4";
import { calzaConTipo } from "@/lib/clases-matching";
import type { TipoClasePublico } from "@/lib/clases-tipos";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { expiracionPreferencia } from "@/lib/mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  // 8 intentos de checkout por IP cada 5 minutos (igual que tienda/talleres).
  if (!(await rateLimit(`clases-checkout:${getClientIp(req)}`, 8, 5 * 60_000))) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en unos minutos." }, { status: 429 });
  }

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
      .select("precio, clase_id, tipo_clase_id, fecha_hora, duracion_minutos, cupo_disponible")
      .eq("id", horarioId)
      .single();

    if (dbError || !horario) {
      return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 });
    }
    // El webhook igual rechaza sin cupo, pero el cliente ya habría pagado.
    if (!(Number(horario.cupo_disponible) > 0)) {
      return NextResponse.json({ error: "Este horario ya no tiene lugares" }, { status: 409 });
    }
    if (new Date(horario.fecha_hora).getTime() < Date.now()) {
      return NextResponse.json({ error: "Este horario ya pasó" }, { status: 409 });
    }

    let precio = horario.precio;
    // Paquete: el alumno paga el paquete completo (+ su inscripción anual) y
    // aparta su PRIMERA clase en este horario. Precio y paquete se leen del
    // admin (service role: paquetes_clase no es legible por anon y trae la
    // ganancia de Papela) — nunca del cliente.
    let paquete: { id: string; nombre: string; precio: number; inscripcion: number; sesiones: number } | null = null;
    // El tipo de clase fija el precio (niños/adultos pagan distinto), así que
    // el que manda el cliente NO se acepta a ciegas: si el admin ligó el
    // horario a un tipo (`tipo_clase_id`) tiene que ser ese; si no, el tipo
    // tiene que calzar con el horario por sus días disponibles (misma regla
    // que pinta el calendario, lib/clases-matching.ts). Antes bastaba con que
    // el tipo existiera en la maestra para pagar el más barato en cualquier slot.
    const tipoPedido = typeof tipoClaseId === "string" && tipoClaseId ? tipoClaseId : null;
    const tipoDelHorario = typeof horario.tipo_clase_id === "string" && horario.tipo_clase_id ? horario.tipo_clase_id : null;
    if (tipoDelHorario && tipoPedido && tipoPedido !== tipoDelHorario) {
      return NextResponse.json({ error: "Esa clase no corresponde a este horario" }, { status: 400 });
    }
    const tipoEfectivo = tipoDelHorario ?? tipoPedido;
    const slot = {
      id: horarioId,
      fecha_hora: horario.fecha_hora as string,
      cupo_disponible: Number(horario.cupo_disponible) || 0,
      precio: Number(horario.precio) || 0,
      duracion_minutos: Number(horario.duracion_minutos) || 0,
      tipo_clase_id: tipoDelHorario,
    };

    if (tipoEfectivo || (paqueteId && typeof paqueteId === "string")) {
      const adminClient = createAdminClient();
      const { data: clase } = await adminClient
        .from("clases")
        .select("tipos_clase, paquetes_clase")
        .eq("id", horario.clase_id)
        .single();
      const tipos = (clase?.tipos_clase ?? []) as { id: string; precio: number; dias?: number[] }[];
      const tipoCalza = (id: string | null) => {
        if (!id) return true;
        const t = tipos.find((x) => x.id === id);
        if (!t) return false;
        return calzaConTipo(slot, { id: t.id, dias: Array.isArray(t.dias) ? t.dias : [] } as TipoClasePublico);
      };
      if (tipoEfectivo) {
        if (!tipoCalza(tipoEfectivo)) {
          return NextResponse.json({ error: "Esa clase no se da en este horario" }, { status: 400 });
        }
        precio = tipos.find((t) => t.id === tipoEfectivo)!.precio;
      }

      if (paqueteId && typeof paqueteId === "string") {
        const paquetes = (clase?.paquetes_clase ?? []) as {
          id: string; tipoId?: string; nombre: string; precio: number; inscripcion?: number; sesiones?: number;
        }[];
        const pq = paquetes.find((x) => x.id === paqueteId);
        // El paquete tiene que ser de ESTA maestra y, si es de una clase, de la
        // clase de este horario (no se aparta un paquete de arcilla en la clase
        // de arte) — se comprueba contra el horario aunque el cliente no mande
        // tipoClaseId.
        const pqTipo = pq && typeof pq.tipoId === "string" && pq.tipoId ? pq.tipoId : null;
        if (!pq || (pqTipo && tipoEfectivo && pqTipo !== tipoEfectivo) || (pqTipo && !tipoCalza(pqTipo))) {
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
        // ga_client_id: el webhook lo reenvía a GA4 para atribuir la compra.
        metadata: {
          ...(gaClientId(req) ? { ga_client_id: gaClientId(req) } : {}),
          ...(paquete
            ? {
                paquete_id: paquete.id,
                paquete_nombre: paquete.nombre,
                paquete_sesiones: paquete.sesiones,
                // La inscripción se paga en Papela: solo se avisa para la nota.
                inscripcion_por_pagar: paquete.inscripcion,
              }
            : {}),
        },
        back_urls: {
          success: `${baseUrl}/clases/pago/gracias`,
          failure: `${baseUrl}/clases/pago/error`,
          pending: `${baseUrl}/clases/pago/pendiente`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        external_reference: horarioId,
        ...expiracionPreferencia(),
      },
    });

    // Datos autoritativos para begin_checkout (el cliente no calcula el precio).
    return NextResponse.json({
      checkoutUrl: result.init_point,
      analitica: { item_name: items[0].title, value: items[0].unit_price },
    });
  } catch (error) {
    logger.error("clases checkout failed", {}, error);
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }
}
