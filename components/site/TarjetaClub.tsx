"use client";

// Tarjeta de lealtad del Club Creativo Papela — /club/[token].
// Los DATOS viven en el admin (admin.papela-atelier.com); esta vista los lee
// de su API pública y solo los presenta. Pase VERTICAL estilo wallet en una
// sola tarjeta: header (título + nº de socio), álbum de stickers con contador
// y acceso a la planilla, y nombre + fecha de miembro. El miembro puede
// PERSONALIZAR su tarjeta (fondo, textura, holo y "cositas"); la elección se
// guarda vía PATCH al mismo endpoint.
//
// FONDOS: imágenes reales (public/images/club/fondos) — auras con grano,
// gises pastel, holográficos y glitter. Cada fondo define su tinta (`ink`):
// oscura sobre fondos claros/pastel y clara sobre los saturados/oscuros, y
// toda la tipografía/bordes del pase la heredan vía la variable CSS --ink
// (clases .club-ink-* con color-mix), para que el texto siempre contraste.
// El fondo es DECORATIVO (material del pase); la estructura de la página usa
// los tokens del sitio.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { TZ } from "@/lib/fecha";
import PlanillaClub from "./club/PlanillaClub";
import RascaSticker from "./club/RascaSticker";
import {
  ADMIN_ORIGIN, CLUB_API as ADMIN_API, copiarTexto, stickerSrc,
  type Catalogo, type MensajeClub, type MisStickers,
} from "./club/clubTipos";

// Espacios del preview en la tarjeta (la planilla completa muestra los 100).
const PREVIEW_SLOTS = 6;

// ── Personalización (whitelist — debe coincidir con el API del admin) ──

// "color" es el tema LIBRE: el miembro elige 1–2 colores con un picker y el
// fondo es un degradado vivo (animado). Los demás son fondos de imagen fija.
type TemaImagenId =
  | "atardecer" | "aura" | "bruma" | "horizonte"
  | "arcoiris" | "sol" | "vitral"
  | "seda" | "perla" | "opalo" | "destellos" | "tul" | "cuarzo" | "remolino";
type TemaId = TemaImagenId | "color";
type TexturaId = "ninguna" | "puntos" | "rayas" | "cuadricula" | "rombos" | "confeti" | "grano";
// Cosita decorativa: emoji + posición (%) sobre el cuerpo del pase. Sin x/y
// usa la esquina default de su índice; el miembro la acomoda arrastrándola.
type Charm = { e: string; x?: number; y?: number };
// Colores del tema "color": 3 que se mezclan en el degradado (repetir un
// color reduce la mezcla; los 3 iguales = sólido).
type Colores = [string, string, string];
type Estilo = {
  tema: TemaId;
  textura: TexturaId;
  holo: boolean;
  charms: Charm[];
  colores: Colores;
};

const COLORES_DEFAULT: Colores = ["#f9c5d8", "#9ec5f7", "#fff3b0"];
const ESTILO_DEFAULT: Estilo = { tema: "atardecer", textura: "ninguna", holo: true, charms: [], colores: COLORES_DEFAULT };

type Tema = {
  nombre: string;
  ink: string;  // tinta del texto/bordes sobre este fondo
  claro: boolean; // fondo claro → ajusta el blend del acabado holográfico
  grupo: "aura" | "arte" | "brillo";
  color: string; // color dominante — se ve mientras carga la imagen
};

// Los fondos son FOTOS (public/images/club/fondos/<id>.jpg) elegidas por
// Papela: auras con grano, holográficos, glitter. `<id>-thumb.jpg` es la
// miniatura del editor (~3KB) para no cargar los 14 fondos completos.
function fondoSrc(id: TemaImagenId, thumb = false) {
  return `/images/club/fondos/${id}${thumb ? "-thumb" : ""}.jpg`;
}

