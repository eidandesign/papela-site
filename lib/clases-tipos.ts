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
// Los horarios (`clases_horarios`) no guardan a qué tipo pertenecen — son la
// disponibilidad de la maestra y el admin los agenda sueltos (ver 545c948 en
// papela-admin: "el precio real siempre sale de tipos_clase"). `ClaseCalendar`
// empata horario↔tipo solo por los "días disponibles" del tipo (la duración
// no se compara: una clase de 90 min puede darse en un bloque de 120). Un
// horario puede calzar en varios tipos — aparece bajo cada filtro que aplique.
export type TipoClasePublico = {
  claseId: string;
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  dias: number[];
  descripcion: string;
  imagen: string | null;
  mediaTipo: "image" | "video"; // `imagen` puede ser un video (bucket taller-videos)
  // Letra chica de la clase suelta (sus paquetes traen la suya).
  sueltaDescripcion: string;
  incluye: string[];
  condiciones: string[];
};

interface TipoClaseRaw {
  id?: string;
  nombre?: string;
  precio?: number;
  duracion?: number;
  dias?: number[];
  descripcion?: string;
  imagen?: string;
  mediaTipo?: string;
  sueltaDescripcion?: string;
  incluye?: unknown;
  condiciones?: unknown;
}

// Paquetes de varias clases (`clases.paquetes_clase`, misma columna privada y
// mismo filtro que los tipos: el reparto Papela/maestra NUNCA sale de aquí).
export type PaqueteClasePublico = {
  claseId: string;
  id: string;
  // Clase (tipo) de la que es otra forma de venta: misma clase, mismos
  // horarios. null = paquete suelto (anteriores a oct-2026).
  tipoId: string | null;
  nombre: string;
  precio: number;
  sesiones: number;
  vigenciaDias: number;
  inscripcion: number; // inscripción anual (0 = no lleva)
  descripcion: string;
  imagen: string | null;
  incluye: string[];
  condiciones: string[];
};

interface PaqueteClaseRaw {
  id?: string;
  tipoId?: string;
  nombre?: string;
  precio?: number;
  sesiones?: number;
  vigenciaDias?: number;
  inscripcion?: number;
  descripcion?: string;
  imagen?: string;
  incluye?: unknown;
  condiciones?: unknown;
}

// El admin ya sanea a https; se re-valida porque la foto termina en un <img>.
const imagenSegura = (v: unknown): string | null =>
  typeof v === "string" && /^https:\/\/\S+$/.test(v) ? v : null;

const listaTexto = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "") : [];

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
          descripcion: (t.descripcion ?? "").trim(),
          imagen: imagenSegura(t.imagen),
          mediaTipo: t.mediaTipo === "video" ? "video" : "image",
          sueltaDescripcion: (t.sueltaDescripcion ?? "").trim(),
          incluye: listaTexto(t.incluye),
          condiciones: listaTexto(t.condiciones),
        }));
    });
  } catch (err) {
    logger.error("Error fetching tipos_clase", {}, err);
    return [];
  }
}

// Paquetes de clases de las maestras activas (o de una sola, por id).
export async function getPaquetesClase(claseId?: string): Promise<PaqueteClasePublico[]> {
  try {
    const supabase = createAdminClient();
    let q = supabase.from("clases").select("id, paquetes_clase").eq("activa", true);
    if (claseId) q = q.eq("id", claseId);
    const { data, error } = await q;

    if (error) {
      logger.error("Error fetching paquetes_clase", {}, error);
      return [];
    }

    return (data ?? []).flatMap((c) => {
      const paquetes = (c.paquetes_clase ?? []) as PaqueteClaseRaw[];
      return paquetes
        .filter((p) => p.id && p.nombre?.trim())
        .map((p) => ({
          claseId: c.id as string,
          id: p.id!,
          tipoId: typeof p.tipoId === "string" && p.tipoId ? p.tipoId : null,
          nombre: p.nombre!.trim(),
          precio: Number(p.precio) || 0,
          sesiones: Number(p.sesiones) || 0,
          vigenciaDias: Number(p.vigenciaDias) || 0,
          inscripcion: Math.max(0, Number(p.inscripcion) || 0),
          descripcion: (p.descripcion ?? "").trim(),
          imagen: imagenSegura(p.imagen),
          incluye: listaTexto(p.incluye),
          condiciones: listaTexto(p.condiciones),
        }));
    });
  } catch (err) {
    logger.error("Error fetching paquetes_clase", {}, err);
    return [];
  }
}
