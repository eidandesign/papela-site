"use client";

// Tarjeta de lealtad del Club Creativo Papela — /club/[token].
// Los DATOS viven en el admin (admin.papela-atelier.com); esta vista los lee
// de su API pública y solo los presenta. Pase VERTICAL estilo wallet en una
// sola tarjeta: header, sellos tipo sticker, miembro y talón con nº de socio
// + QR. El miembro puede PERSONALIZAR su tarjeta (fondo, textura, holo y
// "cositas"); la elección se guarda vía PATCH al mismo endpoint.
//
// FONDOS en dos grupos: colores de marca (tinta blanca) y acabados —
// holográficos pastel y papeles con grano (tinta oscura). Cada fondo define
// su tinta (`ink`) y toda la tipografía/bordes del pase la heredan vía la
// variable CSS --ink (clases .club-ink-* con color-mix), para que el texto
// siempre contraste. Los gradientes/texturas son DECORATIVOS (material del
// pase); la estructura de la página usa los tokens del sitio.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PlanillaClub from "./club/PlanillaClub";
import RascaSticker from "./club/RascaSticker";
import {
  ADMIN_ORIGIN, CLUB_API as ADMIN_API, copiarTexto, stickerSrc,
  type Catalogo, type MensajeClub, type MisStickers,
} from "./club/clubTipos";

// Espacios del preview en la tarjeta (la planilla completa muestra los 100).
const PREVIEW_SLOTS = 6;

// ── Personalización (whitelist — debe coincidir con el API del admin) ──

type TemaId =
  | "verde" | "rosa" | "terra" | "lavanda" | "cielo" | "noche"
  | "limon" | "petalo" | "atardecer" | "algodon" | "menta"
  | "holo" | "aurora" | "prisma" | "papel" | "kraft";
type TexturaId = "ninguna" | "puntos" | "rayas" | "cuadricula" | "rombos" | "confeti" | "grano";
// Cosita decorativa: emoji + posición (%) sobre el cuerpo del pase. Sin x/y
// usa la esquina default de su índice; el miembro la acomoda arrastrándola.
type Charm = { e: string; x?: number; y?: number };
type Estilo = { tema: TemaId; textura: TexturaId; holo: boolean; charms: Charm[] };

const ESTILO_DEFAULT: Estilo = { tema: "verde", textura: "ninguna", holo: true, charms: [] };

// Grano de papel: ruido SVG desaturado y tenue (data URI, sin assets externos).
const PAPEL_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23p)' opacity='0.16'/%3E%3C/svg%3E\")";

type Tema = {
  nombre: string;
  grad: string; // background shorthand (puede llevar varias capas)
  ink: string;  // tinta del texto/bordes sobre este fondo
  claro: boolean; // fondo claro → ajusta el blend del acabado holográfico
  grupo: "color" | "aura" | "acabado";
};

