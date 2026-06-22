"use client";

import { useEffect, useRef } from "react";

interface HeroSectionProps {
  children: React.ReactNode;
  /** Background color — defaults to var(--color-verde) */
  bgColor?: string;
  className?: string;
}

/**
 * Shared hero shell for all pages except the home (which uses HeroExperience).
 * Provides: ink-trail canvas cursor, watercolor SVG filter, ribbon SVG draw,
 * and ribbon-papela.png decorative image.
 *
 * Usage:
 *   <HeroSection bgColor="#5E7E86">
 *     <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
 *       ...content...
 *     </div>
 *   </HeroSection>
 */
export default function HeroSection({ children, bgColor, className = "" }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const penRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // ── GSAP: text entrance + ribbon draw on load ────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let ctx: { revert: () => void } | null = null;

    // Hide text elements immediately so they don't flash unstyled
    const section = sectionRef.current;
    if (section) {
      const badge = section.querySelector<HTMLElement>("[data-hero-badge]");
      const heading = section.querySelector<HTMLElement>("h1");
      const para = section.querySelector<HTMLElement>("p");
      for (const el of [badge, heading, para]) {
        if (el) el.style.visibility = "hidden";
      }
    }

    (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("gsap/SplitText"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger, SplitText);

        ctx = gsap.context(() => {
          const mm = gsap.matchMedia();

          mm.add("(prefers-reduced-motion: no-preference)", () => {
            const badge = sectionRef.current?.querySelector<HTMLElement>("[data-hero-badge]");
            const heading = sectionRef.current?.querySelector<HTMLElement>("h1");
            const para = sectionRef.current?.querySelector<HTMLElement>("p");
            const content = sectionRef.current?.querySelector<HTMLElement>("[data-hero-content]");

            if (heading) heading.style.filter = "url(#watercolor-hero)";

            gsap.set([badge, heading, para].filter(Boolean), { visibility: "visible" });

            const split = heading ? new SplitText(heading, { type: "words,chars" }) : null;

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
            if (badge) tl.from(badge, { autoAlpha: 0, y: -12, duration: 0.6 });
            if (split) {
              tl.from(
                split.chars,
                {
                  opacity: 0,
                  yPercent: 60,
                  scaleY: 1.5,
                  filter: "blur(12px)",
                  duration: 0.9,
                  stagger: { each: 0.03, from: "start" },
                },
                "-=0.25"
              );
            }
            if (para) tl.from(para, { autoAlpha: 0, y: 22, filter: "blur(6px)", duration: 0.8 }, "-=0.5");

            // Ribbon draw
            const path = pathRef.current;
            if (path) {
              const len = path.getTotalLength();
              gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
              tl.to(path, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, "-=1.2");
            }

            // Scroll parallax (same as home)
            if (content) {
              gsap.to(content, {
                yPercent: -16,
                autoAlpha: 0.2,
                ease: "none",
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: "top top",
                  end: "bottom top",
                  scrub: true,
                },
              });
            }

            return () => split?.revert();
          });

          mm.add("(prefers-reduced-motion: reduce)", () => {
            const badge = sectionRef.current?.querySelector<HTMLElement>("[data-hero-badge]");
            const heading = sectionRef.current?.querySelector<HTMLElement>("h1");
            const para = sectionRef.current?.querySelector<HTMLElement>("p");
            gsap.set([badge, heading, para].filter(Boolean), { visibility: "visible" });
          });
        }, sectionRef);
      } catch {
        // GSAP failed — reveal everything
        const sec = sectionRef.current;
        if (sec) {
          for (const el of sec.querySelectorAll<HTMLElement>("[data-hero-badge], h1, p")) {
            el.style.visibility = "visible";
          }
          if (pathRef.current) {
            pathRef.current.style.strokeDasharray = "none";
            pathRef.current.style.strokeDashoffset = "0";
          }
        }
      }
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  // ── Pen cursor + fading ink line ─────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const canvas = inkRef.current;
    const pen = penRef.current;
    if (!section || !canvas || !pen) return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const cx = canvas.getContext("2d");
    if (!cx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      const r = section.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);

    section.style.cursor = "none";

    const LIFE = 160;
    const MIN_DIST = 3.5;
    const EASE = 0.13;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowEnd = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    const CHAIKIN_PASSES = lowEnd ? 1 : 2;
    const pts: { x: number; y: number; life: number }[] = [];

    let tx = 0;
    let ty = 0;
    let sx = 0;
    let sy = 0;
    let inside = false;
    let visible = true;
    let raf = 0;

    const TIP_X = 20;
    const TIP_Y = 20;

    const addPoint = (x: number, y: number) => {
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(x - last.x, y - last.y) >= MIN_DIST) {
        pts.push({ x, y, life: LIFE });
      }
    };

    const loop = () => {
      raf = 0;
      if (inside) {
        sx += (tx - sx) * EASE;
        sy += (ty - sy) * EASE;
        addPoint(sx, sy);
        pen.style.transform = `translate(${sx - TIP_X}px, ${sy - TIP_Y}px)`;
      }
      cx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) pts[i].life--;
      while (pts.length && pts[0].life <= 0) pts.shift();
      const n = pts.length;
      if (n > 1) {
        cx.lineCap = "round";
        cx.lineJoin = "round";
        let sm: { x: number; y: number }[] = pts.map((p) => ({ x: p.x, y: p.y }));
        for (let pass = 0; pass < CHAIKIN_PASSES && sm.length > 2; pass++) {
          const out: { x: number; y: number }[] = [sm[0]];
          for (let i = 0; i < sm.length - 1; i++) {
            const p = sm[i];
            const q = sm[i + 1];
            out.push({ x: p.x * 0.75 + q.x * 0.25, y: p.y * 0.75 + q.y * 0.25 });
            out.push({ x: p.x * 0.25 + q.x * 0.75, y: p.y * 0.25 + q.y * 0.75 });
          }
          out.push(sm[sm.length - 1]);
          sm = out;
        }
        const m = sm.length;
        const grad = cx.createLinearGradient(sm[0].x, sm[0].y, sm[m - 1].x, sm[m - 1].y);
        grad.addColorStop(0, "rgba(243,230,207,0)");
        grad.addColorStop(0.5, "rgba(243,230,207,0.5)");
        grad.addColorStop(1, "rgba(243,230,207,0.95)");
        cx.strokeStyle = grad;
        cx.lineWidth = 2.4;
        cx.beginPath();
        cx.moveTo(sm[0].x, sm[0].y);
        for (let i = 1; i < m - 1; i++) {
          const mx = (sm[i].x + sm[i + 1].x) / 2;
          const my = (sm[i].y + sm[i + 1].y) / 2;
          cx.quadraticCurveTo(sm[i].x, sm[i].y, mx, my);
        }
        cx.lineTo(sm[m - 1].x, sm[m - 1].y);
        cx.stroke();
      }
      if (!inside && n === 0) return;
      if (visible) raf = requestAnimationFrame(loop);
    };

    const ensureLoop = () => {
      if (!raf && visible) raf = requestAnimationFrame(loop);
    };

    const onEnter = (e: PointerEvent) => {
      inside = true;
      const r = section.getBoundingClientRect();
      tx = sx = e.clientX - r.left;
      ty = sy = e.clientY - r.top;
      pts.length = 0;
      addPoint(sx, sy);
      pen.style.opacity = "1";
      pen.style.transform = `translate(${sx - TIP_X}px, ${sy - TIP_Y}px)`;
      ensureLoop();
    };

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!inside) {
        inside = true;
        sx = tx;
        sy = ty;
        pen.style.opacity = "1";
      }
      ensureLoop();
    };

    const onLeave = () => {
      inside = false;
      pen.style.opacity = "0";
    };

    section.addEventListener("pointerenter", onEnter);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) ensureLoop();
      },
      { threshold: 0 }
    );
    io.observe(section);

    return () => {
      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      section.style.cursor = "";
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden min-h-[80vh] flex flex-col ${className}`}
      style={{
        backgroundColor: bgColor ?? "var(--color-verde)",
        width: "98vw",
        marginLeft: "1vw",
        marginRight: "1vw",
      }}
    >
      {/* Ink trail canvas */}
      <canvas ref={inkRef} className="absolute inset-0 z-0 h-full w-full" aria-hidden="true" />

      {/* Watercolor displacement filter */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="watercolor-hero" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.018"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Page content */}
      <div data-hero-content className="relative z-10 flex flex-col flex-1">{children}</div>

      {/* Decorative SVG ribbon — draws itself on load */}
      <svg
        viewBox="-67 133 1526 294"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-[20px] left-0 right-0 w-full pointer-events-none h-[130px] md:h-auto z-20"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          ref={pathRef}
          d="M864.984 271.314C876.502 294.712 907.345 334.037 995.323 300.643C1104.1 259.357 1331.53 279.964 1457.77 390.325M864.984 271.314C862.261 265.785 860.617 261.143 859.555 258.563C856.233 250.495 861.138 246.328 865.113 247.716C867.789 248.648 870.875 251.417 869.083 258.563C867.993 262.897 866.624 267.156 864.984 271.314ZM864.984 271.314C779.94 487.307 -39.135 506.19 -66.2061 133.911"
          stroke="#F3E6CF"
          strokeOpacity="0.8"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {/* Dot + ring cursor */}
      <div
        ref={penRef}
        aria-hidden="true"
        className="absolute left-0 top-0 z-50 pointer-events-none opacity-0 transition-opacity duration-200"
        style={{ transformOrigin: "20px 20px", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="12.5" fill="none" stroke="#F3E6CF" strokeWidth="1.5" strokeOpacity="0.7" />
          <circle cx="20" cy="20" r="3.5" fill="#F3E6CF" />
        </svg>
      </div>
    </section>
  );
}
