const ADMIN_API = "https://admin.papela-atelier.com/api/public/clases-tipos";

// Tipos de clase configurados en el admin (perfil de la maestra), con precio
// y duración reales — sustituyen al dropdown hardcodeado de clases-actividades.ts
// en el modal "Elige tu horario". No incluye datos de ganancia/comisión.
export type TipoClasePublico = {
  claseId: string;
  slug: string;
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  dias: number[];
};

interface TipoApi {
  clase_id: string;
  slug: string;
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
  dias?: number[];
}

function normalizar(t: TipoApi): TipoClasePublico {
  return {
    claseId: t.clase_id,
    slug: t.slug,
    id: t.id,
    nombre: t.nombre,
    precio: t.precio,
    duracion: t.duracion,
    dias: t.dias ?? [],
  };
}

// Todos los tipos de clase de todas las maestras activas.
export async function getTiposClase(): Promise<TipoClasePublico[]> {
  try {
    const res = await fetch(ADMIN_API, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = Array.isArray(data.tipos) ? (data.tipos as TipoApi[]) : [];
    return arr.map(normalizar);
  } catch {
    return [];
  }
}
