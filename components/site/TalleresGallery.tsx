"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import gsap from "gsap";

const POOL = [
  { src: "/images/taller1.jpg", alt: "Asistentes creando en un taller de Papela Atelier" },
  { src: "/images/taller2.jpg", alt: "Grupo disfrutando un taller creativo en Papela Atelier" },
  { src: "/images/taller-papela.JPG", alt: "Mesa de trabajo durante un taller en Papela Atelier" },
  { src: "/images/taller-papela-1.jpg", alt: "Personas pintando en un taller de Papela Atelier" },
  { src: "/images/taller-papela-2.JPG", alt: "Participantes sonriendo en un taller de Papela Atelier" },
  { src: "/images/fatima-papela.JPG", alt: "Tallerista guiando una actividad en Papela Atelier" },
  { src: "/images/fatima.jpeg", alt: "Momento creativo en un taller de Papela Atelier" },
];

// Posiciones del scatter en desktop (como Figma). offset = foto inicial del POOL.
const DESKTOP_FRAMES = [
  { pos: "left-[2%] top-[24%] w-[120px] h-[150px] -rotate-6", offset: 0 },
  { pos: "left-[42%] top-[0%] w-[114px] h-[150px] rotate-3", offset: 2 },
  { pos: "right-[2%] top-[20%] w-[112px] h-[148px] rotate-6", offset: 4 },
  { pos: "left-[20%] bottom-[2%] w-[104px] h-[136px] rotate-3", offset: 1 },
  { pos: "right-[18%] bottom-[0%] w-[112px] h-[148px] -rotate-3", offset: 3 },
];

// En mobile: 3 marcos en fila debajo del texto.
const MOBILE_FRAMES = [
  { offset: 0, rot: "-rotate-3" },
  { offset: 3, rot: "rotate-2" },
  { offset: 5, rot: "-rotate-2" },
];

function FrameImages({ index }: { index: number }) {
  return (
    <>
      {POOL.map((photo, p) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="170px"
          aria-hidden={p !== index}
          className={`object-cover transition-opacity duration-1000 ${
            p === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}

function Cta({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-semibold bg-[var(--color-verde)] text-[var(--color-cremita)] rounded-full px-6 py-3 relative overflow-hidden mt-8 isolate"
    >
      <span className="absolute inset-0 bg-black/10 -z-10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />
      {label}
      <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

/**
 * Marcos flotantes alrededor del texto. Cada marco flota e inclina suavemente
 * (GSAP, infinito yoyo) y va cambiando la foto que muestra (crossfade) ciclando
 * el POOL. Desktop: scatter absoluto. Mobile: fila debajo del texto.
 */
export default function TalleresGallery({
  cta,
}: {
  cta?: { label: string; href: string };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dIdx, setDIdx] = useState<number[]>(DESKTOP_FRAMES.map((f) => f.offset));
  const [mIdx, setMIdx] = useState<number[]>(MOBILE_FRAMES.map((f) => f.offset));

  // Float + tilt en todos los marcos visibles ([data-float])
  useEffect(() => {
    const ctx = gsap.context(() => {
      const frames = gsap.utils.toArray<HTMLElement>("[data-float]");
      frames.forEach((el, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.to(el, {
          y: 14 * dir,
          rotation: `+=${4 * dir}`,
          duration: 3.2 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Ciclar la foto de cada marco, escalonado para que cambien una a la vez
  useEffect(() => {
    const advance = (setter: React.Dispatch<React.SetStateAction<number[]>>, step: number) => (i: number) =>
      setter((prev) => {
        const next = [...prev];
        next[i] = (next[i] + step) % POOL.length;
        return next;
      });
    const adv = advance(setDIdx, DESKTOP_FRAMES.length);
    const advM = advance(setMIdx, MOBILE_FRAMES.length);
    const timers = [
      ...DESKTOP_FRAMES.map((_, i) => setInterval(() => adv(i), 3600 + i * 700)),
      ...MOBILE_FRAMES.map((_, i) => setInterval(() => advM(i), 3800 + i * 700)),
    ];
    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <section className="w-[90%] mx-auto py-16 md:py-24" ref={containerRef}>
      {/* Desktop: scatter + texto centrado */}
      <div className="relative mx-auto max-w-[1158px] min-h-[520px] hidden md:flex items-center justify-center">
        {DESKTOP_FRAMES.map((frame, i) => (
          <div
            key={i}
            data-float
            className={`absolute rounded-2xl overflow-hidden shadow-[0_12px_30px_-12px_rgba(64,60,60,0.35)] ${frame.pos}`}
          >
            <FrameImages index={dIdx[i]} />
          </div>
        ))}

        <div className="relative z-10 text-center px-4 max-w-[560px]">
          <h2 className="font-serif font-extralight text-[clamp(1.9rem,4vw,2.5rem)] text-[var(--color-text)] leading-[1.2]">
            Más de 100 personas ya han creado en Papela Atelier.
          </h2>
          <p className="font-sans text-[15px] text-[var(--color-muted)] leading-relaxed mt-4 max-w-[522px] mx-auto">
            Cada taller en Papela es una experiencia para relajarte, aprender
            algo nuevo y llevarte algo hecho por ti. No necesitas experiencia,
            solo ganas de pasar un rato bonito.
          </p>
          {cta && <Cta {...cta} />}
        </div>
      </div>

      {/* Mobile: texto + fila de fotos */}
      <div className="flex flex-col items-center text-center md:hidden">
        <h2 className="font-serif font-extralight text-[1.9rem] text-[var(--color-text)] leading-[1.2] px-2">
          Más de 100 personas ya han creado en Papela Atelier.
        </h2>
        <p className="font-sans text-sm text-[var(--color-muted)] leading-relaxed mt-4">
          Cada taller en Papela es una experiencia para relajarte, aprender algo
          nuevo y llevarte algo hecho por ti. No necesitas experiencia, solo
          ganas de pasar un rato bonito.
        </p>
        {cta && <Cta {...cta} />}
        <div className="flex items-center justify-center gap-3 mt-10">
          {MOBILE_FRAMES.map((frame, i) => (
            <div
              key={i}
              data-float
              className={`relative rounded-2xl overflow-hidden shadow-[0_12px_30px_-12px_rgba(64,60,60,0.35)] w-[100px] h-[130px] ${frame.rot}`}
            >
              <FrameImages index={mIdx[i]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
