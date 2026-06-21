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
