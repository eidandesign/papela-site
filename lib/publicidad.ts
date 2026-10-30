// Publicidad — pantalla vertical de la tienda (papela-atelier.com/publicidad).
// Los anuncios viven en el ADMIN (papela-admin): este módulo consume su API
// pública y define el CONTRATO del payload (espejo de
// lib/publicidad/types.ts del admin, `AnuncioPublico`). Si cambia, cambia en
// los dos lados.

export const PUBLICIDAD_API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/public/publicidad"
    : "https://admin.papela-atelier.com/api/public/publicidad";

// Orígenes que pueden mandar borradores a /publicidad?preview=1 por postMessage.
export const PREVIEW_ALLOWED_ORIGINS = ["https://admin.papela-atelier.com"];
export const PUBLICIDAD_MSG_READY = "papela-publicidad-preview:ready";
export const PUBLICIDAD_MSG_RENDER = "papela-publicidad-preview:render";

/** Lienzo de la Samsung QM43C girada a vertical (4K, 9:16). Todo el diseño va en estos px. */
export const LIENZO = { ancho: 2160, alto: 3840 } as const;
/** Margen de seguridad (se ve con ?guias=1). */
export const MARGEN_SEGURO = 120;
/** Crossfade entre anuncios. */
export const CROSSFADE_MS = 800;
/** Antes del crossfade, la info del anuncio que se va sale (panel, textos y QR). */
export const SALIDA_MS = 600;
/** Sondeo de `version` a la API. */
export const SONDEO_MS = 60_000;
/** Recarga completa (fugas de memoria del navegador de la pantalla). */
export const RECARGA_MS = 6 * 60 * 60 * 1000;
export const DURACION_DEFAULT_SEG = 6;

export type Plantilla = "taller" | "clase" | "producto" | "especial" | "resumen" | "libre";
export type FondoTipo = "imagen" | "video";

export type AnuncioPublico = {
  id: string;
  plantilla: Plantilla;
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  fechaTexto: string;
  precioTexto: string;
  /** Precio en paquete ("Paquete 4 clases · $1,100 al mes"). Snapshots viejos no lo traen. */
  paqueteTexto?: string;
  ctaTexto: string;
  qrUrl: string;
  fondo: { tipo: FondoTipo; url: string; poster: string; enfoqueX: number; enfoqueY: number };
  duracionSeg: number;
  iniciaEn: string | null;
  terminaEn: string | null;
  /** Id de PARES_COLOR (lo elige el admin). Snapshots viejos no lo traen: cae al par de la plantilla. */
  color?: string;
};

export type PublicidadRespuesta = {
  version: number;
  publicadoAt: string | null;
  pantalla: string;
  anuncios: AnuncioPublico[];
};

/**
 * Par del Brand Book 2026 por plantilla (un solo par por anuncio). El panel
 * de color garantiza el contraste sobre la foto/video: el texto va en `tinta`
 * y el título en `acento` (validado: pistache sobre verde 3.6:1 solo en
 * titulares grandes; agua sobre tinta 4.8:1; rosa-papel sobre cacao 8.8:1;
 * Barro es decorativo, así que ahí el texto va en color-text sobre
 * durazno-vivo y el barro solo tiñe la foto y el filete).
 */
export const PARES: Record<Exclude<Plantilla, "libre">, { nombre: string; panel: string; tinta: string; acento: string; tinte: string }> = {
  taller: { nombre: "Barro", panel: "var(--color-durazno-vivo)", tinta: "var(--color-text)", acento: "var(--color-text)", tinte: "var(--color-barro)" },
  clase: { nombre: "Raíz", panel: "var(--color-verde)", tinta: "var(--color-cremita)", acento: "var(--color-pistache)", tinte: "var(--color-verde)" },
  producto: { nombre: "Tinta", panel: "var(--color-tinta)", tinta: "var(--color-cremita)", acento: "var(--color-agua)", tinte: "var(--color-tinta)" },
  especial: { nombre: "Cacao", panel: "var(--color-cacao)", tinta: "var(--color-cremita)", acento: "var(--color-rosa-papel)", tinte: "var(--color-cacao)" },
  resumen: { nombre: "Raíz", panel: "var(--color-verde)", tinta: "var(--color-cremita)", acento: "var(--color-pistache)", tinte: "var(--color-verde)" },
};

// ── Color por anuncio ────────────────────────────────────────────────────────
// Cada anuncio trae su color (`color`, elegido en el admin): pinta el panel de
// su slide y su tarjeta en el Resumen. Espejo de COLORES en
// lib/publicidad/colores.ts del admin (allá con hex para las muestras y la
// prueba de contraste: texto ≥4.5:1, título ≥3:1).

export type Par = { nombre: string; panel: string; tinta: string; acento: string; tinte: string };

