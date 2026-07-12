"use client";

// Tarjeta de lealtad del Club Creativo Papela — /club/[token].
// Los DATOS viven en el admin (admin.papela-atelier.com); esta vista los lee
// de su API pública y solo los presenta. Pase VERTICAL estilo wallet en una
// sola tarjeta: header, sellos tipo sticker, miembro y talón con nº de socio
// + QR. El miembro puede PERSONALIZAR su tarjeta (tema, textura, holo y
// "cositas"); la elección se guarda vía PATCH al mismo endpoint.
//
// Los gradientes/texturas de los temas son DECORATIVOS (material del pase);
// la estructura de la página usa los tokens del sitio.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const ADMIN_API = "https://admin.papela-atelier.com/api/public/club";
const MAX_SELLOS = 10;

// Colección de stickers Papela: cada sello revela una ilustración distinta.
const STICKERS = ["✂️", "🖌️", "🌷", "💌", "🧵", "🎨", "📖", "🎀", "✏️", "✨"];
// Rotación fija por posición (look de sticker pegado a mano, estable entre renders).
const GIROS = [-6, 4, -3, 7, -8, 5, -4, 8, -5, 3];

// ── Personalización (whitelist — debe coincidir con el API del admin) ──

type TemaId = "verde" | "rosa" | "terra" | "lavanda" | "cielo" | "noche";
type TexturaId = "ninguna" | "puntos" | "rayas" | "cuadricula" | "grano";
type Estilo = { tema: TemaId; textura: TexturaId; holo: boolean; charms: string[] };

const ESTILO_DEFAULT: Estilo = { tema: "verde", textura: "ninguna", holo: true, charms: [] };

const TEMAS: Record<TemaId, { nombre: string; grad: string }> = {
  verde:   { nombre: "Verde Papela", grad: "linear-gradient(165deg, #0d3f47 0%, #12535C 45%, #1a6a75 100%)" },
  rosa:    { nombre: "Rosa",         grad: "linear-gradient(165deg, #8f1d4e 0%, #c2255c 45%, #e0578d 100%)" },
  terra:   { nombre: "Terra",        grad: "linear-gradient(165deg, #8a4629 0%, #C4704A 45%, #d98d63 100%)" },
  lavanda: { nombre: "Lavanda",      grad: "linear-gradient(165deg, #4a3d80 0%, #6f5bb5 45%, #9b8ad6 100%)" },
  cielo:   { nombre: "Cielo",        grad: "linear-gradient(165deg, #1d4e79 0%, #2e6ea3 45%, #5ba0cf 100%)" },
  noche:   { nombre: "Noche",        grad: "linear-gradient(165deg, #17181c 0%, #2a2c33 45%, #3d4049 100%)" },
};

// Ruido SVG para la textura "grano" (data URI, sin assets externos).
const GRANO_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

const TEXTURAS: Record<TexturaId, { nombre: string; style: React.CSSProperties | null }> = {
  ninguna: { nombre: "Lisa", style: null },
  puntos: {
    nombre: "Puntitos",
    style: {
      backgroundImage: "radial-gradient(rgba(255,255,255,.3) 1.2px, transparent 1.7px)",
      backgroundSize: "16px 16px",
    },
  },
  rayas: {
    nombre: "Rayitas",
    style: {
      backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.14) 0 10px, transparent 10px 26px)",
    },
  },
  cuadricula: {
    nombre: "Cuadrícula",
    style: {
      backgroundImage:
        "linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)",
      backgroundSize: "22px 22px",
    },
  },
  grano: { nombre: "Grano", style: { backgroundImage: GRANO_URI } },
};

const CHARMS = ["🌷", "🎀", "✨", "🧵", "🍓", "🌙", "🦋", "🍰", "🐚", "🍒"];
const MAX_CHARMS = 4;
// Posiciones fijas para las cositas (esquinas de la zona de sellos).
const CHARM_POS: React.CSSProperties[] = [
  { top: "4%", left: "3%", transform: "rotate(-14deg)" },
  { top: "6%", right: "3%", transform: "rotate(10deg)" },
  { bottom: "5%", left: "4%", transform: "rotate(8deg)" },
  { bottom: "7%", right: "4%", transform: "rotate(-10deg)" },
];

