"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@heroicons/react/24/solid";
import HojaInferior from "@/components/site/HojaInferior";
import { useReservaModalStore } from "@/lib/stores/reservaModalStore";
import type { Horario, HorarioSemanal } from "@/lib/clases";
import type { PaqueteClasePublico, TipoClasePublico } from "@/lib/clases-tipos";

// Clases en el sitio (/clases y la página de cada maestra). Todo se edita en
// el admin (perfil de la maestra). Cada clase es UN bloque con solo su info
// (foto, duración, horario, descripción) y "Ver más información": un drawer
// (panel derecho en desktop, bottom sheet en mobile) con las formas de venta
// (clase suelta + paquetes); al elegir una, el mismo drawer muestra el resumen
// y dos caminos: pagar en línea (calendario + MercadoPago) o WhatsApp.

const WHATSAPP_PAPELA = "522211865590";

const precioMx = (n: number) => `$${n.toLocaleString("es-MX", { maximumFractionDigits: 2 })}`;

function duracionTexto(min: number): string {
  if (!min) return "";
  if (min % 60 === 0) return `${min / 60} ${min === 60 ? "hora" : "horas"}`;
  if (min > 60) return `${Math.floor(min / 60)} h ${min % 60} min`;
  return `${min} min`;
}

/** "06:00 p.m. a 08:00 p.m." → "6:00 a 8:00 p.m." (sin ceros de más ni p.m. repetido). */
function rangoCorto(rango: string): string {
  const quitaCero = (t: string) => t.replace(/^0(\d)/, "$1");
  const [ini, fin] = rango.split(" a ").map((x) => quitaCero(x.trim()));
  if (!fin) return quitaCero(rango);
  const sufijo = (t: string) => t.match(/\s*([ap]\.\s?m\.)$/i)?.[1] ?? "";
  const sIni = sufijo(ini);
  return sIni && sIni === sufijo(fin) ? `${ini.replace(/\s*[ap]\.\s?m\.$/i, "")} a ${fin}` : `${ini} a ${fin}`;
}

/** Días y horario para la tarjeta: "Jueves" + "6:00 a 8:00 p.m."; si cada día va a otra hora, una línea por día. */
function diasYHorario(horarios: HorarioSemanal[]): { dias: string; horario: string[] } {
  const dias = [...new Set(horarios.map((h) => h.dia))];
  const rangos = [...new Set(horarios.map((h) => rangoCorto(h.rango)))];
  const listaDias =
    dias.length <= 1 ? dias.join("") : `${dias.slice(0, -1).join(", ")} y ${dias.at(-1)!.toLowerCase()}`;
  return {
    dias: listaDias,
    horario: rangos.length === 1 ? rangos : horarios.map((h) => `${h.dia} ${rangoCorto(h.rango)}`),
  };
}

/** Forma de venta: la clase suelta o uno de sus paquetes. */
type Opcion = {
  key: string;
  etiqueta: string; // "Clase suelta" / "Paquete"
  nombre: string | null; // nombre del paquete (la suelta no lleva)
  detalle: string; // "1 clase" / "4 clases · vigencia 30 días"
  precio: number;
  precioNota: string; // "por clase" / "el paquete · $300 por clase"
  inscripcion: number;
  notas: string;
  incluye: string[];
  condiciones: string[];
  paquete: PaqueteClasePublico | null;
};

function opcionesDe(tipo: TipoClasePublico, paquetes: PaqueteClasePublico[]): Opcion[] {
  const suelta: Opcion = {
    key: `suelta-${tipo.id}`,
    etiqueta: "Clase suelta",
    nombre: null,
    detalle: "1 clase",
    precio: tipo.precio,
    precioNota: "por clase",
    inscripcion: 0,
    notas: tipo.sueltaDescripcion,
    incluye: tipo.incluye,
    condiciones: tipo.condiciones,
    paquete: null,
  };
  return [suelta, ...paquetes.map((p) => opcionDePaquete(p))];
}

function opcionDePaquete(p: PaqueteClasePublico): Opcion {
  const partes = [
    p.sesiones > 0 ? `${p.sesiones} ${p.sesiones === 1 ? "clase" : "clases"}` : "",
    p.vigenciaDias > 0 ? `vigencia ${p.vigenciaDias} días` : "",
  ].filter(Boolean);
  const porClase = p.sesiones > 1 && p.precio > 0 ? ` · ${precioMx(Math.round((p.precio / p.sesiones) * 100) / 100)} por clase` : "";
  return {
    key: `paquete-${p.id}`,
    etiqueta: "Paquete",
    nombre: p.nombre,
    detalle: partes.join(" · "),
    precio: p.precio,
    precioNota: `el paquete${porClase}`,
    inscripcion: p.inscripcion,
    notas: p.descripcion,
    incluye: p.incluye,
    condiciones: p.condiciones,
    paquete: p,
  };
}

