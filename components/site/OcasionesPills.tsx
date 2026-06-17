"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CakeIcon,
  AcademicCapIcon,
  HeartIcon,
  StarIcon,
  SparklesIcon,
  FaceSmileIcon,
  SunIcon,
  GiftIcon,
  BookOpenIcon,
  BuildingStorefrontIcon,
  BriefcaseIcon,
  ScissorsIcon,
} from "@heroicons/react/24/solid";

// Evita el warning de useLayoutEffect en SSR.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Íconos: placeholders con Heroicons. Cuando lleguen los íconos finales se sustituyen aquí.
const OCASIONES = [
  { label: "Cumpleaños", Icon: CakeIcon },
  { label: "Graduaciones", Icon: AcademicCapIcon },
  { label: "Día de las Madres", Icon: HeartIcon },
  { label: "Día del Padre", Icon: StarIcon },
  { label: "Bautizos", Icon: SparklesIcon },
  { label: "Baby showers", Icon: FaceSmileIcon },
  { label: "Fiestas infantiles", Icon: SunIcon },
  { label: "Regalos especiales", Icon: GiftIcon },
  { label: "Eventos escolares", Icon: BookOpenIcon },
  { label: "Emprendimientos", Icon: BuildingStorefrontIcon },
  { label: "Mesas de dulces", Icon: CakeIcon },
  { label: "Ramos y arreglos", Icon: SparklesIcon },
  { label: "Detalles corporativos", Icon: BriefcaseIcon },
  { label: "Manualidades para niños y adultos", Icon: ScissorsIcon },
];

type Ocasion = (typeof OCASIONES)[number];

// Tintes suaves de la marca que rotan por pill.
const PILL_COLORS = [
  { bg: "#F0D9CC", text: "#8C482A" }, // terracota
  { bg: "#C9D3C0", text: "#2f5d4a" }, // verde salvia
  { bg: "#CED8D9", text: "#1e4a52" }, // azul-gris
  { bg: "#F0E6D0", text: "#946233" }, // cremita
  { bg: "#E6DCEA", text: "#5e4b6b" }, // lila
  { bg: "#F5DAD2", text: "#a8543a" }, // durazno
];

// Mobile: repartimos las ocasiones en 5 filas que se mueven horizontalmente,
// así la sección no crece tanto hacia abajo. Mantenemos el índice global de
// cada ocasión para conservar la rotación de colores.
const MOBILE_ROWS = 5;
const MOBILE_INDEXED = OCASIONES.map((ocasion, index) => ({ ocasion, index }));
const MOBILE_DISTRIBUTION: { ocasion: Ocasion; index: number }[][] = Array.from(
  { length: MOBILE_ROWS },
  () => []
);
MOBILE_INDEXED.forEach((item, i) => {
  MOBILE_DISTRIBUTION[i % MOBILE_ROWS].push(item);
});

function PillContent({ ocasion }: { ocasion: Ocasion }) {
  const Icon = ocasion.Icon;
  return (
    <>
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      {ocasion.label}
    </>
  );
}

