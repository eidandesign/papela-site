"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const FORMSPREE_URL = "https://formspree.io/f/mbdbbwgo";

const T = {
  cremita: "rgb(243,230,207)",
  terracota: "rgb(140,72,42)",
  cafe: "rgb(102,73,23)",
  green: "rgb(18,83,92)",
  ink: "rgb(64,60,60)",
  inkSoft: "rgb(98,95,94)",
  inkMuted: "rgb(100,95,95)",
  white: "#fffcf7",
  border: "rgba(102,73,23,0.15)",
};

const CC = [
  "rgba(197,117,90,0.85)",
  "rgba(18,83,92,0.75)",
  "rgba(201,169,110,0.85)",
  "rgba(243,230,207,1)",
  "rgba(102,73,23,0.6)",
  "rgba(197,117,90,0.4)",
];

const CLASES = ["Acrílico", "Acuarela", "Dibujo", "Óleo", "Manualidades", "Cerámica", "Otra"];

// ─── Confetti ────────────────────────────────────────────────────────────────

type Particle = {
  x: number; y: number; vx: number; vy: number; sz: number; c: string;
  r: number; rs: number; s: number; l: number; m: number;
};

function useConfetti() {
  const cvs = useRef<HTMLCanvasElement | null>(null);
  const pts = useRef<Particle[]>([]);
  const raf = useRef(0);
  const on = useRef(false);
  const drawRef = useRef<() => void>(() => {});

  // The draw loop self-references for requestAnimationFrame, so it lives in an
  // effect (not a self-referential useCallback) and is reached via drawRef.
  useEffect(() => {
    const draw = () => {
      const c = cvs.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      pts.current = pts.current.filter((p) => p.l < p.m);
      for (const p of pts.current) {
        p.l++; p.x += p.vx; p.y += p.vy; p.vy += 0.11; p.vx *= 0.99; p.r += p.rs;
        const t = p.l / p.m;
        const a = t < 0.1 ? t / 0.1 : t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
        ctx.save();
        ctx.globalAlpha = a * 0.88;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.strokeStyle = p.c;
        if (p.s === 1) { ctx.beginPath(); ctx.arc(0, 0, p.sz / 2, 0, Math.PI * 2); ctx.fill(); }
        else if (p.s === 2) { ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -p.sz); ctx.lineTo(0, p.sz); ctx.stroke(); }
        else ctx.fillRect(-p.sz / 2, -p.sz / 3, p.sz, p.sz * 0.55);
        ctx.restore();
      }
      if (pts.current.length > 0) raf.current = requestAnimationFrame(draw);
      else { on.current = false; if (c.parentNode) c.parentNode.removeChild(c); cvs.current = null; }
    };
    drawRef.current = draw;
    return () => {
      cancelAnimationFrame(raf.current);
      if (cvs.current?.parentNode) cvs.current.parentNode.removeChild(cvs.current);
    };
  }, []);

  const celebrate = useCallback((ox: number, oy: number, count = 40) => {
    if (!cvs.current) {
      const c = document.createElement("canvas");
      c.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
      c.width = window.innerWidth; c.height = window.innerHeight;
      document.body.appendChild(c);
      cvs.current = c;
    }
    const c = cvs.current!;
    c.width = window.innerWidth; c.height = window.innerHeight;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 5;
      pts.current.push({
        x: ox + (Math.random() - 0.5) * 20, y: oy + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp - 1.5,
        sz: 4 + Math.random() * 6, c: CC[Math.floor(Math.random() * CC.length)],
        r: Math.random() * Math.PI * 2, rs: (Math.random() - 0.5) * 0.18,
        s: [0, 0, 1, 2][Math.floor(Math.random() * 4)], l: 0, m: 80 + Math.random() * 50,
      });
    }
    if (!on.current) { on.current = true; raf.current = requestAnimationFrame(drawRef.current); }
  }, []);

  return celebrate;
}

