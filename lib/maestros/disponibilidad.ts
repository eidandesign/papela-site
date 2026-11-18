// ─────────────────────────────────────────────────────────────────────────────
// Qué días y horarios puede proponer un maestro en /colabora/maestros/solicitud.
// Módulo PURO (sin servidor ni cifras): lo usan el formulario (cliente) y el
// envío (servidor), que vuelve a validar la selección contra la agenda real.
//
//  · Clases recurrentes: lunes a viernes, en bloques fijos de 2 horas. Un
//    bloque que se cruza con una clase que ya se da (Club de Estampado,
//    Club de Arcilla…) sale como ocupado. El maestro elige hasta 3.
//  · Talleres especiales: solo sábados o domingos, dentro del horario de la
//    tienda. Elige UNA fecha libre y la hora en que empezaría.
//
// Los ocupados salen de `clases_horarios` y `talleres` (disponibilidad-server).
// ─────────────────────────────────────────────────────────────────────────────

/** Cuántas opciones puede proponer el maestro: 3 horarios de clase, 1 fecha de taller. */
export const MAX_OPCIONES = { clases: 3, talleres: 1 } as const;

export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const;
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** Bloques de clase que ofrece Papela de lunes a viernes, en minutos desde medianoche. */
export const BLOQUES_CLASE: readonly (readonly [number, number])[] = [
  [10 * 60, 12 * 60],
  [12 * 60, 14 * 60],
  [15 * 60 + 30, 17 * 60 + 30],
  [17 * 60 + 30, 19 * 60 + 30],
];
/** 0 = lunes … 4 = viernes. */
export const DIAS_CLASE = [0, 1, 2, 3, 4] as const;

/** Horario de la tienda en fin de semana (5 = sábado, 6 = domingo). */
const HORARIO_TALLER: Record<number, readonly [number, number]> = {
  5: [10 * 60, 15 * 60 + 30],
  6: [12 * 60, 19 * 60],
};

export const TALLER = {
  /** Días de anticipación: hace falta tiempo para anunciar el taller. */
  diasAntes: 14,
  /** Cuántas semanas hacia adelante se ofrecen. */
  semanas: 10,
  /** El taller tiene que caber antes del cierre: al menos 2 horas. */
  duracionMinima: 120,
  /** Cada cuánto se ofrece una hora de inicio. */
  paso: 30,
};

export type BloqueClase = { id: string; dia: number; inicio: number; fin: number; libre: boolean };
export type FechaTaller = { fecha: string; dia: number; abre: number; cierra: number };
export type Disponibilidad = { clases: BloqueClase[]; talleres: FechaTaller[] };
/** Clase que ya se da: día (0 = lunes … 6 = domingo) y minutos de inicio y fin. */
export type Ocupado = { dia: number; inicio: number; fin: number };