export default function OcasionesPills() {
  const containerRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pills = gsap.utils.toArray<HTMLElement>(".ocasion-pill", el);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: todo visible, sin animación.
    if (reduce) {
      gsap.set(pills, { opacity: 1, scale: 1, y: 0, rotation: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const tweens: gsap.core.Tween[] = [];
    const triggers: ScrollTrigger[] = [];
    const removeHandlers: Array<() => void> = [];
    let revealed = false;

    // Estado inicial: escondidas, encogidas y giradas al azar.
    gsap.set(pills, {
      opacity: 0,
      scale: 0.4,
      y: 24,
      rotation: () => gsap.utils.random(-18, 18),
      transformOrigin: "center center",
    });

    // Failsafe: si la animación no corre/termina (tab en 2do plano, RAF throttled,
    // dispositivo lento), garantiza que las pills SIEMPRE terminen visibles.
    const failsafe = window.setTimeout(() => {
      if (!revealed) gsap.set(pills, { opacity: 1, scale: 1, y: 0, rotation: 0 });
    }, 2500);

    // Entrada: pop elástico escalonado en orden aleatorio al entrar en viewport.
    const entrada = gsap.to(pills, {
      opacity: 1,
      scale: 1,
      y: 0,
      rotation: 0,
      ease: "back.out(1.7)",
      duration: 0.6,
      stagger: { each: 0.05, from: "random" },
      scrollTrigger: { trigger: el, start: "top 82%", once: true },
      onComplete: () => {
        revealed = true;
        window.clearTimeout(failsafe);
        // Flotación continua: cada pill flota con ritmo y desfase distintos.
        pills.forEach((p) => {
          tweens.push(
            gsap.to(p, {
              y: "+=7",
              duration: gsap.utils.random(1.6, 2.6),
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay: gsap.utils.random(0, 1),
            })
          );
        });
      },
    });
    tweens.push(entrada);
    if (entrada.scrollTrigger) triggers.push(entrada.scrollTrigger);

    // Hover juguetón: escala + giro con rebote (no interfiere con la flotación en Y).
    pills.forEach((p) => {
      const enter = () =>
        gsap.to(p, {
          scale: 1.12,
          rotation: gsap.utils.random(-6, 6),
          duration: 0.3,
          ease: "back.out(3)",
          overwrite: "auto",
        });
      const leave = () =>
        gsap.to(p, {
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      p.addEventListener("mouseenter", enter);
      p.addEventListener("mouseleave", leave);
      removeHandlers.push(() => {
        p.removeEventListener("mouseenter", enter);
        p.removeEventListener("mouseleave", leave);
      });
    });

    return () => {
      window.clearTimeout(failsafe);
      tweens.forEach((t) => t.kill());
      triggers.forEach((t) => t.kill());
      removeHandlers.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      {/* Mobile: 5 filas en marquee horizontal con flotación. Compacto en vertical. */}
      <div
        className="flex flex-col gap-3 md:hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
        }}
        aria-label="Ocasiones para personalizar"
      >
        {MOBILE_DISTRIBUTION.map((row, rowIndex) => {
          const toLeft = rowIndex % 2 === 0;
          const duration = 22 + rowIndex * 4; // filas con ritmos distintos
          return (
            <div key={rowIndex} className="overflow-hidden">
              <div
                className="ocasiones-marquee-track gap-3"
                style={{
                  animationName: toLeft
                    ? "ocasiones-marquee-left"
                    : "ocasiones-marquee-right",
                  animationDuration: `${duration}s`,
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                }}
              >
                {/* Contenido duplicado x2 para el loop sin costuras. */}
                {[0, 1].map((dup) =>
                  row.map(({ ocasion, index }, i) => {
                    const color = PILL_COLORS[index % PILL_COLORS.length];
                    return (
                      <span
                        key={`${dup}-${ocasion.label}-${i}`}
                        aria-hidden={dup === 1}
                        className="ocasiones-float inline-flex shrink-0 cursor-default items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 font-sans text-[15px]"
                        style={{
                          backgroundColor: color.bg,
                          color: color.text,
                          animationDelay: `${(i * 0.35 + rowIndex * 0.2).toFixed(2)}s`,
                        }}
                      >
                        <PillContent ocasion={ocasion} />
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: flex-wrap con entrada GSAP + flotación + hover. */}
      <div
        ref={containerRef}
        className="hidden flex-wrap justify-center gap-3 max-w-3xl mx-auto md:flex"
      >
        {OCASIONES.map((ocasion, i) => {
          const color = PILL_COLORS[i % PILL_COLORS.length];
          return (
            <span
              key={ocasion.label}
              className="ocasion-pill inline-flex cursor-default items-center gap-2 rounded-full px-5 py-2.5 font-sans text-[15px] will-change-transform"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              <PillContent ocasion={ocasion} />
            </span>
          );
        })}
      </div>
    </>
  );
}
