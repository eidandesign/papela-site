import { createClient } from "./supabase/server";

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
};

export async function getTalleres(): Promise<Taller[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talleres")
    .select("*")
    .eq("activo", true)
    .order("fecha", { ascending: true });

  if (error) {
    console.error("Error fetching talleres:", error.message);
    return [];
  }
  return data ?? [];
}
