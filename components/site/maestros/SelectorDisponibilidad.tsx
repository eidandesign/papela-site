"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  DIAS_CLASE,
  DIAS_SEMANA,
  MAX_OPCIONES,
  diaDelMes,
  fechaLegible,
  horaLegible,
  horasDeInicio,
  idTaller,
  leerIdTaller,
  mesLegible,
  rangoCorto,
  rangoLegible,
  type Disponibilidad,
} from "@/lib/maestros/disponibilidad";
import type { Modalidad } from "@/lib/maestros/campos";

// Paso "Tu actividad" de la propuesta del maestro: en vez de escribir día y
// horario, ELIGE entre lo que de verdad está libre en la agenda de Papela.
//  · Clases: lunes a viernes en bloques de 2 horas; lo que ya tiene clase sale
//    tachado y deshabilitado (no se esconde: así se entiende por qué no está).
//  · Talleres: UNA fecha en tres desplegables (Mes → Día → Horario): solo
//    sábados y domingos libres, y la hora dentro del horario de la tienda.
// Clases: hasta 3 opciones en orden de preferencia (el orden en que se tocan).
// Talleres: una sola fecha.

const labelCls = "font-sans text-[15px] md:text-base font-semibold text-[var(--color-text)]";
const chipBase =
  "relative h-12 rounded-xl border-[1.5px] font-sans text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-verde)]";
const chipLibre = "cursor-pointer border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-verde)]";
const chipElegido = "cursor-pointer border-[var(--color-verde)] bg-[var(--color-verde)] text-[var(--color-cremita)]";
const chipApagado = "cursor-not-allowed border-[var(--color-border)] bg-transparent text-[#403C3C]/45";

function Orden({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[var(--color-cremita)] border-[1.5px] border-[var(--color-verde)] text-[var(--color-verde)] font-sans text-xs font-bold flex items-center justify-center"
    >
      {n}
    </span>
  );
}

