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
  cupo_total: number | null;
  imagenes: string[];
  videos: string[];
};

export async function getTalleres(): Promise<Taller[]> {
  try {
    const res = await fetch("https://admin.papela-atelier.com/api/public/talleres", {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { talleres } = await res.json();
    return (talleres ?? []).sort((a: Taller, b: Taller) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return a.fecha.localeCompare(b.fecha);
    });
  } catch (err) {
    logger.error("Error fetching talleres from admin API", {}, err as Error);
    return [];
  }
}
