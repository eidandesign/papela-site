"use client";

import { useEffect, useRef } from "react";

const VIDEO_URL =
  "https://res.cloudinary.com/duxnks729/video/upload/v1784080899/magnific_necesito-que-este-persona_0pzvzcZTfW_vrzfud.mp4";

// Resolución de trabajo del canvas — más chica que el video original para que
// el recorte por pixel sea barato en cada frame; se escala por CSS después.
const CANVAS_W = 480;
const CANVAS_H = 270;

// Chroma-key por luminancia (no por color): el video es tiza blanca sobre un
// pizarrón oscuro cuyo verde propio nunca coincide exactamente con el del
// hero (por eso mix-blend-mode dejaba una caja visible — además de que los
// navegadores mezclan mal un <video> con mix-blend-mode). Aquí se descarta
// directamente todo pixel oscuro (alpha 0) y solo sobrevive la tiza brillante,
// recoloreada al cremita de la marca — transparencia real, sin cajas.
const LOW = 95;
const HIGH = 175;

/**
 * Avioneta de gis "Back to School" que cruza volando el fondo verde del hero.
 * Decorativo: pointer-events-none y aria-hidden. La posición de vuelo la anima
 * `.bts-plane` (globals.css) sobre el <canvas>; el recorte de color corre en
 * cada frame vía requestAnimationFrame y respeta prefers-reduced-motion
 * (dibuja un solo frame estático en vez de animar el trazo).
 */
export default function BackToSchoolPlane() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let raf = 0;
    let cancelled = false;
    let visible = true;

    const drawFrame = () => {
      if (video.readyState < 2) return;
      ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H);
      const frame = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
      const data = frame.data;
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const alpha = Math.max(0, Math.min(255, ((lum - LOW) / (HIGH - LOW)) * 255));
        data[i] = 243; // cremita
        data[i + 1] = 230;
        data[i + 2] = 207;
        data[i + 3] = alpha;
      }
      ctx.putImageData(frame, 0, 0);
    };

    const loop = () => {
      raf = 0;
      if (cancelled || !visible) return;
      drawFrame();
      raf = requestAnimationFrame(loop);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Sin animación de trazo: solo un frame fijo, sin seguir dibujando.
      video.addEventListener("loadeddata", drawFrame, { once: true });
      return () => {
        cancelled = true;
      };
    }

    // Pausa el loop de dibujo (get/putImageData en cada frame) cuando el hero
    // sale de pantalla — evita quemar CPU en el resto de la página larga.
    // Observa el contenedor fijo (no el canvas, que se traslada ±100vw por su
    // propia animación de vuelo y saldría del viewport en cada vuelta aunque
    // el hero siga visible).
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      },
      { threshold: 0 }
    );
    io.observe(wrap);

    return () => {
      cancelled = true;
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Fuente de video, invisible — solo alimenta al canvas */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        crossOrigin="anonymous"
        autoPlay
        muted
        loop
        playsInline
        className="absolute h-px w-px opacity-0"
      />
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="bts-plane absolute top-[15%] left-0 h-auto w-[220px] md:top-[6%] md:w-[clamp(240px,30vw,480px)]"
      />
    </div>
  );
}
