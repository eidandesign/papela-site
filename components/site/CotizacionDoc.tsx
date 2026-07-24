"use client";

// Cotización de proyecto — /cotizacion/[token].
// Los DATOS viven en el admin (tabla `tareas`); esta vista los lee de su API
// pública (/api/public/cotizacion/[token]) y los presenta como documento:
// portada de marca, detalle por columnas, timeline de entrega y cierre con
// agradecimiento + redes. "Descargar PDF" usa la vista de impresión del
// navegador (window.print) con estilos @media print: la portada es la página 1
// y el detalle la página 2, con los colores de marca preservados.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Image from "next/image";

// En dev el endpoint vive en el admin local; en producción, en el deployado
// (mismo criterio que page.tsx y opengraph-image.tsx; NODE_ENV se sustituye
// en build, así que la URL local no viaja al bundle de producción).
const ADMIN_API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/public/cotizacion"
    : "https://admin.papela-atelier.com/api/public/cotizacion";
const TZ = "America/Mexico_City";
const WHATSAPP = "522211865590";

// `pendiente` = renglón "Por cotizar": el admin aún no le pone precio.
// Se muestra sin precio y NO está incluido en `total` (viaja así desde el admin).
type Item = { label: string; unitPrice: number; qty: number; pendiente?: boolean };
type Cotizacion = {
  folio: string;
  proyecto: string;
  categoria: string;
  cliente: string;
  fecha: string;   // ISO timestamp de emisión
  entrega: string; // YYYY-MM-DD o ""
  items: Item[];
  // Desglose tal como lo guardó el admin (no se deriva aquí):
  //   total = suma de ítems + cargoUrgente − descuento
  cargoUrgente: number;
  descuento: number;
  total: number;
  pagado: number;
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}

function fechaLarga(iso: string) {
  if (!iso) return "";
  // Las fechas-solo-día (YYYY-MM-DD) se anclan a mediodía para que el TZ no
  // las recorra al día anterior.
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: TZ });
}

// ── Estados de carga ──

function Cargando() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-bg)]">
      <Image src="/images/Logo-papela-verde.svg" alt="Papela Atelier" width={120} height={40} className="opacity-60" />
      <p className="text-sm text-[var(--color-muted)] animate-pulse">Cargando tu cotización…</p>
    </div>
  );
}

function NoEncontrada() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-[var(--color-bg)]">
      <Image src="/images/Logo-papela-verde.svg" alt="Papela Atelier" width={120} height={40} />
      <h1 className="font-serif text-2xl text-[var(--color-verde)]">No encontramos esta cotización</h1>
      <p className="text-sm text-[var(--color-muted)] max-w-sm">
        Puede que el link esté incompleto o que la cotización ya no exista.
        Escríbenos por WhatsApp y con gusto te la reenviamos. 💌
      </p>
      <a
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 px-6 py-2.5 rounded-full bg-[var(--color-verde)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Escribir a Papela
      </a>
    </div>
  );
}

// ── Menú hamburguesa (mismo lenguaje que el navbar del sitio) ──
// Burger animado → overlay verde a pantalla completa (clip-path) con las
// acciones del documento: Descargar PDF y Aprobar cotización (WhatsApp con
// mensaje prellenado). Va en portal a <body> (el wrapper .page-enter de
// template.tsx tiene will-change: transform y rompería el position: fixed).

const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";
const CREMA = "#F3E6CF";

function BurgerLines({ open }: { open: boolean }) {
  const ease = `transform 0.38s ${EASE}`;
  return (
    <div style={{ width: 22, height: 15, position: "relative" }} aria-hidden="true">
      <span style={{
        position: "absolute", top: 0, left: 0, display: "block", height: 1.5, width: 22,
        backgroundColor: CREMA, transformOrigin: "center", transition: ease,
        transform: open ? "translateY(6.75px) rotate(45deg)" : "none",
      }} />
      <span style={{
        position: "absolute", top: "50%", left: 0, marginTop: -0.75, display: "block", height: 1.5, width: 14,
        backgroundColor: CREMA, opacity: open ? 0 : 1,
        transform: open ? "scaleX(0)" : "scaleX(1)",
        transition: "opacity 0.18s ease, transform 0.22s ease",
      }} />
      <span style={{
        position: "absolute", bottom: 0, left: 0, display: "block", height: 1.5, width: 22,
        backgroundColor: CREMA, transformOrigin: "center", transition: ease,
        transform: open ? "translateY(-6.75px) rotate(-45deg)" : "none",
      }} />
    </div>
  );
}

