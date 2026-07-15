"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

interface HeroNinosParallaxProps {
  src: string;
  alt: string;
}

/**
 * Niños del hero de Back to School. HeroSection anima [data-hero-content]
 * completo con un scroll-parallax compartido (yPercent -16 + fade), y como
 * esta imagen vive pegada al fondo de la tarjeta, ese desplazamiento
 * compartido dejaba un corte visible (el fondo del hero asomaba debajo de
 * la imagen al hacer scroll).
 *
 * Este componente cancela ese desplazamiento heredado en píxeles exactos
 * (mide el alto real de [data-hero-content], que varía por breakpoint) y
 * en su lugar anima su propio efecto: zoom leve — "se acerca" — más una
 * subida propia y controlada, atados al mismo scroll-trigger del hero para
 * que se sientan sincronizados con el resto del contenido.
 */
export default function HeroNinosParallax({ src, alt }: HeroNinosParallaxProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let ro: ResizeObserver | null = null;
    let currentTrigger: ScrollTrigger | null = null;

    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const build = () => {
          const el = wrapRef.current;
          const section = el?.closest("section");
          const content = el?.closest<HTMLElement>("[data-hero-content]");
          if (!el || !section || !content) return;

          currentTrigger?.kill();
          gsap.set(el, { clearProps: "transform" });

          // Cuánto "sube" de más, además de cancelar el -16% heredado.
          const RISE_PX = 30;
          const parentH = content.getBoundingClientRect().height;
          const targetY = parentH * 0.16 - RISE_PX;

          const tween = gsap.to(el, {
            y: targetY,
            scale: 1.12,
            transformOrigin: "50% 100%",
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
          currentTrigger = tween.scrollTrigger ?? null;
        };

        build();

        const content = wrapRef.current?.closest<HTMLElement>("[data-hero-content]");
        if (content) {
          ro = new ResizeObserver(() => build());
          ro.observe(content);
        }
      } catch {
        // Sin GSAP: la imagen queda estática — no rompe el layout.
      }
    })();

    return () => {
      cancelled = true;
      ro?.disconnect();
      currentTrigger?.kill();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none relative z-10 mx-auto mt-4 flex w-[82%] items-end justify-center will-change-transform sm:w-[62%] md:absolute md:bottom-0 md:right-[1%] md:mx-0 md:mt-0 md:w-[52%] md:max-w-[760px] lg:right-[3%]"
    >
      <Image
        src={src}
        alt={alt}
        width={760}
        height={570}
        priority
        className="h-auto w-full object-contain"
        style={{ filter: "drop-shadow(16px 22px 26px rgba(0,0,0,0.5))" }}
      />
    </div>
  );
}