type Tarjeta = { nombre: string; sellos: number; desde: string; numero: string; estilo: Estilo };

function fechaLarga(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

// prefers-reduced-motion como store externo (evita setState dentro del efecto).
function subscribeReducida(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducida,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false, // SSR: asumir movimiento normal
  );
}

// Capas decorativas del pase: textura + acabado holográfico.
function DecorBloque({ estilo, reducida, animada }: { estilo: Estilo; reducida: boolean; animada?: boolean }) {
  const textura = TEXTURAS[estilo.textura].style;
  return (
    <>
      {textura && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{ ...textura, mixBlendMode: "overlay", opacity: 0.9 }} />
      )}
      {estilo.holo && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none ${animada && !reducida ? "club-holo-idle" : ""}`}
          style={{
            background:
              "linear-gradient(115deg, transparent 12%, rgba(255,119,168,.34) 30%, rgba(120,220,232,.38) 42%, rgba(255,232,150,.3) 54%, rgba(168,140,255,.34) 66%, transparent 84%)",
            backgroundSize: "250% 250%",
            mixBlendMode: "color-dodge",
            opacity: 0.8,
          }}
        />
      )}
    </>
  );
}

export default function TarjetaClub() {
  const { token } = useParams<{ token: string }>();
  const [tarjeta, setTarjeta] = useState<Tarjeta | null>(null);
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
  const [estilo, setEstilo] = useState<Estilo>(ESTILO_DEFAULT);
  const [qr, setQr] = useState<string | null>(null);
  const reducida = useReducedMotion();

  // Editor de personalización (bottom sheet)
  const [editor, setEditor] = useState(false);
  const [draft, setDraft] = useState<Estilo>(ESTILO_DEFAULT);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  // Tilt 3D: rx/ry en grados, px/py = posición del puntero (%) para el brillo.
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 50, py: 50, activo: false });

  useEffect(() => {
    if (!token) return;
    fetch(`${ADMIN_API}/${token}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setTarjeta(json);
        setEstilo(json.estilo ?? ESTILO_DEFAULT);
        setEstado("ok");
      })
      .catch(() => setEstado("error"));
  }, [token]);

  // QR con el link privado del pase (client-side, sin backend).
  useEffect(() => {
    if (estado !== "ok") return;
    import("qrcode")
      .then((q) =>
        q.toDataURL(window.location.href, {
          margin: 0,
          width: 200,
          color: { dark: "#403c3c", light: "#00000000" },
        }),
      )
      .then(setQr)
      .catch(() => {});
  }, [estado]);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducida || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
    setTilt({ ry: (x - 0.5) * 10, rx: -(y - 0.5) * 8, px: x * 100, py: y * 100, activo: true });
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0, px: 50, py: 50, activo: false });
  }

  function abrirEditor() {
    setDraft(estilo);
    setErrorGuardar(null);
    setEditor(true);
  }

  async function guardarEstilo() {
    setGuardando(true);
    setErrorGuardar(null);
    try {
      const res = await fetch(`${ADMIN_API}/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estilo: draft }),
      });
      const json = await res.json();
      if (res.status === 404) throw new Error("Este link ya no es válido — pide uno nuevo en Papela Atelier.");
      if (!res.ok) throw new Error(json.error ?? "No se pudo guardar, intenta de nuevo.");
      setEstilo(json.estilo);
      setEditor(false);
    } catch (e: unknown) {
      setErrorGuardar((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  const sellos = tarjeta?.sellos ?? 0;
  const completa = sellos >= MAX_SELLOS;
  // El pase se pinta con el DRAFT mientras el editor está abierto (preview en vivo).
  const vista = editor ? draft : estilo;
  const grad = TEMAS[vista.tema].grad;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center px-5 pt-8 pb-16">
      <style>{`
        @keyframes club-sticker-pop {
          0% { opacity: 0; transform: scale(0.2) rotate(20deg); }
          70% { transform: scale(1.15) rotate(var(--giro)); }
          100% { opacity: 1; transform: scale(1) rotate(var(--giro)); }
        }
        @keyframes club-holo-drift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes club-confeti {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(140px) rotate(320deg); }
        }
        .club-sticker { animation: club-sticker-pop .45s cubic-bezier(.2,1.4,.4,1) both; }
        .club-holo-idle { animation: club-holo-drift 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .club-sticker { animation: none; opacity: 1; transform: rotate(var(--giro)); }
          .club-holo-idle { animation: none; }
        }
      `}</style>

      {/* Logo → página principal */}
      <Link href="/" className="mb-7 mt-1" aria-label="Ir a Papela Atelier">
        <Image src="/images/Logo-papela-verde.svg" alt="Papela Atelier" width={56} height={56} className="h-14 w-14" />
      </Link>

      {estado === "cargando" && (
        <div className="w-full max-w-[380px] rounded-3xl bg-white/60 border border-[var(--color-border)] animate-pulse h-[560px]" />
      )}

      {estado === "error" && (
        <div className="text-center max-w-sm space-y-3 mt-8">
          <p className="text-4xl" aria-hidden="true">🎫</p>
          <h1 className="font-serif text-2xl text-[var(--color-text)]">Tarjeta no encontrada</h1>
          <p className="text-base text-[var(--color-muted)]">
            Este link ya no es válido. Pregunta en Papela Atelier por tu tarjeta del Club Creativo.
          </p>
        </div>
      )}

      {estado === "ok" && tarjeta && (
        <>
          {/* ── Pase vertical estilo wallet (UNA sola tarjeta) ── */}
          <div style={{ perspective: "1100px" }} className="w-full max-w-[380px]">
            <div
              ref={cardRef}
              onPointerMove={onMove}
              onPointerLeave={onLeave}
              className="rounded-3xl overflow-hidden select-none touch-none"
              style={{
                transform: reducida ? undefined : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transition: tilt.activo ? "transform .08s linear" : "transform .5s ease",
                transformStyle: "preserve-3d",
                filter: "drop-shadow(0 24px 40px rgba(18,83,92,0.28))",
              }}
            >
              {/* Cuerpo de color (header + sellos + miembro) */}
              <div className="relative overflow-hidden" style={{ background: grad }}>
                <DecorBloque estilo={vista} reducida={reducida} animada />

                {/* Header */}
                <div className="relative flex items-start justify-between gap-3 p-5 pb-2">
                  <p className="font-sans font-black uppercase leading-[0.95] tracking-tight text-white text-[34px]">
                    Club<br />Creativo
                  </p>
                  <div className="bg-[var(--color-bg)] rounded-2xl px-3 py-2 text-right flex-shrink-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-text)] leading-tight">
                      Papela Atelier
                    </p>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] leading-tight mt-0.5">
                      Pase de miembro
                    </p>
                  </div>
                </div>

                {/* Sellos (las cositas decoran esta zona) */}
                <div className="relative px-5 pt-4 pb-5">
                  {vista.charms.map((c, i) => (
                    <span key={`${c}-${i}`} aria-hidden="true"
                      className="absolute text-2xl pointer-events-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
                      style={CHARM_POS[i % CHARM_POS.length]}>
                      {c}
                    </span>
                  ))}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">Mis sellos</p>
                    <span className="text-[11px] font-semibold text-white bg-white/15 border border-white/25 rounded-full px-3 py-0.5 backdrop-blur-sm">
                      {sellos} / {MAX_SELLOS}
                    </span>
                  </div>
                  <div
                    className="grid grid-cols-5 gap-y-4 justify-items-center"
                    role="img"
                    aria-label={`${sellos} de ${MAX_SELLOS} sellos`}
                  >
                    {Array.from({ length: MAX_SELLOS }, (_, i) => {
                      const lleno = i < sellos;
                      return lleno ? (
                        <span
                          key={i}
                          className="club-sticker flex items-center justify-center w-12 h-12 rounded-full bg-white text-xl shadow-[0_3px_8px_rgba(0,0,0,0.3)] ring-2 ring-white/60"
                          style={{ "--giro": `${GIROS[i]}deg`, animationDelay: `${i * 70}ms` } as React.CSSProperties}
                          aria-hidden="true"
                        >
                          {STICKERS[i]}
                        </span>
                      ) : (
                        <span
                          key={i}
                          className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-white/35 text-white/40 text-xs font-semibold"
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Miembro */}
                <div className="relative p-5 pt-1">
                  <p className="font-serif text-2xl text-white leading-snug break-words">{tarjeta.nombre}</p>
                  <div className="flex items-end justify-between gap-3 mt-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">Miembro desde</p>
                      <p className="text-xs text-white/85 mt-0.5">{fechaLarga(tarjeta.desde)}</p>
                    </div>
                    <span className="text-white/50 text-lg" aria-hidden="true">❋</span>
                  </div>
                </div>

                {/* Confeti al completar la tarjeta */}
                {completa && !reducida && (
                  <div aria-hidden="true" className="absolute inset-x-0 top-0 pointer-events-none">
                    {Array.from({ length: 14 }, (_, i) => (
                      <span
                        key={i}
                        className="absolute text-sm"
                        style={{
                          left: `${(i * 7.3 + 4) % 100}%`,
                          top: `${(i * 13) % 30}%`,
                          animation: `club-confeti ${1.6 + (i % 5) * 0.3}s ease-in ${i * 0.12}s infinite`,
                        }}
                      >
                        {["🎉", "✨", "🎊"][i % 3]}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Talón — número de socio + QR (misma tarjeta, corte punteado) */}
              <div className="relative bg-[var(--color-bg)] border-t-2 border-dashed border-[var(--color-border)] p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted)]">N.º de socio</p>
                  <p className="font-mono text-lg text-[var(--color-text)] tracking-[0.14em] mt-0.5">{tarjeta.numero}</p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-1.5">papela-atelier.com</p>
                </div>
                {qr && (
                  // eslint-disable-next-line @next/next/no-img-element -- data URI generado en el cliente
                  <img src={qr} alt="Código QR de tu tarjeta" className="w-[76px] h-[76px] flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Personalizar */}
          <button
            onClick={abrirEditor}
            className="mt-5 px-6 py-3 rounded-full border-2 border-[var(--color-verde)] bg-transparent text-sm font-sans font-semibold text-[var(--color-verde)] hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition-all duration-300"
          >
            🎨 Personalizar mi tarjeta
          </button>

          {/* Leyenda */}
          <div className="text-center mt-5 space-y-1 max-w-sm">
            {completa ? (
              <>
                <p className="font-serif text-xl text-[var(--color-verde)]">¡Tarjeta completa! 🎉</p>
                <p className="text-sm text-[var(--color-muted)]">
                  Visítanos en Papela Atelier para elegir tu recompensa:
                  una clase gratis o 25% de descuento en papelería.
                </p>
              </>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">
                Junta {MAX_SELLOS} stickers y elige una clase creativa gratis o 25% de descuento en tu compra.
              </p>
            )}
          </div>

          {/* ── Editor de personalización (bottom sheet) ── */}
          {editor && (
            <div role="dialog" aria-modal="true" aria-label="Personalizar mi tarjeta"
              className="fixed inset-0 z-[100002] flex items-end sm:items-center justify-center">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditor(false)} aria-hidden="true" />
              <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-white px-5 pt-5 pb-3 flex items-center justify-between border-b border-[var(--color-border)]">
                  <h2 className="font-serif text-lg text-[var(--color-text)]">Personalizar mi tarjeta</h2>
                  <button onClick={() => setEditor(false)} aria-label="Cerrar"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-cremita-3)] transition">
                    ✕
                  </button>
                </div>

                <div className="px-5 py-4 space-y-5">
                  {/* Tema */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-2">Color</p>
                    <div className="flex flex-wrap gap-2.5">
                      {(Object.keys(TEMAS) as TemaId[]).map((t) => (
                        <button key={t} onClick={() => setDraft(d => ({ ...d, tema: t }))}
                          aria-label={TEMAS[t].nombre} aria-pressed={draft.tema === t} title={TEMAS[t].nombre}
                          className={`w-11 h-11 rounded-full transition ${
                            draft.tema === t ? "ring-2 ring-[var(--color-verde)] ring-offset-2 scale-105" : "hover:scale-105"
                          }`}
                          style={{ background: TEMAS[t].grad }} />
                      ))}
                    </div>
                  </div>

                  {/* Textura */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-2">Textura</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(TEXTURAS) as TexturaId[]).map((t) => (
                        <button key={t} onClick={() => setDraft(d => ({ ...d, textura: t }))}
                          aria-pressed={draft.textura === t}
                          className={`text-xs px-3.5 py-1.5 rounded-full border-[1.5px] font-sans font-semibold transition ${
                            draft.textura === t
                              ? "bg-[var(--color-verde)] text-[var(--color-cremita)] border-[var(--color-verde)]"
                              : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-verde)] hover:text-[var(--color-verde)]"
                          }`}>
                          {TEXTURAS[t].nombre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Holo */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">Acabado holográfico</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">Brillo iridiscente que se mueve con tu tarjeta.</p>
                    </div>
                    <button type="button" role="switch" aria-checked={draft.holo} aria-label="Acabado holográfico"
                      onClick={() => setDraft(d => ({ ...d, holo: !d.holo }))}
                      className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${
                        draft.holo ? "bg-[var(--color-verde)]" : "bg-[var(--color-border)]"
                      }`}>
                      <span aria-hidden="true"
                        className={`absolute left-0 top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          draft.holo ? "translate-x-[22px]" : "translate-x-0.5"
                        }`} />
                    </button>
                  </div>

                  {/* Cositas */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-1">Cositas creativas</p>
                    <p className="text-xs text-[var(--color-muted)] mb-2">Elige hasta {MAX_CHARMS} para decorar tus sellos.</p>
                    <div className="flex flex-wrap gap-2">
                      {CHARMS.map((c) => {
                        const activo = draft.charms.includes(c);
                        const lleno = draft.charms.length >= MAX_CHARMS;
                        return (
                          <button key={c} aria-pressed={activo} aria-label={`Cosita ${c}`}
                            onClick={() =>
                              setDraft(d => ({
                                ...d,
                                charms: activo ? d.charms.filter(x => x !== c)
                                  : d.charms.length >= MAX_CHARMS ? d.charms : [...d.charms, c],
                              }))
                            }
                            disabled={!activo && lleno}
                            className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center border-[1.5px] transition disabled:opacity-35 disabled:cursor-not-allowed ${
                              activo
                                ? "border-[var(--color-verde)] bg-[var(--color-cremita-3)]"
                                : "border-[var(--color-border)] bg-white hover:border-[var(--color-verde)]"
                            }`}>
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {errorGuardar && <p className="text-xs text-[var(--color-terracota)]">{errorGuardar}</p>}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-[var(--color-border)] px-5 py-4 flex items-center justify-between gap-3">
                  <button onClick={() => setDraft(ESTILO_DEFAULT)}
                    className="text-sm font-sans font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)] transition">
                    Restablecer
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setEditor(false)}
                      className="px-5 py-2.5 rounded-full border-2 border-[var(--color-border)] text-sm font-sans font-semibold text-[var(--color-text)] hover:border-[var(--color-verde)] hover:text-[var(--color-verde)] transition">
                      Cancelar
                    </button>
                    <button onClick={guardarEstilo} disabled={guardando}
                      className="px-5 py-2.5 rounded-full bg-[var(--color-verde)] text-sm font-sans font-semibold text-[var(--color-cremita)] hover:opacity-85 transition disabled:opacity-50">
                      {guardando ? "Guardando…" : "Guardar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
