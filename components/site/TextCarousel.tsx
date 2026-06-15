"use client";

const ITEMS = "TALLERES • DISEÑO • PAPELERÍA • CLASES DE ARTE • CAFÉ • STICKERS • BRANDING • SITIOS WEB • Y MUCHO MÁS •";

function RibbonRow({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="overflow-hidden py-3" style={{ fontFamily: "'PP Editorial New', Georgia, serif" }}>
      <div className={`inline-flex whitespace-nowrap ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="inline-block text-[15px] font-light tracking-[0.06em] text-[#403C3C] mr-6">
            {ITEMS}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TextCarousel() {
  return (
    <div style={{ position: "relative", height: "270px", overflow: "hidden", margin: "0" }}>
      {/* First ribbon — tilts left */}
      <div
        className="bg-[var(--color-bg)] border-y border-[#403C3C]/20"
        style={{
          position: "absolute",
          top: "80px",
          left: "-50%",
          width: "200%",
          transform: "rotate(-4deg)",
        }}
      >
        <RibbonRow />
      </div>
      {/* Second ribbon — tilts right */}
      <div
        className="bg-[var(--color-bg)] border-y border-[#403C3C]/20"
        style={{
          position: "absolute",
          top: "160px",
          left: "-50%",
          width: "200%",
          transform: "rotate(4deg)",
        }}
      >
        <RibbonRow reverse />
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-20%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-20%); }
          to   { transform: translateX(0); }
        }
        .animate-marquee { animation: marquee 40s linear infinite; will-change: transform; }
        .animate-marquee-reverse { animation: marquee-reverse 40s linear infinite; will-change: transform; }
      `}</style>
    </div>
  );
}
