"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Logo de Papela con cara animada.
 * - El anillo de texto se pinta vía CSS mask (recolorable con `color`).
 * - Ojos y boca son paths vectoriales (extraídos de Logo-papela-verde.svg,
 *   viewBox 116×116) que se trasladan hacia el cursor en desktop y de forma
 *   aleatoria en mobile / dispositivos sin puntero fino.
 */

const RING_SRC = "/site/logo-ring.svg";

// Paths de la cara (coords en el viewBox 0 0 116 116 del logo original)
const EYE_LEFT =
  "M42.1747 64.7179C42.1747 66.9316 40.5135 68.7259 38.4634 68.7259C36.4141 68.7259 34.7529 66.9316 34.7529 64.7179C34.7529 62.5042 36.4141 60.71 38.4634 60.71C40.5135 60.71 42.1747 62.5042 42.1747 64.7179Z";
const EYE_RIGHT =
  "M78.6168 68.0419C76.6998 69.1484 74.3151 68.6071 73.2897 66.8321C72.265 65.0572 72.9885 62.7208 74.9055 61.6144C76.8225 60.5071 79.2072 61.0492 80.2319 62.8242C81.2565 64.5991 80.5337 66.9355 78.6168 68.0419Z";
const MOUTH =
  "M61.4496 77.7836C61.5634 77.7055 61.7002 77.6728 61.8325 77.6936C61.9656 77.7152 62.0854 77.7873 62.1701 77.8966C62.2549 78.0059 62.2958 78.1428 62.2973 78.2788C62.2832 78.5644 62.2534 78.7822 62.2051 79.0254C61.9069 81.2019 59.4828 83.133 57.1925 82.9954C57.1866 82.9954 57.1814 82.9954 57.1754 82.9962C54.8815 83.1516 52.4499 81.2562 52.1049 79.0894C52.0521 78.8477 52.0172 78.6298 51.9971 78.345C51.9963 78.2089 52.0343 78.0714 52.1168 77.9606C52.1986 77.8498 52.3176 77.7739 52.4492 77.7501C52.5815 77.7263 52.7191 77.7561 52.8351 77.8319C52.9504 77.907 53.0336 78.023 53.0805 78.1502C53.1444 78.284 53.2389 78.4766 53.3326 78.6343C54.2234 80.1631 55.5715 80.8227 57.1673 80.7951C57.171 80.7951 57.1754 80.7944 57.1792 80.7944C58.7756 80.8078 60.1104 80.14 60.9685 78.5956C61.0592 78.4357 61.1492 78.2417 61.2109 78.1071C61.254 77.9784 61.3351 77.8617 61.4496 77.7836Z";

// Cuánto se desplazan (en unidades del viewBox 116)
const EYE_SHIFT = 2.4;
const MOUTH_SHIFT = 1.1;
// Centro vertical de los ojos: eje sobre el que se cierran al parpadear
const EYE_CY = 64.75;

type Offset = { x: number; y: number };

export default function AnimatedLogo({
  color = "var(--color-cremita)",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [gaze, setGaze] = useState<Offset>({ x: 0, y: 0 });
  // duración de la transición: corta al seguir el mouse, larga en modo aleatorio
  const [smooth, setSmooth] = useState(false);
  const [blink, setBlink] = useState(false);

  // Parpadeo periódico (ambos modos). setState vive en callbacks de timeout,
  // nunca en el cuerpo del efecto.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let close: ReturnType<typeof setTimeout>;
    let next: ReturnType<typeof setTimeout>;
    const loop = () => {
      setBlink(true);
      close = setTimeout(() => {
        setBlink(false);
        next = setTimeout(loop, 2600 + Math.random() * 3600);
      }, 115);
    };
    next = setTimeout(loop, 1800 + Math.random() * 2000);
    return () => {
      clearTimeout(close);
      clearTimeout(next);
    };
  }, []);

  useEffect(() => {
    // Respeta la preferencia de movimiento reducido: cara quieta.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fine = window.matchMedia("(pointer: fine)").matches;

    if (fine) {
      // Throttle a un update por frame: mousemove dispara muchos eventos,
      // pero solo recalculamos/renderizamos una vez por rAF.
      let frame = 0;
      let lastX = 0;
      let lastY = 0;
      const apply = () => {
        frame = 0;
        const el = wrapRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let dx = lastX - cx;
        let dy = lastY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        // normaliza y satura: lejos = mirada al tope, cerca = proporcional
        const reach = Math.min(dist / 160, 1);
        dx = (dx / dist) * reach;
        dy = (dy / dist) * reach;
        setGaze({ x: dx, y: dy });
      };
      const onMove = (e: MouseEvent) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (frame) return;
        frame = requestAnimationFrame(apply);
      };
      // smooth queda en false (default) → seguimiento ágil del cursor
      window.addEventListener("mousemove", onMove, { passive: true });
      return () => {
        window.removeEventListener("mousemove", onMove);
        if (frame) cancelAnimationFrame(frame);
      };
    }

    // Mobile / sin puntero fino → mirada aleatoria con easing suave.
    // setSmooth se llama dentro del timeout (no en el cuerpo del efecto).
    let timer: ReturnType<typeof setTimeout>;
    const wander = () => {
      setSmooth(true);
      const a = Math.random() * Math.PI * 2;
      const m = 0.45 + Math.random() * 0.55; // 45–100% del alcance
      setGaze({ x: Math.cos(a) * m, y: Math.sin(a) * m });
      timer = setTimeout(wander, 1300 + Math.random() * 1400);
    };
    timer = setTimeout(wander, 600);
    return () => clearTimeout(timer);
  }, []);

  const eyeT = `translate(${(gaze.x * EYE_SHIFT).toFixed(2)} ${(gaze.y * EYE_SHIFT).toFixed(2)})`;
  const mouthT = `translate(${(gaze.x * MOUTH_SHIFT).toFixed(2)} ${(gaze.y * MOUTH_SHIFT * 0.6).toFixed(2)})`;
  const transition = smooth
    ? "transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)"
    : "transform 0.18s ease-out";
  // scaleY alrededor del centro de los ojos (cierra/abre el párpado)
  const blinkT = `translate(0 ${EYE_CY}) scale(1 ${blink ? 0.1 : 1}) translate(0 ${-EYE_CY})`;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Anillo de texto, recoloreado por CSS mask */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundColor: color,
          maskImage: `url(${RING_SRC})`,
          WebkitMaskImage: `url(${RING_SRC})`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
      {/* Cara animada */}
      <svg
        viewBox="0 0 116 116"
        className="absolute inset-0 h-full w-full"
        fill={color}
        aria-hidden
      >
        <g transform={eyeT} style={{ transition }}>
          <g transform={blinkT} style={{ transition: "transform 0.09s ease-out" }}>
            <path d={EYE_LEFT} />
            <path d={EYE_RIGHT} />
          </g>
        </g>
        <g transform={mouthT} style={{ transition }}>
          <path d={MOUTH} />
        </g>
      </svg>
    </div>
  );
}