export const PARES_COLOR: Record<string, Par> = {
  raiz: { nombre: "Verde", panel: "var(--color-verde)", tinta: "var(--color-cremita)", acento: "var(--color-pistache)", tinte: "var(--color-verde)" },
  barro: { nombre: "Durazno", panel: "var(--color-durazno-vivo)", tinta: "var(--color-text)", acento: "var(--color-text)", tinte: "var(--color-barro)" },
  tinta: { nombre: "Azul tinta", panel: "var(--color-tinta)", tinta: "var(--color-cremita)", acento: "var(--color-agua)", tinte: "var(--color-tinta)" },
  cacao: { nombre: "Cacao", panel: "var(--color-cacao)", tinta: "var(--color-cremita)", acento: "var(--color-rosa-papel)", tinte: "var(--color-cacao)" },
  pistache: { nombre: "Pistache", panel: "var(--color-pistache)", tinta: "var(--color-cacao)", acento: "var(--color-cacao)", tinte: "var(--color-pistache)" },
  agua: { nombre: "Agua", panel: "var(--color-agua)", tinta: "var(--color-tinta)", acento: "var(--color-tinta)", tinte: "var(--color-agua)" },
  rosa: { nombre: "Rosa papel", panel: "var(--color-rosa-papel)", tinta: "var(--color-cacao)", acento: "var(--color-cacao)", tinte: "var(--color-rosa-papel)" },
  terracota: { nombre: "Terracota", panel: "var(--color-terracota)", tinta: "var(--color-cremita)", acento: "var(--color-durazno-vivo)", tinte: "var(--color-terracota)" },
  crema: { nombre: "Crema", panel: "var(--color-cremita)", tinta: "var(--color-verde)", acento: "var(--color-verde)", tinte: "var(--color-cremita)" },
};

/** El color de un anuncio: el que eligió el admin o, si no trae, el de su plantilla. */
export function parDe(a: Pick<AnuncioPublico, "plantilla" | "color">): Par {
  // El Resumen tiene fondo fijo: los colores que cambian son sus tarjetas,
  // cada una con el color de su propio anuncio.
  if (a.plantilla === "resumen") return PARES.resumen;
  if (a.color && PARES_COLOR[a.color]) return PARES_COLOR[a.color];
  return a.plantilla === "libre" ? PARES_COLOR.raiz : PARES[a.plantilla];
}

// ── Resumen: el menú de todo lo que hay ──────────────────────────────────────
// La plantilla `resumen` no trae contenido propio: lista los DEMÁS anuncios de
// la misma lista (los que la pantalla está reproduciendo, ya filtrados por sus
// fechas), agrupados por plantilla. Así se alimenta solo: publicas o apagas un
// anuncio y el resumen cambia con él. Espejo de `contextoResumen()` del admin.

export type GrupoResumen = { plantilla: "taller" | "clase" | "especial" | "producto"; titulo: string; items: AnuncioPublico[] };

const ORDEN_GRUPOS: { plantilla: GrupoResumen["plantilla"]; titulo: string }[] = [
  { plantilla: "taller", titulo: "Talleres" },
  { plantilla: "clase", titulo: "Clases" },
  { plantilla: "especial", titulo: "Especiales" },
  { plantilla: "producto", titulo: "En tienda" },
];

/** Máximo de renglones que caben legibles en el lienzo; el resto se resume en "y N más". */
export const RESUMEN_MAX = 12;

/**
 * Para las columnas de precio del Resumen: el monto de un texto de precio
 * ("$250 por clase" → "$250", "Paquete 4 clases · $1,100 al mes" → "$1,100").
 * Sin monto reconocible devuelve el texto tal cual.
 */
export function montoDe(texto: string | undefined): string {
  const t = (texto ?? "").trim();
  const m = t.match(/\$\s?\d[\d,.]*/);
  return m ? m[0].replace(/\s/g, "").replace(/[.,]$/, "") : t;
}

