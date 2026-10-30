"use client";

import { useEffect, useRef, useState } from "react";
import { ANUNCIOS_DEMO, PUBLICIDAD_API, SONDEO_MS, pareceRespuesta, reportarDiag, type AnuncioPublico, type PublicidadRespuesta } from "@/lib/publicidad";
import { logger } from "@/lib/logger";

// Lista de anuncios de la pantalla:
//   1. arranca con lo último guardado en localStorage (si el Wi-Fi está caído
//      sigue reproduciendo lo que tenía);
//   2. pide la API al cargar y sondea `version` cada 60 s;
//   3. una versión nueva NO se aplica al instante: queda en `pendiente` y el
//      reproductor la toma al terminar el anuncio en curso (sin cortes);
//   4. con ?demo=1 muestra los anuncios demo (uno por plantilla) SIN tocar la
//      API ni la caché: sirve para revisar las plantillas. Nunca se cae a demo
//      solo — antes, en dev con la API caída, la pantalla pintaba anuncios que
//      no existían en el admin y confundía ("el admin dice sin anuncios").

const CLAVE = (pantalla: string) => `papela_publicidad_${pantalla}_v1`;

type Estado = { version: number; anuncios: AnuncioPublico[]; origen: "cache" | "api" | "demo" | "vacio" };

function leerCache(pantalla: string): Estado | null {
  try {
    const raw = localStorage.getItem(CLAVE(pantalla));
    if (!raw) return null;
    const j = JSON.parse(raw);
    return pareceRespuesta(j) ? { version: j.version, anuncios: j.anuncios, origen: "cache" } : null;
  } catch {
    return null;
  }
}

function guardarCache(pantalla: string, r: PublicidadRespuesta) {
  try {
    localStorage.setItem(CLAVE(pantalla), JSON.stringify(r));
  } catch {
    /* sin espacio o modo privado: no pasa nada */
  }
}

export function usePlaylist(pantalla: string, activo: boolean, demo = false) {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [pendiente, setPendiente] = useState<Estado | null>(null);
  const versionRef = useRef<number>(-1);
  // ¿Se está reproduciendo algo? Sin anuncios en pantalla no hay "fin del
  // anuncio en curso" que aplique la versión pendiente, así que una versión
  // nueva entra al instante (si no, la pantalla se quedaba en el logo para
  // siempre cuando arrancaba con la lista vacía guardada en caché).
  const hayAnunciosRef = useRef(false);

  useEffect(() => {
    if (!activo) return;
    if (demo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstado({ version: 0, anuncios: ANUNCIOS_DEMO, origen: "demo" });
      return;
    }
    let vivo = true;
    let ultimoReporte = 0;
    const cache = leerCache(pantalla);
    if (cache) {
      versionRef.current = cache.version;
      hayAnunciosRef.current = cache.anuncios.length > 0;
      setEstado(cache);
    }

    async function sondear(primera: boolean) {
      try {
        const res = await fetch(`${PUBLICIDAD_API}?pantalla=${encodeURIComponent(pantalla)}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        if (!pareceRespuesta(j) || !vivo) return;
        guardarCache(pantalla, j);
        if (j.version === versionRef.current) return;
        const nuevo: Estado = { version: j.version, anuncios: j.anuncios, origen: j.anuncios.length ? "api" : "vacio" };
        if ((primera && versionRef.current < 0) || !hayAnunciosRef.current) {
          versionRef.current = j.version;
          hayAnunciosRef.current = nuevo.anuncios.length > 0;
          setPendiente(null);
          setEstado(nuevo);
        } else {
          setPendiente(nuevo);
        }
      } catch (e) {
        if (!vivo) return;
        if (primera && versionRef.current < 0) setEstado({ version: 0, anuncios: [], origen: "vacio" });
        logger.warn("publicidad: no se pudo leer la API", { error: e instanceof Error ? e.message : String(e) });
        // Una vez al arrancar y luego cada 10 minutos como máximo.
        if (primera || Date.now() - ultimoReporte > 10 * 60_000) {
          ultimoReporte = Date.now();
          reportarDiag({ tipo: "api", error: e instanceof Error ? `${e.name}: ${e.message}` : String(e), enLinea: navigator.onLine, cache: versionRef.current });
        }
      }
    }

    void sondear(true);
    const t = setInterval(() => void sondear(false), SONDEO_MS);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [pantalla, activo, demo]);

  /** El reproductor lo llama entre anuncios: aplica la versión pendiente si la hay. */
  function aplicarPendiente(): boolean {
    if (!pendiente) return false;
    versionRef.current = pendiente.version;
    hayAnunciosRef.current = pendiente.anuncios.length > 0;
    setEstado(pendiente);
    setPendiente(null);
    return true;
  }

  return { estado, hayPendiente: !!pendiente, aplicarPendiente };
}
