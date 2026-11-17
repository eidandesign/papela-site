"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  DocumentIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AnimatedLogo from "@/components/site/AnimatedLogo";
import { createClient } from "@/lib/supabase/client";
import {
  ARCHIVOS,
  BUCKET_ARCHIVOS,
  CAMPOS_FICHA,
  CAMPOS_PRESTADOR,
  MAX_CAMPO,
  CAMPOS_OBLIGATORIOS,
  MODALIDADES,
  usuarioInstagram,
  type ArchivoSubido,
  type Campo,
  type Modalidad,
} from "@/lib/maestros/campos";

// Propuesta del maestro, paso a paso y a pantalla completa (estilo Typeform):
// 1 ¿Qué vas a impartir? · 2 Tus datos · 3 Tu actividad · 4 Tu trabajo (opcional)
// · 5 Enviar. "Siguiente" se deshabilita mientras falte algo obligatorio.
// No descarga nada: se guarda la solicitud y Papela la revisa en Admin →
// Maestros; una vez aprobada, firman juntos el acuerdo.
// Sin cifras ni texto del contrato: este componente viaja en un chunk público.

const PASOS = ["¿Qué vas a impartir?", "Tus datos", "Tu actividad", "Tu trabajo", "Enviar"] as const;

const inputCls =
  "w-full h-14 md:h-16 px-5 rounded-2xl border-[1.5px] border-[var(--color-border)] bg-white text-[var(--color-text)] font-sans text-lg md:text-xl outline-none transition-colors placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-verde)] focus-visible:ring-4 focus-visible:ring-[var(--color-verde)]/15 aria-[invalid=true]:border-[var(--color-terracota)]";
const labelCls = "font-sans text-[15px] md:text-base font-semibold text-[var(--color-text)]";
const btnPrimario =
  "group relative overflow-hidden cursor-pointer disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans font-semibold text-base md:text-lg disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-verde)]";

const correoValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function Pregunta({ titulo, ayuda, id }: { titulo: string; ayuda?: string; id: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <h1 id={id} tabIndex={-1} className="font-serif text-[clamp(2rem,5vw,3.2rem)] leading-[1.18] text-[#4A3B31] outline-none">
        {titulo}
      </h1>
      {ayuda && <p className="font-sans text-[17px] md:text-lg leading-relaxed text-[#403C3C]/75 mt-3">{ayuda}</p>}
    </div>
  );
}

