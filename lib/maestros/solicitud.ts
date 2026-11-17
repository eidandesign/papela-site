import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { CAMPOS_FICHA, type ArchivoSubido, type DatosContrato } from "./campos";

// Guarda (o actualiza) la solicitud del maestro en `maestros_solicitudes`
// (migración 20261117 del admin). Lo llama el envío de la propuesta
// (/colabora/maestros/enviar): el mismo `solicitudId` por formulario, así un
// doble clic o un reintento no duplican.
// Service role: la tabla no tiene policy de insert (solo el sitio escribe).

export async function guardarSolicitud(
  solicitudId: string,
  datos: DatosContrato,
  extra: { portafolio: string | null; archivos: ArchivoSubido[] },
): Promise<boolean> {
  const v = datos.valores;
  // La actividad viaja con su etiqueta: el admin no conoce los campos del sitio.
  const actividad = CAMPOS_FICHA[datos.modalidad]
    .filter((c) => !c.soloPdf && v[c.id])
    .map((c) => ({ label: c.label, valor: v[c.id] }));

  const supabase = createAdminClient();
  const { error } = await supabase.from("maestros_solicitudes").upsert(
    {
      id: solicitudId.toLowerCase(),
      updated_at: new Date().toISOString(),
      modalidad: datos.modalidad,
      nombre: v.nombre ?? null,
      telefono: v.telefono ?? null,
      correo: v.correo ?? null,
      domicilio: v.domicilio ?? null,
      // Columna `redes`: hoy guarda el Instagram ya con "@".
      redes: v.instagram ? `@${v.instagram}` : null,
      portafolio: extra.portafolio,
      actividad,
      archivos: extra.archivos,
    },
    { onConflict: "id" },
  );
  return !error;
}
