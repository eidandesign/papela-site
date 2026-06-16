"use client";

import { useEffect, useRef } from "react";

/**
 * HeroExperience — solid verde hero with a watercolor-painted headline and a
 * dot cursor that draws a fading ink line following the pointer.
 *
 * - GSAP SplitText paints the headline in on load (brush-written feel); the
 *   ribbon draws itself; a light scroll parallax on the block.
 * - A custom dot-and-ring cursor replaces the system cursor over the hero. As
 *   it moves it draws a smooth cremita ink line (matching the decorative
 *   ribbon) whose tail fades out gradually. Disabled on touch / reduced-motion.
 *
 * The <h1> text stays in the SSR HTML for SEO.
 */
export default function HeroExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const penRef = useRef<HTMLDivElement>(null);

  // ── GSAP: entrance reveal + ribbon draw + scroll parallax ────────────────────
  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    const revealText = () => {
      for (const el of [headlineRef.current, badgeRef.current, paraRef.current]) {
        if (el) el.style.visibility = "visible";
      }
    };

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
          const split = new SplitText(headlineRef.current, { type: "words,chars" });

          gsap.set([headlineRef.current, badgeRef.current, paraRef.current], {
            visibility: "visible",
          });

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          tl.from(badgeRef.current, { autoAlpha: 0, y: -12, duration: 0.6 })
            .from(
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
            )
            .from(
              paraRef.current,
              { autoAlpha: 0, y: 22, filter: "blur(6px)", duration: 0.8 },
              "-=0.5"
            );

          const path = pathRef.current;
          if (path) {
            const len = path.getTotalLength();
            gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
            tl.to(path, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, "-=1.2");
          }

          gsap.to(contentRef.current, {
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

          return () => split.revert();
        });

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set([headlineRef.current, badgeRef.current, paraRef.current], {
            visibility: "visible",
          });
        });
        }, sectionRef);
      } catch {
        // GSAP chunk failed to load — reveal the text so it never stays hidden.
        if (!cancelled) revealText();
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

    const LIFE = 160; // frames a point lives before vanishing (~2.7s)
    const MIN_DIST = 3.5; // min px between recorded points
    const EASE = 0.13; // tip inertia → fluid trailing (lower = more flow)
    // Smoothing is the per-frame cost; halve it on low-end devices.
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowEnd = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    const CHAIKIN_PASSES = lowEnd ? 1 : 2;
    const pts: { x: number; y: number; life: number }[] = [];

    let tx = 0; // target cursor (local)
    let ty = 0;
    let sx = 0; // eased pen tip (the fluid bit)
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

      // Ease the pen tip toward the cursor → smooth, flowing line.
      if (inside) {
        sx += (tx - sx) * EASE;
        sy += (ty - sy) * EASE;
        addPoint(sx, sy);
        pen.style.transform = `translate(${sx - TIP_X}px, ${sy - TIP_Y}px)`;
      }

      cx.clearRect(0, 0, w, h);

      // Age the trail; drop the dead tail.
      for (let i = 0; i < pts.length; i++) pts[i].life--;
      while (pts.length && pts[0].life <= 0) pts.shift();

      const n = pts.length;
      if (n > 1) {
        cx.lineCap = "round";
        cx.lineJoin = "round";

        // Chaikin corner-cutting → rounds off every bend in the path.
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

        // One continuous smooth path with a tail→head gradient: a clean ink
        // line with no beading, fading out along its length.
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

      if (!inside && n === 0) return; // nothing left to draw
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
      // A move means the pointer is inside (covers a missed pointerenter, e.g.
      // when the cursor is already over the hero on load).
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
      className="relative mt-6 rounded-[32px] md:rounded-[48px] bg-[var(--color-verde)] overflow-hidden h-[80vh] flex flex-col"
      style={{ width: "98vw", marginLeft: "1vw", marginRight: "1vw" }}
    >
      {/* Ink trail canvas (behind the text) */}
      <canvas ref={inkRef} className="absolute inset-0 z-0 h-full w-full" aria-hidden="true" />

      {/* Watercolor displacement filter — gives the headline painted edges */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="watercolor" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.018"
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={4}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Hero content */}
      <div
        ref={contentRef}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-[140px] md:pt-[180px] pb-20 md:pb-40"
      >
        <span
          ref={badgeRef}
          className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8 md:mb-10"
          style={{ visibility: "hidden" }}
        >
          <span className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase text-[var(--color-cremita)]/70">
            Una pape bien bonita
          </span>
        </span>

        <h1
          ref={headlineRef}
          className="font-serif italic text-[clamp(3rem,7.5vw,6.5rem)] leading-[1.02] text-[var(--color-cremita)] mb-6 md:mb-8"
          style={{
            visibility: "hidden",
            filter: "url(#watercolor)",
            textShadow: "0 0 18px rgba(243,230,207,0.12)",
          }}
        >
          Lo que imaginas
          <br />
          comienza aquí
        </h1>

        <p
          ref={paraRef}
          className="font-sans font-normal text-[var(--color-cremita)]/70 text-base md:text-[22px] max-w-2xl leading-relaxed"
          style={{ visibility: "hidden" }}
        >
          Desde una cartulina de último minuto hasta stickers, regalos, talleres y clases
          creativas.
        </p>
      </div>

      {/* Decorative ribbon — draws itself on load */}
      <svg
        viewBox="-67 133 1526 294"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-[20px] left-0 right-0 w-full pointer-events-none h-[130px] md:h-auto z-10"
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