const TEMAS: Record<TemaId, Tema> = {
  // ── Colores de marca (tinta blanca) ──
  verde:   { nombre: "Verde Papela", grupo: "color", ink: "#ffffff", claro: false, grad: "linear-gradient(165deg, #0d3f47 0%, #12535C 45%, #1a6a75 100%)" },
  rosa:    { nombre: "Rosa",         grupo: "color", ink: "#ffffff", claro: false, grad: "linear-gradient(165deg, #8f1d4e 0%, #c2255c 45%, #e0578d 100%)" },
  terra:   { nombre: "Terra",        grupo: "color", ink: "#ffffff", claro: false, grad: "linear-gradient(165deg, #8a4629 0%, #C4704A 45%, #d98d63 100%)" },
  lavanda: { nombre: "Lavanda",      grupo: "color", ink: "#ffffff", claro: false, grad: "linear-gradient(165deg, #4a3d80 0%, #6f5bb5 45%, #9b8ad6 100%)" },
  cielo:   { nombre: "Cielo",        grupo: "color", ink: "#ffffff", claro: false, grad: "linear-gradient(165deg, #1d4e79 0%, #2e6ea3 45%, #5ba0cf 100%)" },
  noche:   { nombre: "Noche",        grupo: "color", ink: "#ffffff", claro: false, grad: "linear-gradient(165deg, #17181c 0%, #2a2c33 45%, #3d4049 100%)" },

  // ── Auras (tinta oscura) — manchas de color difusas y vivas, estilo aura
  // pastel (referencia ubu gohan): grandes radiales que se funden entre sí.
  limon: {
    nombre: "Limón", grupo: "aura", ink: "#403c3c", claro: true,
    grad:
      "radial-gradient(120% 90% at 18% 12%, rgba(255,232,90,.95), transparent 60%), " +
      "radial-gradient(110% 90% at 88% 35%, rgba(126,224,138,.9), transparent 60%), " +
      "radial-gradient(130% 110% at 55% 95%, rgba(91,182,232,.9), transparent 60%), " +
      "linear-gradient(160deg, #fff3b8 0%, #d6f0e2 100%)",
  },
  petalo: {
    nombre: "Pétalo", grupo: "aura", ink: "#403c3c", claro: true,
    grad:
      "radial-gradient(120% 90% at 20% 18%, rgba(255,105,180,.85), transparent 60%), " +
      "radial-gradient(100% 80% at 75% 15%, rgba(255,190,235,.9), transparent 55%), " +
      "radial-gradient(120% 100% at 85% 80%, rgba(150,160,255,.85), transparent 60%), " +
      "linear-gradient(160deg, #ffc9e5 0%, #d9d4ff 100%)",
  },
  atardecer: {
    nombre: "Atardecer", grupo: "aura", ink: "#403c3c", claro: true,
    grad:
      "radial-gradient(120% 90% at 22% 20%, rgba(255,150,64,.9), transparent 60%), " +
      "radial-gradient(120% 90% at 80% 45%, rgba(255,99,146,.85), transparent 60%), " +
      "radial-gradient(130% 110% at 60% 95%, rgba(96,150,235,.85), transparent 60%), " +
      "linear-gradient(160deg, #ffd9a8 0%, #cfe0ff 100%)",
  },
  algodon: {
    nombre: "Algodón", grupo: "aura", ink: "#403c3c", claro: true,
    grad:
      "radial-gradient(110% 90% at 18% 22%, rgba(150,196,255,.8), transparent 60%), " +
      "radial-gradient(110% 90% at 84% 24%, rgba(255,182,220,.85), transparent 60%), " +
      "radial-gradient(120% 110% at 55% 92%, rgba(255,236,150,.85), transparent 60%), " +
      "linear-gradient(160deg, #e4ecff 0%, #ffeeda 100%)",
  },
  menta: {
    nombre: "Menta", grupo: "aura", ink: "#403c3c", claro: true,
    grad:
      "radial-gradient(120% 90% at 20% 18%, rgba(110,226,180,.9), transparent 60%), " +
      "radial-gradient(120% 100% at 85% 30%, rgba(255,240,120,.85), transparent 58%), " +
      "radial-gradient(130% 110% at 60% 95%, rgba(88,196,235,.85), transparent 60%), " +
      "linear-gradient(160deg, #dff7e8 0%, #d2f0fa 100%)",
  },

  // ── Acabados (tinta oscura) ──
  // Seda holográfica: manchas pastel iridiscentes que se funden entre sí.
  holo: {
    nombre: "Holograma", grupo: "acabado", ink: "#403c3c", claro: true,
    grad:
      "radial-gradient(120% 90% at 15% 20%, rgba(255,170,214,.85), transparent 55%), " +
      "radial-gradient(110% 85% at 85% 12%, rgba(150,214,255,.85), transparent 55%), " +
      "radial-gradient(130% 100% at 82% 85%, rgba(255,214,160,.8), transparent 55%), " +
      "radial-gradient(110% 95% at 18% 82%, rgba(186,170,255,.85), transparent 55%), " +
      "linear-gradient(160deg, #ffdcee 0%, #dcecff 45%, #ffedd2 100%)",
  },
  // Remolino pastel con brillitos (dos capas de destellos + giro cónico suave).
  aurora: {
    nombre: "Aurora", grupo: "acabado", ink: "#403c3c", claro: true,
    grad:
      "radial-gradient(rgba(255,255,255,.9) 1px, transparent 1.6px) 8px 12px / 90px 70px, " +
      "radial-gradient(rgba(255,255,255,.75) 1.3px, transparent 2px) 48px 44px / 110px 90px, " +
      "radial-gradient(90% 70% at 50% 45%, rgba(255,255,255,.35), transparent 70%), " +
      "conic-gradient(from 220deg at 55% 40%, #ffd3e4, #ffe4cf 18%, #d9f2e4 36%, #cfe3ff 55%, #e6d7ff 75%, #ffd3e4 100%)",
  },
  // Facetas prismáticas: dos abanicos cónicos pastel que se cruzan.
  prisma: {
    nombre: "Prisma", grupo: "acabado", ink: "#403c3c", claro: true,
    grad:
      "repeating-conic-gradient(from 25deg at 28% 32%, rgba(255,214,235,.75) 0 11%, rgba(214,232,255,.75) 11% 20%, rgba(255,242,214,.75) 20% 32%, rgba(219,246,232,.75) 32% 43%, rgba(233,221,255,.75) 43% 54%), " +
      "repeating-conic-gradient(from 190deg at 72% 70%, #ffe9f4 0 14%, #e7f0ff 14% 26%, #fff6e3 26% 40%, #eaf8f0 40% 52%, #f0e8ff 52% 64%)",
  },
  // Papeles con grano (textura tradicional de papelería).
  papel: {
    nombre: "Papel", grupo: "acabado", ink: "#664917", claro: true,
    grad: `${PAPEL_URI}, linear-gradient(170deg, #f7eeda 0%, #f0e3c6 100%)`,
  },
  kraft: {
    nombre: "Kraft", grupo: "acabado", ink: "#3f2d14", claro: true,
    grad: `${PAPEL_URI}, linear-gradient(170deg, #cba576 0%, #b98f5c 100%)`,
  },
};

const GRUPOS_TEMA: { titulo: string; grupo: Tema["grupo"] }[] = [
  { titulo: "Color", grupo: "color" },
  { titulo: "Auras", grupo: "aura" },
  { titulo: "Acabados", grupo: "acabado" },
];

