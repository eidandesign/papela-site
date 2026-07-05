import { createPublicClient } from "./supabase/public";
import { logger } from "./logger";

/**
 * Variación de un producto, tal como la expone la API pública del admin.
 * Cada variación trae sus valores ya resueltos (override o heredados del producto).
 */
export type Variacion = {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  imagen_url: string | null;
  color: string | null;
  tamano: string | null;
  material?: string | null;
  tipo_papel?: string | null;
  gramaje?: string | null;
};

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  categoria: string | null;
  descripcion: string | null;
  stock: number;
  color: string | null;
  medida: string | null;
  // ── Campos extra de la API pública (opcionales: las queries directas a
  //    Supabase no los traen) ───────────────────────────────────────────────
  variaciones?: Variacion[] | null;
  imagenes?: string[];
  precio_min?: number;
  precio_max?: number;
};

export async function getProductos(categoria?: string, limit?: number): Promise<Producto[]> {
  const supabase = createPublicClient();

  let query = supabase
    .from("productos")
    .select("id, nombre, precio, imagen_url, categoria, descripcion, stock, color, medida")
    .gt("stock", 0)
    .order("created_at", { ascending: false });

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    logger.error("Error fetching productos", { categoria, limit }, error);
    return [];
  }

  return data ?? [];
}

export async function getProductoById(id: string): Promise<Producto | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, precio, imagen_url, categoria, descripcion, stock, color, medida")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
