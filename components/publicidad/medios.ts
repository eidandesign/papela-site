import { useState } from "react";
import { reportarDiag, type AnuncioPublico } from "@/lib/publicidad";

// Medios de la pantalla: CADA ARCHIVO SE DESCARGA UNA SOLA VEZ (nov-2026).
//
// El reproductor monta un <video>/<img> nuevo en cada vuelta y el navegador de
// la tele (Yodeck, Chrome 94 sobre Tizen) no conserva nada entre una y otra:
// volvía a pedir a Supabase los videos y sus pósters en CADA vuelta, las 24 h.
// Dos videos de 3–4 MB eran ~14 GB al día de transferencia (el plan gratis de
// Supabase da 5.5 GB al MES) y casi tumban el proyecto entero, admin incluido.
//
// Aquí cada medio de la lista se baja una vez (fetch → Blob) y se reutiliza
// desde memoria con un `blob:` URL que vive mientras la página esté abierta.
// Además se guarda en Cache Storage, así una recarga (la de las 4 a.m. o la
// del vigilante) tampoco vuelve a descargar, y los videos siguen saliendo sin
// Wi-Fi. Si algo falla, el medio se pide directo como antes y se reporta al
// diagnóstico: la pantalla nunca se queda sin imagen por culpa de la caché.
//
// Solo se activa con el Reproductor (`sincronizarMedios`). La vista previa del
// admin no la usa: `medioLocal` devuelve la URL tal cual si nadie la registró.

/** No empieza con "papela-publicidad-": el service worker borra esas al activarse. */
const CACHE_DISCO = "papela-pantalla-medios-v1";
/** Tope en memoria. Lo que no quepa se pide directo (y se reporta). */
const MAX_TOTAL = 160 * 1048576;
const MAX_ARCHIVO = 64 * 1048576;
const TIEMPO_DESCARGA_MS = 3 * 60_000;
const REINTENTO_MS = 5 * 60_000;
const MAX_INTENTOS = 6;
/** Un medio que salió de la lista se libera después: un anuncio aún en pantalla puede estar usándolo. */
const GRACIA_MS = 2 * 60_000;

type Entrada = {
  estado: "cola" | "bajando" | "local" | "directo";
  /** blob: URL cuando ya está en memoria. */
  local?: string;
  bytes: number;
  intentos: number;
  /** De dónde salió: la red o el Cache Storage de una carga anterior. */
  origen?: "red" | "disco";
  /** Por qué se pide directo. */
  motivo?: string;
  /** true = no se vuelve a intentar (no cabe, o el blob no se pudo reproducir). */
  definitivo?: boolean;
  /** Veces seguidas que un video local no arrancó. */
  tropiezos: number;
};

const entradas = new Map<string, Entrada>();
let deseadas: string[] = [];
let trabajando = false;
let resumenPendiente = false;

const nombreDe = (url: string) => url.split("?")[0].split("/").pop() ?? url;
const cacheable = (url: string) => /^https?:\/\//i.test(url);

function totalBytes(): number {
  let n = 0;
  entradas.forEach((e) => {
    n += e.bytes;
  });
  return n;
}

async function abrirDisco(): Promise<Cache | null> {
  try {
    return typeof caches !== "undefined" ? await caches.open(CACHE_DISCO) : null;
  } catch {
    return null;
  }
}

async function obtener(url: string): Promise<{ blob: Blob; origen: "red" | "disco" }> {
  const disco = await abrirDisco();
  if (disco) {
    try {
      const guardado = await disco.match(url);
      if (guardado && guardado.ok) {
        const blob = await guardado.blob();
        if (blob.size) return { blob, origen: "disco" };
      }
    } catch {
      /* se baja de la red */
    }
  }
  // Sin AbortSignal.timeout: el reproductor de la tele es Chrome 94.
  const corte = new AbortController();
  const reloj = setTimeout(() => corte.abort(), TIEMPO_DESCARGA_MS);
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit", signal: corte.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const anunciado = Number(res.headers.get("content-length")) || 0;
    if (anunciado > MAX_ARCHIVO || totalBytes() + anunciado > MAX_TOTAL) {
      corte.abort();
      throw new NoCabe();
    }
    const blob = await res.blob();
    if (!blob.size) throw new Error("archivo vacío");
    if (disco) {
      const cabeceras: Record<string, string> = {};
      if (blob.type) cabeceras["content-type"] = blob.type;
      disco.put(url, new Response(blob, { headers: cabeceras })).catch(() => {});
    }
    return { blob, origen: "red" };
  } finally {
    clearTimeout(reloj);
  }
}