function getCenter(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function starCount(n: number) { return [8, 16, 26, 40, 60][n - 1]; }

// ─── Sub-components ──────────────────────────────────────────────────────────

function TInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [f, setF] = useState(false);
  return (
    <input {...props}
      onFocus={(e) => { setF(true); props.onFocus?.(e); }}
      onBlur={(e) => { setF(false); props.onBlur?.(e); }}
      style={{
        width: "100%", borderRadius: 10, padding: "13px 16px",
        fontFamily: "'Satoshi',sans-serif", fontSize: 16, lineHeight: "24px",
        fontWeight: 300, color: T.ink, outline: "none", boxSizing: "border-box",
        background: f ? T.white : "rgba(252,250,247,1)",
        border: f ? `2px solid ${T.green}` : `1.5px solid ${T.border}`,
        boxShadow: f ? "0 0 0 3px rgba(18,83,92,0.08)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    />
  );
}

function TArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [f, setF] = useState(false);
  return (
    <textarea {...props}
      onFocus={(e) => { setF(true); props.onFocus?.(e); }}
      onBlur={(e) => { setF(false); props.onBlur?.(e); }}
      style={{
        width: "100%", borderRadius: 10, padding: "13px 16px",
        fontFamily: "'Satoshi',sans-serif", fontSize: 16, lineHeight: "24px",
        fontWeight: 300, color: T.ink, outline: "none", boxSizing: "border-box",
        resize: "vertical", minHeight: 96,
        background: f ? T.white : "rgba(252,250,247,1)",
        border: f ? `2px solid ${T.green}` : `1.5px solid ${T.border}`,
        boxShadow: f ? "0 0 0 3px rgba(18,83,92,0.08)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    />
  );
}

function ChipGroup({ opts, val, onChange, onFirstPick, showOtra = false, otraVal = "", onOtraChange }: {
  opts: string[]; val: string; onChange: (v: string) => void;
  onFirstPick: (x: number, y: number) => void;
  showOtra?: boolean; otraVal?: string; onOtraChange?: (v: string) => void;
}) {
  const [otraFocused, setOtraFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (val === "Otra") setTimeout(() => inputRef.current?.focus(), 50); }, [val]);
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {opts.map((o) => {
          const sel = val === o;
          return (
            <button key={o} type="button"
              onClick={(e) => {
                const first = !val; onChange(o);
                if (first) { const { x, y } = getCenter(e.currentTarget); onFirstPick(x, y); }
              }}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                borderRadius: 999, padding: "9px 18px", cursor: "pointer",
                fontFamily: "'Satoshi',sans-serif", fontSize: 15, lineHeight: "22px",
                whiteSpace: "nowrap",
                background: sel ? "rgba(18,83,92,0.08)" : "rgba(252,250,247,1)",
                border: sel ? `1.5px solid ${T.green}` : `1.5px solid ${T.border}`,
                color: sel ? T.green : T.ink, fontWeight: sel ? 500 : 400,
                transition: "background 0.15s, border-color 0.15s, color 0.15s",
                WebkitTapHighlightColor: "transparent",
              }}
            >{o}</button>
          );
        })}
      </div>
      {showOtra && val === "Otra" && (
        <div style={{ marginTop: 10 }}>
          <input ref={inputRef} type="text" placeholder="¿Cuál clase tomaste?" value={otraVal}
            onChange={(e) => onOtraChange?.(e.target.value)}
            onFocus={() => setOtraFocused(true)} onBlur={() => setOtraFocused(false)}
            style={{
              width: "100%", borderRadius: 10, padding: "13px 16px",
              fontFamily: "'Satoshi',sans-serif", fontSize: 16, fontWeight: 300, color: T.ink,
              outline: "none", boxSizing: "border-box" as const,
              background: otraFocused ? T.white : "rgba(252,250,247,1)",
              border: otraFocused ? `2px solid ${T.green}` : `1.5px solid ${T.border}`,
              boxShadow: otraFocused ? "0 0 0 3px rgba(18,83,92,0.08)" : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          />
        </div>
      )}
    </div>
  );
}

function Stars({ val, onChange, lo, hi, onPick }: {
  val: number; onChange: (v: number) => void; lo?: string; hi?: string;
  onPick: (x: number, y: number, n: number) => void;
}) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button"
            onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
            onClick={(e) => { onChange(n); const { x, y } = getCenter(e.currentTarget); onPick(x, y, n); }}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              flex: 1, aspectRatio: "1", maxWidth: 64, fontSize: "clamp(32px,9vw,48px)",
              lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
              color: n <= (hov || val) ? T.green : "rgba(64,60,60,0.2)",
              transform: hov === n ? "scale(1.12)" : "scale(1)",
              transition: "transform 0.12s, color 0.12s", WebkitTapHighlightColor: "transparent",
            }}
          >★</button>
        ))}
      </div>
      {(lo || hi) && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 400, color: T.inkMuted, fontStyle: "italic" }}>{lo}</span>
          <span style={{ fontSize: 13, fontWeight: 400, color: T.inkMuted, fontStyle: "italic", textAlign: "right" }}>{hi}</span>
        </div>
      )}
    </div>
  );
}

