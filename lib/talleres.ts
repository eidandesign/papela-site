import { createClient } from "./supabase/server";

export type Taller = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  precio: number;
  imagen_url: string | null;
  categoria: string | null;
  nivel: string | null;
  instructor: string | null;
  instructor_avatar: string | null;
  activo: boolean;
  cupo: number | null;
  cupo_disponible: number | null;
};

export async function getTalleres(): Promise<Taller[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("talleres")
    .select("*")
    .eq("activo", true)
    .order("fecha_inicio", { ascending: true });

  if (error) {
    console.error("Error fetching talleres:", error.message);
    return [];
  }
  return data ?? [];
}