class NoCabe extends Error {
  constructor() {
    super("no cabe en memoria");
  }
}

async function bajar(url: string, e: Entrada): Promise<void> {
  e.estado = "bajando";
  e.intentos += 1;
  try {
    const { blob, origen } = await obtener(url);
    if (entradas.get(url) !== e) return; // salió de la lista mientras bajaba
    if (blob.size > MAX_ARCHIVO || totalBytes() + blob.size > MAX_TOTAL) throw new NoCabe();
    e.local = URL.createObjectURL(blob);
    e.bytes = blob.size;
    e.origen = origen;
    e.estado = "local";
    e.motivo = undefined;
  } catch (err) {
    if (entradas.get(url) !== e) return;
    e.estado = "directo";
    e.motivo = err instanceof Error ? `${err.name}: ${err.message}`.slice(0, 120) : String(err).slice(0, 120);
    if (err instanceof NoCabe || e.intentos >= MAX_INTENTOS) {
      e.definitivo = true;
      return;
    }
    // Falla de red: se intenta otra vez más tarde (el Wi-Fi de la tienda se cae a ratos).
    setTimeout(() => {
      if (entradas.get(url) !== e || e.estado !== "directo" || e.definitivo) return;
      e.estado = "cola";
      void trabajar();
    }, REINTENTO_MS);
  }
}

/** Baja lo que falte, de uno en uno y en el orden de la lista. */
async function trabajar(): Promise<void> {
  if (trabajando) return;
  trabajando = true;
  try {
    for (;;) {
      const url = deseadas.find((u) => entradas.get(u)?.estado === "cola");
      if (!url) break;
      const e = entradas.get(url);
      if (!e) break;
      await bajar(url, e);
    }
  } finally {
    trabajando = false;
  }
  if (resumenPendiente) {
    resumenPendiente = false;
    reportarDiag({ tipo: "medios", ...estadoMedios() });
  }
}

function liberar(url: string): void {
  const e = entradas.get(url);
  if (!e || deseadas.indexOf(url) >= 0) return;
  if (e.local) URL.revokeObjectURL(e.local);
  entradas.delete(url);
}

/** Medios que usa la lista, en orden de reproducción: póster antes que su video. */
export function mediosDe(anuncios: AnuncioPublico[]): string[] {
  const urls: string[] = [];
  const agrega = (u: string | undefined | null) => {
    if (u && cacheable(u) && urls.indexOf(u) < 0) urls.push(u);
  };
  for (const a of anuncios) {
    if (a.fondo.tipo === "video") agrega(a.fondo.poster);
    agrega(a.fondo.url);
  }
  return urls;
}

/**
 * El reproductor avisa qué lista está corriendo: se bajan los medios nuevos y
 * se sueltan (memoria y disco) los que ya no están.
 */