// Ruido SVG para la textura "grano" (con color, se mezcla en overlay).
const GRANO_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

// Patrones dibujados con currentColor (la capa hereda --ink), así se ven
// tanto en fondos oscuros como claros. `opacidad` calibra cada patrón.
type Textura = { nombre: string; style: React.CSSProperties | null; opacidad?: number; overlay?: boolean };

const TEXTURAS: Record<TexturaId, Textura> = {
  ninguna: { nombre: "Lisa", style: null },
  puntos: {
    nombre: "Puntitos", opacidad: 0.35,
    style: {
      backgroundImage: "radial-gradient(currentColor 1.2px, transparent 1.7px)",
      backgroundSize: "16px 16px",
    },
  },
  rayas: {
    nombre: "Rayitas", opacidad: 0.16,
    style: {
      backgroundImage: "repeating-linear-gradient(45deg, currentColor 0 10px, transparent 10px 26px)",
    },
  },
  cuadricula: {
    nombre: "Cuadrícula", opacidad: 0.22,
    style: {
      backgroundImage:
        "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
      backgroundSize: "22px 22px",
    },
  },
  rombos: {
    nombre: "Rombos", opacidad: 0.25,
    style: {
      backgroundImage:
        "repeating-linear-gradient(45deg, currentColor 0 1.5px, transparent 1.5px 18px), repeating-linear-gradient(-45deg, currentColor 0 1.5px, transparent 1.5px 18px)",
    },
  },
  confeti: {
    nombre: "Confeti", opacidad: 0.4,
    style: {
      backgroundImage:
        "radial-gradient(currentColor 1.6px, transparent 2.2px), radial-gradient(currentColor 1px, transparent 1.5px), radial-gradient(currentColor 2.2px, transparent 2.8px)",
      backgroundSize: "26px 26px, 26px 26px, 34px 34px",
      backgroundPosition: "0 0, 13px 9px, 7px 21px",
    },
  },
  grano: { nombre: "Grano", opacidad: 0.9, overlay: true, style: { backgroundImage: GRANO_URI } },
};

const CHARMS = ["🌷", "🎀", "✨", "🧵", "🍓", "🌙", "🦋", "🍰", "🐚", "🍒"];
const MAX_CHARMS = 4;
// Posiciones default al agregar una cosita (esquinas de la zona de sellos,
// en % del cuerpo del pase) y giro fijo por índice (look pegado a mano).
const CHARM_POS_DEFAULT = [
  { x: 8, y: 34 }, { x: 92, y: 32 }, { x: 9, y: 58 }, { x: 91, y: 60 },
];
const CHARM_GIROS = [-14, 10, 8, -10];

// El API puede devolver charms como strings (formato viejo) u objetos {e,x,y}.
function normalizaCharms(v: unknown): Charm[] {
  if (!Array.isArray(v)) return [];
  return v
    .flatMap((c): Charm[] => {
      if (typeof c === "string") return CHARMS.includes(c) ? [{ e: c }] : [];
      if (c && typeof c === "object") {
        const o = c as { e?: unknown; x?: unknown; y?: unknown };
        if (typeof o.e === "string" && CHARMS.includes(o.e)) {
          return [{
            e: o.e,
            x: typeof o.x === "number" ? o.x : undefined,
            y: typeof o.y === "number" ? o.y : undefined,
          }];
        }
      }
      return [];
    })
    .slice(0, MAX_CHARMS);
}

