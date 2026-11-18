import "server-only";
import { logger } from "@/lib/logger";
import { TZ, diaMexico } from "@/lib/fecha";
import { createAdminClient } from "@/lib/supabase/admin";
import { bloquesDeClase, diaDeClave, fechasDeTaller, type Disponibilidad, type Ocupado } from "./disponibilidad";

// Lee la agenda real para saber qué puede proponer un maestro:
//  · `clases_horarios` de las próximas 5 semanas (alcanza para ver las series
//    semanales y quincenales) → qué bloques de lunes a viernes ya tienen clase.
//  · `talleres` de hoy en adelante → qué sábados y domingos ya están tomados.
// Service role: son lecturas de servidor y `talleres` no es legible en borrador
// con la llave pública. Si la lectura falla se ofrece todo como libre (Papela
// revisa cada propuesta antes de aprobarla) y queda rastro en el log.

const DIAS_DE_AGENDA = 35;

function minutosMexico(d: Date): number {
  const partes = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const n = (t: string) => Number(partes.find((p) => p.type === t)?.value ?? 0);
  return n("hour") * 60 + n("minute");
}

export async function leerDisponibilidad(): Promise<Disponibilidad> {
  const ahora = new Date();
  const hoy = diaMexico(ahora);
  let ocupados: Ocupado[] = [];
  let fechasTomadas: string[] = [];

  try {
    const supabase = createAdminClient();
    const hasta = new Date(ahora.getTime() + DIAS_DE_AGENDA * 24 * 60 * 60 * 1000);
    const [horarios, talleres] = await Promise.all([
      supabase
        .from("clases_horarios")
        .select("fecha_hora, duracion_minutos, clases!inner(activa)")
        .eq("clases.activa", true)
        .neq("estado", "cancelado")
        .gte("fecha_hora", ahora.toISOString())
        .lt("fecha_hora", hasta.toISOString()),
      supabase.from("talleres").select("fecha, estado").gte("fecha", hoy),
    ]);
    if (horarios.error) throw horarios.error;
    if (talleres.error) throw talleres.error;

    const vistos = new Set<string>();
    for (const h of horarios.data ?? []) {
      const d = new Date(h.fecha_hora as string);
      const dia = diaDeClave(diaMexico(d));
      const inicio = minutosMexico(d);
      const fin = inicio + (Number(h.duracion_minutos) || 120);
      const llave = `${dia}-${inicio}-${fin}`;
      if (vistos.has(llave)) continue;
      vistos.add(llave);
      ocupados.push({ dia, inicio, fin });
    }
    fechasTomadas = (talleres.data ?? [])
      .filter((t) => String(t.estado ?? "").toLowerCase() !== "cancelado" && typeof t.fecha === "string")
      .map((t) => (t.fecha as string).slice(0, 10));
  } catch (error) {
    logger.error("maestros: no se pudo leer la agenda para la propuesta", {}, error);
    ocupados = [];
    fechasTomadas = [];
  }

  return { clases: bloquesDeClase(ocupados), talleres: fechasDeTaller(hoy, fechasTomadas) };
}
