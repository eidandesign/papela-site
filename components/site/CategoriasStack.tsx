"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Evita el warning de useLayoutEffect en SSR.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type Categoria = {
  titulo: string;
  imagen: string;
  descripcion: string;
};

// Solo mobile: las tarjetas se apilan con position:sticky (cada una se queda
// fija un poco más abajo que la anterior) y al hacer scroll la de abajo se
// encima sobre la de arriba — efecto de tarjetitas superpuestas. GSAP agrega
// el detalle de profundidad: la tarjeta cubierta se encoge y se atenúa.
const STICKY_BASE = 96; // px desde el top donde se fija la primera tarjeta
const STICKY_STEP = 14; // cada tarjeta se fija 14px más abajo → asoma una franja

export default function CategoriasStack({ categorias }: { categorias: Categoria[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // El apilado por sticky es CSS puro y siempre funciona. GSAP solo añade el
    // efecto de profundidad; sin él (o con reduced motion) el efecto base queda.
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const cards = gsap.utils.toArray<HTMLElement>(".stack-card", el);
    const triggers: ScrollTrigger[] = [];

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        // La última no se cubre por ninguna otra.
        if (i === cards.length - 1) return;
        const next = cards[i + 1];
        const stickyTop = STICKY_BASE + (i + 1) * STICKY_STEP;

        const tween = gsap.fromTo(
          card,
          { scale: 1, autoAlpha: 1 },
          {
            scale: 0.92,
            autoAlpha: 0.55,
            ease: "none",
            transformOrigin: "50% 0%",
            scrollTrigger: {
              // Animamos la tarjeta i mientras la i+1 sube a cubrirla.
              trigger: next,
              start: "top bottom",
              end: `top ${stickyTop}`,
              scrub: true,
            },
          }
        );
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      });
    }, el);

    return () => {
      triggers.forEach((t) => t.kill());
      ctx.revert();
    };
  }, [categorias.length]);

  return (
    <div ref={containerRef} className="md:hidden pb-[22vh]">
      {categorias.map((cat, i) => (
        <article
          key={cat.titulo}
          className="stack-card sticky overflow-hidden rounded-[24px] border-2 border-[#C2D2D4] bg-[#DCE6E7] shadow-[0_18px_50px_-20px_rgba(30,45,54,0.55)] will-change-transform"
          style={{ top: `${STICKY_BASE + i * STICKY_STEP}px` }}
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={cat.imagen}
              alt={cat.titulo}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 p-7">
            <span className="font-sans text-[13px] font-bold tracking-[2px] text-[#5E7E86]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-serif italic text-[24px] leading-[30px] text-[#1e2d36]">
              {cat.titulo}
            </h3>
            <p className="font-sans text-[15px] leading-[24px] text-[#4a5b62]">
              {cat.descripcion}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