function Fld({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24, width: "100%" }}>
      <label style={{ display: "block", fontSize: 16, lineHeight: "24px", fontWeight: 400, color: T.ink, marginBottom: 10 }}>
        {l}
      </label>
      {children}
    </div>
  );
}

function Sec({ c }: { c: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, fontSize: 11, lineHeight: "18px",
      fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: T.inkMuted,
      marginBottom: 20, marginTop: 36, paddingBottom: 12, borderBottom: `1px solid ${T.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, flexShrink: 0 }} />
      {c}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SatisfaccionClasesPage() {
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const celebrate = useConfetti();
  const done = useRef(new Set<string>());

  const [form, setForm] = useState({
    nombre: "", clase: "", claseOtra: "", experiencia: 0, claridad: 0,
    acompanamiento: "", ritmo: "", materiales: "", comodidad: "",
    lo_mejor: "", mejoras: "", regresar: "", nuevas_clases: "",
    recomendacion: "", comentario_extra: "",
  });

  const set = (k: string) => (v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const once = useCallback((k: string, x: number, y: number) => {
    if (!done.current.has(k)) { done.current.add(k); celebrate(x, y); }
  }, [celebrate]);

  const onBlurText = (k: string, e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.value.trim()) { const { x, y } = getCenter(e.target); once(k, x, y); }
  };

  const claseEnvio = form.clase === "Otra"
    ? (form.claseOtra.trim() ? `Otra: ${form.claseOtra.trim()}` : "Otra")
    : form.clase;

  const onStarPick = useCallback((x: number, y: number, n: number) => {
    celebrate(x, y, starCount(n));
  }, [celebrate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clase) { setError("Por favor indica la clase que tomaste."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Nueva respuesta de ${form.nombre || "Anónimo"} — Satisfacción clases Papela`,
          Nombre: form.nombre || "Anónimo",
          "Clase tomada": claseEnvio,
          "Experiencia general": `${form.experiencia}/5 ★`,
          "Claridad de la maestra": `${form.claridad}/5 ★`,
          "Acompañamiento": form.acompanamiento || "—",
          Ritmo: form.ritmo || "—",
          Materiales: form.materiales || "—",
          Comodidad: form.comodidad || "—",
          "Lo que más le gustó": form.lo_mejor || "—",
          "Qué mejoraría": form.mejoras || "—",
          "¿Regresaría?": form.regresar || "—",
          "Clases sugeridas": form.nuevas_clases || "—",
          "¿Recomendaría?": form.recomendacion || "—",
          "Comentario extra": form.comentario_extra || "—",
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setLoading(false); setOk(true);
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        celebrate(cx, cy, 60);
        setTimeout(() => celebrate(cx - 100, cy - 50, 40), 200);
        setTimeout(() => celebrate(cx + 100, cy - 50, 40), 350);
      } else {
        setError("Hubo un error al enviar. Intenta de nuevo."); setLoading(false);
      }
    } catch {
      setError("No se pudo conectar. Revisa tu internet e intenta de nuevo."); setLoading(false);
    }
  };

  if (ok) return (
    <div style={{
      position: "fixed", inset: 0, background: "rgb(252,250,247)",
      fontFamily: "'Satoshi',sans-serif", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "40px 24px", zIndex: 100,
    }}>
      <div style={{
        width: "100%", maxWidth: 520, background: T.white, borderRadius: 24,
        padding: "64px 48px", border: `1px solid ${T.border}`,
        boxShadow: "0 4px 40px rgba(64,60,60,0.07)", textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72, background: "rgba(18,83,92,0.1)", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px",
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M7 16L13 22L25 10" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{
          fontFamily: "'PP Editorial New',serif", fontSize: 36, lineHeight: 1.2,
          fontWeight: 300, color: T.ink, marginBottom: 16,
        }}>
          ¡Gracias por ayudarnos a mejorar!
        </h2>
        <p style={{ fontSize: 17, lineHeight: "26px", fontWeight: 400, color: T.inkSoft, maxWidth: 340, margin: "0 auto" }}>
          Tu opinión nos ayuda a crear clases más bonitas, claras y especiales para ti.
        </p>
        <div style={{ marginTop: 40, fontSize: 22, lineHeight: 1, letterSpacing: "0.1em", opacity: 0.4, color: T.green }}>
          ✦ ✧ ✦
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: "rgb(252,250,247)",
      fontFamily: "'Satoshi',sans-serif", color: T.ink,
      display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px 80px",
    }}>
      <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Header */}
        <section style={{ width: "100%", textAlign: "center", padding: "64px 0 48px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, background: T.cremita,
            color: T.cafe, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em",
            textTransform: "uppercase", padding: "7px 18px", borderRadius: 999, marginBottom: 28,
          }}>
            ✦ Satisfacción de clases
          </div>
          <h1 style={{
            fontFamily: "'PP Editorial New',serif", fontSize: "clamp(36px,6vw,52px)",
            lineHeight: 1.1, fontWeight: 300, letterSpacing: "-0.02em", color: T.ink, marginBottom: 20,
          }}>
            Queremos mejorar<br />
            <em style={{ fontStyle: "italic", color: T.terracota }}>tus clases en Papela</em>
          </h1>
          <p style={{ fontSize: 17, lineHeight: "26px", fontWeight: 400, color: T.inkSoft, maxWidth: 460, margin: "0 auto 18px" }}>
            Gracias por ser parte de nuestras clases. Tu opinión nos ayuda a mejorar la experiencia, el espacio y la forma en que acompañamos tu proceso creativo.
          </p>
          <span style={{ fontSize: 14, color: T.inkMuted, fontStyle: "italic" }}>
            ⏱ Te tomará menos de 2 minutos responder.
          </span>
        </section>

        {/* Card */}
        <div style={{
          width: "100%", background: T.white, borderRadius: 24, padding: "44px 40px",
          border: `1px solid ${T.border}`, boxShadow: "0 4px 40px rgba(64,60,60,0.07)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Top gradient bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg,rgba(197,117,90,1),rgb(243,230,207),rgb(18,83,92))",
            borderRadius: "24px 24px 0 0",
          }} />

          <form onSubmit={submit} noValidate>
            <Sec c="Sobre ti" />
            <Fld l="Nombre (Opcional)">
              <TInput type="text" placeholder="Tu nombre" value={form.nombre}
                onChange={(e) => set("nombre")(e.target.value)}
                onBlur={(e) => onBlurText("nombre", e)} />
            </Fld>
            <Fld l="¿Qué clase tomaste en Papela? *">
              <ChipGroup opts={CLASES} val={form.clase}
                onChange={(v) => { set("clase")(v); if (v !== "Otra") set("claseOtra")(""); }}
                onFirstPick={(x, y) => once("clase", x, y)}
                showOtra otraVal={form.claseOtra} onOtraChange={(v) => set("claseOtra")(v)} />
            </Fld>

            <Sec c="Tu experiencia" />
            <Fld l="¿Cómo calificarías tu experiencia general?">
              <Stars val={form.experiencia} onChange={set("experiencia")} lo="No me gustó" hi="Me encantó" onPick={onStarPick} />
            </Fld>
            <Fld l="¿La maestra explicó de forma clara?">
              <Stars val={form.claridad} onChange={set("claridad")} lo="Nada clara" hi="Muy clara" onPick={onStarPick} />
            </Fld>
            <Fld l="¿Sentiste que recibiste suficiente acompañamiento durante la clase?">
              <ChipGroup opts={["Sí, totalmente", "Más o menos", "No mucho"]} val={form.acompanamiento}
                onChange={(v) => set("acompanamiento")(v)} onFirstPick={(x, y) => once("acompanamiento", x, y)} />
            </Fld>
            <Fld l="¿El ritmo de la clase te pareció adecuado?">
              <ChipGroup opts={["Muy rápido", "Adecuado", "Muy lento"]} val={form.ritmo}
                onChange={(v) => set("ritmo")(v)} onFirstPick={(x, y) => once("ritmo", x, y)} />
            </Fld>
            <Fld l="¿Los materiales fueron suficientes y adecuados para la actividad?">
              <ChipGroup opts={["Sí", "No", "Parcialmente"]} val={form.materiales}
                onChange={(v) => set("materiales")(v)} onFirstPick={(x, y) => once("materiales", x, y)} />
            </Fld>
            <Fld l="¿Cómo te sentiste durante la clase?">
              <ChipGroup opts={["Muy cómodo/a", "Cómodo/a", "Neutral", "Un poco incómodo/a", "Incómodo/a"]}
                val={form.comodidad} onChange={(v) => set("comodidad")(v)}
                onFirstPick={(x, y) => once("comodidad", x, y)} />
            </Fld>

            <Sec c="Tu opinión" />
            <Fld l="¿Qué fue lo que más te gustó de la clase?">
              <TArea placeholder="Cuéntanos qué disfrutaste más" value={form.lo_mejor}
                onChange={(e) => set("lo_mejor")(e.target.value)} onBlur={(e) => onBlurText("lo_mejor", e)} />
            </Fld>
            <Fld l="¿Qué crees que podríamos mejorar?">
              <TArea placeholder="Tu opinión nos ayuda muchísimo" value={form.mejoras}
                onChange={(e) => set("mejoras")(e.target.value)} onBlur={(e) => onBlurText("mejoras", e)} />
            </Fld>
            <Fld l="¿Te gustaría seguir tomando clases en Papela?">
              <ChipGroup opts={["Sí", "No", "Tal vez"]} val={form.regresar}
                onChange={(v) => set("regresar")(v)} onFirstPick={(x, y) => once("regresar", x, y)} />
            </Fld>
            <Fld l="¿Qué tipo de clases te gustaría que agregáramos?">
              <TArea placeholder="Ej. Acuarela, dibujo, lettering, cerámica, bordado..." value={form.nuevas_clases}
                onChange={(e) => set("nuevas_clases")(e.target.value)} onBlur={(e) => onBlurText("nuevas_clases", e)} />
            </Fld>

            <Sec c="Recomendación" />
            <Fld l="¿Recomendarías nuestras clases a alguien más?">
              <ChipGroup opts={["Sí", "No", "Tal vez"]} val={form.recomendacion}
                onChange={(v) => set("recomendacion")(v)} onFirstPick={(x, y) => once("recomendacion", x, y)} />
            </Fld>
            <Fld l="Comentario extra o mensaje para la maestra">
              <TArea placeholder="Escríbenos cualquier sugerencia o comentario adicional" value={form.comentario_extra}
                onChange={(e) => set("comentario_extra")(e.target.value)} onBlur={(e) => onBlurText("comentario_extra", e)} />
            </Fld>

            {/* Submit */}
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: `1px solid ${T.border}` }}>
              <button type="submit" disabled={loading} style={{
                width: "100%", background: loading ? "rgba(18,83,92,0.6)" : T.green,
                color: "#fff", border: "none", borderRadius: 12, padding: "17px 32px",
                fontFamily: "'Satoshi',sans-serif", fontSize: 16, fontWeight: 500,
                letterSpacing: "0.02em", cursor: loading ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {loading ? "Enviando..." : (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Enviar mi opinión
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M7 4.5L11.5 9L7 13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
              {error && (
                <p style={{
                  background: "rgba(140,72,42,0.08)", border: "1.5px solid rgba(140,72,42,0.3)",
                  borderRadius: 10, padding: "12px 16px", fontSize: 14, color: T.terracota,
                  marginTop: 12, textAlign: "center",
                }}>{error}</p>
              )}
              <p style={{ textAlign: "center", fontSize: 12, color: T.inkMuted, marginTop: 12, fontStyle: "italic" }}>
                Tu respuesta es confidencial y nos ayuda a mejorar. ✦
              </p>
            </div>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: T.inkMuted, marginTop: 48, fontStyle: "italic" }}>
          Con cariño desde Puebla · Papela Atelier
        </p>
      </div>
    </div>
  );
}
