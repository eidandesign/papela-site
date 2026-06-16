import { createClient } from "./supabase/server";
import { logger } from "./logger";

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
};

export async function getProductos(categoria?: string, limit?: number): Promise<Producto[]> {
  const supabase = await createClient();

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
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, precio, imagen_url, categoria, descripcion, stock, color, medida")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