export function sincronizarMedios(anuncios: AnuncioPublico[]): void {
  if (typeof window === "undefined") return;
  deseadas = mediosDe(anuncios);
  let nuevos = 0;
  for (const url of deseadas) {
    if (entradas.has(url)) continue;
    entradas.set(url, { estado: "cola", bytes: 0, intentos: 0, tropiezos: 0 });
    nuevos += 1;
  }
  const sobran: string[] = [];
  entradas.forEach((_e, url) => {
    if (deseadas.indexOf(url) < 0) sobran.push(url);
  });
  if (sobran.length) setTimeout(() => sobran.forEach(liberar), GRACIA_MS);
  // Disco: fuera lo que ya no está en la lista.
  void abrirDisco().then(async (disco) => {
    if (!disco) return;
    try {
      const claves = await disco.keys();
      const vigentes = deseadas;
      await Promise.all(claves.filter((r) => vigentes.indexOf(r.url) < 0).map((r) => disco.delete(r)));
    } catch {
      /* la limpieza nunca rompe la pantalla */
    }
  });
  if (nuevos) {
    resumenPendiente = true;
    void trabajar();
  }
}

/** La copia en memoria si ya está; si no, la URL original. */
export function medioLocal(url: string | undefined | null): string {
  if (!url) return "";
  const e = entradas.get(url);
  return e && e.estado === "local" && e.local ? e.local : url;
}

/** true = se está bajando (o está en cola): no vale la pena precargarlo por fuera. */
export function medioEnCamino(url: string): boolean {
  const e = entradas.get(url);
  return !!e && (e.estado === "cola" || e.estado === "bajando");
}

export const esLocal = (src: string | undefined | null): boolean => !!src && src.indexOf("blob:") === 0;

/** Un video local arrancó bien: borra los tropiezos anteriores. */
export function medioSirve(url: string): void {
  const e = entradas.get(url);
  if (e) e.tropiezos = 0;
}

/**
 * La copia local no se pudo usar. Con `definitivo` (error del medio) o al
 * segundo tropiezo seguido (un video que no arrancó) ese archivo se pide
 * directo en adelante, como antes de la caché. Siempre se reporta.
 */
export function medioNoSirve(url: string, motivo: string, definitivo = false): void {
  const e = entradas.get(url);
  if (!e || e.estado !== "local") return;
  e.tropiezos += 1;
  const fuera = definitivo || e.tropiezos >= 2;
  reportarDiag({ tipo: "medio-local-falla", archivo: nombreDe(url), motivo: motivo.slice(0, 160), tropiezos: e.tropiezos, fuera });
  if (!fuera) return;
  const local = e.local;
  e.estado = "directo";
  e.definitivo = true;
  e.motivo = motivo.slice(0, 120);
  e.local = undefined;
  e.bytes = 0;
  // Quien lo esté mostrando ya cambió a la URL directa; se suelta poco después.
  if (local) setTimeout(() => URL.revokeObjectURL(local), 10_000);
}

/** Para el latido del diagnóstico: cuántos medios van desde memoria y cuáles no. */
export function estadoMedios(): { locales: number; deDisco: number; enCamino: number; directos: string[]; mb: number } {
  let locales = 0;
  let deDisco = 0;
  let enCamino = 0;
  const directos: string[] = [];
  entradas.forEach((e, url) => {
    if (e.estado === "local") {
      locales += 1;
      if (e.origen === "disco") deDisco += 1;
    } else if (e.estado === "directo") {
      if (directos.length < 6) directos.push(`${nombreDe(url)} (${e.motivo ?? "?"})`);
    } else enCamino += 1;
  });
  return { locales, deDisco, enCamino, directos, mb: Math.round((totalBytes() / 1048576) * 10) / 10 };
}

/**
 * Fuente de un medio para UN anuncio en pantalla: se resuelve al montar y no
 * cambia a media reproducción (cambiar el `src` reinicia el video). `directo()`
 * la pasa a la URL original si la copia local falla.
 */
export function useMedio(url: string | undefined | null): { src: string; local: boolean; directo: () => void } {
  const original = url ?? "";
  const [fuente, setFuente] = useState(() => ({ de: original, src: medioLocal(original) }));
  // La vista previa del admin cambia el anuncio sin remontar: se resuelve de nuevo.
  if (fuente.de !== original) setFuente({ de: original, src: medioLocal(original) });
  const src = fuente.de === original ? fuente.src : original;
  return { src, local: esLocal(src), directo: () => setFuente({ de: original, src: original }) };
}