function MenuCotizacion({ waAprobar }: { waAprobar: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape cierra el menú (el overlay tapa toda la pantalla; sin esto el
  // teclado no tiene salida).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function descargarPdf() {
    setOpen(false);
    // Esperar a que el overlay termine de cerrarse antes del diálogo de impresión.
    setTimeout(() => window.print(), 550);
  }

  const acciones = [
    { key: "pdf", label: "Descargar PDF", onClick: descargarPdf },
    { key: "aprobar", label: "Aprobar cotización", href: waAprobar },
  ];

  return createPortal(
    <div className="cotizacion-doc no-print">
      {/* Burger — abajo a la derecha, liquid glass (mismo estilo que la nav
          flotante del sitio); siempre visible, se vuelve ✕ sobre el menú */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar menú" : "Abrir menú de la cotización"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 w-[52px] h-[52px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{
          zIndex: 100003,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(20px) saturate(200%)",
          WebkitBackdropFilter: "blur(20px) saturate(200%)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      >
        <BurgerLines open={open} />
      </button>

      {/* Overlay. Cerrado usa `visibility: hidden` (no solo clip-path): así sus
          botones salen del orden de tabulación — si no, el teclado podría
          enfocar acciones invisibles. La visibilidad se retrasa al cerrar para
          no cortar la animación de cortina. */}
      <div
        aria-hidden={!open}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100002,
          backgroundColor: "var(--color-verde)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 8vw",
          overflow: "hidden",
          clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
          WebkitClipPath: open ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
          visibility: open ? "visible" : "hidden",
          transition: [
            `clip-path 0.65s ${EASE}`,
            `-webkit-clip-path 0.65s ${EASE}`,
            `visibility 0s linear ${open ? "0s" : "0.65s"}`,
          ].join(", "),
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <nav style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {acciones.map((a, i) => {
            const estilo: React.CSSProperties = {
              display: "block",
              fontFamily: "PP Editorial New, serif",
              fontSize: "clamp(2.2rem, 9vw, 4rem)",
              fontWeight: 300,
              color: CREMA,
              textDecoration: "none",
              textAlign: "left",
              lineHeight: 1.15,
              padding: "14px 0",
              background: "none",
              border: "none",
              borderBottom: "1px solid rgba(243,230,207,0.18)",
              cursor: "pointer",
              opacity: open ? 1 : 0,
              transform: open ? "none" : "translateY(30px)",
              transition: `opacity 0.5s ease ${0.15 + i * 0.08}s, transform 0.6s ${EASE} ${0.15 + i * 0.08}s`,
            };
            return a.href ? (
              <a key={a.key} href={a.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} style={estilo}>
                {a.label}
              </a>
            ) : (
              <button key={a.key} type="button" onClick={a.onClick} style={estilo}>
                {a.label}
              </button>
            );
          })}
        </nav>
        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "rgba(243,230,207,0.6)",
            opacity: open ? 1 : 0,
            transition: "opacity 0.5s ease 0.35s",
          }}
        >
          Al aprobar, se abre WhatsApp con tu autorización lista para enviar. 💌
        </p>
      </div>
    </div>,
    document.body,
  );
}

// ── Documento ──

