import { redirect } from "next/navigation";
import { leerSesion } from "@/lib/maestros/sesion";
import SolicitudMaestro from "@/components/site/maestros/SolicitudMaestro";

// /colabora/maestros/solicitud — formulario paso a paso (estilo Typeform) para
// que el maestro nos mande su propuesta: qué imparte, sus datos, su actividad
// y su trabajo. No descarga nada: Papela la revisa y, una vez aprobada, firman
// juntos el acuerdo. Misma sesión que la página de maestros (la cookie viaja a
// /colabora/maestros/*); sin sesión, regresa a pedir la contraseña.
// Ruta standalone (sin navbar ni footer, ConditionalShell) y noindex (layout
// de /colabora/maestros + X-Robots-Tag de next.config).
export const dynamic = "force-dynamic";

export default async function SolicitudMaestroPage() {
  if (!(await leerSesion())) redirect("/colabora/maestros");
  return <SolicitudMaestro />;
}