type Tarjeta = {
  nombre: string;
  desde: string;
  numero: string;
  estilo: Estilo;
  stickers?: MisStickers;
};

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
  const textura = TEXTURAS[estilo.textura];
  const claro = TEMAS[estilo.tema].claro;
  return (
    <>
      {/* Grano fino SIEMPRE presente sobre el fondo (acabado de impresión
          tipo póster riso/grainy gradient, ref. Baugasm/MANS). */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: GRANO_URI, mixBlendMode: "overlay", opacity: 0.45 }} />
      {textura.style && (
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
          style={{
            ...textura.style,
            color: "var(--ink)",
            opacity: textura.opacidad,
            ...(textura.overlay ? { mixBlendMode: "overlay" as const } : {}),
          }} />
      )}
      {estilo.holo && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none ${animada && !reducida ? "club-holo-idle" : ""}`}
          style={{
            background:
              "linear-gradient(115deg, transparent 12%, rgba(255,119,168,.34) 30%, rgba(120,220,232,.38) 42%, rgba(255,232,150,.3) 54%, rgba(168,140,255,.34) 66%, transparent 84%)",
            backgroundSize: "250% 250%",
            // color-dodge quema los fondos claros; ahí el brillo va en overlay suave.
            mixBlendMode: claro ? "overlay" : "color-dodge",
            opacity: claro ? 0.55 : 0.8,
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

  // Álbum de coleccionables: catálogo público (cacheado en CDN) + overlays.
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [planilla, setPlanilla] = useState(false);
  const [rascando, setRascando] = useState(false);
  const [compartido, setCompartido] = useState(false);

  // Campana de notificaciones: mensajes del negocio + aviso de pendientes.
  // Los descartes viven en localStorage por token ("quitar y ver más adelante":
  // la pill se oculta pero todo sigue disponible en la campana).
  const [mensajes, setMensajes] = useState<MensajeClub[]>([]);
  const [campana, setCampana] = useState(false);
  // Inicialización perezosa desde localStorage (los descartes sobreviven
  // recargas; si el storage está bloqueado, la campana funciona sin memoria).
  const [notifs, setNotifs] = useState<{ pillEn: number | null; leidos: string[] }>(() => {
    if (typeof window === "undefined" || !token) return { pillEn: null, leidos: [] };
    try {
      const raw = localStorage.getItem(`papela_club_notifs_${token}`);
      if (raw) return { pillEn: null, leidos: [], ...JSON.parse(raw) };
    } catch { /* storage bloqueado */ }
    return { pillEn: null, leidos: [] };
  });

  function guardaNotifs(n: { pillEn: number | null; leidos: string[] }) {
    setNotifs(n);
    try { localStorage.setItem(`papela_club_notifs_${token}`, JSON.stringify(n)); } catch { /* idem */ }
  }

  useEffect(() => {
    fetch(`${ADMIN_API}/mensajes`)
      .then((res) => res.json())
      .then((json) => { if (Array.isArray(json?.mensajes)) setMensajes(json.mensajes); })
      .catch(() => {});
  }, []);

  // Editor de personalización (bottom sheet)
  const [editor, setEditor] = useState(false);
  const [draft, setDraft] = useState<Estilo>(ESTILO_DEFAULT);
  // Aviso si el guardado en segundo plano falla (el modal cierra al instante).
  const [avisoGuardar, setAvisoGuardar] = useState<string | null>(null);

  // Tilt 3D: rx/ry en grados, px/py = posición del puntero (%) para el brillo.
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, activo: false });

  // Arrastre de cositas: índice en drag + espejo del estilo para persistir al soltar.
  const cuerpoRef = useRef<HTMLDivElement>(null);
  const dragIdx = useRef<number | null>(null);
  const estiloRef = useRef(estilo);
  useEffect(() => { estiloRef.current = estilo; }, [estilo]);

  const cargarTarjeta = useCallback(() => {
    if (!token) return;
    fetch(`${ADMIN_API}/${token}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setTarjeta(json);
        // Sin pendientes, la pill descartada vuelve a estar "armada" para el
        // siguiente sticker que llegue.
        if ((json.stickers?.pendientes ?? 0) === 0) {
          setNotifs((n) => {
            if (n.pillEn === null) return n;
            const limpio = { ...n, pillEn: null };
            try { localStorage.setItem(`papela_club_notifs_${token}`, JSON.stringify(limpio)); } catch { /* sin memoria */ }
            return limpio;
          });
        }
        setEstilo(
          json.estilo
            ? { ...ESTILO_DEFAULT, ...json.estilo, charms: normalizaCharms(json.estilo.charms) }
            : ESTILO_DEFAULT,
        );
        setEstado("ok");
      })
      .catch(() => setEstado("error"));
  }, [token]);

  useEffect(() => { cargarTarjeta(); }, [cargarTarjeta]);

  // Catálogo del álbum (sin datos personales, cacheable).
  useEffect(() => {
    fetch(`${ADMIN_API}/stickers`)
      .then((res) => res.json())
      .then((json) => { if (json?.stickers) setCatalogo(json); })
      .catch(() => {});
  }, []);

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
    // Sin tilt mientras se arrastra una cosita (mueve el plano bajo el cursor).
    if (reducida || !cardRef.current || dragIdx.current !== null) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
    setTilt({ ry: (x - 0.5) * 10, rx: -(y - 0.5) * 8, activo: true });
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0, activo: false });
  }

  function abrirEditor() {
    setDraft(estilo);
    setAvisoGuardar(null);
    setEditor(true);
  }

  // Persiste el estilo en segundo plano; si falla, avisa bajo la tarjeta.
  function patchEstilo(nuevo: Estilo) {
    fetch(`${ADMIN_API}/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estilo: nuevo }),
    })
      .then((res) => {
        if (res.status === 404) throw new Error("Este link ya no es válido — pide uno nuevo en Papela Atelier.");
        if (!res.ok) throw new Error();
      })
      .catch((e: unknown) => {
        setAvisoGuardar(
          (e as Error)?.message || "No se pudo guardar tu personalización — revisa tu conexión e intenta de nuevo.",
        );
      });
  }

  // Guardar cierra el modal AL INSTANTE (optimista): la tarjeta ya se ve con
  // el draft por el preview en vivo, y el PATCH corre en segundo plano.
  function guardarEstilo() {
    setEstilo(draft);
    setEditor(false);
    setAvisoGuardar(null);
    patchEstilo(draft);
  }

  // ── Arrastre de cositas sobre el cuerpo del pase ──
  // Solo ocurre con el editor CERRADO (abierto, el backdrop cubre la tarjeta),
  // así que siempre mueve el estilo real y se persiste al soltar.
  function moverCharm(i: number, x: number, y: number) {
    setEstilo((s) => ({
      ...s,
      charms: s.charms.map((c, j) => (j === i ? { ...c, x, y } : c)),
    }));
  }

  // El drag va con listeners en window (patrón clásico): más confiable que
  // setPointerCapture y sigue funcionando si el dedo/cursor sale del emoji.
  function charmPointerDown(i: number) {
    return (e: React.PointerEvent<HTMLSpanElement>) => {
      e.preventDefault(); // sin selección de texto ni drag nativo del emoji
      e.stopPropagation();
      dragIdx.current = i;

      const alMover = (ev: PointerEvent) => {
        const idx = dragIdx.current;
        if (idx === null || !cuerpoRef.current) return;
        const r = cuerpoRef.current.getBoundingClientRect();
        const x = Math.min(96, Math.max(4, ((ev.clientX - r.left) / r.width) * 100));
        const y = Math.min(96, Math.max(4, ((ev.clientY - r.top) / r.height) * 100));
        moverCharm(idx, Math.round(x * 10) / 10, Math.round(y * 10) / 10);
      };
      const alSoltar = () => {
        window.removeEventListener("pointermove", alMover);
        window.removeEventListener("pointerup", alSoltar);
        window.removeEventListener("pointercancel", alSoltar);
        if (dragIdx.current === null) return;
        dragIdx.current = null;
        // setTimeout: deja que React confirme la última posición en estiloRef.
        setTimeout(() => patchEstilo(estiloRef.current), 0);
      };
      window.addEventListener("pointermove", alMover);
      window.addEventListener("pointerup", alSoltar);
      window.addEventListener("pointercancel", alSoltar);
    };
  }

  const misStickers = tarjeta?.stickers ?? { obtenidos: 0, pendientes: 0, album: [] };
  const albumTotal = catalogo?.total ?? 100;

  // Pill de aviso: se oculta al descartarla y REAPARECE solo si llegan MÁS
  // pendientes que cuando se descartó (rascar la baja, no la revive). La
  // memoria se resetea al llegar a 0 (en cargarTarjeta). La campana siempre
  // lista el aviso aunque la pill esté oculta.
  const pillVisible =
    misStickers.pendientes > 0 &&
    (notifs.pillEn === null || misStickers.pendientes > notifs.pillEn);
  const noLeidos =
    mensajes.filter((m) => !notifs.leidos.includes(m.id)).length +
    (misStickers.pendientes > 0 ? 1 : 0);

  function abrirCampana() {
    setCampana(true);
    // Abrir la campana marca los mensajes como leídos (el aviso de pendientes
    // no se "lee": sigue contando hasta que se rasquen).
    const leidos = [...new Set([...notifs.leidos, ...mensajes.map((m) => m.id)])];
    if (leidos.length !== notifs.leidos.length) guardaNotifs({ ...notifs, leidos });
  }
  // El pase se pinta con el DRAFT mientras el editor está abierto (preview en vivo).
  const vista = editor ? draft : estilo;
  const tema = TEMAS[vista.tema];

  // Compartir la tarjeta (elección del miembro): share nativo o copiar link.
  async function compartir() {
    const data = { title: "Mi tarjeta del Club Creativo Papela", url: window.location.href };
    if (navigator.share) {
      navigator.share(data).catch(() => {});
    } else if (await copiarTexto(window.location.href)) {
      setCompartido(true);
      setTimeout(() => setCompartido(false), 2000);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center px-5 pt-8 pb-16">
      <style>{`
        @keyframes club-holo-drift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* Deriva ambiental del fondo: TODOS los fondos se mueven (aura viva).
           Recorrido amplio en 3 puntos + giro y zoom para que el color viaje
           visiblemente por el pase. */
        @keyframes club-fondo-drift {
          0%   { transform: translate(-6%, -4%) rotate(-3deg) scale(1.06); }
          33%  { transform: translate(5%, -2%) rotate(2.5deg) scale(1.14); }
          66%  { transform: translate(-2%, 5%) rotate(-1.5deg) scale(1.18); }
          100% { transform: translate(-6%, -4%) rotate(-3deg) scale(1.06); }
        }
        .club-fondo-anim { animation: club-fondo-drift 9s ease-in-out infinite; }
        .club-holo-idle { animation: club-holo-drift 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .club-holo-idle { animation: none; }
          .club-fondo-anim { animation: none; }
        }
        /* Texto FOIL: el glifo se pinta con un gradiente metálico derivado de
           --ink (bandas iridiscentes rosa/blanco/cian). El reflejo es VIVO y
           CONSTANTE: el ángulo del gradiente gira 360° en loop (via @property)
           y la posición recorre el texto, como si la tarjeta se inclinara y la
           letra reflejara la luz desde direcciones cambiantes. */
        @property --foilA {
          syntax: "<angle>";
          inherits: false;
          initial-value: 105deg;
        }
        @keyframes club-foil-vivo {
          0%   { --foilA: 80deg;  background-position: 0% 50%; }
          25%  { --foilA: 170deg; background-position: 65% 10%; }
          50%  { --foilA: 260deg; background-position: 100% 65%; }
          75%  { --foilA: 350deg; background-position: 35% 100%; }
          100% { --foilA: 440deg; background-position: 0% 50%; }
        }
        .club-foil {
          background-image: linear-gradient(var(--foilA),
            var(--ink) 0%,
            color-mix(in srgb, var(--ink) 45%, #ffb6d9) 16%,
            color-mix(in srgb, var(--ink) 8%, #ffffff) 30%,
            color-mix(in srgb, var(--ink) 45%, #a8e6ff) 44%,
            var(--ink) 58%,
            color-mix(in srgb, var(--ink) 55%, #d9c8ff) 74%,
            var(--ink) 88%,
            var(--ink) 100%);
          background-size: 240% 240%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: club-foil-vivo 7s linear infinite;
        }
        @supports not ((-webkit-background-clip: text) or (background-clip: text)) {
          .club-foil { background: none; color: var(--ink); animation: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .club-foil { animation: none; background-position: 50% 50%; }
        }

        /* Tinta adaptativa del pase: cada fondo define --ink y todo hereda. */
        .club-ink { color: var(--ink); }
        .club-ink-85 { color: color-mix(in srgb, var(--ink) 85%, transparent); }
        .club-ink-75 { color: color-mix(in srgb, var(--ink) 75%, transparent); }
        .club-ink-60 { color: color-mix(in srgb, var(--ink) 60%, transparent); }
        .club-ink-50 { color: color-mix(in srgb, var(--ink) 50%, transparent); }
        .club-ink-40 { color: color-mix(in srgb, var(--ink) 45%, transparent); }
        .club-chip {
          background: color-mix(in srgb, var(--ink) 13%, transparent);
          border: 1px solid color-mix(in srgb, var(--ink) 28%, transparent);
        }
        .club-dash { border-color: color-mix(in srgb, var(--ink) 38%, transparent); }
      `}</style>

      {/* Header: logo centrado + campana de notificaciones a la derecha */}
      <div className="w-full max-w-[420px] relative flex justify-center mb-6">
        <Link href="/" className="mt-1" aria-label="Ir a Papela Atelier">
          <Image src="/images/Logo-papela-verde.svg" alt="Papela Atelier" width={80} height={80} className="h-20 w-20" />
        </Link>
        {estado === "ok" && (
          <button onClick={abrirCampana} aria-label={`Notificaciones${noLeidos > 0 ? ` (${noLeidos} nuevas)` : ""}`}
            className="absolute right-0 top-3 w-11 h-11 rounded-full bg-white shadow-[0_2px_10px_rgba(18,83,92,.12)] flex items-center justify-center text-[var(--color-verde)] hover:shadow-[0_4px_14px_rgba(18,83,92,.2)] transition">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 01-3.4 0" />
            </svg>
            {noLeidos > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-terracota)] text-white text-[10px] font-bold flex items-center justify-center">
                {noLeidos}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Aviso de sticker sorpresa — descartable; sigue viva en la campana */}
      {estado === "ok" && pillVisible && (
        <div className="mb-5 flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5"
          style={{
            background: "color-mix(in srgb, var(--color-verde) 10%, #ffffff)",
            border: "1px solid color-mix(in srgb, var(--color-verde) 25%, transparent)",
          }}>
          <span className="text-sm font-semibold text-[var(--color-verde)]">
            🎁 Tienes {misStickers.pendientes} sticker{misStickers.pendientes !== 1 ? "s" : ""} por revelar
          </span>
          <button onClick={() => setRascando(true)}
            className="text-sm font-bold text-[var(--color-verde)] underline underline-offset-2">
            Rascar
          </button>
          <button onClick={() => guardaNotifs({ ...notifs, pillEn: misStickers.pendientes })}
            aria-label="Descartar aviso (queda en la campana)"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-verde)]/60 hover:text-[var(--color-verde)] hover:bg-white/70 transition text-sm">
            ✕
          </button>
        </div>
      )}

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
              className="rounded-3xl overflow-hidden select-none touch-pan-y"
              style={{
                transform: reducida ? undefined : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transition: tilt.activo ? "transform .08s linear" : "transform .5s ease",
                transformStyle: "preserve-3d",
                filter: "drop-shadow(0 24px 40px rgba(18,83,92,0.28))",
                // iOS/Safari: overflow-hidden + border-radius pierde las esquinas
                // cuando un hijo tiene transform animado (el fondo con deriva).
                // El mask fuerza el recorte redondeado en su propia capa.
                isolation: "isolate",
                WebkitMaskImage: "-webkit-radial-gradient(#fff, #000)",
              }}
            >
              {/* Cuerpo de color (header + sellos + miembro) */}
              <div
                ref={cuerpoRef}
                className="relative overflow-hidden"
                style={{ "--ink": tema.ink } as React.CSSProperties}
              >
                {/* Fondo en capa propia, más grande que el pase, con deriva viva */}
                <div
                  aria-hidden="true"
                  className={`absolute -inset-[25%] pointer-events-none ${reducida ? "" : "club-fondo-anim"}`}
                  style={{ background: tema.grad }}
                />
                <DecorBloque estilo={vista} reducida={reducida} animada />

                {/* Header — título editorial en una línea + pill translúcida */}
                <div className="relative flex items-center justify-between gap-3 p-5 pb-2">
                  <p className="club-foil font-serif italic text-[28px] leading-tight whitespace-nowrap">
                    Club Creativo
                  </p>
                  <span className="club-ink club-chip rounded-full px-3.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap flex-shrink-0 backdrop-blur-sm">
                    Miembro
                  </span>
                </div>

                {/* Álbum de stickers — preview de los primeros espacios */}
                <div className="relative px-5 pt-4 pb-5">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <p className="club-ink-75 text-[10px] font-bold uppercase tracking-[0.22em]">Mis stickers</p>
                    <span className="club-ink club-chip text-[11px] font-semibold rounded-full px-3 py-0.5 backdrop-blur-sm">
                      {misStickers.obtenidos} / {albumTotal}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-y-4 justify-items-center"
                    role="img" aria-label={`${misStickers.obtenidos} de ${albumTotal} stickers`}>
                    {Array.from({ length: PREVIEW_SLOTS }, (_, i) => {
                      const orden = i + 1;
                      const sticker = catalogo?.stickers.find((s) => s.orden === orden);
                      const mio = sticker && misStickers.album.find((a) => a.id === sticker.id);
                      const hito = catalogo?.hitos.find((h) => h.en === orden);
                      if (sticker && mio) {
                        return (
                          <span key={orden}
                            className="flex items-center justify-center w-[74px] h-[74px] rounded-full bg-white/90 p-1.5"
                            style={{ boxShadow: "0 3px 8px rgba(0,0,0,.22), 0 0 0 2px color-mix(in srgb, var(--ink) 30%, transparent)" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
                            <img src={stickerSrc(ADMIN_ORIGIN, sticker)} alt={sticker.nombre}
                              className="w-full h-full object-contain" draggable={false} />
                          </span>
                        );
                      }
                      return (
                        <span key={orden}
                          className="club-dash club-ink-40 flex flex-col items-center justify-center w-[74px] h-[74px] rounded-full border-[1.5px] border-dashed text-center leading-tight"
                          aria-hidden="true">
                          <span className="text-xs font-semibold">{orden}</span>
                          {hito && <span className="text-[8.5px] font-medium px-2">Gana un {hito.premio.replace(" de descuento", "")}</span>}
                        </span>
                      );
                    })}
                  </div>

                  <button onClick={() => setPlanilla(true)}
                    className="club-ink-85 block mx-auto mt-4 text-xs font-semibold underline underline-offset-2">
                    Ver mi planilla completa
                  </button>
                </div>

                {/* Miembro */}
                <div className="relative p-5 pt-1 flex items-end justify-between gap-3">
                  <p className="club-foil font-serif text-2xl leading-snug break-words min-w-0">{tarjeta.nombre}</p>
                  <div className="text-right flex-shrink-0">
                    <p className="club-ink-60 text-[9px] font-bold uppercase tracking-[0.2em]">Miembro desde</p>
                    <p className="club-ink-85 text-xs mt-0.5">{fechaLarga(tarjeta.desde)}</p>
                  </div>
                </div>

                {/* Cositas decorativas — arrastrables sobre todo el cuerpo del pase */}
                {vista.charms.map((c, i) => {
                  const def = CHARM_POS_DEFAULT[i % CHARM_POS_DEFAULT.length];
                  return (
                    <span
                      key={`${c.e}-${i}`}
                      role="button"
                      aria-label={`Mover ${c.e}`}
                      onPointerDown={charmPointerDown(i)}
                      className="absolute z-10 text-2xl cursor-grab active:cursor-grabbing drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
                      style={{
                        left: `${c.x ?? def.x}%`,
                        top: `${c.y ?? def.y}%`,
                        transform: `translate(-50%, -50%) rotate(${CHARM_GIROS[i % CHARM_GIROS.length]}deg)`,
                        touchAction: "none",
                      }}
                    >
                      {c.e}
                    </span>
                  );
                })}

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

          {/* Personalizar + compartir */}
          <div className="mt-5 flex items-center gap-2.5">
            <button
              onClick={abrirEditor}
              className="px-7 py-3 rounded-full bg-[var(--color-verde)] text-sm font-sans font-semibold text-[var(--color-cremita)] hover:opacity-85 transition"
            >
              Personalizar tarjeta
            </button>
            <button onClick={compartir} aria-label="Compartir mi tarjeta" title="Compartir mi tarjeta"
              className="w-11 h-11 rounded-full border-2 border-[var(--color-verde)] text-[var(--color-verde)] flex items-center justify-center hover:bg-[var(--color-verde)] hover:text-[var(--color-cremita)] transition">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
            </button>
          </div>

          <div className="text-center mt-4 space-y-1 max-w-sm">
            {compartido && <p className="text-xs text-[var(--color-verde)]">Link copiado ✓</p>}
            {avisoGuardar && <p className="text-xs text-[var(--color-terracota)]">{avisoGuardar}</p>}
          </div>

          {/* ── Campana: avisos y mensajes del Club ── */}
          {campana && (
            <div role="dialog" aria-modal="true" aria-label="Notificaciones del Club"
              className="fixed inset-0 z-[100002]">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setCampana(false)} aria-hidden="true" />
              <div className="absolute right-4 top-16 w-[calc(100%-2rem)] max-w-sm bg-white rounded-3xl shadow-2xl max-h-[70vh] overflow-y-auto">
                <div className="sticky top-0 bg-white px-5 pt-4 pb-3 flex items-center justify-between border-b border-[var(--color-border)]">
                  <h2 className="font-serif italic text-lg text-[var(--color-text)]">Avisos del Club</h2>
                  <button onClick={() => setCampana(false)} aria-label="Cerrar"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-cremita-3)] transition">
                    ✕
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {misStickers.pendientes > 0 && (
                    <button onClick={() => { setCampana(false); setRascando(true); }}
                      className="w-full text-left rounded-2xl p-3.5 flex items-center justify-between gap-3 transition hover:opacity-90"
                      style={{
                        background: "color-mix(in srgb, var(--color-verde) 10%, #ffffff)",
                        border: "1px solid color-mix(in srgb, var(--color-verde) 25%, transparent)",
                      }}>
                      <span className="text-sm font-semibold text-[var(--color-verde)]">
                        🎁 Tienes {misStickers.pendientes} sticker{misStickers.pendientes !== 1 ? "s" : ""} sorpresa por revelar
                      </span>
                      <span className="text-sm font-bold text-[var(--color-verde)] underline underline-offset-2 flex-shrink-0">Rascar</span>
                    </button>
                  )}
                  {mensajes.map((m) => (
                    <div key={m.id} className="rounded-2xl border border-[var(--color-border)] p-3.5">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{m.titulo}</p>
                      {m.cuerpo && <p className="text-sm text-[var(--color-muted)] mt-1 whitespace-pre-line">{m.cuerpo}</p>}
                      <p className="text-[11px] text-[var(--color-muted)] mt-2">
                        {new Date(m.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}
                      </p>
                    </div>
                  ))}
                  {misStickers.pendientes === 0 && mensajes.length === 0 && (
                    <p className="text-sm text-[var(--color-muted)] text-center py-6">
                      Sin avisos por ahora — aquí verás tus stickers sorpresa y las noticias del Club. ✨
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Planilla completa (los 100 espacios del álbum) ── */}
          {planilla && catalogo && (
            <PlanillaClub
              token={token}
              catalogo={catalogo}
              album={misStickers.album}
              detalles={misStickers.detalles}
              obtenidos={misStickers.obtenidos}
              pendientes={misStickers.pendientes}
              onCerrar={() => setPlanilla(false)}
              onRascar={() => setRascando(true)}
              onCambio={cargarTarjeta}
            />
          )}

          {/* ── Rascado de sticker sorpresa ── */}
          {rascando && (
            <RascaSticker
              token={token}
              onCerrar={() => { setRascando(false); cargarTarjeta(); }}
              onPegado={() => { setRascando(false); cargarTarjeta(); setPlanilla(true); }}
            />
          )}

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
                  {/* Fondo: colores de marca + acabados */}
                  {GRUPOS_TEMA.map(({ titulo, grupo }) => (
                    <div key={grupo}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-2">{titulo}</p>
                      <div className="flex flex-wrap gap-2.5">
                        {(Object.keys(TEMAS) as TemaId[])
                          .filter((t) => TEMAS[t].grupo === grupo)
                          .map((t) => (
                            <button key={t} onClick={() => setDraft(d => ({ ...d, tema: t }))}
                              aria-label={TEMAS[t].nombre} aria-pressed={draft.tema === t} title={TEMAS[t].nombre}
                              className={`w-11 h-11 rounded-full border border-black/10 transition ${
                                draft.tema === t ? "ring-2 ring-[var(--color-verde)] ring-offset-2 scale-105" : "hover:scale-105"
                              }`}
                              style={{ background: TEMAS[t].grad }} />
                          ))}
                      </div>
                    </div>
                  ))}

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
                    <p className="text-xs text-[var(--color-muted)] mb-2">
                      Elige hasta {MAX_CHARMS} — al guardar podrás arrastrarlas sobre tu tarjeta para acomodarlas.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CHARMS.map((c) => {
                        const activo = draft.charms.some(ch => ch.e === c);
                        const lleno = draft.charms.length >= MAX_CHARMS;
                        return (
                          <button key={c} aria-pressed={activo} aria-label={`Cosita ${c}`}
                            onClick={() =>
                              setDraft(d => ({
                                ...d,
                                charms: activo ? d.charms.filter(ch => ch.e !== c)
                                  : d.charms.length >= MAX_CHARMS ? d.charms
                                  : [...d.charms, { e: c, ...CHARM_POS_DEFAULT[d.charms.length % CHARM_POS_DEFAULT.length] }],
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
                    <button onClick={guardarEstilo}
                      className="px-5 py-2.5 rounded-full bg-[var(--color-verde)] text-sm font-sans font-semibold text-[var(--color-cremita)] hover:opacity-85 transition">
                      Guardar
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
