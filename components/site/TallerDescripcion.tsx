"use client";

import { useEffect, useRef, useState } from "react";

const LINEAS = 3;
// Alto de colapso antes de medir (leading por defecto del párrafo × 3). El valor
// real se recalcula en el effect a partir del line-height computado, así el
// componente funciona con cualquier tamaño de texto y en cualquier breakpoint.
const COLLAPSED_H_INICIAL = 22.75 * LINEAS;

export default function TallerDescripcion({
  texto,
  className = "text-[16px] leading-[22.75px]",
}: {
  texto: string;
  /** Tamaño/interlineado del párrafo. El colapso se mide solo. */
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [fullHeight, setFullHeight] = useState(COLLAPSED_H_INICIAL);
  const [collapsedH, setCollapsedH] = useState(COLLAPSED_H_INICIAL);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const lh = parseFloat(getComputedStyle(el).lineHeight);
      const colapsado = Number.isFinite(lh) ? lh * LINEAS : COLLAPSED_H_INICIAL;
      const h = el.scrollHeight;
      setCollapsedH(colapsado);
      setFullHeight(h);
      setIsTruncated(h > colapsado + 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [texto]);

  return (
    <div className="w-full">
      <div
        style={{
          maxHeight: expanded ? fullHeight : collapsedH,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <p
          ref={ref}
          className={`font-sans text-[#6e645f] ${className} ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {texto}
        </p>
      </div>
      {(isTruncated || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 font-sans font-bold text-[#12535c] text-[14px] leading-[20px] hover:opacity-70 transition-opacity"
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      )}
    </div>
  );
}
