"use client";

import { useState } from "react";
import type { Horario } from "@/lib/clases";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatMes(date: Date) {
  return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

function getWeekOfMonth(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstMonday = new Date(firstDay);
  const day = firstDay.getDay();
  const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  firstMonday.setDate(firstDay.getDate() + diff);
  if (date < firstMonday) return 1;
  return Math.floor((date.getDate() - firstMonday.getDate()) / 7) + (diff === 0 ? 1 : 2);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function ClaseCalendar({
  horarios,
  claseNombre,
  actividad,
}: {
  horarios: Horario[];
  claseNombre: string;
  actividad?: string;
}) {
  // Arranca en la semana del primer horario disponible (no en la semana actual
  // si ésta ya no tiene fechas) para no mostrar una semana vacía al abrir.
  const [weekStart, setWeekStart] = useState(() => {
    if (horarios.length > 0) {
      const earliest = horarios.reduce(
        (min, h) => (new Date(h.fecha_hora) < new Date(min.fecha_hora) ? h : min),
        horarios[0]
      );
      return startOfWeek(new Date(earliest.fecha_hora));
    }
    return startOfWeek(new Date());
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const slotsByDay = weekDays.map((day) =>
    horarios.filter((h) => isSameDay(new Date(h.fecha_hora), day))
  );

  const hasAnySlot = slotsByDay.some((s) => s.length > 0);

  async function handleReservar(h: Horario) {
    setLoading(h.id);
    setErrorMsg(null);
    try {
      const date = new Date(h.fecha_hora);
      const fechaHora = date.toLocaleDateString("es-MX", {
        weekday: "long", day: "numeric", month: "long",
      }) + " a las " + date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          horarioId: h.id,
          claseNombre,
          actividad,
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
  const allSlots = weekDays.flatMap((day, i) =>
    slotsByDay[i].map((h) => ({ h, day, dayIdx: i }))
  );

  const weekNum = getWeekOfMonth(weekStart);

  const weekNav = (
    <div className="flex items-center justify-between gap-4">
      <button
        type="button"
        aria-label="Semana anterior"
        onClick={() => setWeekStart((w) => addDays(w, -7))}
        className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center hover:opacity-80 transition-opacity"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-serif font-extralight text-[clamp(1.4rem,5vw,2rem)] capitalize text-[var(--color-text)] leading-tight">
          {formatMes(weekStart)}
        </span>
        <span className="font-sans text-xs uppercase tracking-widest text-[var(--color-muted)]">
          Semana {weekNum}
        </span>
      </div>
      <button
        type="button"
        aria-label="Siguiente semana"
        onClick={() => setWeekStart((w) => addDays(w, 7))}
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
        ) : allSlots.map(({ h, day, dayIdx }) => {
          const isToday = isSameDay(day, new Date());
          const hora = new Date(h.fecha_hora).toLocaleTimeString("es-MX", {
            hour: "2-digit", minute: "2-digit",
          });
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
                  {day.getDate()}
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
        {weekDays.map((day, i) => {
          const slots = slotsByDay[i];
          const isToday = isSameDay(day, new Date());
          return (
            <div key={i} className="flex flex-col gap-3">
              <div className={`flex flex-col items-center py-3 rounded-xl ${isToday ? "bg-[var(--color-verde)]" : "bg-[#f2f0e9]"}`}>
                <span className={`font-sans text-xs uppercase tracking-widest ${isToday ? "text-[var(--color-cremita)]" : "text-[var(--color-muted)]"}`}>
                  {DAYS[i]}
                </span>
                <span className={`font-serif text-2xl leading-tight ${isToday ? "text-[var(--color-cremita)]" : "text-[var(--color-text)]"}`}>
                  {day.getDate()}
                </span>
              </div>
              {slots.map((h) => {
                const hora = new Date(h.fecha_hora).toLocaleTimeString("es-MX", {
                  hour: "2-digit", minute: "2-digit",
                });
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
