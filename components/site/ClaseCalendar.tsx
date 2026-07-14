"use client";

import { useState } from "react";
import type { Horario } from "@/lib/clases";
import {
  TZ,
  diaMexico,
  horaMexico,
  sumarDiasAClave,
  diaSemanaLunes0,
  diaDelMes,
  mesYAnio,
} from "@/lib/fecha";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

// Toda la grilla se razona con claves "YYYY-MM-DD" del día calendario en hora de
// México. Así el bucketing y las horas mostradas coinciden con el admin, sin que
// el TZ del runtime (SSR en UTC, o un visitante en otra zona) desplace los días.

// Lunes de la semana a la que pertenece una clave de día.
function lunesDeLaSemana(key: string) {
  return sumarDiasAClave(key, -diaSemanaLunes0(key));
}

// Número de semana dentro del mes, calculado sobre la clave de día.
function semanaDelMes(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const primerDiaSemana = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0=Dom
  const diff = primerDiaSemana === 0 ? 1 : primerDiaSemana === 1 ? 0 : 8 - primerDiaSemana;
  const primerLunes = 1 + diff;
  if (d < primerLunes) return 1;
  return Math.floor((d - primerLunes) / 7) + (diff === 0 ? 1 : 2);
}

export default function ClaseCalendar({
  horarios: todosLosHorarios,
  claseNombre,
  tipoClaseId,
  tipoClaseNombre,
}: {
  horarios: Horario[];
  claseNombre: string;
  tipoClaseId?: string;
  tipoClaseNombre?: string;
}) {
  // Sin tipo elegido ("Todas las clases") se muestran todos los horarios —
  // incluye los que aún no tienen tipo asignado en el admin (legacy).
  const horarios = tipoClaseId
    ? todosLosHorarios.filter((h) => h.tipo_clase_id === tipoClaseId)
    : todosLosHorarios;
  // Arranca en la semana del primer horario disponible (no en la semana actual
  // si ésta ya no tiene fechas) para no mostrar una semana vacía al abrir.
  const [weekStart, setWeekStart] = useState(() => {
    if (horarios.length > 0) {
      const earliest = horarios.reduce(
        (min, h) => (new Date(h.fecha_hora) < new Date(min.fecha_hora) ? h : min),
        horarios[0]
      );
      return lunesDeLaSemana(diaMexico(new Date(earliest.fecha_hora)));
    }
    return lunesDeLaSemana(diaMexico(new Date()));
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Claves de día (Lun–Vie) de la semana visible.
  const weekDays = Array.from({ length: 5 }, (_, i) => sumarDiasAClave(weekStart, i));
  const todayKey = diaMexico(new Date());

  const slotsByDay = weekDays.map((dayKey) =>
    horarios.filter((h) => diaMexico(new Date(h.fecha_hora)) === dayKey)
  );

  const hasAnySlot = slotsByDay.some((s) => s.length > 0);

  async function handleReservar(h: Horario) {
    setLoading(h.id);
    setErrorMsg(null);
    try {
      const date = new Date(h.fecha_hora);
      const fechaHora = date.toLocaleDateString("es-MX", {
        weekday: "long", day: "numeric", month: "long", timeZone: TZ,
      }) + " a las " + horaMexico(date);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horarioId: h.id,
          claseNombre,
          actividad: tipoClaseNombre,
          fechaHora,
          precio: h.precio,
          duracion: h.duracion_minutos,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Error al crear el pago");
      }
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        setErrorMsg("No se pudo iniciar el pago. Intenta de nuevo.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  // Flat sorted list of slots for mobile view
  const allSlots = weekDays.flatMap((dayKey, i) =>
    slotsByDay[i].map((h) => ({ h, dayKey, dayIdx: i }))
  );

  const weekNum = semanaDelMes(weekStart);

  const weekNav = (
    <div className="flex items-center justify-between gap-4">
      <button
        type="button"
        aria-label="Semana anterior"
        onClick={() => setWeekStart((w) => sumarDiasAClave(w, -7))}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-serif font-extralight text-[clamp(1.4rem,5vw,2rem)] capitalize text-[var(--color-text)] leading-tight">
          {mesYAnio(weekStart)}
        </span>
        <span className="font-sans text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Semana {weekNum}
        </span>
      </div>
      <button
        type="button"
        aria-label="Siguiente semana"
        onClick={() => setWeekStart((w) => sumarDiasAClave(w, 7))}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {errorMsg && (
        <p className="text-sm font-sans text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {errorMsg}
        </p>
      )}
      {weekNav}

      {/* ── MOBILE: list rows ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {allSlots.length === 0 ? (
          <p className="text-center font-sans text-[var(--color-muted)] py-6">
            No hay clases disponibles esta semana. Navega a la siguiente.
          </p>
        ) : allSlots.map(({ h, dayKey, dayIdx }) => {
          const isToday = dayKey === todayKey;
          const hora = horaMexico(new Date(h.fecha_hora));
          return (
            <div
              key={h.id}
              className="flex items-center gap-4 bg-[#e7d6cf] rounded-2xl px-4 py-4"
            >
              {/* Date pill */}
              <div className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl ${isToday ? "bg-[var(--color-verde)]" : "bg-white/60"}`}>
                <span className={`font-sans text-[10px] uppercase tracking-widest leading-none ${isToday ? "text-[var(--color-cremita)]" : "text-[var(--color-muted)]"}`}>
                  {DAYS[dayIdx]}
                </span>
                <span className={`font-serif text-2xl leading-tight ${isToday ? "text-[var(--color-cremita)]" : "text-[var(--color-text)]"}`}>
                  {diaDelMes(dayKey)}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[var(--color-verde)] text-base leading-tight">{hora}</p>
                <p className="font-sans text-xs text-[var(--color-muted)] mt-0.5">
                  {h.duracion_minutos} min · {h.cupo_disponible} lugar{h.cupo_disponible !== 1 ? "es" : ""}
                </p>
                <p className="font-sans font-semibold text-[var(--color-text)] text-sm mt-1">
                  ${h.precio.toLocaleString()} MXN
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => handleReservar(h)}
                disabled={loading === h.id}
                className="flex-shrink-0 bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading === h.id ? "..." : "Reservar"}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: 5-column calendar grid ── */}
      <div className="hidden md:grid grid-cols-5 gap-3">
        {weekDays.map((dayKey, i) => {
          const slots = slotsByDay[i];
          const isToday = dayKey === todayKey;
          return (
            <div key={i} className="flex flex-col gap-3">
              <div className={`flex flex-col items-center py-3 rounded-xl ${isToday ? "bg-[var(--color-verde)]" : "bg-[#f2f0e9]"}`}>
                <span className={`font-sans text-xs uppercase tracking-widest ${isToday ? "text-[var(--color-cremita)]" : "text-[var(--color-muted)]"}`}>
                  {DAYS[i]}
                </span>
                <span className={`font-serif text-2xl leading-tight ${isToday ? "text-[var(--color-cremita)]" : "text-[var(--color-text)]"}`}>
                  {diaDelMes(dayKey)}
                </span>
              </div>
              {slots.map((h) => {
                const hora = horaMexico(new Date(h.fecha_hora));
                return (
                  <div key={h.id} className="flex flex-col items-center gap-2 bg-[#e7d6cf] rounded-xl p-3 text-center w-full">
                    <span className="font-sans font-medium text-sm text-[var(--color-verde)]">{hora}</span>
                    <span className="font-sans text-xs text-[var(--color-muted)]">{h.duracion_minutos}m</span>
                    <span className="font-sans font-semibold text-sm text-[var(--color-text)]">${h.precio.toLocaleString()}</span>
                    <span className="font-sans text-xs text-[var(--color-muted)]">
                      {h.cupo_disponible} lugar{h.cupo_disponible !== 1 ? "es" : ""}
                    </span>
                    <button
                      onClick={() => handleReservar(h)}
                      disabled={loading === h.id}
                      className="w-full mt-1 bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans text-xs py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading === h.id ? "Cargando..." : "Reservar"}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {!hasAnySlot && (
        <p className="hidden md:block text-center font-sans text-[var(--color-muted)] py-6">
          No hay clases disponibles esta semana. Navega a la siguiente.
        </p>
      )}
    </div>
  );
}
