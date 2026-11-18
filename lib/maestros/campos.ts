// ─────────────────────────────────────────────────────────────────────────────
// Campos que el maestro llena del Acuerdo de colaboración. Lo comparten el
// formulario (cliente) y el generador del PDF (servidor).
//
// ⚠️ Aquí NO van cifras comerciales ni texto del contrato: este módulo sí viaja
// al navegador en un chunk público. Las cifras viven en config.ts (server-only)
// y las cláusulas en contrato-texto.ts (server-only).
// ─────────────────────────────────────────────────────────────────────────────

export type Modalidad = "clases" | "talleres";

export const MODALIDADES: { value: Modalidad; label: string; sub: string }[] = [
  { value: "clases", label: "Clases recurrentes", sub: "Clases fijas cada semana" },
  { value: "talleres", label: "Talleres especiales", sub: "Un evento con fecha propia" },
];

export type Campo = {
  id: string;
  label: string;
  placeholder?: string;
  /** Textarea en vez de input de una línea. */
  largo?: boolean;
  /** No se pregunta en la página: sale en el PDF con línea para llenarse a mano. */
  soloPdf?: boolean;
  autoComplete?: string;
  /** Texto fijo pegado al inicio del campo (ej. "@" en Instagram). */
  prefijo?: string;
  /** Tipo del input (teclado en celular). Default "text". */
  tipo?: "text" | "tel" | "email";
  /**
   * No se escribe: el maestro ELIGE días y horarios libres (lib/maestros/
   * disponibilidad.ts). El texto lo arma el servidor al validar la selección
   * contra la agenda real; lo que mande el navegador en este campo se ignora.
   */
  seleccion?: boolean;
};

/** Campo donde se guarda lo que el maestro eligió de la agenda (clases y talleres). */
export const CAMPO_DISPONIBILIDAD = "disponibilidad";

export const CAMPOS_PRESTADOR: Campo[] = [
  { id: "nombre", label: "Nombre completo", autoComplete: "name" },
  { id: "telefono", label: "Teléfono", autoComplete: "tel", tipo: "tel" },
  { id: "correo", label: "Correo", autoComplete: "email", tipo: "email" },
  { id: "domicilio", label: "Domicilio", autoComplete: "street-address" },
  { id: "instagram", label: "Instagram", placeholder: "tuusuario", prefijo: "@", autoComplete: "off" },
];

/** Datos que el maestro tiene que dar sí o sí para que podamos contactarlo. */
export const CAMPOS_OBLIGATORIOS = ["nombre", "telefono", "correo", "instagram"];

/**
 * Usuario de Instagram sin "@" ni liga: acepta "@ana.arte", "ana.arte" o
 * "instagram.com/ana.arte/" y deja "ana.arte" (letras, números, punto y guion
 * bajo; máximo 30, como Instagram).
 */