// ── Fechas "YYYY-MM-DD" como día calendario puro (se opera en UTC) ───────────
const CLAVE_RE = /^\d{4}-\d{2}-\d{2}$/;
function aFecha(clave: string): Date {
  const [y, m, d] = clave.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function sumarDias(clave: string, dias: number): string {
  const f = aFecha(clave);
  f.setUTCDate(f.getUTCDate() + dias);
  return f.toISOString().slice(0, 10);
}
/** 0 = lunes … 6 = domingo. */
export function diaDeClave(clave: string): number {
  return (aFecha(clave).getUTCDay() + 6) % 7;
}

// ── Textos ───────────────────────────────────────────────────────────────────
const periodo = (min: number) => (min < 12 * 60 ? "a.m." : "p.m.");
const hora12 = (min: number) => `${Math.floor(min / 60) % 12 || 12}:${String(min % 60).padStart(2, "0")}`;

/** "5:30 p.m." */
export const horaLegible = (min: number) => `${hora12(min)} ${periodo(min)}`;
/** "5:30 a 7:30 p.m." · "10:00 a.m. a 12:00 p.m." */
export function rangoLegible(inicio: number, fin: number): string {
  return periodo(inicio) === periodo(fin) ? `${hora12(inicio)} a ${horaLegible(fin)}` : `${horaLegible(inicio)} a ${horaLegible(fin)}`;
}
/** "10:00 a 12:00" (para botones angostos; el lector de pantalla recibe el rango completo). */
export const rangoCorto = (inicio: number, fin: number) => `${hora12(inicio)} a ${hora12(fin)}`;
/** "Sábado 5 de diciembre" */
export function fechaLegible(clave: string): string {
  const f = aFecha(clave);
  return `${DIAS_SEMANA[diaDeClave(clave)]} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]}`;
}
/** "Diciembre" */
export function mesLegible(clave: string): string {
  const m = MESES[aFecha(clave).getUTCMonth()];
  return m.charAt(0).toUpperCase() + m.slice(1);
}
export const diaDelMes = (clave: string) => aFecha(clave).getUTCDate();

// ── Opciones ─────────────────────────────────────────────────────────────────
export const idClase = (dia: number, inicio: number) => `c-${dia}-${inicio}`;
export const idTaller = (fecha: string, inicio: number) => `t-${fecha}-${inicio}`;

/** Fecha y hora de un id de taller, o null si no tiene esa forma. */
export function leerIdTaller(id: string): { fecha: string; inicio: number } | null {
  const m = /^t-(\d{4}-\d{2}-\d{2})-(\d{1,4})$/.exec(id);
  return m ? { fecha: m[1], inicio: Number(m[2]) } : null;
}

/** Los bloques de lunes a viernes; `libre: false` si se cruza con una clase que ya se da. */
export function bloquesDeClase(ocupados: Ocupado[]): BloqueClase[] {
  const salida: BloqueClase[] = [];
  for (const dia of DIAS_CLASE) {
    for (const [inicio, fin] of BLOQUES_CLASE) {
      const cruza = ocupados.some((o) => o.dia === dia && o.inicio < fin && o.fin > inicio);
      salida.push({ id: idClase(dia, inicio), dia, inicio, fin, libre: !cruza });
    }
  }
  return salida;
}

/** Sábados y domingos libres desde `hoy + diasAntes`, durante `semanas` semanas. */
export function fechasDeTaller(hoy: string, ocupadas: Iterable<string>): FechaTaller[] {
  if (!CLAVE_RE.test(hoy)) return [];
  const tomadas = new Set(ocupadas);
  const salida: FechaTaller[] = [];
  const desde = sumarDias(hoy, TALLER.diasAntes);
  for (let i = 0; i < TALLER.semanas * 7; i++) {
    const fecha = sumarDias(desde, i);
    const dia = diaDeClave(fecha);
    const horario = HORARIO_TALLER[dia];
    if (!horario || tomadas.has(fecha)) continue;
    salida.push({ fecha, dia, abre: horario[0], cierra: horario[1] });
  }
  return salida;
}

/** Horas en que puede empezar un taller ese día (cabe completo antes del cierre). */
export function horasDeInicio(f: FechaTaller): number[] {
  const salida: number[] = [];
  for (let m = f.abre; m + TALLER.duracionMinima <= f.cierra; m += TALLER.paso) salida.push(m);
  return salida;
}

/**
 * Renglones legibles de lo que eligió el maestro ("Lunes · 10:00 a.m. a
 * 12:00 p.m."), en su orden de preferencia. Devuelve null si la selección no
 * es válida: vacía, con más opciones de las permitidas, repetida, o con un
 * horario que ya no está libre.
 */
export function renglonesDeSeleccion(modalidad: "clases" | "talleres", ids: unknown, disp: Disponibilidad): string[] | null {
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_OPCIONES[modalidad]) return null;
  const renglones: string[] = [];
  const vistos = new Set<string>();
  for (const id of ids) {
    if (typeof id !== "string") return null;
    if (modalidad === "clases") {
      const b = disp.clases.find((x) => x.id === id);
      if (!b || !b.libre || vistos.has(id)) return null;
      vistos.add(id);
      renglones.push(`${DIAS_SEMANA[b.dia]} · ${rangoLegible(b.inicio, b.fin)}`);
    } else {
      const t = leerIdTaller(id);
      const f = t && disp.talleres.find((x) => x.fecha === t.fecha);
      // Una fecha solo puede ir una vez (con una sola hora de inicio).
      if (!t || !f || vistos.has(t.fecha) || !horasDeInicio(f).includes(t.inicio)) return null;
      vistos.add(t.fecha);
      renglones.push(`${fechaLegible(f.fecha)} · empieza ${horaLegible(t.inicio)}`);
    }
  }
  return renglones;
}

/** La selección como texto (numerado si hay varias), para guardarla en la solicitud y el correo. */
export function textoDeSeleccion(modalidad: "clases" | "talleres", ids: unknown, disp: Disponibilidad): string | null {
  const r = renglonesDeSeleccion(modalidad, ids, disp);
  if (!r) return null;
  return r.length === 1 ? r[0] : r.map((t, i) => `${i + 1}. ${t}`).join("\n");
}