const TEMAS: Record<TemaImagenId, Tema> = {
  // ── Auras (degradados difusos con grano) ──
  atardecer: { nombre: "Atardecer", grupo: "aura", ink: "#ffffff", claro: false, color: "#e0637a" },
  aura:      { nombre: "Aura",      grupo: "aura", ink: "#403c3c", claro: true,  color: "#ef7fa0" },
  bruma:     { nombre: "Bruma",     grupo: "aura", ink: "#403c3c", claro: true,  color: "#9aa7d8" },
  horizonte: { nombre: "Horizonte", grupo: "aura", ink: "#ffffff", claro: false, color: "#5d7fa8" },

  // ── Arte (rayos y vitral — hechos a mano) ──
  arcoiris: { nombre: "Arcoíris", grupo: "arte", ink: "#403c3c", claro: true, color: "#f2a86e" },
  sol:      { nombre: "Sol",      grupo: "arte", ink: "#403c3c", claro: true, color: "#f2b7c9" },
  vitral:   { nombre: "Vitral",   grupo: "arte", ink: "#403c3c", claro: true, color: "#f2917c" },

  // ── Brillos (holográficos y glitter) ──
  seda:      { nombre: "Seda",      grupo: "brillo", ink: "#403c3c", claro: true, color: "#cfd8f2" },
  perla:     { nombre: "Perla",     grupo: "brillo", ink: "#403c3c", claro: true, color: "#b8cdf0" },
  opalo:     { nombre: "Ópalo",     grupo: "brillo", ink: "#403c3c", claro: true, color: "#cbd5ee" },
  destellos: { nombre: "Destellos", grupo: "brillo", ink: "#403c3c", claro: true, color: "#e8c7e0" },
  tul:       { nombre: "Tul",       grupo: "brillo", ink: "#403c3c", claro: true, color: "#e9c2d8" },
  cuarzo:    { nombre: "Cuarzo",    grupo: "brillo", ink: "#403c3c", claro: true, color: "#d998b8" },
  remolino:  { nombre: "Remolino",  grupo: "brillo", ink: "#403c3c", claro: true, color: "#bcd0e6" },
};

// Un tema guardado con un id viejo (o basura) cae al default sin romper.
function temaValido(t: unknown): TemaId {
  return t === "color" || (typeof t === "string" && t in TEMAS) ? (t as TemaId) : ESTILO_DEFAULT.tema;
}

const HEX_RE = /^#[0-9a-f]{6}$/i;
// Acepta lo guardado con 1, 2 o 3 colores y siempre regresa 3 (rellena
// repitiendo el último para que el degradado no cambie de carácter).
function coloresValidos(v: unknown): Colores {
  const hex = (Array.isArray(v) ? v : []).filter((c): c is string => typeof c === "string" && HEX_RE.test(c));
  const c1 = hex[0] ?? COLORES_DEFAULT[0];
  const c2 = hex[1] ?? hex[0] ?? COLORES_DEFAULT[1];
  return [c1, c2, hex[2] ?? c2];
}

// Luminancia relativa (WCAG) — decide la tinta sobre el color elegido:
// oscura en fondos claros, blanca en fondos oscuros (regla de la tarjeta).
function luminancia(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(((n >> 16) & 255) / 255) + 0.7152 * f(((n >> 8) & 255) / 255) + 0.0722 * f((n & 255) / 255);
}

// Tema efectivo del tema LIBRE: tinta y blend según qué tan claros son los
// colores elegidos (el degradado en sí se pinta en la capa de fondo).
function temaColor(colores: Colores): Tema {
  const claro = colores.reduce((s, c) => s + luminancia(c), 0) / colores.length > 0.4;
  return { nombre: "Tu color", grupo: "aura", ink: claro ? "#403c3c" : "#ffffff", claro, color: colores[0] };
}

// Degradado base con los primeros 2 colores (manchas difusas estilo aura).
// El TERCER color no vive aquí: es una mancha en su propia capa que ORBITA
// la tarjeta (ver .club-orbita), paseándose por las esquinas.
function gradienteColores([c1, c2]: Colores) {
  return (
    `radial-gradient(120% 90% at 18% 12%, ${c1}, transparent 60%), ` +
    `radial-gradient(110% 90% at 88% 30%, ${c2}, transparent 60%), ` +
    `linear-gradient(160deg, ${c1} 0%, ${c2} 100%)`
  );
}

const GRUPOS_TEMA: { titulo: string; grupo: Tema["grupo"] }[] = [
  { titulo: "Auras", grupo: "aura" },
  { titulo: "Arte", grupo: "arte" },
  { titulo: "Brillos", grupo: "brillo" },
];