export default function CotizacionDoc() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [cot, setCot] = useState<Cotizacion | null>(null);
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");

  useEffect(() => {
    if (!token) return;
    fetch(`${ADMIN_API}/${token}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Cotizacion) => {
        setCot(data);
        setEstado("ok");
      })
      .catch(() => setEstado("error"));
  }, [token]);

  if (estado === "cargando") return <Cargando />;
  if (estado === "error" || !cot) return <NoEncontrada />;

  const restante = cot.total - cot.pagado;
  const hayAnticipo = cot.pagado > 0 && restante > 0.005;

  const pasos = [
    {
      titulo: "Confirmación y anticipo",
      desc: "Al confirmar tu cotización apartamos tu lugar en producción. Con el anticipo arrancamos de inmediato.",
    },
    {
      titulo: "Diseño y producción",
      desc: "Creamos tu proyecto con todo el detalle: te compartimos avances y afinamos juntos lo que haga falta.",
    },
    {
      titulo: "Entrega",
      desc: cot.entrega
        ? `Tu proyecto estará listo el ${fechaLarga(cot.entrega)}. ¡Marca la fecha! ✨`
        : "Definimos juntos la fecha de entrega al confirmar el proyecto.",
    },
  ];

  // Mensaje de aprobación con el contexto de la cotización, listo para enviar.
  const waAprobar = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `✅ Autorizo la cotización${cot.folio ? ` ${cot.folio}` : ""} — ${cot.proyecto} por ${fmt(cot.total)}.${cot.cliente ? ` — ${cot.cliente}` : ""}`,
  )}`;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] cotizacion-doc">
      <MenuCotizacion waAprobar={waAprobar} />

      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 print:p-0 print:space-y-0 print:max-w-none">

        {/* ── Portada ── */}
        <section className="portada relative overflow-hidden rounded-[24px] bg-[var(--color-verde)] text-[var(--color-cremita)] px-8 sm:px-14 pt-14 sm:pt-20 pb-36 sm:pb-44 print:rounded-none">
          <Image
            src="/images/Logo-papela-verde.svg"
            alt="Papela Atelier"
            width={130}
            height={44}
            className="cot-rise mb-12 sm:mb-16 brightness-0 invert opacity-90"
          />

          <p className="cot-rise text-[11px] font-semibold uppercase tracking-[0.35em] opacity-80 mb-4" style={{ animationDelay: "0.1s" }}>
            Cotización{cot.folio ? ` · ${cot.folio}` : ""}
          </p>
          <h1 className="cot-rise font-serif font-extralight text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.08] mb-8" style={{ animationDelay: "0.2s" }}>
            {cot.proyecto}
          </h1>

          <div className="cot-rise flex flex-wrap gap-x-12 gap-y-4 text-sm" style={{ animationDelay: "0.32s" }}>
            {cot.cliente && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-1">Preparada para</p>
                <p className="font-medium text-base">{cot.cliente}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-1">Fecha</p>
              <p className="font-medium text-base">{fechaLarga(cot.fecha)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 mb-1">Servicio</p>
              <p className="font-medium text-base">{cot.categoria}</p>
            </div>
          </div>

          {/* Ribbon de marca (mismo trazo del hero del home) — se dibuja solo */}
          <svg
            viewBox="-67 133 1526 294"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cot-ribbon absolute bottom-0 left-0 right-0 w-full pointer-events-none h-[110px] sm:h-[150px]"
            preserveAspectRatio="xMidYMax slice"
            aria-hidden="true"
          >
            <path
              pathLength={1}
              d="M864.984 271.314C876.502 294.712 907.345 334.037 995.323 300.643C1104.1 259.357 1331.53 279.964 1457.77 390.325M864.984 271.314C862.261 265.785 860.617 261.143 859.555 258.563C856.233 250.495 861.138 246.328 865.113 247.716C867.789 248.648 870.875 251.417 869.083 258.563C867.993 262.897 866.624 267.156 864.984 271.314ZM864.984 271.314C779.94 487.307 -39.135 506.19 -66.2061 133.911"
              stroke="#F3E6CF"
              strokeOpacity="0.8"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </section>

        {/* ── Detalle por columnas ── */}
        <section className="cot-rise bg-white rounded-[24px] border border-[var(--color-border)] px-6 sm:px-10 py-8 sm:py-10 print:rounded-none print:border-0" style={{ animationDelay: "0.4s" }}>
          <h2 className="font-serif text-2xl text-[var(--color-verde)] mb-6">Detalle de tu proyecto</h2>

          {/* Encabezados (desktop / print) */}
          <div className="hidden sm:grid print:grid grid-cols-[1fr_70px_110px_110px] gap-3 pb-3 border-b border-[var(--color-border)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            <span>Concepto</span>
            <span className="text-center">Cant.</span>
            <span className="text-right">Precio unit.</span>
            <span className="text-right">Subtotal</span>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {cot.items.map((item, i) => (
              <div
                key={i}
                className="py-3.5 sm:grid print:grid grid-cols-[1fr_70px_110px_110px] gap-3 items-baseline"
              >
                <p className="text-[15px] text-[var(--color-text)] leading-snug">{item.label}</p>
                {/* Mobile: metadata en una línea; desktop/print: columnas */}
                <p className="text-sm text-[var(--color-muted)] sm:text-center print:text-center tabular-nums">
                  <span className="sm:hidden print:hidden">Cantidad: </span>{item.qty}
                </p>
                {item.pendiente ? (
                  <p className="sm:col-span-2 print:col-span-2 sm:text-right print:text-right">
                    <span className="inline-block text-xs font-semibold text-[var(--color-verde)] bg-[var(--color-cremita)] px-2.5 py-0.5 rounded-full">
                      Por cotizar
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-[var(--color-muted)] sm:text-right print:text-right tabular-nums">
                      <span className="sm:hidden print:hidden">Precio unitario: </span>{fmt(item.unitPrice)}
                    </p>
                    <p className="text-[15px] font-medium text-[var(--color-text)] sm:text-right print:text-right tabular-nums">
                      {fmt(item.unitPrice * item.qty)}
                    </p>
                  </>
                )}
              </div>
            ))}

            {cot.cargoUrgente > 0 && (
              <div className="py-3.5 flex items-baseline justify-between gap-3">
                <p className="text-[15px] text-[var(--color-text)]">⚡ Entrega urgente</p>
                <p className="text-[15px] font-medium text-[var(--color-text)] tabular-nums">{fmt(cot.cargoUrgente)}</p>
              </div>
            )}
            {cot.descuento > 0 && (
              <div className="py-3.5 flex items-baseline justify-between gap-3">
                <p className="text-[15px] text-[var(--color-verde)]">Descuento</p>
                <p className="text-[15px] font-medium text-[var(--color-verde)] tabular-nums">−{fmt(cot.descuento)}</p>
              </div>
            )}
          </div>

          {/* Totales */}
          <div className="mt-2 pt-5 border-t-[1.5px] border-[var(--color-verde)]">
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-xl text-[var(--color-verde)]">Total</p>
              <p className="font-serif font-extrabold text-[1.7rem] text-[var(--color-verde)] tabular-nums">
                {fmt(cot.total)}
              </p>
            </div>
            {hayAnticipo && (
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Anticipo recibido</span>
                  <span className="tabular-nums">{fmt(cot.pagado)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[var(--color-terracota)]">
                  <span>Restante</span>
                  <span className="tabular-nums">{fmt(restante)}</span>
                </div>
              </div>
            )}
          </div>

          {cot.items.some((i) => i.pendiente) && (
            <p className="mt-6 text-xs text-[var(--color-muted)]">
              Los conceptos marcados &quot;Por cotizar&quot; aún no tienen precio; te confirmaremos su
              costo por separado y no están incluidos en el total.
            </p>
          )}
          <p className="mt-6 text-xs text-[var(--color-muted)]">
            Precios en pesos mexicanos (MXN). Cotización válida por 15 días a partir de su emisión.
          </p>
        </section>

        {/* ── Timeline ── */}
        <section className="cot-rise bg-white rounded-[24px] border border-[var(--color-border)] px-6 sm:px-10 py-8 sm:py-10 print:rounded-none print:border-0" style={{ animationDelay: "0.5s" }}>
          <h2 className="font-serif text-2xl text-[var(--color-verde)] mb-7">¿Cómo sigue tu proyecto?</h2>
          <ol className="relative space-y-7">
            {pasos.map((paso, i) => (
              <li key={i} className="relative pl-11">
                {/* Línea conectora */}
                {i < pasos.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[13px] top-8 bottom-[-28px] w-px bg-[var(--color-border)]"
                  />
                )}
                <span className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[var(--color-cremita)] text-[var(--color-verde)] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="text-[15px] font-semibold text-[var(--color-text)] leading-7">{paso.titulo}</h3>
                <p className="text-sm text-[var(--color-muted)] mt-0.5 leading-relaxed">{paso.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Cierre ── */}
        <section className="cierre cot-rise bg-[var(--color-durazno)] rounded-[24px] px-6 sm:px-10 py-10 text-center print:rounded-none" style={{ animationDelay: "0.6s" }}>
          <p className="font-serif font-extralight text-[clamp(1.5rem,3.5vw,2rem)] text-[var(--color-verde)] leading-snug max-w-lg mx-auto">
            Gracias por dejarnos ser parte de tu proyecto ✨
          </p>
          <p className="text-sm text-[var(--color-muted)] mt-4 max-w-md mx-auto leading-relaxed">
            Es un gusto crear cosas increíbles para ti. Nos respaldan más de 20 años de experiencia
            haciendo branding, diseño y productos alrededor del mundo.
          </p>

          {/* Redes */}
          <div className="flex items-center justify-center gap-4 mt-7">
            <a
              href="https://instagram.com/papela.atelier"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Papela Atelier"
              className="w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center text-[var(--color-cremita)] hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/papelaatelier/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de Papela Atelier"
              className="w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center text-[var(--color-cremita)] hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://tiktok.com/@papela.atelier"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok de Papela Atelier"
              className="w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center text-[var(--color-cremita)] hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.84 1.56V6.78a4.85 4.85 0 01-1.07-.09z" />
              </svg>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp de Papela Atelier"
              className="w-10 h-10 rounded-full bg-[var(--color-verde)] flex items-center justify-center text-[var(--color-cremita)] hover:opacity-80 transition-opacity"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.86L0 24l6.335-1.512A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.652-.491-5.187-1.349l-.371-.214-3.762.898.938-3.67-.234-.384A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </a>
          </div>

          <div className="mt-7 text-sm text-[var(--color-verde)] space-y-1">
            <p>
              <a
                href="https://www.papela-atelier.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif text-lg hover:opacity-70 transition-opacity"
              >
                www.papela-atelier.com
              </a>
            </p>
            <p className="text-[var(--color-muted)] text-xs">Puebla, México</p>
          </div>
        </section>
      </div>

    </div>
  );
}
