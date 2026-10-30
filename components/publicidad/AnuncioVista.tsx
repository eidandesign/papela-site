"use client";

import { useEffect, useRef, useState } from "react";
import { LIENZO, duracionDe, parDe, type AnuncioPublico } from "@/lib/publicidad";
import Plantilla from "./Plantilla";
import Resumen from "./Resumen";

// Un anuncio completo: medio de fondo (imagen con Ken Burns o video), tinte
// del par, textos y barra de progreso. Avisa `onFin` cuando toca el siguiente
// (por duración o al terminar el video) y `onError` si el medio no carga.

export default function AnuncioVista({
  anuncio,
  activo,
  saliendo = false,
  onFin,
  onError,
  reduced,
  contexto = [],
}: {
  anuncio: AnuncioPublico;
  /** true = es la capa visible (corre su tiempo). Las capas en precarga no cuentan. */
  activo: boolean;
  /** La info está saliendo (el reproductor está por cambiar de anuncio). */
  saliendo?: boolean;
  onFin: () => void;
  onError: () => void;
  reduced: boolean;
  /** La lista completa que se está reproduciendo (la usa el Resumen para armar su menú). */
  contexto?: AnuncioPublico[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duracion, setDuracion] = useState<number>(duracionDe(anuncio));
  const sinMedio = !anuncio.fondo.url;
  const [listo, setListo] = useState(anuncio.fondo.tipo === "imagen" || sinMedio);
  const esVideo = anuncio.fondo.tipo === "video" && !sinMedio;
  const esLibre = anuncio.plantilla === "libre";
  const esResumen = anuncio.plantilla === "resumen";
  const par = anuncio.plantilla === "libre" ? null : parDe(anuncio);

  // Tiempo del anuncio (imágenes y videos con duración fija).
  useEffect(() => {
    if (!activo || duracion <= 0) return;
    const t = setTimeout(onFin, duracion * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, duracion]);

  // Video: muted forzado (React no escribe el atributo), play() desde efecto,
  // reintento al volver a ser visible; con reduced-motion se queda en el póster.
  // El navegador de la pantalla (Tizen) puede rechazar o ignorar un play()
  // pedido antes de que el video tenga datos y lo dejaba en el póster: se
  // reintenta en cuanto puede reproducir y, mientras siga en pausa, cada segundo.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !esVideo) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    if (!activo) {
      v.pause();
      return;
    }
    if (reduced) return;
    const play = () => {
      if (v.paused && !v.ended) v.play().catch(() => {});
    };
    play();
    const onVis = () => {
      if (document.visibilityState === "visible") play();
    };
    v.addEventListener("loadeddata", play);
    v.addEventListener("canplay", play);
    const reintento = setInterval(play, 1000);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(reintento);
      v.removeEventListener("loadeddata", play);
      v.removeEventListener("canplay", play);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [activo, esVideo, reduced]);

  // Diagnóstico: a los 3 s del slide de video se reporta si de verdad está
  // corriendo y, si no, por qué (ver /api/public/publicidad-diag). Una vez por
  // anuncio y por carga de página. No aplica a la vista previa del admin.
  useEffect(() => {
    if (!activo || !esVideo || typeof window === "undefined" || new URLSearchParams(window.location.search).get("preview") === "1") return;
    const v = videoRef.current;
    if (!v) return;
    const clave = `diag:${anuncio.id}`;
    const w = window as unknown as Record<string, unknown>;
    if (w[clave]) return;
    let errorPlay = "";
    v.play()?.catch((e: unknown) => {
      errorPlay = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    });
    const t = setTimeout(() => {
      w[clave] = true;
      const datos = {
        anuncio: anuncio.id,
        corre: !v.paused && v.currentTime > 0,
        paused: v.paused,
        currentTime: Number(v.currentTime.toFixed(2)),
        readyState: v.readyState,
        networkState: v.networkState,
        error: v.error ? `${v.error.code} ${v.error.message || ""}`.trim() : null,
        errorPlay: errorPlay || null,
        reduced,
        tam: [v.videoWidth, v.videoHeight],
        src: v.currentSrc.split("/").pop(),
        mp4: v.canPlayType("video/mp4"),
        h264High41: v.canPlayType('video/mp4; codecs="avc1.640029"'),
        h264Main31: v.canPlayType('video/mp4; codecs="avc1.4d401f"'),
        pantalla: [window.screen.width, window.screen.height, window.innerWidth, window.innerHeight, window.devicePixelRatio],
      };
      try {
        const cuerpo = JSON.stringify(datos);
        if (!navigator.sendBeacon?.("/api/public/publicidad-diag", cuerpo)) {
          fetch("/api/public/publicidad-diag", { method: "POST", body: cuerpo, keepalive: true }).catch(() => {});
        }
      } catch {
        // el diagnóstico nunca rompe la pantalla
      }
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, esVideo]);

  // Sin medio nunca se queda colgado: si no carga en 12 s, se salta.
  useEffect(() => {
    if (!activo || listo) return;
    const t = setTimeout(onError, 12_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, listo]);

  const posicion = `${anuncio.fondo.enfoqueX}% ${anuncio.fondo.enfoqueY}%`;
  const kenBurns = !esVideo && !sinMedio && !reduced && activo && duracion > 0;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ width: LIENZO.ancho, height: LIENZO.alto, background: esResumen && par ? par.panel : "var(--color-bg)" }}
    >
      {/* Medio (el Resumen puede ir sin él: queda el verde de marca) */}
      {sinMedio ? null : esVideo ? (
        <video
          ref={videoRef}
          src={anuncio.fondo.url}
          poster={anuncio.fondo.poster || undefined}
          muted
          autoPlay={activo && !reduced}
          playsInline
          preload="auto"
          loop={anuncio.duracionSeg > 0}
          onLoadedMetadata={(e) => {
            setListo(true);
            const d = e.currentTarget.duration;
            if (anuncio.duracionSeg === 0 && Number.isFinite(d) && d > 0) setDuracion(d);
          }}
          onEnded={() => {
            if (anuncio.duracionSeg === 0 && activo) onFin();
          }}
          onError={onError}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: posicion }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={anuncio.fondo.url}
          alt=""
          decoding="async"
          onError={onError}
          className={`absolute inset-0 w-full h-full object-cover ${kenBurns ? "pub-kenburns" : ""}`}
          style={{ objectPosition: posicion, animationDuration: kenBurns ? `${duracion + 1}s` : undefined }}
        />
      )}

      {/* Tinte del par solo en la parte de abajo, donde va el panel con el QR:
          arriba la foto queda limpia (la sombra del logo vive en LogoFijo). */}
      {/* Resumen con foto: velo verde parejo para que el menú se lea en toda la pantalla */}
      {esResumen && !sinMedio && par && <div className="absolute inset-0 pointer-events-none" style={{ background: par.panel, opacity: 0.86 }} />}

      {par && !esResumen && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `linear-gradient(180deg, transparent 0%, transparent 42%, rgba(0,0,0,.35) 72%, ${par.tinte} 100%)`, opacity: 0.6 }}
        />
      )}

      {esResumen ? <Resumen anuncio={anuncio} contexto={contexto} saliendo={saliendo} /> : !esLibre && <Plantilla anuncio={anuncio} saliendo={saliendo} />}

      {/* Barra de progreso discreta */}
      {activo && duracion > 0 && (
        <div className="absolute left-0 right-0 bottom-0" style={{ height: 14, background: "rgba(0,0,0,.25)" }} aria-hidden="true">
          <div className="h-full pub-progreso" style={{ background: "var(--color-cremita)", opacity: 0.85, animationDuration: `${duracion}s` }} />
        </div>
      )}
    </div>
  );
}
