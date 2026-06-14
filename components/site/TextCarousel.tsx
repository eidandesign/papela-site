"use client";

const ITEMS =
  "TALLERES • DISEÑO • PAPELERÍA • CLASES DE ARTE • CAFÉ • STICKERS • BRANDING •";

export default function TextCarousel() {
  return (
    <div className="overflow-hidden whitespace-nowrap select-none py-3 bg-[var(--color-cremita)]">
      <div className="inline-flex animate-marquee">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block text-xs font-semibold tracking-widest text-[var(--color-verde)] mr-12"
          >
            {ITEMS}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