function CampoGrande({
  campo,
  valor,
  onChange,
  error,
  prefijo,
  requerido,
  className = "",
}: {
  campo: Campo;
  valor: string;
  onChange: (v: string) => void;
  error?: string;
  prefijo: string;
  requerido?: boolean;
  className?: string;
}) {
  const id = `${prefijo}-${campo.id}`;
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <label htmlFor={id} className={labelCls}>
        {campo.label}
        {requerido ? (
          <span className="text-[var(--color-terracota)]"> *</span>
        ) : (
          <span className="font-normal text-[#403C3C]/60"> (opcional)</span>
        )}
      </label>
      {campo.largo ? (
        <textarea
          id={id}
          rows={3}
          maxLength={MAX_CAMPO}
          value={valor}
          placeholder={campo.placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputCls} h-auto py-4 resize-none min-h-[120px]`}
        />
      ) : campo.prefijo ? (
        // Prefijo fijo ("@"): el maestro solo escribe su usuario.
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-sans text-lg md:text-xl text-[#403C3C]/60">
            {campo.prefijo}
          </span>
          <input
            id={id}
            type="text"
            maxLength={30}
            value={valor}
            placeholder={campo.placeholder}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => onChange(campo.id === "instagram" ? usuarioInstagram(e.target.value) : e.target.value)}
            className={`${inputCls} pl-11`}
          />
        </div>
      ) : (
        <input
          id={id}
          type={campo.tipo ?? "text"}
          inputMode={campo.tipo === "tel" ? "tel" : campo.tipo === "email" ? "email" : undefined}
          maxLength={MAX_CAMPO}
          value={valor}
          placeholder={campo.placeholder}
          autoComplete={campo.autoComplete ?? "off"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
      {campo.largo && (
        <p className="hidden md:block font-sans text-xs text-[#403C3C]/55">
          <kbd className="font-sans font-semibold">Shift + Enter</kbd> para un nuevo renglón
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="font-sans text-sm text-[var(--color-terracota)]">
          {error}
        </p>
      )}
    </div>
  );
}

function Resumen({ titulo, onEditar, children }: { titulo: string; onEditar: () => void; children: ReactNode }) {
  return (
    <div className="rounded-3xl bg-white border border-[var(--color-border)] p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-serif text-[1.4rem] leading-tight text-[#4A3B31]">{titulo}</h2>
        <button
          type="button"
          onClick={onEditar}
          className="cursor-pointer h-10 px-4 rounded-full font-sans text-sm font-semibold text-[var(--color-verde)] hover:bg-[var(--color-verde-light)] focus-visible:outline-2 focus-visible:outline-[var(--color-verde)]"
        >
          Editar
        </button>
      </div>
      <div className="font-sans text-[15px] leading-relaxed text-[#403C3C]/90">{children}</div>
    </div>
  );
}

export default function SolicitudMaestro() {
  const router = useRouter();
  const prefijo = useId();
  const sinMovimiento = useReducedMotion();
  const [paso, setPaso] = useState(0);
  const [dir, setDir] = useState(1);
  const [modalidad, setModalidad] = useState<Modalidad | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [solicitudId] = useState(() => crypto.randomUUID());
  const [portafolio, setPortafolio] = useState("");
  const [archivos, setArchivos] = useState<ArchivoSubido[]>([]);
  const [subiendo, setSubiendo] = useState(0);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const contenidoRef = useRef<HTMLDivElement>(null);

  const set = (id: string) => (v: string) => {
    setValores((prev) => ({ ...prev, [id]: v }));
    if (errores[id]) setErrores((prev) => ({ ...prev, [id]: "" }));
  };

  // Al cambiar de paso: foco al primer campo en computadora (escribir de corrido,
  // como Typeform) y al título en celular (no abrir el teclado de golpe).
  useEffect(() => {
    const t = setTimeout(() => {
      const raiz = contenidoRef.current;
      if (!raiz) return;
      const escritorio = window.matchMedia("(min-width: 768px)").matches;
      const campo = raiz.querySelector<HTMLElement>("input:not([type=file]), textarea");
      const titulo = raiz.querySelector<HTMLElement>("h1");
      (escritorio && campo ? campo : titulo)?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    }, sinMovimiento ? 0 : 380);
    return () => clearTimeout(t);
  }, [paso, enviado, sinMovimiento]);

  // Errores de los datos obligatorios del paso 2 (nombre, teléfono, correo, Instagram).
  function erroresDatos(): Record<string, string> {
    const e: Record<string, string> = {};
    {
      if (!valores.nombre?.trim()) e.nombre = "Escribe tu nombre.";
      const tel = valores.telefono?.replace(/\D/g, "") ?? "";
      if (!tel) e.telefono = "Escribe tu teléfono.";
      else if (tel.length < 10) e.telefono = "Revisa tu teléfono (10 dígitos).";
      const correo = valores.correo?.trim();
      if (!correo) e.correo = "Escribe tu correo.";
      else if (!correoValido(correo)) e.correo = "Revisa tu correo.";
      if (!valores.instagram?.trim()) e.instagram = "Escribe tu usuario de Instagram.";
    }
    return e;
  }
  // Mientras falte algo obligatorio, "Siguiente" queda deshabilitado.
  const datosCompletos = Object.keys(erroresDatos()).length === 0;

  // Paso 3: todos los campos de la actividad son obligatorios.
  function erroresActividad(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!modalidad) return e;
    for (const c of CAMPOS_FICHA[modalidad]) {
      if (!c.soloPdf && !valores[c.id]?.trim()) e[c.id] = "Completa este campo.";
    }
    return e;
  }
  const actividadCompleta = Object.keys(erroresActividad()).length === 0;

  function validar(p: number): boolean {
    const e = p === 1 ? erroresDatos() : p === 2 ? erroresActividad() : {};
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function ir(nuevo: number) {
    setDir(nuevo > paso ? 1 : -1);
    setPaso(nuevo);
  }

  function siguiente() {
    if (paso === 0 && !modalidad) return;
    if (!validar(paso)) {
      // Lleva al primer campo con error (y el lector lo anuncia por aria-describedby).
      setTimeout(() => contenidoRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus(), 0);
      return;
    }
    if (paso < PASOS.length - 1) ir(paso + 1);
  }

  function elegir(m: Modalidad) {
    setModalidad(m);
    // Como Typeform: elegir avanza solo, con una pausa para ver la selección.
    setTimeout(() => ir(1), sinMovimiento ? 0 : 320);
  }

  // Teclado en toda la página (estilo Typeform), no solo dentro de un campo:
  //  · Enter avanza. En un input lo resuelve el submit nativo del formulario;
  //    aquí se cubre el resto (foco fuera de los campos) y los textarea, donde
  //    Enter avanza y Shift + Enter hace el salto de renglón (como Typeform).
  //  · ← regresa un paso cuando no se está escribiendo en un campo (dentro de
  //    un campo la flecha mueve el cursor).
  //  · En el paso 1, A / B eligen aunque el foco no esté en las tarjetas.
  //  · Nunca envía la propuesta con Enter: el último paso pide el botón.
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (enviado || e.defaultPrevented || e.isComposing) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const escribiendo = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t?.isContentEditable;
      const enBoton = tag === "BUTTON" || tag === "A" || t?.getAttribute("role") === "radio";

      if (e.key === "ArrowLeft" && !escribiendo && !e.metaKey && !e.altKey && !e.ctrlKey && paso > 0) {
        e.preventDefault();
        ir(paso - 1);
        return;
      }
      if (paso === 0 && !escribiendo && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === "a" || k === "b") {
          e.preventDefault();
          elegir(k === "a" ? "clases" : "talleres");
          return;
        }
      }
      if (e.key !== "Enter" || enBoton) return;
      if (tag === "INPUT") {
        // Con el botón deshabilitado el navegador no hace el submit: aquí se
        // muestran qué campos faltan. Si está completo, el submit nativo avanza.
        if ((paso === 1 && !datosCompletos) || (paso === 2 && !actividadCompleta)) {
          e.preventDefault();
          siguiente();
        }
        return;
      }
      if (tag === "TEXTAREA" && e.shiftKey) return; // Shift + Enter = salto de renglón
      if (paso === 0) {
        if (modalidad) ir(1);
        return;
      }
      if (paso >= 1 && paso <= 3) {
        e.preventDefault();
        if (paso === 3 && subiendo > 0) return;
        siguiente();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function subirArchivos(lista: FileList | null) {
    if (!lista?.length) return;
    setErrorArchivo(null);
    const espacio = ARCHIVOS.max - archivos.length;
    const elegidos = Array.from(lista).slice(0, Math.max(0, espacio));
    if (lista.length > espacio) setErrorArchivo(`Puedes compartir hasta ${ARCHIVOS.max} archivos.`);
    for (const f of elegidos) {
      if (!(ARCHIVOS.tipos as readonly string[]).includes(f.type)) {
        setErrorArchivo("Solo PDF o imágenes (JPG, PNG o WEBP).");
        continue;
      }
      if (f.size > ARCHIVOS.maxBytes) {
        setErrorArchivo(`"${f.name}" pesa más de 10 MB.`);
        continue;
      }
      setSubiendo((n) => n + 1);
      try {
        const res = await fetch("/colabora/maestros/archivo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solicitudId, nombre: f.name, tipo: f.type, tamano: f.size }),
        });
        const d = await res.json().catch(() => ({}));
        if (res.status === 401) {
          router.push("/colabora/maestros");
          return;
        }
        if (!res.ok) throw new Error(d.error ?? "No pudimos subir el archivo.");
        const { error } = await createClient().storage.from(BUCKET_ARCHIVOS).uploadToSignedUrl(d.path, d.token, f, { contentType: f.type });
        if (error) throw new Error("No pudimos subir el archivo. Intenta de nuevo.");
        setArchivos((prev) => [...prev, { path: d.path, nombre: f.name, tipo: f.type, tamano: f.size }]);
      } catch (err) {
        setErrorArchivo(err instanceof Error ? err.message : "No pudimos subir el archivo.");
      } finally {
        setSubiendo((n) => n - 1);
      }
    }
  }

  async function enviar() {
    if (!modalidad) return ir(0);
    if (!validar(1)) return ir(1);
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const res = await fetch("/colabora/maestros/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitudId, modalidad, valores, portafolio, archivos }),
      });
      if (res.status === 401) {
        router.push("/colabora/maestros");
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? "No pudimos enviar tu propuesta. Intenta de nuevo.");
      }
      setEnviado(true);
    } catch (err) {
      setErrorEnvio(err instanceof Error ? err.message : "No pudimos enviar tu propuesta. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const progreso = enviado ? 1 : (paso + (paso === 0 && modalidad ? 1 : 0)) / PASOS.length;
  const variantes = {
    entra: (d: number) => (sinMovimiento ? { opacity: 0 } : { opacity: 0, y: d > 0 ? 48 : -48, filter: "blur(6px)" }),
    centro: { opacity: 1, y: 0, filter: "blur(0px)" },
    sale: (d: number) => (sinMovimiento ? { opacity: 0 } : { opacity: 0, y: d > 0 ? -48 : 48, filter: "blur(6px)" }),
  };
  const transicion = { duration: sinMovimiento ? 0.15 : 0.38, ease: [0.32, 0.72, 0, 1] as const };
  const modalidadInfo = MODALIDADES.find((m) => m.value === modalidad);
  const camposActividad = modalidad ? CAMPOS_FICHA[modalidad].filter((c) => !c.soloPdf) : [];

  const navegacion = (primario: ReactNode) => (
    <div className="mt-10 flex items-start justify-between gap-4">
      {paso > 0 ? (
        <div className="flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={() => ir(paso - 1)}
            className="cursor-pointer inline-flex items-center gap-2 h-14 px-4 -ml-4 rounded-full font-sans text-base font-semibold text-[#403C3C]/75 hover:text-[var(--color-text)] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[var(--color-verde)]"
          >
            <ArrowLeftIcon aria-hidden="true" className="w-5 h-5" />
            Atrás
          </button>
          <span className="hidden md:inline font-sans text-sm text-[#403C3C]/60">
            o presiona <kbd className="font-sans font-semibold">←</kbd>
          </span>
        </div>
      ) : (
        <span />
      )}
      {/* Botones a la derecha y, debajo de Siguiente, la pista de Enter. */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">{primario}</div>
        {(paso === 1 && !datosCompletos) || (paso === 2 && !actividadCompleta) ? (
          <span className="font-sans text-sm text-[#403C3C]/60 pr-2 text-right">Llena los campos con * para continuar</span>
        ) : (
          (paso === 1 || paso === 2 || paso === 3) && (
            <span className="hidden md:inline font-sans text-sm text-[#403C3C]/60 pr-2">
              o presiona <kbd className="font-sans font-semibold">Enter ↵</kbd>
            </span>
          )
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-bg)]">
      {/* Barra de progreso + encabezado */}
      <header className="sticky top-0 z-20 bg-[var(--color-bg)]/90 backdrop-blur">
        <div
          className="h-1.5 bg-[var(--color-border)]/70"
          role="progressbar"
          aria-label="Progreso"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progreso * 100)}
        >
          <motion.div
            className="h-full bg-[var(--color-verde)] rounded-r-full"
            initial={false}
            animate={{ width: `${Math.max(progreso, 0.04) * 100}%` }}
            transition={{ duration: sinMovimiento ? 0 : 0.5, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>
        {/* Paso a la izquierda · logo al centro · Cancelar a la derecha. */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-10 h-16 md:h-20">
          {/* El número del paso resalta: se ve de un vistazo dónde vas. */}
          <span className="justify-self-start flex items-baseline gap-1 font-sans text-sm text-[#403C3C]/70" aria-live="polite">
            {!enviado && (
              <>
                Paso
                <motion.span
                  key={paso}
                  initial={sinMovimiento ? false : { y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="inline-block font-semibold text-[var(--color-verde)]"
                >
                  {paso + 1}
                </motion.span>
                de {PASOS.length}
              </>
            )}
          </span>
          <Link
            href="/colabora/maestros"
            aria-label="Papela Atelier · Colaboración maestros"
            className="justify-self-center rounded-full focus-visible:outline-2 focus-visible:outline-[var(--color-verde)]"
          >
            <AnimatedLogo color="var(--color-verde)" className="w-11 h-11 md:w-14 md:h-14" />
          </Link>
          {enviado ? (
            <span />
          ) : (
            <Link
              href="/colabora/maestros"
              className="justify-self-end inline-flex items-center h-11 px-4 -mr-4 rounded-full font-sans text-sm md:text-base font-semibold text-[#403C3C]/75 hover:text-[var(--color-text)] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[var(--color-verde)]"
            >
              Cancelar
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-start md:items-center">
        <div ref={contenidoRef} className="w-full max-w-2xl mx-auto px-5 md:px-6 pt-8 pb-16 md:py-16">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {enviado ? (
              <motion.section
                key="enviado"
                custom={1}
                variants={variantes}
                initial="entra"
                animate="centro"
                exit="sale"
                transition={transicion}
                className="text-center"
              >
                <motion.span
                  className="mx-auto mb-8 w-20 h-20 rounded-full bg-[var(--color-verde)] flex items-center justify-center"
                  initial={sinMovimiento ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
                >
                  <CheckIcon aria-hidden="true" className="w-10 h-10 text-[var(--color-cremita)]" strokeWidth={2.5} />
                </motion.span>
                <h1 tabIndex={-1} className="font-serif text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.18] text-[#4A3B31] outline-none">
                  ¡Gracias{valores.nombre?.trim() ? `, ${valores.nombre.trim().split(/\s+/)[0]}` : ""}!
                </h1>
                <p className="font-sans text-lg md:text-xl leading-relaxed text-[#403C3C]/80 mt-4 max-w-lg mx-auto">
                  Recibimos tu propuesta. La revisamos con calma y, una vez aprobada, te contactamos para firmar juntos el acuerdo.
                </p>
                <Link href="/colabora/maestros" className={`${btnPrimario} mt-10`}>
                  <span className="absolute inset-0 bg-black/15 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                  <span className="relative">Volver a la página</span>
                </Link>
              </motion.section>
            ) : (
              <motion.section
                key={paso}
                custom={dir}
                variants={variantes}
                initial="entra"
                animate="centro"
                exit="sale"
                transition={transicion}
                aria-labelledby={`${prefijo}-titulo`}
              >
                {/* ── 1. ¿Qué vas a impartir? ─────────────────────────────── */}
                {paso === 0 && (
                  <>
                    <Pregunta id={`${prefijo}-titulo`} titulo="¿Qué te gustaría impartir en Papela?" ayuda="Elige una para poder empezar." />
                    <div role="radiogroup" aria-labelledby={`${prefijo}-titulo`} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {MODALIDADES.map((m, i) => {
                        const sel = modalidad === m.value;
                        return (
                          <motion.button
                            key={m.value}
                            type="button"
                            role="radio"
                            aria-checked={sel}
                            onClick={() => elegir(m.value)}
                            whileTap={sinMovimiento ? undefined : { scale: 0.98 }}
                            className={`cursor-pointer relative text-left rounded-3xl border-[1.5px] p-6 md:p-7 min-h-[168px] flex flex-col justify-between transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-verde)] ${
                              sel
                                ? "border-[var(--color-verde)] bg-[var(--color-verde)] text-[var(--color-cremita)]"
                                : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-verde)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(18,83,92,0.10)]"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center font-sans text-sm font-bold ${
                                sel ? "border-[var(--color-cremita)]/50 bg-white/10" : "border-[var(--color-verde)]/30 text-[var(--color-verde)]"
                              }`}
                            >
                              {sel ? <CheckIcon className="w-5 h-5" strokeWidth={2.5} /> : String.fromCharCode(65 + i)}
                            </span>
                            <span>
                              <span className="block font-serif text-[1.9rem] leading-tight mt-6">{m.label}</span>
                              <span className={`block font-sans text-base mt-1 ${sel ? "text-[var(--color-cremita)]/85" : "text-[#403C3C]/70"}`}>{m.sub}</span>
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                    <p className="hidden md:block font-sans text-sm text-[#403C3C]/60 mt-6">
                      Toca una opción o presiona <kbd className="font-semibold">A</kbd> o <kbd className="font-semibold">B</kbd>
                    </p>
                  </>
                )}

                {/* ── 2. Tus datos ────────────────────────────────────────── */}
                {paso === 1 && (
                  <form
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      siguiente();
                    }}
                  >
                    <Pregunta id={`${prefijo}-titulo`} titulo="Cuéntanos de ti" ayuda="Así sabremos cómo contactarte. Tus datos están protegidos y son confidenciales." />
                    {/* Teléfono y correo comparten fila desde sm; lo demás a lo ancho. */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {CAMPOS_PRESTADOR.map((c) => (
                        <CampoGrande
                          key={c.id}
                          campo={c}
                          valor={valores[c.id] ?? ""}
                          onChange={set(c.id)}
                          error={errores[c.id] || undefined}
                          prefijo={prefijo}
                          requerido={CAMPOS_OBLIGATORIOS.includes(c.id)}
                          className={c.id === "telefono" || c.id === "correo" ? "" : "sm:col-span-2"}
                        />
                      ))}
                    </div>
                    {navegacion(
                      <button type="submit" disabled={!datosCompletos} className={btnPrimario}>
                        <span className="absolute inset-0 bg-black/15 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                        <span className="relative">Siguiente</span>
                        <ArrowRightIcon aria-hidden="true" className="relative w-5 h-5" />
                      </button>,
                    )}
                  </form>
                )}

                {/* ── 3. Tu actividad ─────────────────────────────────────── */}
                {paso === 2 && (
                  <form
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      siguiente();
                    }}
                  >
                    <Pregunta
                      id={`${prefijo}-titulo`}
                      titulo={modalidad === "talleres" ? "Cuéntanos de tu taller" : "Cuéntanos de tu clase"}
                      ayuda="Cuéntanos lo básico para conocer tu propuesta."
                    />
                    <div className="flex flex-col gap-6">
                      {/* Día y horario disponibles comparten fila desde sm. */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {camposActividad.map((c) => (
                          <CampoGrande
                            key={`${modalidad}-${c.id}`}
                            campo={c}
                            valor={valores[c.id] ?? ""}
                            onChange={set(c.id)}
                            prefijo={prefijo}
                            error={errores[c.id] || undefined}
                            requerido
                            className={c.id === "dia" || c.id === "horario" ? "" : "sm:col-span-2"}
                          />
                        ))}
                      </div>

                    </div>
                    {navegacion(
                      <button type="submit" disabled={!actividadCompleta} className={btnPrimario}>
                        <span className="absolute inset-0 bg-black/15 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                        <span className="relative">Siguiente</span>
                        <ArrowRightIcon aria-hidden="true" className="relative w-5 h-5" />
                      </button>,
                    )}
                  </form>
                )}

                {/* ── 4. Tu trabajo (opcional) ────────────────────────────── */}
                {paso === 3 && (
                  <form
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      siguiente();
                    }}
                  >
                    <Pregunta
                      id={`${prefijo}-titulo`}
                      titulo="Compártenos tu trabajo"
                      ayuda="Este paso es opcional. Tu página o una muestra de lo que haces nos ayuda a conocerte."
                    />
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2.5">
                        <label htmlFor={`${prefijo}-portafolio`} className={labelCls}>
                          Tu página o portafolio <span className="font-normal text-[#403C3C]/60">(opcional)</span>
                        </label>
                        <input
                          id={`${prefijo}-portafolio`}
                          type="url"
                          inputMode="url"
                          maxLength={300}
                          value={portafolio}
                          placeholder="instagram.com/tuusuario"
                          onChange={(e) => setPortafolio(e.target.value)}
                          className={inputCls}
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <span id={`${prefijo}-archivos`} className={labelCls}>
                          Archivos <span className="font-normal text-[#403C3C]/60">(opcional · PDF o imágenes, hasta {ARCHIVOS.max} de 10 MB)</span>
                        </span>
                        <AnimatePresence initial={false}>
                          {archivos.map((a) => (
                            <motion.div
                              key={a.path}
                              initial={sinMovimiento ? false : { opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3"
                            >
                              {a.tipo === "application/pdf" ? (
                                <DocumentIcon aria-hidden="true" className="w-6 h-6 shrink-0 text-[var(--color-verde)]" />
                              ) : (
                                <PhotoIcon aria-hidden="true" className="w-6 h-6 shrink-0 text-[var(--color-verde)]" />
                              )}
                              <span className="flex-1 min-w-0 truncate font-sans text-base text-[var(--color-text)]">{a.nombre}</span>
                              <span className="shrink-0 font-sans text-sm text-[#403C3C]/60">{(a.tamano / 1024 / 1024).toFixed(1)} MB</span>
                              <button
                                type="button"
                                onClick={() => setArchivos((prev) => prev.filter((x) => x.path !== a.path))}
                                aria-label={`Quitar ${a.nombre}`}
                                className="cursor-pointer shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[#403C3C]/60 hover:text-[var(--color-terracota)] hover:bg-black/5"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {archivos.length < ARCHIVOS.max && (
                          <label
                            className={`flex flex-col items-center justify-center gap-2 min-h-[120px] rounded-2xl border-[1.5px] border-dashed border-[var(--color-verde)]/40 bg-white/60 font-sans text-[var(--color-verde)] cursor-pointer transition-colors hover:bg-[var(--color-verde-light)] hover:border-[var(--color-verde)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--color-verde)] ${
                              subiendo > 0 ? "opacity-60 pointer-events-none" : ""
                            }`}
                          >
                            <ArrowUpTrayIcon aria-hidden="true" className={`w-7 h-7 ${subiendo > 0 && !sinMovimiento ? "animate-bounce" : ""}`} />
                            <span className="text-lg font-semibold">{subiendo > 0 ? "Subiendo…" : "Subir archivo"}</span>
                            <input
                              type="file"
                              multiple
                              accept={ARCHIVOS.accept}
                              aria-labelledby={`${prefijo}-archivos`}
                              className="sr-only"
                              disabled={subiendo > 0}
                              onChange={(e) => {
                                void subirArchivos(e.target.files);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                        {errorArchivo && (
                          <p role="alert" className="font-sans text-sm text-[var(--color-terracota)]">
                            {errorArchivo}
                          </p>
                        )}
                      </div>
                    </div>
                    {navegacion(
                    <button type="submit" disabled={subiendo > 0} className={btnPrimario}>
                      <span className="absolute inset-0 bg-black/15 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                      <span className="relative">Siguiente</span>
                      <ArrowRightIcon aria-hidden="true" className="relative w-5 h-5" />
                    </button>,
                    )}
                  </form>
                )}

                {/* ── 5. Revisar y enviar ─────────────────────────────────── */}
                {paso === 4 && (
                  <>
                    <Pregunta id={`${prefijo}-titulo`} titulo="¿Todo listo?" ayuda="Revisa tu propuesta y envíala. Nosotros la revisamos y, una vez aprobada, firmamos juntos el acuerdo." />
                    <div className="flex flex-col gap-4">
                      <Resumen titulo="Vas a impartir" onEditar={() => ir(0)}>
                        {modalidadInfo ? `${modalidadInfo.label} · ${modalidadInfo.sub}` : "—"}
                      </Resumen>
                      <Resumen titulo="Tus datos" onEditar={() => ir(1)}>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          {CAMPOS_PRESTADOR.filter((c) => valores[c.id]?.trim()).map((c) => (
                            <div key={c.id} className="min-w-0">
                              <dt className="text-sm text-[#403C3C]/60">{c.label}</dt>
                              <dd className="break-words">{c.prefijo ? `${c.prefijo}${valores[c.id]}` : valores[c.id]}</dd>
                            </div>
                          ))}
                        </dl>
                      </Resumen>
                      <Resumen titulo={modalidad === "talleres" ? "Tu taller" : "Tu clase"} onEditar={() => ir(2)}>
                        {camposActividad.some((c) => valores[c.id]?.trim()) ? (
                          <dl className="flex flex-col gap-2">
                            {camposActividad
                              .filter((c) => valores[c.id]?.trim())
                              .map((c) => (
                                <div key={c.id}>
                                  <dt className="text-sm text-[#403C3C]/60">{c.label}</dt>
                                  <dd className="break-words whitespace-pre-line">{valores[c.id]}</dd>
                                </div>
                              ))}
                          </dl>
                        ) : (
                          <p className="text-[#403C3C]/60">Lo platicamos juntos.</p>
                        )}
                      </Resumen>
                      <Resumen titulo="Tu trabajo" onEditar={() => ir(3)}>
                        {portafolio.trim() || archivos.length > 0 ? (
                          <dl className="flex flex-col gap-2">
                            {portafolio.trim() && (
                              <div>
                                <dt className="text-sm text-[#403C3C]/60">Tu página o portafolio</dt>
                                <dd className="break-words">{portafolio}</dd>
                              </div>
                            )}
                            {archivos.length > 0 && (
                              <div>
                                <dt className="text-sm text-[#403C3C]/60">Archivos</dt>
                                <dd>{archivos.map((a) => a.nombre).join(", ")}</dd>
                              </div>
                            )}
                          </dl>
                        ) : (
                          <p className="text-[#403C3C]/60">Lo saltaste; puedes agregarlo si quieres.</p>
                        )}
                      </Resumen>
                    </div>

                    <p className="font-sans text-sm leading-relaxed text-[#403C3C]/70 mt-6">
                      Al enviar aceptas nuestro{" "}
                      <Link href="/privacidad" target="_blank" rel="noopener" className="text-[var(--color-verde)] underline underline-offset-2">
                        Aviso de privacidad
                      </Link>{" "}
                      y nos compartes tus datos y archivos para revisar tu propuesta.
                    </p>
                    {errorEnvio && (
                      <p role="alert" className="font-sans text-sm text-[var(--color-terracota)] mt-3">
                        {errorEnvio}
                      </p>
                    )}
                    {navegacion(
                      <button type="button" onClick={enviar} disabled={enviando} className={btnPrimario}>
                        <span className="absolute inset-0 bg-black/15 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                        <span className="relative">{enviando ? "Enviando…" : "Enviar propuesta"}</span>
                        {!enviando && <ArrowRightIcon aria-hidden="true" className="relative w-5 h-5" />}
                      </button>,
                    )}
                  </>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
