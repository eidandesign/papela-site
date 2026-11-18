"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRightIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { inputBase } from "@/lib/ui";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analitica";
import {
  BUCKET_FOTOS,
  CONDICIONES,
  EMAIL_RE,
  FOTOS,
  LIMITES,
  whatsappValido,
  type FotoSubida,
} from "@/lib/creadores/config";

// Formulario de postulación de Creadores en Papela (/creadores). Las fotos van
// directo del navegador al bucket PRIVADO `creadores-fotos` con una URL firmada
// que entrega /api/creadores/foto; el envío final va a /api/creadores/postulacion,
// que vuelve a validar todo. `id` (uuid por formulario) hace el envío
// idempotente. Enviar NO es aceptación: el mensaje de éxito lo deja claro.

type Campo =
  | "nombre"
  | "marca"
  | "correo"
  | "whatsapp"
  | "redes"
  | "descripcion"
  | "aceptaPrivacidad"
  | "aceptaCondiciones";
type Errores = Partial<Record<Campo, string>>;
type Foto = FotoSubida & { preview: string };

const ORDEN: Campo[] = [
  "nombre",
  "marca",
  "correo",
  "whatsapp",
  "redes",
  "descripcion",
  "aceptaPrivacidad",
  "aceptaCondiciones",
];

const labelCls = "font-sans text-[14px] font-semibold text-[var(--color-text)]";
const ayudaCls = "font-sans text-[13px] leading-snug text-[var(--color-muted)]";
const errorCls =
  "flex items-start gap-1.5 font-sans text-[13px] leading-snug text-[var(--color-terracota)]";

function nuevoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (Number(c) ^ ((Math.random() * 16) >> (Number(c) / 4))).toString(16),
      );
}

