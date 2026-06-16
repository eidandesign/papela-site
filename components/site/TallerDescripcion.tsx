"use client";

import { useEffect, useRef, useState } from "react";

// 3 lines × leading-[22.75px]
const COLLAPSED_H = 22.75 * 3;

export default function TallerDescripcion({ texto }: { texto: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [fullHeight, setFullHeight] = useState(COLLAPSED_H);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const h = el.scrollHeight;
      setFullHeight(h);
      setIsTruncated(h > COLLAPSED_H + 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [texto]);

  return (
    <div className="w-full">
      <div
        style={{
          maxHeight: expanded ? fullHeight : COLLAPSED_H,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <p
          ref={ref}
          className={`font-sans text-[#6e645f] text-[16px] leading-[22.75px] ${
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
