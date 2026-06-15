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

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function ClaseCalendar({
  horarios,
  claseNombre,
}: {
  horarios: Horario[];
  claseNombre: string;
}) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [loading, setLoading] = useState<string | null>(null);

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const slotsByDay = weekDays.map((day) =>
    horarios.filter((h) => isSameDay(new Date(h.fecha_hora), day))
  );

  const hasAnySlot = slotsByDay.some((s) => s.length > 0);

  async function handleReservar(h: Horario) {
    setLoading(h.id);
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
          fechaHora,
          precio: h.precio,
          duracion: h.duracion_minutos,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("No se pudo iniciar el pago. Intenta de nuevo.");
      }
    } catch {
      alert("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Semana anterior"
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          className="w-9 h-9 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <span className="font-sans text-sm capitalize text-[var(--color-text)]">
          {formatMes(weekStart)}
        </span>
        <button
          type="button"
          aria-label="Siguiente semana"
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          className="w-9 h-9 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-5 gap-3">
        {weekDays.map((day, i) => {
          const slots = slotsByDay[i];
          const isToday = isSameDay(day, new Date());
          return (
            <div key={i} className="flex flex-col gap-3">
              {/* Day header */}
              <div className={`flex flex-col items-center py-3 rounded-xl ${isToday ? "bg-[var(--color-verde)]" : "bg-[#f2f0e9]"}`}>
                <span className={`font-sans text-xs uppercase tracking-widest ${isToday ? "text-[var(--color-cremita)]" : "text-[var(--color-muted)]"}`}>
                  {DAYS[i]}
                </span>
                <span className={`font-serif text-2xl leading-tight ${isToday ? "text-[var(--color-cremita)]" : "text-[var(--color-text)]"}`}>
                  {day.getDate()}
                </span>
              </div>

              {/* Slots */}
              {slots.map((h) => {
                const hora = new Date(h.fecha_hora).toLocaleTimeString("es-MX", {
                  hour: "2-digit", minute: "2-digit",
                });
                return (
                  <div key={h.id} className="flex flex-col items-center gap-2 bg-[#e7d6cf] border-2 border-transparent rounded-xl p-3 text-center w-full">
                    <span className="font-sans font-medium text-sm text-[var(--color-verde)]">
                      {hora}
                    </span>
                    <span className="font-sans text-xs text-[var(--color-muted)]">
                      {h.duracion_minutos}m
                    </span>
                    <span className="font-sans font-semibold text-sm text-[var(--color-text)]">
                      ${h.precio.toLocaleString()}
                    </span>
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
        <p className="text-center font-sans text-[var(--color-muted)] py-6">
          No hay clases disponibles esta semana. Navega a la siguiente.
        </p>
      )}
    </div>
  );
}
