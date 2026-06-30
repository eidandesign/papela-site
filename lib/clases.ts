import { createClient } from "./supabase/server";
import { logger } from "./logger";

export type Horario = {
  id: string;
  fecha_hora: string;
  cupo_disponible: number;
  precio: number;
  duracion_minutos: number;
};

export type Maestra = {
  id: string;
  nombre: string;
  slug: string;
  tecnicas: string[];
  descripcion: string | null;
  experiencia: string | null;
  foto: string | null;
  galeria: string[];
  whatsapp: string | null;
  activa: boolean;
};

export type MaestraConHorarios = Maestra & { horarios: Horario[] };

export async function getClases(): Promise<Maestra[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clases")
    .select("id, nombre, slug, tecnicas, descripcion, experiencia, foto, galeria, whatsapp, activa")
    .eq("activa", true)
    .order("nombre", { ascending: true });

  if (error) {
    logger.error("Error fetching clases", {}, error);
    return [];
  }
  return data ?? [];
}

export async function getClasesConHorarios(): Promise<MaestraConHorarios[]> {
  const supabase = await createClient();

  const { data: maestras, error } = await supabase
    .from("clases")
    .select("id, nombre, slug, tecnicas, descripcion, experiencia, foto, galeria, whatsapp, activa")
    .eq("activa", true)
    .order("nombre", { ascending: true });

  if (error || !maestras?.length) {
    if (error) logger.error("Error fetching clases con horarios", {}, error);
    return [];
  }

  // Orden por antigüedad de las maestras (primero Liz, luego Celia).
  // No hay columna de antigüedad en Supabase: se define aquí por slug.
  // Las maestras sin orden explícito quedan después, en orden alfabético.
  const ordenAntiguedad = ["liz-art", "celia"];
  maestras.sort((a, b) => {
    const ia = ordenAntiguedad.indexOf(a.slug);
    const ib = ordenAntiguedad.indexOf(b.slug);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const { data: horarios, error: horariosError } = await supabase
    .from("clases_horarios")
    .select("id, clase_id, fecha_hora, cupo_disponible, precio, duracion_minutos")
    .in("clase_id", maestras.map((m) => m.id))
    .eq("estado", "disponible")
    .gt("fecha_hora", twoHoursFromNow)
    .gt("cupo_disponible", 0)
    .order("fecha_hora", { ascending: true });

  if (horariosError) logger.error("Error fetching horarios (listado)", {}, horariosError);

  return maestras.map((m) => ({
    ...m,
    horarios: (horarios ?? []).filter((h) => h.clase_id === m.id),
  }));
}

// Deriva un horario semanal legible ("Lunes 10:00 a 12:00") a partir de los
// horarios cargados en el admin (fechas puntuales). Agrupa por día + hora,
// deduplica las repeticiones semanales y ordena de Lunes a Domingo.
// Así el sitio muestra los horarios sin que nadie tenga que cargarlos aparte.
export type HorarioSemanal = { dia: string; rango: string; orden: number; minutos: number };

export function getHorariosSemanales(horarios: Horario[]): HorarioSemanal[] {
  const vistos = new Map<string, HorarioSemanal>();

  for (const h of horarios) {
    const inicio = new Date(h.fecha_hora);
    const fin = new Date(inicio.getTime() + (h.duracion_minutos || 0) * 60 * 1000);

    const dia = inicio.toLocaleDateString("es-MX", { weekday: "long" });
    const horaInicio = inicio.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    const horaFin = fin.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    // getDay(): 0=Domingo. Reordenamos para que Lunes vaya primero.
    const orden = (inicio.getDay() + 6) % 7;
    const minutos = inicio.getHours() * 60 + inicio.getMinutes();

    const diaCap = dia.charAt(0).toUpperCase() + dia.slice(1);
    const rango = `${horaInicio} a ${horaFin}`;
    const key = `${orden}-${rango}`;

    if (!vistos.has(key)) {
      vistos.set(key, { dia: diaCap, rango, orden, minutos });
    }
  }

  return [...vistos.values()].sort((a, b) => a.orden - b.orden || a.minutos - b.minutos);
}

export async function getClaseBySlug(slug: string): Promise<MaestraConHorarios | null> {
  const supabase = await createClient();

  const { data: maestra, error } = await supabase
    .from("clases")
    .select("id, nombre, slug, tecnicas, descripcion, experiencia, foto, galeria, whatsapp, activa")
    .eq("slug", slug)
    .eq("activa", true)
    .single();

  if (error || !maestra) return null;

  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const { data: horarios, error: horariosError } = await supabase
    .from("clases_horarios")
    .select("id, fecha_hora, cupo_disponible, precio, duracion_minutos")
    .eq("clase_id", maestra.id)
    .eq("estado", "disponible")
    .gt("fecha_hora", twoHoursFromNow)
    .gt("cupo_disponible", 0)
    .order("fecha_hora", { ascending: true });

  if (horariosError) logger.error("Error fetching horarios", { slug }, horariosError);

  return { ...maestra, horarios: horarios ?? [] };
}
