"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { reportarDiag, PREVIEW_ALLOWED_ORIGINS, PUBLICIDAD_MSG_READY, PUBLICIDAD_MSG_RENDER, RECARGA_MS, SALIDA_MS, pareceAnuncio, quitarResumenesVacios, type AnuncioPublico } from "@/lib/publicidad";
import Escenario from "./Escenario";
import Reproductor from "./Reproductor";
import AnuncioVista from "./AnuncioVista";
import LogoFijo from "./LogoFijo";
import { usePlaylist } from "./usePlaylist";

// Página /publicidad. Dos modos:
//   · pantalla (default): lista publicada de la API, sondeo, caché offline,
//     service worker y recarga cada 6 h;
//   · preview (?preview=1, iframe del editor del admin): pinta el borrador que
//     llega por postMessage con el MISMO AnuncioVista, en bucle sobre sí mismo.

function origenPermitido(origin: string): boolean {
  if (PREVIEW_ALLOWED_ORIGINS.includes(origin)) return true;
  return process.env.NODE_ENV === "development" && /^http:\/\/localhost(:\d+)?$/.test(origin);
}

export default function PantallaPublicidad() {
  const sp = useSearchParams();
  const preview = sp.get("preview") === "1";
  const pantalla = (sp.get("pantalla") ?? "tienda").trim().toLowerCase() || "tienda";
  const rotarParam = sp.get("rotar");
  const rotar: 0 | 90 | -90 = rotarParam === "90" ? 90 : rotarParam === "-90" ? -90 : 0;
  const [guias, setGuias] = useState(sp.get("guias") === "1");
  const demo = sp.get("demo") === "1";

  // ── Modo preview ───────────────────────────────────────────────────────────
  const [borrador, setBorrador] = useState<AnuncioPublico | null>(null);
  // Los demás anuncios (solo los manda el editor cuando el borrador es un Resumen).
  const [contextoPreview, setContextoPreview] = useState<AnuncioPublico[]>([]);
  const [vuelta, setVuelta] = useState(0);
  // Igual que la pantalla: al terminar, la info sale y luego se repite la entrada.
  const [saliendoPreview, setSaliendoPreview] = useState(false);
  const terminarVuelta = useCallback(() => {
    setSaliendoPreview(true);
    setTimeout(() => {
      setSaliendoPreview(false);
      setVuelta((v) => v + 1);
    }, SALIDA_MS);
  }, []);
  useEffect(() => {
    if (!preview) return;
    function onMessage(e: MessageEvent) {
      if (!origenPermitido(e.origin)) return;
      if (e.data?.type !== PUBLICIDAD_MSG_RENDER || !pareceAnuncio(e.data.anuncio)) return;
       
      setBorrador(e.data.anuncio);
      setContextoPreview(Array.isArray(e.data.contexto) ? e.data.contexto.filter(pareceAnuncio).slice(0, 100) : []);
      if (typeof e.data.guias === "boolean") setGuias(e.data.guias);
    }
    window.addEventListener("message", onMessage);
    if (window.parent && window.parent !== window) window.parent.postMessage({ type: PUBLICIDAD_MSG_READY }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [preview]);

  // Errores de JavaScript de la pantalla → diagnóstico (máx. 5 por carga).
  useEffect(() => {
    if (preview) return;
    let n = 0;
    const enviar = (tipo: string, msg: unknown) => {
      if (n++ >= 5) return;
      reportarDiag({ tipo, error: String(msg).slice(0, 500) });
    };
    const onError = (e: ErrorEvent) => enviar("error-js", `${e.message} @ ${e.filename}:${e.lineno}`);
    const onRechazo = (e: PromiseRejectionEvent) => enviar("promesa", e.reason instanceof Error ? `${e.reason.name}: ${e.reason.message}` : e.reason);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRechazo);
    reportarDiag({ tipo: "arranque", sw: !!navigator.serviceWorker?.controller, enLinea: navigator.onLine, pantalla: [window.screen.width, window.screen.height, window.innerWidth, window.innerHeight, window.devicePixelRatio] });
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRechazo);
    };
  }, [preview]);

  // ── Modo pantalla ──────────────────────────────────────────────────────────
  const { estado, aplicarPendiente } = usePlaylist(pantalla, !preview, demo);
  const recargarRef = useRef(false);

  useEffect(() => {
    if (preview) return;
    const t = setTimeout(() => {
      recargarRef.current = true;
    }, RECARGA_MS);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/publicidad-sw.js", { scope: "/publicidad" }).catch(() => {});
    }
    return () => clearTimeout(t);
  }, [preview]);

  const antesDeAvanzar = useCallback((): "recargar" | void => {
    if (recargarRef.current) return "recargar";
    aplicarPendiente();
  }, [aplicarPendiente]);

  // Un Resumen sin nada que listar se salta (sería una pantalla vacía).
  const anuncios = useMemo(() => quitarResumenesVacios(estado?.anuncios ?? []), [estado]);

  return (
    <Escenario rotar={rotar} guias={guias}>
      {preview ? (
        borrador ? (
          // Cada vuelta remonta la vista para repetir la entrada animada.
          <>
            <AnuncioVista key={`${borrador.id}-${vuelta}`} anuncio={borrador} activo saliendo={saliendoPreview} onFin={terminarVuelta} onError={() => {}} reduced={false} contexto={contextoPreview} />
            <LogoFijo />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-sans text-[var(--color-muted)]" style={{ fontSize: 64 }}>
            Vista previa de la pantalla
          </div>
        )
      ) : (
        <Reproductor anuncios={anuncios} antesDeAvanzar={antesDeAvanzar} />
      )}
    </Escenario>
  );
}