function ListaPuntos({ items, tono }: { items: string[]; tono: "verde" | "muted" }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((x, i) => (
        <li key={i} className={`flex items-start gap-2 font-sans text-[15px] leading-6 ${tono === "verde" ? "text-[var(--color-text)]" : "text-[var(--color-muted)]"}`}>
          {tono === "verde" ? (
            <CheckIcon className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--color-verde)]" aria-hidden />
          ) : (
            <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-terracota)]" aria-hidden />
          )}
          {x}
        </li>
      ))}
    </ul>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] gap-3 font-sans text-[15px] leading-6">
      <dt className="text-[var(--color-muted)]">{etiqueta}</dt>
      <dd className="text-[var(--color-text)]">{children}</dd>
    </div>
  );
}

export function ClaseBloque({
  tipo,
  paquetes,
  horarioSemanal,
  horariosReservables,
  tipos,
  maestraNombre,
  whatsapp,
}: {
  tipo: TipoClasePublico;
  paquetes: PaqueteClasePublico[];
  horarioSemanal: HorarioSemanal[];
  horariosReservables: Horario[];
  tipos: TipoClasePublico[];
  maestraNombre: string;
  whatsapp: string | null;
}) {
  // Drawer de precios: cerrado / abierto en la lista de opciones / abierto en
  // el resumen de una opción elegida (mismo drawer, dos pasos).
  const [abierto, setAbierto] = useState(false);
  const [elegida, setElegida] = useState<Opcion | null>(null);
  const abrirReserva = useReservaModalStore((s) => s.open);
  const opciones = opcionesDe(tipo, paquetes);
  const cuando = diasYHorario(horarioSemanal);
  // Pestañas del drawer: Paquetes primero si la clase tiene; si no, solo la suelta.
  const pestanas: { id: "paquetes" | "suelta"; label: string }[] = [
    ...(paquetes.length ? [{ id: "paquetes" as const, label: paquetes.length === 1 ? "Paquete" : "Paquetes" }] : []),
    { id: "suelta", label: "Clase suelta" },
  ];
  const [pestana, setPestana] = useState<"paquetes" | "suelta">(paquetes.length ? "paquetes" : "suelta");

  const waNumero = whatsapp || WHATSAPP_PAPELA;
  const waHref = (o: Opcion) => {
    const texto = o.paquete
      ? `Hola Papela 🌿 me interesa el "${o.paquete.nombre}" de ${tipo.nombre}.`
      : `Hola Papela 🌿 me interesa una clase suelta de "${tipo.nombre}".`;
    return `https://wa.me/${waNumero}?text=${encodeURIComponent(texto)}`;
  };

  function cerrar() {
    setAbierto(false);
    setElegida(null);
    setPestana(paquetes.length ? "paquetes" : "suelta");
  }

  function pagarEnLinea(o: Opcion) {
    cerrar();
    abrirReserva({
      horarios: horariosReservables,
      claseNombre: maestraNombre,
      whatsapp,
      tipos,
      tipoInicial: tipo.id,
      paquete: o.paquete
        ? { id: o.paquete.id, nombre: o.paquete.nombre, precio: o.paquete.precio, inscripcion: o.paquete.inscripcion, sesiones: o.paquete.sesiones }
        : null,
    });
  }

  return (
    <article className="flex flex-col bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_rgba(64,60,60,0.08)]">
      {/* Tarjeta: foto arriba, info abajo y el botón al pie (todas alinean su CTA) */}
      <div className="relative w-full aspect-[4/3] bg-[#e7d6cf]">
        {tipo.imagen && (
          <Image
            src={tipo.imagen}
            alt={tipo.nombre}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover"
          />
        )}
        {tipo.duracion > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-terracota)] backdrop-blur-sm">
            {duracionTexto(tipo.duracion)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="font-serif text-[clamp(1.5rem,2.4vw,1.9rem)] leading-tight text-[#403c3c]">{tipo.nombre}</h3>
        {horarioSemanal.length > 0 && (
          <dl className="mt-3 flex flex-col gap-1">
            <Dato etiqueta="Días">{cuando.dias}</Dato>
            <Dato etiqueta="Horario">
              {cuando.horario.map((h) => (
                <span key={h} className="block">
                  {h}
                </span>
              ))}
            </Dato>
          </dl>
        )}
        {tipo.descripcion && (
          <p className="mt-3 font-sans text-[15px] leading-6 text-[var(--color-muted)] line-clamp-2">{tipo.descripcion}</p>
        )}

        <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-verde)] px-6 py-3 font-sans text-sm font-semibold text-[var(--color-cremita)] hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-verde)]"
        >
          Ver más información
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </button>
        </div>
      </div>

      <HojaInferior
        abierta={abierto}
        onClose={cerrar}
        variante="drawer"
        titulo={elegida ? "Tu elección" : tipo.nombre}
        encabezado={
          elegida ? (
            <button
              type="button"
              onClick={() => setElegida(null)}
              className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[var(--color-verde)] hover:opacity-80"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden />
              Otras opciones
            </button>
          ) : undefined
        }
        pie={
          elegida && (
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <a
                href={waHref(elegida)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-6 py-3 font-sans text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-verde)] hover:text-[var(--color-verde)] transition-colors"
              >
                Por WhatsApp
              </a>
              <button
                type="button"
                onClick={() => pagarEnLinea(elegida)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-verde)] px-6 py-3 font-sans text-sm font-semibold text-[var(--color-cremita)] hover:opacity-90 transition-opacity"
              >
                Pagar en línea
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )
        }
      >
        {!elegida ? (
          /* Paso 1: pestañas por forma de venta — Paquetes primero (es lo que
             más conviene y trae más letra chica), luego Clase suelta. Una
             pestaña a la vez: con la descripción completa de cada opción, la
             hoja crecería demasiado si se apilaran todas. */
          <div className="flex flex-col gap-4">
            {tipo.descripcion && (
              <p className="font-sans text-[15px] leading-6 text-[var(--color-text)] whitespace-pre-line">{tipo.descripcion}</p>
            )}
            {pestanas.length > 1 && (
              <div role="tablist" aria-label="Formas de tomar la clase" className="grid grid-cols-2 rounded-full bg-[#f2f0e9] p-1">
                {pestanas.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={pestana === t.id}
                    onClick={() => setPestana(t.id)}
                    className={`rounded-full px-4 py-2.5 font-sans text-sm font-semibold transition-colors ${
                      pestana === t.id ? "bg-white text-[var(--color-verde)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
            <div role="tabpanel" className="flex flex-col gap-4">
              {(pestana === "paquetes" ? opciones.slice(1) : opciones.slice(0, 1)).map((o) => (
                <div key={o.key} className="rounded-2xl border border-[var(--color-border)] p-5">
                  {o.nombre ? (
                    <p className="font-serif text-xl leading-tight text-[#403c3c]">{o.nombre}</p>
                  ) : (
                    <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-terracota)]">{o.etiqueta}</p>
                  )}
                  <p className="mt-1 font-sans text-sm text-[var(--color-muted)]">{o.detalle}</p>
                  {o.notas && (
                    <p className="mt-3 font-sans text-[15px] leading-6 text-[var(--color-text)] whitespace-pre-line">{o.notas}</p>
                  )}
                  {o.incluye.length > 0 && (
                    <div className="mt-4">
                      <p className="font-sans text-xs font-semibold text-[var(--color-text)] mb-2">Incluye</p>
                      <ListaPuntos items={o.incluye} tono="verde" />
                    </div>
                  )}
                  {o.condiciones.length > 0 && (
                    <div className="mt-4">
                      <p className="font-sans text-xs font-semibold text-[var(--color-text)] mb-2">Condiciones</p>
                      <ListaPuntos items={o.condiciones} tono="muted" />
                    </div>
                  )}
                  <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-end justify-between gap-3">
                    <div className="font-sans">
                      <p>
                        <span className="text-2xl font-semibold text-[var(--color-verde)]">{precioMx(o.precio)}</span>{" "}
                        <span className="text-sm text-[var(--color-muted)]">{o.precioNota}</span>
                      </p>
                      {o.inscripcion > 0 && (
                        <p className="mt-0.5 text-sm font-semibold text-[var(--color-terracota)]">+ Inscripción anual {precioMx(o.inscripcion)} (se paga en Papela)</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setElegida(o)}
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-verde)] px-5 py-2.5 font-sans text-sm font-semibold text-[var(--color-cremita)] hover:opacity-90 transition-opacity"
                    >
                      Apartar clase
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Paso 2: resumen de lo elegido + lo que se paga */
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl bg-[#f2f0e9] px-5 py-4">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-terracota)]">
                {tipo.nombre} · {elegida.etiqueta}
              </p>
              {elegida.nombre && <p className="mt-1 font-serif text-xl text-[#403c3c]">{elegida.nombre}</p>}
              <dl className="mt-3 flex flex-col gap-1.5">
                <Dato etiqueta="Opción">{elegida.detalle}</Dato>
                {tipo.duracion > 0 && <Dato etiqueta="Duración">{duracionTexto(tipo.duracion)}</Dato>}
                {horarioSemanal.length > 0 && (
                  <Dato etiqueta="Horario">
                    {horarioSemanal.map((h) => (
                      <span key={`${h.dia}-${h.rango}`} className="block">
                        {h.dia} de {h.rango}
                      </span>
                    ))}
                  </Dato>
                )}
              </dl>
            </div>

            {elegida.incluye.length > 0 && (
              <div>
                <p className="label text-[var(--color-terracota)] mb-2">Incluye</p>
                <ListaPuntos items={elegida.incluye} tono="verde" />
              </div>
            )}
            {elegida.condiciones.length > 0 && (
              <div>
                <p className="label text-[var(--color-terracota)] mb-2">Condiciones</p>
                <ListaPuntos items={elegida.condiciones} tono="muted" />
              </div>
            )}
            {elegida.notas && (
              <p className="font-sans text-[15px] leading-6 text-[var(--color-text)] whitespace-pre-line">{elegida.notas}</p>
            )}

            <div className="font-sans text-[15px]">
              <div className="flex justify-between gap-3 text-[var(--color-text)]">
                <span>{elegida.paquete ? `Paquete${elegida.paquete.sesiones ? ` (${elegida.paquete.sesiones} clases)` : ""}` : "Clase suelta"}</span>
                <span>{precioMx(elegida.precio)}</span>
              </div>
              <div className="flex justify-between gap-3 mt-2 pt-2 border-t border-[var(--color-border)] font-semibold text-[var(--color-verde)]">
                <span>Total</span>
                <span>{precioMx(elegida.precio)} MXN</span>
              </div>
              {elegida.inscripcion > 0 && (
                <p className="mt-2 rounded-xl bg-[#fdeee8] px-3 py-2 text-sm text-[var(--color-terracota)]">
                  La inscripción anual de {precioMx(elegida.inscripcion)} se paga directamente en Papela.
                </p>
              )}
              {elegida.paquete && (
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Al pagar en línea eliges el día de tu primera clase; las siguientes las agendas con nosotros.
                </p>
              )}
            </div>
          </div>
        )}
      </HojaInferior>
    </article>
  );
}

/** Paquetes heredados sin clase: se muestran con su info y se apartan por WhatsApp. */
export function PaquetesSueltos({
  paquetes,
  maestraNombre,
  whatsapp,
}: {
  paquetes: PaqueteClasePublico[];
  maestraNombre: string;
  whatsapp: string | null;
}) {
  const waNumero = whatsapp || WHATSAPP_PAPELA;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paquetes.map((p) => {
        const o = opcionDePaquete(p);
        return (
          <div key={p.id} className="flex flex-col rounded-2xl bg-[#f2f0e9] p-5">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-terracota)]">Paquete</p>
            <p className="mt-1 font-serif text-xl text-[#403c3c]">{p.nombre}</p>
            <p className="mt-1 font-sans text-sm text-[var(--color-muted)]">{o.detalle}</p>
            {o.incluye.length > 0 && (
              <div className="mt-4">
                <ListaPuntos items={o.incluye} tono="verde" />
              </div>
            )}
            <p className="mt-auto pt-5 font-sans">
              <span className="text-2xl font-semibold text-[var(--color-verde)]">{precioMx(o.precio)}</span>{" "}
              <span className="text-sm text-[var(--color-muted)]">{o.precioNota}</span>
            </p>
            <a
              href={`https://wa.me/${waNumero}?text=${encodeURIComponent(`Hola Papela 🌿 me interesa el "${p.nombre}" con ${maestraNombre}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[var(--color-verde)] px-6 py-3 font-sans text-sm font-semibold text-[var(--color-cremita)] hover:opacity-90 transition-opacity"
            >
              Apartar por WhatsApp
            </a>
          </div>
        );
      })}
    </div>
  );
}