export default function SelectorDisponibilidad({
  modalidad,
  disponibilidad,
  opciones,
  onChange,
  label,
  error,
  idBase,
}: {
  modalidad: Modalidad;
  disponibilidad: Disponibilidad;
  opciones: string[];
  onChange: (ids: string[]) => void;
  label: string;
  error?: string;
  idBase: string;
}) {
  const labelId = `${idBase}-label`;
  const errorId = `${idBase}-error`;
  // Mes abierto en el selector de talleres ("AAAA-MM"). Arranca en el de la
  // fecha ya elegida (al volver de otro paso) y vive aquí porque elegir mes no
  // es todavía una selección: la propuesta solo guarda fecha + hora.
  const [mesSel, setMesSel] = useState(() => leerIdTaller(opciones[0] ?? "")?.fecha.slice(0, 7) ?? "");
  const max = MAX_OPCIONES[modalidad];
  const lleno = opciones.length >= max;

  const encabezado = (ayuda: string) => (
    <div className="flex flex-col gap-1">
      <span id={labelId} className={labelCls}>
        {label}
        <span className="text-[var(--color-terracota)]"> *</span>
      </span>
      <p className="font-sans text-[15px] leading-relaxed text-[#403C3C]/70">{ayuda}</p>
    </div>
  );
  const pie = (
    <>
      <p className="font-sans text-sm text-[#403C3C]/60" aria-live="polite">
        {opciones.length} de {max} elegidas
        {lleno ? ". Quita una si quieres cambiarla." : ""}
      </p>
      {error && (
        <p id={errorId} role="alert" className="font-sans text-sm text-[var(--color-terracota)]">
          {error}
        </p>
      )}
    </>
  );

  // ── Clases: lunes a viernes × bloques ──────────────────────────────────────
  if (modalidad === "clases") {
    const alternar = (id: string) => onChange(opciones.includes(id) ? opciones.filter((x) => x !== id) : [...opciones, id]);
    return (
      <div role="group" aria-labelledby={labelId} aria-describedby={error ? errorId : undefined} className="flex flex-col gap-4">
        {encabezado(`Elige hasta ${max}, en el orden que prefieras. Los tachados ya tienen clase.`)}
        <div className="flex flex-col gap-4 sm:gap-3">
          {DIAS_CLASE.map((dia) => (
            <div key={dia} className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-2 sm:gap-4 sm:items-center">
              <span className="font-sans text-[15px] font-semibold text-[#403C3C]/80">{DIAS_SEMANA[dia]}</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {disponibilidad.clases
                  .filter((b) => b.dia === dia)
                  .map((b) => {
                    const orden = opciones.indexOf(b.id);
                    const elegido = orden >= 0;
                    const apagado = !b.libre || (lleno && !elegido);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        aria-pressed={elegido}
                        data-invalido={error && b.libre ? "" : undefined}
                        disabled={apagado}
                        onClick={() => alternar(b.id)}
                        aria-label={`${DIAS_SEMANA[dia]}, ${rangoLegible(b.inicio, b.fin)}${b.libre ? "" : ", ocupado"}`}
                        className={`${chipBase} ${elegido ? chipElegido : apagado ? chipApagado : chipLibre} ${b.libre ? "" : "line-through"}`}
                      >
                        {elegido && <Orden n={orden + 1} />}
                        {rangoCorto(b.inicio, b.fin)}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        {pie}
      </div>
    );
  }

  // ── Talleres: una fecha en tres desplegables: Mes → Día → Horario ──────────
  // Cada uno se enciende al elegir el anterior (deshabilitado, no escondido).
  // Solo salen sábados y domingos libres; el horario depende del día.
  const elegida = opciones.map(leerIdTaller).find((x) => x !== null) ?? null;
  const f = elegida ? disponibilidad.talleres.find((x) => x.fecha === elegida.fecha) : undefined;
  const meses: { clave: string; nombre: string; fechas: Disponibilidad["talleres"] }[] = [];
  for (const x of disponibilidad.talleres) {
    const clave = x.fecha.slice(0, 7);
    const grupo = meses[meses.length - 1];
    if (grupo?.clave === clave) grupo.fechas.push(x);
    else meses.push({ clave, nombre: mesLegible(x.fecha), fechas: [x] });
  }
  const mes = meses.find((m) => m.clave === mesSel);

  function ponerMes(clave: string) {
    setMesSel(clave);
    // Cambiar de mes borra el día: ya no corresponde.
    if (elegida && elegida.fecha.slice(0, 7) !== clave) onChange([]);
  }
  function ponerDia(clave: string) {
    const nueva = disponibilidad.talleres.find((x) => x.fecha === clave);
    if (!nueva) return onChange([]);
    // Conserva la hora ya elegida si ese día también se puede.
    const inicio = elegida && horasDeInicio(nueva).includes(elegida.inicio) ? elegida.inicio : nueva.abre;
    onChange([idTaller(clave, inicio)]);
  }

  const selectCls =
    "w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 appearance-none h-14 md:h-16 pl-5 pr-12 rounded-2xl border-[1.5px] border-[var(--color-border)] bg-white font-sans text-lg md:text-xl text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-verde)] focus-visible:ring-4 focus-visible:ring-[var(--color-verde)]/15";
  const subLabelCls = "font-sans text-sm font-semibold text-[#403C3C]/70";
  const flecha = <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#403C3C]/60" />;
  const mesId = `${idBase}-mes`;
  const diaId = `${idBase}-dia`;
  const horaId = `${idBase}-hora`;

  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={error ? errorId : undefined} className="flex flex-col gap-4">
      {encabezado("Los talleres son en sábado o domingo. Elige el mes, el día y a qué hora empezarías.")}
      {disponibilidad.talleres.length === 0 ? (
        <p className="rounded-2xl border border-[var(--color-border)] bg-white p-4 font-sans text-[15px] text-[#403C3C]/80">
          Por ahora no tenemos sábados ni domingos libres. Escríbenos por WhatsApp y buscamos una fecha juntos.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <label htmlFor={mesId} className={subLabelCls}>
                Mes
              </label>
              <div className="relative">
                <select
                  id={mesId}
                  value={mes?.clave ?? ""}
                  data-invalido={error ? "" : undefined}
                  onChange={(ev) => ponerMes(ev.target.value)}
                  className={`${selectCls} ${mes ? "" : "text-[#403C3C]/60"}`}
                >
                  <option value="">Elige el mes</option>
                  {meses.map((m) => (
                    <option key={m.clave} value={m.clave}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                {flecha}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={diaId} className={subLabelCls}>
                Día
              </label>
              <div className="relative">
                <select
                  id={diaId}
                  value={elegida?.fecha ?? ""}
                  disabled={!mes}
                  onChange={(ev) => ponerDia(ev.target.value)}
                  className={`${selectCls} ${elegida ? "" : "text-[#403C3C]/60"}`}
                >
                  <option value="">Elige el día</option>
                  {(mes?.fechas ?? []).map((x) => (
                    <option key={x.fecha} value={x.fecha}>
                      {DIAS_SEMANA[x.dia]} {diaDelMes(x.fecha)}
                    </option>
                  ))}
                </select>
                {flecha}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={horaId} className={subLabelCls}>
                Horario
              </label>
              <div className="relative">
                <select
                  id={horaId}
                  value={elegida?.inicio ?? ""}
                  disabled={!f}
                  onChange={(ev) => elegida && onChange([idTaller(elegida.fecha, Number(ev.target.value))])}
                  className={`${selectCls} ${f ? "" : "text-[#403C3C]/60"}`}
                >
                  {f ? (
                    horasDeInicio(f).map((m) => (
                      <option key={m} value={m}>
                        {horaLegible(m)}
                      </option>
                    ))
                  ) : (
                    <option value="">Elige la hora</option>
                  )}
                </select>
                {flecha}
              </div>
            </div>
          </div>
          {/* Renglón siempre presente para que el formulario no brinque al elegir. */}
          <p className="min-h-5 font-sans text-sm text-[#403C3C]/60">
            {f ? `${fechaLegible(f.fecha)}: abrimos de ${rangoLegible(f.abre, f.cierra)}` : ""}
          </p>
        </div>
      )}
      {error && (
        <p id={errorId} role="alert" className="font-sans text-sm text-[var(--color-terracota)]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Lo elegido, como lista numerada (paso de revisión). */
export function ResumenDisponibilidad({ renglones }: { renglones: string[] }) {
  return (
    <ol className="flex flex-col gap-1">
      {renglones.map((r, i) => (
        <li key={r} className="flex gap-2">
          {renglones.length > 1 && <span className="font-semibold text-[var(--color-verde)]">{i + 1}.</span>}
          <span>{r}</span>
        </li>
      ))}
    </ol>
  );
}
