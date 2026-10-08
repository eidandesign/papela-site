import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CategoriasStack } from "papela-ds";
import { categoriasPersonaliza } from "./_fixtures";

// The GSAP depth effect (covered card shrinks/fades) is driven by ScrollTrigger
// on the *top* window, which can't see the phone frame's own scroll — it would
// freeze cards half-faded. Report reduced motion to this component so it keeps
// its pure-CSS sticky stack (the documented reduced-motion behaviour).
if (typeof window !== "undefined" && !(window as any).__papelaRM) {
  (window as any).__papelaRM = true;
  const mm = window.matchMedia.bind(window);
  window.matchMedia = ((q: string) =>
    q.includes("prefers-reduced-motion") ? ({ ...mm(q), matches: true, media: q } as MediaQueryList) : mm(q)) as typeof window.matchMedia;
}

// Renders children inside a phone-width iframe (via portal) so the
// component's mobile-only (md:hidden) layout is what media queries see.
function MobileFrame({ children, width = 390, height, scrollY = 0 }: { children: React.ReactNode; width?: number; height: number; scrollY?: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const doc = ref.current?.contentDocument;
    if (!doc) return;
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((n) => doc.head.appendChild(n.cloneNode(true)));
    doc.body.style.margin = "0";
    doc.body.style.background = "var(--color-bg)";
    setBody(doc.body);
    // Scroll the phone frame so the sticky cards are caught mid-stack.
    const t = window.setTimeout(() => ref.current?.contentWindow?.scrollTo(0, scrollY), 400);
    return () => window.clearTimeout(t);
  }, [scrollY]);
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24, background: "#e9e7e1" }}>
      <iframe ref={ref} title="mobile" style={{ width, height, border: 0, borderRadius: 28, boxShadow: "0 10px 40px -12px rgba(64,60,60,.35)", background: "var(--color-bg)" }} />
      {body && createPortal(children, body)}
    </div>
  );
}

// /personaliza "Qué podemos personalizar" — mobile only (the component is
// md:hidden; desktop uses a plain grid). Cards are position:sticky so each one
// slides over the previous while scrolling; shown here in a phone-width frame.
export const Default = () => (
  <MobileFrame height={620} scrollY={1150}>
    <section className="w-[90%] mx-auto py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="label text-[var(--color-terracota)] mb-4">Qué podemos personalizar</p>
        <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight">
          Creamos piezas únicas para cada ocasión
        </h2>
      </div>
      <CategoriasStack categorias={categoriasPersonaliza} />
    </section>
  </MobileFrame>
);