/** Lo que acompaña al monto del paquete: "Paquete 4 clases · $1,100 al mes" → "4 clases al mes". */
export function detallePaquete(texto: string | undefined): string {
  const t = (texto ?? "").trim();
  const monto = montoDe(t);
  if (!monto || monto === t) return "";
  return t
    .replace(monto, " ")
    .replace(/\bMXN\b/gi, " ")
    .replace(/^\s*paquete( mensual)?\b/i, " ")
    .replace(/[·:|•/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function entradasResumen(lista: AnuncioPublico[], excluirId?: string): GrupoResumen[] {
  const vistos = new Set<string>();
  const validos = lista.filter((a) => {
    if (a.id === excluirId || vistos.has(a.id)) return false;
    if (a.plantilla === "libre" || a.plantilla === "resumen") return false;
    if (!a.titulo.trim()) return false;
    vistos.add(a.id);
    return true;
  });
  return ORDEN_GRUPOS.map((g) => ({ ...g, items: validos.filter((a) => a.plantilla === g.plantilla) })).filter((g) => g.items.length > 0);
}

/** Un Resumen sin nada que listar no se reproduce (sería una pantalla vacía). */
export function quitarResumenesVacios(lista: AnuncioPublico[]): AnuncioPublico[] {
  return lista.filter((a) => a.plantilla !== "resumen" || entradasResumen(lista, a.id).length > 0);
}

export function pareceAnuncio(v: unknown): v is AnuncioPublico {
  if (!v || typeof v !== "object") return false;
  const a = v as Record<string, unknown>;
  const f = a.fondo as Record<string, unknown> | undefined;
  return typeof a.id === "string" && typeof a.plantilla === "string" && !!f && typeof f.url === "string" && typeof f.tipo === "string";
}

export function pareceRespuesta(v: unknown): v is PublicidadRespuesta {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return typeof r.version === "number" && Array.isArray(r.anuncios) && r.anuncios.every(pareceAnuncio);
}

/** Segundos que se queda un anuncio (0 en video = lo que dure el video; se resuelve con los metadatos). */
export function duracionDe(a: AnuncioPublico): number {
  if (a.fondo.tipo === "video" && a.duracionSeg === 0) return 0;
  return a.duracionSeg > 0 ? a.duracionSeg : DURACION_DEFAULT_SEG;
}

// ── Datos demo (un anuncio por plantilla) para probar en dev sin API ──────────
const F = (url: string, enfoqueY = 50): AnuncioPublico["fondo"] => ({ tipo: "imagen", url, poster: "", enfoqueX: 50, enfoqueY });

export const ANUNCIOS_DEMO: AnuncioPublico[] = [
  {
    id: "demo-taller",
    plantilla: "taller",
    eyebrow: "Taller de acuarela",
    titulo: "Flores de temporada",
    subtitulo: "Con Fátima · Todos los materiales incluidos",
    fechaTexto: "Sábado 14 de noviembre · 11:00",
    precioTexto: "$380 MXN",
    ctaTexto: "Escanea para reservar",
    qrUrl: "https://www.papela-atelier.com/talleres",
    fondo: F("/images/taller-papela-1.jpg", 40),
    duracionSeg: 6,
    iniciaEn: null,
    terminaEn: null,
  },
  {
    id: "demo-clase",
    plantilla: "clase",
    eyebrow: "Clases de arte",
    titulo: "Club de arcilla",
    subtitulo: "Para peques de 6 a 12 años",
    fechaTexto: "Jueves · 5:00 p.m.",
    precioTexto: "$250 MXN",
    paqueteTexto: "Paquete 4 clases · $900 al mes",
    ctaTexto: "Pregunta en caja",
    qrUrl: "https://www.papela-atelier.com/clases",
    fondo: F("/images/modelado-arcillla-papela.jpg", 35),
    duracionSeg: 6,
    iniciaEn: null,
    terminaEn: null,
  },
  {
    id: "demo-producto",
    plantilla: "producto",
    eyebrow: "Nuevo en tienda",
    titulo: "Libretas artesanales",
    subtitulo: "Hechas a mano en Puebla",
    fechaTexto: "",
    precioTexto: "$180 MXN",
    ctaTexto: "Míralas en la vitrina",
    qrUrl: "https://www.papela-atelier.com/tienda",
    fondo: F("/images/dibujando-papela.jpg", 45),
    duracionSeg: 6,
    iniciaEn: null,
    terminaEn: null,
  },
  {
    id: "demo-especial",
    plantilla: "especial",
    eyebrow: "Artista invitada",
    titulo: "Noche de grabado",
    subtitulo: "Una sola función, cupo limitado",
    fechaTexto: "Viernes 20 · 7:00 p.m.",
    precioTexto: "$450 MXN",
    ctaTexto: "Escanea para apartar",
    qrUrl: "https://www.papela-atelier.com/talleres",
    fondo: F("/images/inspirados-artistas-papela.jpg", 40),
    duracionSeg: 6,
    iniciaEn: null,
    terminaEn: null,
  },
  {
    id: "demo-resumen",
    plantilla: "resumen",
    eyebrow: "Esta semana en Papela",
    titulo: "Todo lo que hay",
    subtitulo: "",
    fechaTexto: "",
    precioTexto: "",
    ctaTexto: "Escanea para ver más",
    qrUrl: "https://www.papela-atelier.com",
    fondo: { tipo: "imagen", url: "", poster: "", enfoqueX: 50, enfoqueY: 50 },
    duracionSeg: 20,
    iniciaEn: null,
    terminaEn: null,
  },
  {
    id: "demo-libre",
    plantilla: "libre",
    eyebrow: "",
    titulo: "",
    subtitulo: "",
    fechaTexto: "",
    precioTexto: "",
    ctaTexto: "",
    qrUrl: "",
    fondo: F("/images/pintura-tela.jpg"),
    duracionSeg: 6,
    iniciaEn: null,
    terminaEn: null,
  },
];
