import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OcasionesPills } from "papela-ds";

const Heading = () => (
  <div className="text-center max-w-2xl mx-auto mb-10">
    <p className="label text-[var(--color-terracota)] mb-4">Para qué ocasiones</p>
    <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight mb-4">
      Personalización para todos tus momentos
    </h2>
    <p className="font-sans text-[17px] leading-[26px] text-[var(--color-muted)]">
      En Papela podemos crear detalles personalizados para:
    </p>
  </div>
);

// Renders children inside a phone-width iframe (via portal) so the
// component's mobile-only (md:hidden) layout is what media queries see.
function MobileFrame({ children, width = 390, height }: { children: React.ReactNode; width?: number; height: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const doc = ref.current?.contentDocument;
    if (!doc) return;
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((n) => doc.head.appendChild(n.cloneNode(true)));
    doc.body.style.margin = "0";
    doc.body.style.background = "var(--color-bg)";
    setBody(doc.body);
  }, []);
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24, background: "#e9e7e1" }}>
      <iframe ref={ref} title="mobile" style={{ width, height, border: 0, borderRadius: 28, boxShadow: "0 10px 40px -12px rgba(64,60,60,.35)", background: "var(--color-bg)" }} />
      {body && createPortal(children, body)}
    </div>
  );
}

// /personaliza "Para qué ocasiones" at desktop width: 14 tinted pills wrap
// centered (GSAP pops them in on scroll, then they float).
export const Default = () => (
  <section className="py-12 px-6 bg-[var(--color-bg)]">
    <Heading />
    <OcasionesPills />
  </section>
);

// Mobile (<768px): the same pills split into 5 marquee rows that drift
// horizontally in alternating directions, faded at the edges.
export const Mobile = () => (
  <MobileFrame height={560}>
    <section className="w-[90%] mx-auto py-12">
      <Heading />
      <OcasionesPills />
    </section>
  </MobileFrame>
);
