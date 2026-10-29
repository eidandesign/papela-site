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
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !esVideo) return;
    v.muted = true;
    if (!activo) {
      v.pause();
      return;
    }
    if (reduced) return;
    const play = () => v.play().catch(() => {});
    play();
    const onVis = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [activo, esVideo, reduced]);

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
