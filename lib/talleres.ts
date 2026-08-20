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

export async function getTalleres(): Promise<Taller[]> {
  try {
    const res = await fetch("https://admin.papela-atelier.com/api/public/talleres", {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { talleres } = await res.json();
    // Del taller más nuevo al más viejo (fecha descendente). Los que no tienen
    // fecha van al final. `fecha` es ISO (YYYY-MM-DD), así que ordena como texto.
    return (talleres ?? []).sort((a: Taller, b: Taller) => {
      if (!a.fecha) return b.fecha ? 1 : 0;
      if (!b.fecha) return -1;
      return b.fecha.localeCompare(a.fecha);
    });
  } catch (err) {
    logger.error("Error fetching talleres from admin API", {}, err as Error);
    return [];
  }
}