// Ruido SVG para la textura "grano" (con color, se mezcla en overlay).
const GRANO_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

// Ruido DENSO para el tema de color (las fotos ya traen su propio grano):
// desaturado y con más octavas — imita la arenilla de los pósters riso.
const GRANO_COLOR_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23g)' opacity='0.8'/%3E%3C/svg%3E\")";

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
  // club_desde es timestamp UTC; sin forzar la zona, Vercel/UTC resta un día.
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
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
function DecorBloque({ estilo, claro, reducida, animada }: { estilo: Estilo; claro: boolean; reducida: boolean; animada?: boolean }) {
  const textura = TEXTURAS[estilo.textura];
  return (
    <>
      {/* Sin grano extra encima: las fotos de fondo ya traen su propia
          textura y taparlas baja la resolución percibida. */}
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
            ? {
                ...ESTILO_DEFAULT,
                ...json.estilo,
                tema: temaValido(json.estilo.tema),
                colores: coloresValidos(json.estilo.colores),
                charms: normalizaCharms(json.estilo.charms),
              }
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
  const tema = vista.tema === "color" ? temaColor(vista.colores) : TEMAS[vista.tema];

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
        /* Los fondos de FOTO van fijos (sin deriva ni zoom) para conservar su
           resolución. El tema "Tu color" es CSS puro, ahí sí: el degradado
           deriva por el pase (aura viva), además del brillo holográfico. */
        @keyframes club-fondo-drift {
          0%   { transform: translate(-6%, -4%) rotate(-3deg) scale(1.06); }
          33%  { transform: translate(5%, -2%) rotate(2.5deg) scale(1.14); }
          66%  { transform: translate(-2%, 5%) rotate(-1.5deg) scale(1.18); }
          100% { transform: translate(-6%, -4%) rotate(-3deg) scale(1.06); }
        }
        .club-fondo-anim { animation: club-fondo-drift 9s ease-in-out infinite; }
        .club-holo-idle { animation: club-holo-drift 7s ease-in-out infinite; }
        /* La mancha del TERCER color deambula por la tarjeta: X y Y van en
           animaciones SEPARADAS con duraciones que no son múltiplos (31s/23s),
           así el recorrido combinado tarda ~12 min en repetirse — se siente
           aleatorio, lento y orgánico. Puntos irregulares a propósito. */
        @keyframes club-orbita-x {
          0%   { transform: translateX(-28%); }
          30%  { transform: translateX(12%); }
          55%  { transform: translateX(30%); }
          80%  { transform: translateX(-10%); }
          100% { transform: translateX(-28%); }
        }
        @keyframes club-orbita-y {
          0%   { transform: translateY(-26%) scale(1); }
          25%  { transform: translateY(8%) scale(1.16); }
          50%  { transform: translateY(28%) scale(0.9); }
          70%  { transform: translateY(-6%) scale(1.1); }
          100% { transform: translateY(-26%) scale(1); }
        }
        .club-orbita-x { animation: club-orbita-x 31s ease-in-out infinite; }
        .club-orbita-y { animation: club-orbita-y 23s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .club-holo-idle { animation: none; }
          .club-fondo-anim { animation: none; }
          .club-orbita-x { animation: none; }
          .club-orbita-y { animation: none; }
        }
        /* Color pickers del editor: círculos limpios (sin el marco nativo). */
        .club-picker {
          -webkit-appearance: none;
          appearance: none;
          width: 44px;
          height: 44px;
          border-radius: 9999px;
          border: 1px solid rgba(0,0,0,.12);
          padding: 0;
          background: transparent;
          cursor: pointer;
        }
        .club-picker::-webkit-color-swatch-wrapper { padding: 0; }
        .club-picker::-webkit-color-swatch { border-radius: 9999px; border: none; }
        .club-picker::-moz-color-swatch { border-radius: 9999px; border: none; }
        /* Texto FOIL: gradiente metálico derivado de --ink con UN destello
           suave. El brillo solo BARRE el texto de izquierda a derecha (ángulo
           fijo, sin giros), con pausa entre pasadas — sutil, como inclinar la
           tarjeta ante la luz. */
        @keyframes club-foil-vivo {
          0%   { background-position: 150% 0; }
          100% { background-position: -50% 0; }
        }
        .club-foil {
          background-image: linear-gradient(100deg,
            var(--ink) 0%,
            var(--ink) 38%,
            color-mix(in srgb, var(--ink) 45%, #ffb6d9) 45%,
            color-mix(in srgb, var(--ink) 10%, #ffffff) 50%,
            color-mix(in srgb, var(--ink) 45%, #a8e6ff) 55%,
            var(--ink) 62%,
            var(--ink) 100%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: club-foil-vivo 7s linear infinite;
        }
        @supports not ((-webkit-background-clip: text) or (background-clip: text)) {
          .club-foil { background: none; color: var(--ink); animation: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .club-foil { animation: none; background-position: 50% 0; }
        }

        /* Tinta adaptativa del pase: cada fondo define --ink y todo hereda. */
        .club-ink { color: var(--ink); }
        .club-ink-85 { color: color-mix(in srgb, var(--ink) 85%, transparent); }
        .club-ink-75 { color: color-mix(in srgb, var(--ink) 75%, transparent); }
        .club-ink-60 { color: color-mix(in srgb, var(--ink) 60%, transparent); }
        .club-ink-50 { color: color-mix(in srgb, var(--ink) 50%, transparent); }
        .club-ink-40 { color: color-mix(in srgb, var(--ink) 45%, transparent); }
        .club-borde { border-color: color-mix(in srgb, var(--ink) 85%, transparent); }
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
                {/* Fondo: foto FIJA (sin zoom ni deriva, conserva su resolución)
                    o, en "Tu color", degradado CSS con deriva viva. */}
                {vista.tema === "color" ? (
                  <>
                    <div
                      aria-hidden="true"
                      className={`absolute -inset-[25%] pointer-events-none ${reducida ? "" : "club-fondo-anim"}`}
                      style={{ background: gradienteColores(vista.colores) }}
                    />
                    {/* Tercer color: mancha difusa GRANDE que deambula por la
                        tarjeta (X y Y desacoplados = camino casi aleatorio) */}
                    <div
                      aria-hidden="true"
                      className={`absolute -inset-[25%] pointer-events-none ${reducida ? "" : "club-orbita-x"}`}
                    >
                      <div
                        className={`absolute inset-0 ${reducida ? "" : "club-orbita-y"}`}
                        style={{ background: `radial-gradient(62% 52% at 50% 50%, ${vista.colores[2]}, transparent 72%)` }}
                      />
                    </div>
                    {/* Grano en dos capas: overlay marca el contraste y la capa
                        normal (tenue) garantiza arenilla visible sobre
                        cualquier color, claro u oscuro. */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{ backgroundImage: GRANO_COLOR_URI, mixBlendMode: "overlay", opacity: 0.75 }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none"
                      style={{ backgroundImage: GRANO_COLOR_URI, opacity: 0.16 }}
                    />
                  </>
                ) : (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: tema.color,
                      backgroundImage: `url(${fondoSrc(vista.tema)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                )}
                <DecorBloque estilo={vista} claro={tema.claro} reducida={reducida} animada />

                {/* Header — título editorial + nº de socio */}
                <div className="relative flex items-start justify-between gap-3 p-6 pb-4">
                  <p className="club-foil font-serif italic text-[28px] leading-tight whitespace-nowrap">
                    Club Creativo
                  </p>
                  <div className="text-right flex-shrink-0">
                    <p className="club-ink-75 text-[9px] font-bold uppercase tracking-[0.22em]">N.º de socio</p>
                    <p className="club-ink font-mono text-lg tracking-[0.14em] mt-0.5">{tarjeta.numero}</p>
                  </div>
                </div>

                {/* Álbum de stickers — preview de los primeros espacios */}
                <div className="relative px-6 pt-4">
                  <div className="grid grid-cols-3 gap-y-6 justify-items-center"
                    role="img" aria-label={`${misStickers.obtenidos} de ${albumTotal} stickers`}>
                    {Array.from({ length: PREVIEW_SLOTS }, (_, i) => {
                      const orden = i + 1;
                      const sticker = catalogo?.stickers.find((s) => s.orden === orden);
                      const mio = sticker && misStickers.album.find((a) => a.id === sticker.id);
                      if (sticker && mio) {
                        return (
                          <span key={orden} className="flex items-center justify-center w-[86px] h-[104px]">
                            {/* eslint-disable-next-line @next/next/no-img-element -- asset del admin */}
                            <img src={stickerSrc(ADMIN_ORIGIN, sticker)} alt={sticker.nombre}
                              className="w-[76px] h-[76px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
                              draggable={false} />
                          </span>
                        );
                      }
                      return (
                        <span key={orden}
                          className="club-borde club-ink-75 flex items-center justify-center w-[86px] h-[104px] rounded-[50%] border"
                          aria-hidden="true">
                          <span className="text-xs font-medium">{orden}</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Contador + planilla, centrados */}
                  <p className="club-ink relative text-center text-sm font-semibold mt-7">
                    {misStickers.obtenidos} / {albumTotal}
                  </p>
                  <button onClick={() => setPlanilla(true)}
                    className="club-ink relative mx-auto mt-3 flex items-center gap-2.5 text-xs font-medium">
                    Ver mi planilla completa
                    <span className="club-borde w-8 h-8 rounded-full border flex items-center justify-center">
                      <ChevronRightIcon className="w-4 h-4" />
                    </span>
                  </button>
                </div>

                {/* Miembro */}
                <div className="relative p-6 pt-12 flex items-end justify-between gap-3">
                  <p className="club-foil font-serif text-[26px] leading-snug break-words min-w-0">{tarjeta.nombre}</p>
                  <div className="text-right flex-shrink-0">
                    <p className="club-ink-75 text-[9px] font-bold uppercase tracking-[0.22em]">Miembro desde</p>
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
                  {/* Tu color: 1–2 colores libres → degradado vivo (animado) */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-1">Tu color</p>
                    <p className="text-xs text-[var(--color-muted)] mb-2">
                      Mezcla hasta tres colores — el degradado se mueve suavecito por tu tarjeta.
                    </p>
                    <div className="flex items-center gap-2.5">
                      <button onClick={() => setDraft(d => ({ ...d, tema: "color" }))}
                        aria-label="Usar mi combinación de colores" aria-pressed={draft.tema === "color"} title="Tu color"
                        className={`w-11 h-11 rounded-full border border-black/10 transition ${
                          draft.tema === "color" ? "ring-2 ring-[var(--color-verde)] ring-offset-2 scale-105" : "hover:scale-105"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${draft.colores[0]}, ${draft.colores[1]}, ${draft.colores[2]})` }} />
                      <span className="text-[var(--color-border)]" aria-hidden="true">│</span>
                      {([0, 1, 2] as const).map((i) => (
                        <input key={i} type="color" className="club-picker" aria-label={`Color ${i + 1}`}
                          value={draft.colores[i]}
                          onChange={(e) =>
                            setDraft(d => ({
                              ...d,
                              tema: "color",
                              colores: d.colores.map((c, j) => (j === i ? e.target.value : c)) as Colores,
                            }))
                          } />
                      ))}
                    </div>
                  </div>

                  {/* Fondos de imagen, por grupo */}
                  {GRUPOS_TEMA.map(({ titulo, grupo }) => (
                    <div key={grupo}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)] mb-2">{titulo}</p>
                      <div className="flex flex-wrap gap-2.5">
                        {(Object.keys(TEMAS) as TemaImagenId[])
                          .filter((t) => TEMAS[t].grupo === grupo)
                          .map((t) => (
                            <button key={t} onClick={() => setDraft(d => ({ ...d, tema: t }))}
                              aria-label={TEMAS[t].nombre} aria-pressed={draft.tema === t} title={TEMAS[t].nombre}
                              className={`w-11 h-11 rounded-full border border-black/10 transition ${
                                draft.tema === t ? "ring-2 ring-[var(--color-verde)] ring-offset-2 scale-105" : "hover:scale-105"
                              }`}
                              style={{
                                backgroundColor: TEMAS[t].color,
                                backgroundImage: `url(${fondoSrc(t, true)})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }} />
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