export default function PostulacionCreadores() {
  const uid = useId();
  const sinMovimiento = useReducedMotion();
  const [id] = useState(nuevoId);
  const formRef = useRef<HTMLFormElement>(null);
  const exitoRef = useRef<HTMLDivElement>(null);

  const [valores, setValores] = useState({
    nombre: "",
    marca: "",
    correo: "",
    whatsapp: "",
    redes: "",
    descripcion: "",
    precio: "",
    portafolio: "",
    sitio: "", // honeypot
  });
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [aceptaCondiciones, setAceptaCondiciones] = useState(false);
  const [sinPromociones, setSinPromociones] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [subiendo, setSubiendo] = useState(0);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [estado, setEstado] = useState<"editando" | "enviando" | "enviado">(
    "editando",
  );
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  // Libera las vistas previas locales al salir.
  const fotosRef = useRef(fotos);
  useEffect(() => {
    fotosRef.current = fotos;
  }, [fotos]);
  useEffect(
    () => () => fotosRef.current.forEach((f) => URL.revokeObjectURL(f.preview)),
    [],
  );

  useEffect(() => {
    if (estado === "enviado") exitoRef.current?.focus();
  }, [estado]);

  const set = (campo: keyof typeof valores) => (v: string) => {
    setValores((prev) => ({ ...prev, [campo]: v }));
    if (campo in errores)
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  function validar(): Errores {
    const e: Errores = {};
    if (valores.nombre.trim().length < 2)
      e.nombre = "Escribe tu nombre completo.";
    if (valores.marca.trim().length < 2)
      e.marca = "Escribe el nombre de tu marca o proyecto.";
    if (!EMAIL_RE.test(valores.correo.trim()))
      e.correo = "Escribe un correo válido, por ejemplo hola@tumarca.com.";
    if (!whatsappValido(valores.whatsapp))
      e.whatsapp = "Escribe tu WhatsApp a 10 dígitos.";
    if (valores.redes.trim().length < 2)
      e.redes = "Déjanos tu Instagram o la red donde muestras tu trabajo.";
    if (valores.descripcion.trim().length < LIMITES.descripcionMin)
      e.descripcion = `Cuéntanos un poco más (mínimo ${LIMITES.descripcionMin} caracteres).`;
    if (!aceptaPrivacidad)
      e.aceptaPrivacidad = "Necesitamos que aceptes el aviso de privacidad.";
    if (!aceptaCondiciones)
      e.aceptaCondiciones =
        "Necesitamos que reconozcas las condiciones del programa.";
    return e;
  }

  async function subirFotos(lista: FileList | null) {
    if (!lista?.length) return;
    setErrorFoto(null);
    const espacio = FOTOS.max - fotos.length - subiendo;
    const elegidas = Array.from(lista).slice(0, Math.max(0, espacio));
    if (lista.length > espacio)
      setErrorFoto(`Puedes compartir hasta ${FOTOS.max} fotos.`);
    for (const f of elegidas) {
      if (!(FOTOS.tipos as readonly string[]).includes(f.type)) {
        setErrorFoto(`"${f.name}" no es una imagen JPG, PNG o WEBP.`);
        continue;
      }
      if (f.size > FOTOS.maxBytes) {
        setErrorFoto(`"${f.name}" pesa más de 8 MB.`);
        continue;
      }
      setSubiendo((n) => n + 1);
      try {
        const res = await fetch("/api/creadores/foto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            nombre: f.name,
            tipo: f.type,
            tamano: f.size,
          }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d.error ?? "No pudimos subir la foto.");
        const { error } = await createClient()
          .storage.from(BUCKET_FOTOS)
          .uploadToSignedUrl(d.path, d.token, f, { contentType: f.type });
        if (error)
          throw new Error("No pudimos subir la foto. Intenta de nuevo.");
        setFotos((prev) => [
          ...prev,
          {
            path: d.path,
            nombre: f.name,
            tipo: f.type,
            tamano: f.size,
            preview: URL.createObjectURL(f),
          },
        ]);
      } catch (err) {
        setErrorFoto(
          err instanceof Error ? err.message : "No pudimos subir la foto.",
        );
      } finally {
        setSubiendo((n) => n - 1);
      }
    }
  }

  function quitarFoto(path: string) {
    setFotos((prev) => {
      const f = prev.find((x) => x.path === path);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.path !== path);
    });
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    if (estado === "enviando" || subiendo > 0) return;
    setErrorEnvio(null);
    const e = validar();
    setErrores(e);
    const primero = ORDEN.find((c) => e[c]);
    if (primero) {
      const el = formRef.current?.querySelector<HTMLElement>(
        `[name="${primero}"]`,
      );
      el?.focus();
      el?.scrollIntoView({
        behavior: sinMovimiento ? "auto" : "smooth",
        block: "center",
      });
      return;
    }

    setEstado("enviando");
    try {
      const res = await fetch("/api/creadores/postulacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...valores,
          fotos: fotos.map(({ path, nombre, tipo, tamano }) => ({
            path,
            nombre,
            tipo,
            tamano,
          })),
          aceptaPrivacidad,
          aceptaCondiciones,
          sinPromociones,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          d.error ?? "No pudimos enviar tu propuesta. Intenta de nuevo.",
        );
      track("generate_lead", {
        tipo: "creadores",
        item_name: "Creadores en Papela",
      });
      setEstado("enviado");
    } catch (err) {
      setErrorEnvio(
        err instanceof Error
          ? err.message
          : "No pudimos enviar tu propuesta. Intenta de nuevo.",
      );
      setEstado("editando");
    }
  }

  if (estado === "enviado") {
    return (
      <motion.div
        ref={exitoRef}
        tabIndex={-1}
        role="status"
        initial={sinMovimiento ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[28px] bg-white/80 border border-[var(--color-border)] p-8 md:p-12 text-center outline-none"
      >
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-cacao)] text-[var(--color-rosa-papel)]">
          <CheckIcon className="h-7 w-7" aria-hidden="true" />
        </span>
        <h3 className="font-serif italic text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-[#403C3C] mb-4">
          ¡Gracias por compartir tu creatividad con nosotros!
        </h3>
        <p className="font-sans text-[17px] leading-[26px] text-[var(--color-muted)] max-w-lg mx-auto">
          Recibimos tu propuesta y nos pondremos en contacto contigo si tu
          proyecto es seleccionado para continuar el proceso.
        </p>
      </motion.div>
    );
  }

  const describe = (campo: Campo, ayuda?: boolean) =>
    [
      ayuda ? `${uid}-${campo}-ayuda` : null,
      errores[campo] ? `${uid}-${campo}-error` : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const mensajeError = (campo: Campo) => (
    <AnimatePresence initial={false}>
      {errores[campo] && (
        <motion.p
          id={`${uid}-${campo}-error`}
          initial={sinMovimiento ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={errorCls}
        >
          <ExclamationCircleIcon
            className="mt-px h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          {errores[campo]}
        </motion.p>
      )}
    </AnimatePresence>
  );

  const texto = (
    campo: Extract<Campo, "nombre" | "marca" | "correo" | "whatsapp" | "redes">,
    label: string,
    props: {
      type?: string;
      autoComplete?: string;
      inputMode?: "email" | "tel" | "text";
      placeholder?: string;
      ayuda?: string;
      max: number;
    },
  ) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={`${uid}-${campo}`} className={labelCls}>
        {label}{" "}
        <span className="text-[var(--color-terracota)]" aria-hidden="true">
          *
        </span>
      </label>
      <input
        id={`${uid}-${campo}`}
        name={campo}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        inputMode={props.inputMode}
        placeholder={props.placeholder}
        maxLength={props.max}
        required
        aria-required="true"
        aria-invalid={errores[campo] ? true : undefined}
        aria-describedby={describe(campo, !!props.ayuda)}
        value={valores[campo]}
        onChange={(e) => set(campo)(e.target.value)}
        className={`${inputBase} ${errores[campo] ? "!border-[var(--color-terracota)]" : ""}`}
      />
      {props.ayuda && (
        <p id={`${uid}-${campo}-ayuda`} className={ayudaCls}>
          {props.ayuda}
        </p>
      )}
      {mensajeError(campo)}
    </div>
  );


  const casilla = (
    campo: "aceptaPrivacidad" | "aceptaCondiciones",
    checked: boolean,
    onChange: (v: boolean) => void,
    contenido: ReactNode,
  ) => (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={`${uid}-${campo}`}
        className="flex cursor-pointer items-start gap-3 font-sans text-[14px] leading-snug text-[var(--color-text)]"
      >
        <input
          id={`${uid}-${campo}`}
          name={campo}
          type="checkbox"
          required
          aria-required="true"
          aria-invalid={errores[campo] ? true : undefined}
          aria-describedby={describe(campo)}
          checked={checked}
          onChange={(e) => {
            onChange(e.target.checked);
            if (e.target.checked)
              setErrores((prev) => ({ ...prev, [campo]: undefined }));
          }}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-verde)]"
        />
        <span>
          {contenido}{" "}
          <span className="text-[var(--color-terracota)]" aria-hidden="true">
            *
          </span>
        </span>
      </label>
      {mensajeError(campo)}
    </div>
  );

  const ocupado = estado === "enviando" || subiendo > 0;

  return (
    <form
      ref={formRef}
      onSubmit={enviar}
      noValidate
      aria-busy={estado === "enviando"}
      className="flex flex-col gap-10"
    >
      <p className={ayudaCls}>
        Los campos con <span className="text-[var(--color-terracota)]">*</span>{" "}
        son obligatorios.
      </p>

      {/* Honeypot: invisible para personas y lectores de pantalla */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor={`${uid}-sitio`}>No llenar</label>
        <input
          id={`${uid}-sitio`}
          tabIndex={-1}
          autoComplete="off"
          value={valores.sitio}
          onChange={(e) => set("sitio")(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {texto("nombre", "Nombre completo", {
            autoComplete: "name",
            max: LIMITES.nombre,
          })}
          {texto("marca", "Marca o proyecto", {
            autoComplete: "organization",
            max: LIMITES.marca,
          })}
          {texto("correo", "Correo electrónico", {
            type: "email",
            autoComplete: "email",
            inputMode: "email",
            max: LIMITES.correo,
          })}
          {texto("whatsapp", "WhatsApp", {
            type: "tel",
            autoComplete: "tel",
            inputMode: "tel",
            placeholder: "222 123 4567",
            max: LIMITES.whatsapp,
          })}
        </div>
        {texto("redes", "Instagram o redes sociales", {
          placeholder: "@tumarca",
          ayuda: "Donde podamos ver tu trabajo. Puedes poner más de una.",
          max: LIMITES.redes,
        })}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${uid}-precio`} className={labelCls}>
              Precio del producto{" "}
              <span className="font-normal text-[var(--color-muted)]">
                (opcional)
              </span>
            </label>
            <input
              id={`${uid}-precio`}
              name="precio"
              type="text"
              placeholder="Ej. $180 cada print"
              maxLength={LIMITES.precio}
              value={valores.precio}
              onChange={(e) => set("precio")(e.target.value)}
              className={inputBase}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${uid}-portafolio`} className={labelCls}>
              Sitio web o portafolio{" "}
              <span className="font-normal text-[var(--color-muted)]">
                (opcional)
              </span>
            </label>
            <input
              id={`${uid}-portafolio`}
              name="portafolio"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="tumarca.com"
              maxLength={LIMITES.portafolio}
              value={valores.portafolio}
              onChange={(e) => set("portafolio")(e.target.value)}
              className={inputBase}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-descripcion`} className={labelCls}>
            Descripción breve del proyecto{" "}
            <span className="text-[var(--color-terracota)]" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            id={`${uid}-descripcion`}
            name="descripcion"
            rows={5}
            required
            aria-required="true"
            maxLength={LIMITES.descripcion}
            aria-invalid={errores.descripcion ? true : undefined}
            aria-describedby={describe("descripcion", true)}
            value={valores.descripcion}
            onChange={(e) => set("descripcion")(e.target.value)}
            className={`${inputBase} resize-y min-h-[140px] ${errores.descripcion ? "!border-[var(--color-terracota)]" : ""}`}
          />
          <p
            id={`${uid}-descripcion-ayuda`}
            className={`${ayudaCls} flex justify-between gap-4`}
          >
            <span>
              Qué haces, con qué materiales y qué te gustaría vender en Papela.
            </span>
            <span className="shrink-0 tabular-nums" aria-hidden="true">
              {valores.descripcion.length}/{LIMITES.descripcion}
            </span>
          </p>
          {mensajeError("descripcion")}
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend
          id={`${uid}-fotos`}
          className="font-serif italic text-[24px] leading-tight text-[#403C3C] mb-2"
        >
          Fotografías de tus productos
        </legend>
        <p id={`${uid}-fotos-ayuda`} className={ayudaCls}>
          Opcional, pero nos ayuda mucho. Hasta {FOTOS.max} fotos JPG, PNG o
          WEBP de 8 MB cada una. Se guardan en un espacio privado que solo ve el
          equipo de Papela.
        </p>
        {fotos.length > 0 && (
          <ul
            className="grid grid-cols-3 sm:grid-cols-6 gap-3"
            aria-label="Fotos subidas"
          >
            <AnimatePresence initial={false}>
              {fotos.map((f) => (
                <motion.li
                  key={f.path}
                  layout={!sinMovimiento}
                  initial={sinMovimiento ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white"
                >
                  <Image
                    src={f.preview}
                    alt={f.nombre}
                    fill
                    unoptimized
                    sizes="120px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => quitarFoto(f.path)}
                    aria-label={`Quitar ${f.nombre}`}
                    className="absolute right-1.5 top-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[var(--color-text)] shadow-sm transition-colors hover:bg-white hover:text-[var(--color-terracota)]"
                  >
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        {fotos.length + subiendo < FOTOS.max && (
          <label
            className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[var(--color-verde)]/40 bg-white/60 px-4 text-center font-sans text-[var(--color-verde)] transition-colors hover:border-[var(--color-verde)] hover:bg-[var(--color-verde-light)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-verde)] ${
              subiendo > 0 ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <ArrowUpTrayIcon
              aria-hidden="true"
              className={`h-7 w-7 ${subiendo > 0 && !sinMovimiento ? "animate-bounce" : ""}`}
            />
            <span className="text-[16px] font-semibold">
              {subiendo > 0 ? "Subiendo…" : "Subir fotos"}
            </span>
            <span className="text-[13px] text-[var(--color-muted)]">
              Puedes elegir varias a la vez
            </span>
            <input
              type="file"
              multiple
              accept={FOTOS.accept}
              aria-labelledby={`${uid}-fotos`}
              aria-describedby={`${uid}-fotos-ayuda`}
              className="sr-only"
              disabled={subiendo > 0}
              onChange={(e) => {
                void subirFotos(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
        <p role="status" aria-live="polite" className="sr-only">
          {subiendo > 0
            ? "Subiendo fotos…"
            : fotos.length
              ? `${fotos.length} fotos subidas`
              : ""}
        </p>
        {errorFoto && (
          <p role="alert" className={errorCls}>
            <ExclamationCircleIcon
              className="mt-px h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            {errorFoto}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-[24px] bg-[var(--color-cremita-3)] p-5 md:p-6">
        <legend className="sr-only">Consentimiento</legend>
        {casilla(
          "aceptaPrivacidad",
          aceptaPrivacidad,
          setAceptaPrivacidad,
          <>
            He leído y acepto el{" "}
            <Link
              href="/privacidad"
              target="_blank"
              rel="noopener"
              className="text-[var(--color-verde)] underline underline-offset-2"
            >
              Aviso de privacidad
            </Link>{" "}
            y el tratamiento de mis datos para revisar mi propuesta.
          </>,
        )}
        {casilla(
          "aceptaCondiciones",
          aceptaCondiciones,
          setAceptaCondiciones,
          <>
            Conozco las{" "}
            <a
              href="#condiciones"
              className="text-[var(--color-verde)] underline underline-offset-2"
            >
              condiciones generales del programa
            </a>{" "}
            ({CONDICIONES.comisionPapela}% de comisión,{" "}
            {CONDICIONES.diasExhibicion} días de exhibición inicial, una
            historia semanal y pieza de muestra) y entiendo que enviar esta
            propuesta no implica aceptación ni firma de contrato.
          </>,
        )}
        <label
          htmlFor={`${uid}-promos`}
          className="flex cursor-pointer items-start gap-3 font-sans text-[14px] leading-snug text-[var(--color-muted)]"
        >
          <input
            id={`${uid}-promos`}
            type="checkbox"
            checked={sinPromociones}
            onChange={(e) => setSinPromociones(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-verde)]"
          />
          <span>No quiero recibir promociones ni novedades de Papela.</span>
        </label>
      </fieldset>

      <div className="flex flex-col items-start gap-4">
        <AnimatePresence>
          {errorEnvio && (
            <motion.p
              role="alert"
              initial={sinMovimiento ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`${errorCls} text-[15px]`}
            >
              <ExclamationCircleIcon
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              {errorEnvio}
            </motion.p>
          )}
        </AnimatePresence>
        <button
          type="submit"
          disabled={ocupado}
          className="group relative inline-flex min-h-12 cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-[var(--color-verde)] px-8 py-3.5 font-sans text-[16px] font-semibold text-[var(--color-cremita)] transition-opacity disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-verde)]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 origin-left scale-x-0 bg-black/15 transition-transform duration-500 ease-out group-hover:scale-x-100"
          />
          <span className="relative">
            {estado === "enviando"
              ? "Enviando tu propuesta…"
              : subiendo > 0
                ? "Esperando las fotos…"
                : "Enviar mi propuesta"}
          </span>
          {estado === "enviando" ? (
            <span
              aria-hidden="true"
              className="relative h-4 w-4 rounded-full border-2 border-[var(--color-cremita)]/40 border-t-[var(--color-cremita)] animate-spin"
            />
          ) : (
            <ArrowRightIcon
              className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </form>
  );
}
