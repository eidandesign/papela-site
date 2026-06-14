"use client";

const ITEMS = "TALLERES • DISEÑO • PAPELERÍA • CLASES DE ARTE • CAFÉ • STICKERS • BRANDING •";

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="overflow-hidden whitespace-nowrap select-none py-3.5 border-b border-[var(--color-verde)]/10 last:border-b-0">
      <div
        className={`inline-flex ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-verde)] mr-16"
          >
            {ITEMS}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TextCarousel() {
  return (
    <div className="bg-[var(--color-cremita)] border-y border-[var(--color-verde)]/10">
      <MarqueeRow />
      <MarqueeRow reverse />
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; will-change: transform; }
        .animate-marquee-reverse { animation: marquee-reverse 30s linear infinite; will-change: transform; }
      `}</style>
    </div>
  );
}
