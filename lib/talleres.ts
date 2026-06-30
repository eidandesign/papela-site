import { logger } from "./logger";

export type Taller = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  precio: number;
  imagen_url: string | null;
  categoria: string | null;
  nivel: string | null;
  instructor_nombre: string | null;
  instructor_foto_url: string | null;
  instructor_instagram: string | null;
  activo: boolean;
  estado: "Activo" | "Agotado";
  cupo_total: number | null;
  imagenes: string[];
  videos: string[];
};

// Orden de antigüedad de las maestras (primera en entrar, primera en aparecer).
// Liz fue la primera, luego Celia. Las demás van después, ordenadas por fecha.
const ORDEN_MAESTRAS = ["liz", "celia"];

function rangoMaestra(nombre: string | null): number {
  if (!nombre) return ORDEN_MAESTRAS.length;
  const n = nombre.trim().toLowerCase();
  const idx = ORDEN_MAESTRAS.findIndex((m) => n.startsWith(m));
  return idx === -1 ? ORDEN_MAESTRAS.length : idx;
}

export async function getTalleres(): Promise<Taller[]> {
  try {
    const res = await fetch("https://admin.papela-atelier.com/api/public/talleres", {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { talleres } = await res.json();
    return (talleres ?? []).sort((a: Taller, b: Taller) => {
      const rangoA = rangoMaestra(a.instructor_nombre);
      const rangoB = rangoMaestra(b.instructor_nombre);
      if (rangoA !== rangoB) return rangoA - rangoB;
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return a.fecha.localeCompare(b.fecha);
    });
  } catch (err) {
    logger.error("Error fetching talleres from admin API", {}, err as Error);
    return [];
  }
}
