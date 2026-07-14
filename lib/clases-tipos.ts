import { createAdminClient } from "./supabase/admin";
import { logger } from "./logger";

// Tipos de clase configurados en el admin (perfil de la maestra: nombre,
// precio, duración, días permitidos) — sustituyen al dropdown hardcodeado de
// clases-actividades.ts en el modal "Elige tu horario".
//
// `tipos_clase` es una columna jsonb de `clases` que anon NO puede leer (ver
// 20260703_cerrar_reservas_anon.sql en papela-admin) — y trae también
// gananciaModo/gananciaValor (reparto Papela/maestra), dato interno que nunca
// debe llegar al cliente. Por eso esto usa `createAdminClient()` (service
// role, bypassa RLS) y solo copia los campos seguros a `TipoClasePublico`.
//
// Los horarios (`clases_horarios`) no guardan a qué tipo pertenecen — el
// admin los agenda sueltos (ver 545c948 en papela-admin: "el precio real
// siempre sale de tipos_clase"). `ClaseCalendar` empata horario↔tipo por
// duración + día de la semana (heurística: si dos tipos comparten duración y
// días, un horario puede calzar en más de uno — se muestra en ambos filtros).
export type TipoClasePublico = {
  claseId: string;
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  dias: number[];
};

interface TipoClaseRaw {
  id?: string;
  nombre?: string;
  precio?: number;
  duracion?: number;
  dias?: number[];
}

// Todos los tipos de clase de todas las maestras activas.
export async function getTiposClase(): Promise<TipoClasePublico[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("clases")
      .select("id, tipos_clase")
      .eq("activa", true);

    if (error) {
      logger.error("Error fetching tipos_clase", {}, error);
      return [];
    }

    return (data ?? []).flatMap((c) => {
      const tipos = (c.tipos_clase ?? []) as TipoClaseRaw[];
      return tipos
        .filter((t) => t.id && t.nombre?.trim())
        .map((t) => ({
          claseId: c.id as string,
          id: t.id!,
          nombre: t.nombre!,
          precio: Number(t.precio) || 0,
          duracion: Number(t.duracion) || 0,
          dias: t.dias ?? [],
        }));
    });
  } catch (err) {
    logger.error("Error fetching tipos_clase", {}, err);
    return [];
  }
}
