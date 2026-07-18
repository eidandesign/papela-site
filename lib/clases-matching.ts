import type { Horario } from "./clases";
import type { TipoClasePublico } from "./clases-tipos";
import { diaMexico, diaSemanaLunes0 } from "./fecha";

// Empate horario↔tipo de clase, compartido por calendario y (a futuro) checkout.
// Funciones puras sin dependencias de servidor: importable desde client components.
//
// Los horarios son la DISPONIBILIDAD de la maestra; la clase elegida define
// precio y duración (tipos_clase — ver lib/clases-tipos.ts). Precedencia:
//   1. `horario.tipo_clase_id` (asignado en el admin) → empate EXACTO.
//   2. Fallback heurístico: los "días disponibles" del tipo. La duración NO se
//      compara porque un tipo puede durar menos que el bloque agendado (ej.
//      clase de 90 min en un slot de 120). Un horario puede calzar en varios
//      tipos — se muestra bajo cada filtro que aplique.

export function calzaConTipo(h: Horario, tipo: TipoClasePublico): boolean {
  if (h.tipo_clase_id) return h.tipo_clase_id === tipo.id;
  if (tipo.dias.length === 0) return true;
  // diaSemanaLunes0: 0=Lun…6=Dom. tipo.dias usa la convención del admin (0=Dom…6=Sáb).
  const diaDomingo0 = (diaSemanaLunes0(diaMexico(new Date(h.fecha_hora))) + 1) % 7;
  return tipo.dias.includes(diaDomingo0);
}

// Tipo de un horario cuando se puede saber SIN ambigüedad: id asignado, un
// solo tipo calza ese día, o exactamente uno de los que calzan coincide en
// precio con el horario. Si sigue ambiguo devuelve null — mejor sin tipo que
// uno equivocado.
export function tipoDeSlot(
  h: Horario,
  tipos: TipoClasePublico[]
): TipoClasePublico | null {
  if (h.tipo_clase_id) return tipos.find((t) => t.id === h.tipo_clase_id) ?? null;
  const matches = tipos.filter((t) => calzaConTipo(h, t));
  if (matches.length === 1) return matches[0];
  const delPrecio = matches.filter((t) => t.precio === h.precio);
  return delPrecio.length === 1 ? delPrecio[0] : null;
}

// Precio/duración a mostrar (y que el checkout cobra vía tipoClaseId): mandan
// los del tipo — fuente de verdad real, ver 545c948 en papela-admin. El dato
// del horario queda como fallback para slots sin tipo resoluble.
export function precioDeSlot(h: Horario, tipo: TipoClasePublico | null): number {
  return tipo && tipo.precio > 0 ? tipo.precio : h.precio;
}

export function duracionDeSlot(h: Horario, tipo: TipoClasePublico | null): number {
  return tipo && tipo.duracion > 0 ? tipo.duracion : h.duracion_minutos;
}
