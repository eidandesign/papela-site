"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";

function isVideo(url: string) {
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || url.includes("/video/");
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({
  items,
  current,
  onClose,
  onChange,
}: {
  items: string[];
  current: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const url = items[current];
  const vid = isVideo(url);
  const prev = useCallback(() => onChange((current - 1 + items.length) % items.length), [current, items.length, onChange]);
  const next = useCallback(() => onChange((current + 1) % items.length), [current, items.length, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
        aria-label="Cerrar"
      >
        <XMarkIcon className="w-5 h-5 text-white" />
      </button>

      {/* Media */}
      <div
        className="relative flex items-center justify-center px-14 py-10 max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {vid ? (
          <video
            key={url}
            src={url}
            autoPlay
            controls
            className="max-h-[80vh] max-w-[85vw] rounded-2xl shadow-2xl"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={url}
            alt=""
            className="max-h-[80vh] max-w-[85vw] rounded-2xl shadow-2xl object-contain"
          />
        )}
      </div>

      {/* Prev / Next */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRightIcon className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-[6px]">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onChange(i); }}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? "w-5 h-[6px] bg-white"
                  : "w-[6px] h-[6px] bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── TallerGaleriaSection ──────────────────────────────────────────────────────
type Props = {
  mainImage: string | null;
  galeria: string[];
  titulo: string;
  instructorNombre?: string | null;
  instructorInstagram?: string | null;
};

export default function TallerGaleriaSection({
  mainImage,
  galeria,
  titulo,
  instructorNombre,
  instructorInstagram,
}: Props) {
  const allItems = [mainImage, ...galeria].filter(Boolean) as string[];
  const hasExtra = galeria.length > 0;
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Main image */}
      <div
        className={`relative w-full aspect-square rounded-xl overflow-hidden ${hasExtra ? "cursor-pointer" : ""}`}
        onClick={() => hasExtra && setOpenAt(0)}
      >
        {mainImage ? (
          <Image src={mainImage} alt={titulo} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] to-[var(--color-cremita-2)]" />
        )}

        {instructorNombre && (
          <div
            className="absolute left-4 bottom-4 bg-[#f9eae3] rounded-2xl px-6 py-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-serif italic text-[#664917] text-[24px] leading-[32px]">
              {instructorNombre}
            </p>
            {instructorInstagram && (
              <a
                href={`https://instagram.com/${instructorInstagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram de ${instructorNombre}`}
                className="font-sans text-[#403c3c] text-[14px] leading-[14px] hover:opacity-70 transition-opacity"
              >
                @{instructorInstagram}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail strip — only shown when there are extra items */}
      {hasExtra && (
        <div
          className="flex gap-2 mt-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {galeria.map((url, i) => {
            // galeria items start at index 1 in allItems (0 = mainImage)
            const idx = i + 1;
            const vid = isVideo(url);
            const active = openAt === idx;
            return (
              <button
                key={i}
                onClick={() => setOpenAt(idx)}
                className={`relative flex-shrink-0 w-[56px] h-[56px] rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                  active
                    ? "border-[#12535c] scale-[1.04]"
                    : "border-[#d6bdb2] hover:border-[#12535c]/60"
                }`}
                aria-label={vid ? `Ver video ${i + 1}` : `Ver imagen extra ${i + 1}`}
              >
                {vid ? (
                  <div className="w-full h-full bg-[#403c3c]/80 flex items-center justify-center">
                    <PlayIcon className="w-6 h-6 text-white drop-shadow" />
                  </div>
                ) : (
                  <Image src={url} alt="" fill className="object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox portal */}
      {mounted && openAt !== null &&
        createPortal(
          <Lightbox
            items={allItems}
            current={openAt}
            onClose={() => setOpenAt(null)}
            onChange={setOpenAt}
          />,
          document.body
        )}
    </>
  );
}
