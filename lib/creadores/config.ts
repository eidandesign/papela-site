// Creadores en Papela (/creadores, nov-2026) — programa de consignación para
// ilustradores, artistas, diseñadores y marcas independientes.
//
// Este archivo viaja al navegador (lo usa el formulario): solo datos públicos.
// Las condiciones comerciales son las mismas que la página comunica; si cambian,
// cambian aquí y se sube `CONDICIONES_VERSION` (queda guardada con cada
// postulación para saber qué versión reconoció el creador).

export const CONDICIONES = {
  comisionPapela: 30, // % de cada venta para Papela
  gananciaCreador: 70, // % para el creador
  diasExhibicion: 60, // periodo inicial de exhibición
  historiasPorSemana: 1, // historias mínimas en Instagram por semana
  instagram: "@papela.atelier",
  diasHabilesPago: 5, // pago dentro de los primeros N días hábiles del mes siguiente
} as const;

export const CONDICIONES_VERSION = "2026-11-17";

export const CATEGORIAS = [
  "Ilustraciones y prints",
  "Stickers y papelería creativa",
  "Libretas, planners y journals",
  "Accesorios de diseño",
  "Objetos creativos y regalos",
  "Otra",
] as const;

export const CANTIDADES = ["1 a 5", "6 a 15", "16 a 30", "Más de 30"] as const;

export const BUCKET_FOTOS = "creadores-fotos";

export const FOTOS = {
  max: 6,
  maxBytes: 8 * 1024 * 1024, // = file_size_limit del bucket
  tipos: ["image/jpeg", "image/png", "image/webp"] as const,
  accept: "image/jpeg,image/png,image/webp",
};

export type FotoSubida = {
  path: string;
  nombre: string;
  tipo: string;
  tamano: number;
};

export const LIMITES = {
  nombre: 100,
  marca: 100,
  correo: 150,
  whatsapp: 30,
  redes: 200,
  descripcionMin: 20,
  descripcion: 1500,
  precio: 120,
  portafolio: 300,
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const esUuid = (v: unknown): v is string =>
  typeof v === "string" && UUID_RE.test(v);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** WhatsApp: entre 10 y 15 dígitos (con o sin lada internacional). */
export const whatsappValido = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 15;
};

/** Carpeta de las fotos de una postulación dentro del bucket. */
export const carpetaPostulacion = (id: string) =>
  `postulaciones/${id.toLowerCase()}/`;