export function usuarioInstagram(v: string): string {
  return v
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?instagram\.com\//i, "")
    .replace(/^@+/, "")
    .split(/[/?#\s]/)[0]
    .replace(/[^A-Za-z0-9._]/g, "")
    .slice(0, 30);
}

/** Anexo A · Ficha particular de la actividad, por modalidad (mismo orden que el PDF). */
export const CAMPOS_FICHA: Record<Modalidad, Campo[]> = {
  clases: [
    { id: "disciplina", label: "Disciplina / nombre de la clase", placeholder: "Ej. Acuarela botánica" },
    { id: CAMPO_DISPONIBILIDAD, label: "Días y horarios que puedes", largo: true, seleccion: true },
    { id: "lugar", label: "Materiales especiales", largo: true },
    { id: "compensacion", label: "Compensación si se cancela una sesión ya confirmada", soloPdf: true },
    { id: "pago", label: "Periodicidad y medio de pago / comprobante", soloPdf: true },
  ],
  talleres: [
    { id: "taller", label: "Nombre del taller" },
    { id: CAMPO_DISPONIBILIDAD, label: "Fecha que propones", largo: true, seleccion: true },
    { id: "duracion", label: "Duración, edad recomendada y cupo" },
    { id: "minimo", label: "Mínimo de inscripciones / fecha límite" },
    { id: "costoBase", label: "Costo base propuesto y qué incluye", largo: true },
    { id: "precioFinal", label: "Precio final al público y remuneración acordada", soloPdf: true },
    { id: "materiales", label: "Materiales / herramientas que aporta cada parte", largo: true },
    { id: "anticipo", label: "Anticipo, liquidación y cancelaciones", soloPdf: true },
  ],
};


export const MAX_CAMPO = 300;

export type DatosContrato = {
  modalidad: Modalidad;
  valores: Record<string, string>;
};

/** Normaliza lo que llega del formulario: solo campos conocidos, texto plano y con tope. */
export function saneaDatosContrato(input: unknown): DatosContrato | null {
  if (!input || typeof input !== "object") return null;
  const { modalidad, valores } = input as { modalidad?: unknown; valores?: unknown };
  if (modalidad !== "clases" && modalidad !== "talleres") return null;
  const crudos = valores && typeof valores === "object" ? (valores as Record<string, unknown>) : {};
  const permitidos = [...CAMPOS_PRESTADOR, ...CAMPOS_FICHA[modalidad]].filter((c) => !c.soloPdf && !c.seleccion);
  const limpios: Record<string, string> = {};
  for (const c of permitidos) {
    const v = crudos[c.id];
    if (typeof v !== "string") continue;
    const t = v
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/\r\n?/g, "\n")
      .trim()
      .slice(0, MAX_CAMPO);
    const final = c.id === "instagram" ? usuarioInstagram(t) : t;
    if (final) limpios[c.id] = final;
  }
  return { modalidad, valores: limpios };
}

// ── Tu trabajo: liga y archivos (se guardan en la solicitud) ───────────────
// El maestro puede compartir su página o portafolio y hasta 3 archivos (PDF o
// fotos de su trabajo). Los archivos van a un bucket PRIVADO de Supabase
// (`maestros-archivos`) con URL firmada de subida; la solicitud se guarda al
// enviar la propuesta y Papela la ve en Admin → Maestros.

export const BUCKET_ARCHIVOS = "maestros-archivos";

export const ARCHIVOS = {
  max: 3,
  maxBytes: 10 * 1024 * 1024, // = file_size_limit del bucket
  tipos: ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const,
  accept: "application/pdf,image/jpeg,image/png,image/webp",
};

export type ArchivoSubido = { path: string; nombre: string; tipo: string; tamano: number };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const esUuid = (v: unknown): v is string => typeof v === "string" && UUID_RE.test(v);

/** Carpeta de los archivos de una solicitud dentro del bucket. */
export const carpetaSolicitud = (solicitudId: string) => `solicitudes/${solicitudId.toLowerCase()}/`;

/** Liga a su página o portafolio: acepta "instagram.com/x" (le pone https://); solo http(s). */
export function saneaPortafolio(v: unknown): string | null {
  if (typeof v !== "string") return null;
  let t = v.trim().slice(0, 300);
  if (!t) return null;
  if (!/^https?:\/\//i.test(t)) t = `https://${t}`;
  try {
    const u = new URL(t);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Solo archivos de ESTA solicitud, de los tipos y tamaño permitidos, máximo 3. */
export function saneaArchivos(input: unknown, solicitudId: string): ArchivoSubido[] {
  if (!Array.isArray(input)) return [];
  const carpeta = carpetaSolicitud(solicitudId);
  const salida: ArchivoSubido[] = [];
  for (const a of input) {
    if (!a || typeof a !== "object") continue;
    const { path, nombre, tipo, tamano } = a as Record<string, unknown>;
    if (typeof path !== "string" || !path.startsWith(carpeta) || path.includes("..") || path.length > 300) continue;
    if (typeof tipo !== "string" || !(ARCHIVOS.tipos as readonly string[]).includes(tipo)) continue;
    const n = typeof tamano === "number" && Number.isFinite(tamano) ? tamano : 0;
    if (n <= 0 || n > ARCHIVOS.maxBytes) continue;
    salida.push({ path, nombre: String(nombre ?? "archivo").replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 120), tipo, tamano: n });
    if (salida.length >= ARCHIVOS.max) break;
  }
  return salida;
}
