"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useReservaModalStore } from "@/lib/stores/reservaModalStore";
import ClaseCalendar from "@/components/site/ClaseCalendar";
import Select from "@/components/site/Select";

const WHATSAPP_FALLBACK = "522211865590";

function WaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

export default function ReservaModal() {
  const data = useReservaModalStore((s) => s.data);
  const close = useReservaModalStore((s) => s.close);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [prevClase, setPrevClase] = useState<string | null>(null);

  // Patrón estándar para render solo-cliente (createPortal necesita document).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Al abrir (o cambiar de maestra) resetea a "Todas las clases" — así nunca
  // se oculta un horario existente que aún no tiene tipo asignado en el admin.
  // Ajuste de estado en render (recomendado por React) en vez de useEffect:
  // evita un render extra y el flash de la selección anterior.
  const claseKey = data?.claseNombre ?? null;
  if (claseKey !== prevClase) {
    setPrevClase(claseKey);
    setSelected(null);
  }

  const tipoSeleccionado = data?.tipos.find((t) => t.id === selected) ?? null;

  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [data, close]);

  if (!mounted) return null;

  const numero = data?.whatsapp || WHATSAPP_FALLBACK;
  const waText = encodeURIComponent(
    tipoSeleccionado
      ? `Hola Papela 🌿 me interesa reservar la clase de "${tipoSeleccionado.nombre}" con ${data?.claseNombre}.`
      : `Hola Papela 🌿 me interesa reservar una clase con ${data?.claseNombre}.`
  );
  const waHref = `https://wa.me/${numero}?text=${waText}`;

  return createPortal(
    <AnimatePresence>
      {data && (
        <div
          key="reserva-modal"
          className="fixed inset-0 z-[100050] flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Elige tu horario"
        >
          {/* Overlay */}
          <motion.button
            type="button"
            aria-label="Cerrar"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Card */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.38 }}
            className="relative z-10 w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-t-[28px] sm:rounded-[28px] px-5 py-8 sm:px-10 sm:py-10 shadow-2xl"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f0e9] text-[var(--color-text)] hover:bg-[#e7d6cf] transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="font-serif font-extralight text-[clamp(2rem,5vw,3rem)] text-[#403c3c] leading-tight">
            Elige tu horario
          </h2>
          <p className="font-sans text-sm text-[var(--color-muted)] mt-2 max-w-md mx-auto">
            Selecciona el día y la hora que más te acomode. Las reservas se cierran
            dos horas antes de la clase.
          </p>
        </div>

        {/* Selector de tipo de clase (dropdown del DS) */}
        {data.tipos.length > 0 && (
          <div className="mb-6 max-w-sm mx-auto flex flex-col gap-1.5">
            <label
              htmlFor="reserva-actividad"
              className="label text-[var(--color-terracota)] text-center"
            >
              ¿Qué clase quieres tomar?
            </label>
            <Select
              id="reserva-actividad"
              value={selected ?? ""}
              onChange={(e) => setSelected(e.target.value || null)}
            >
              <option value="">Todas las clases</option>
              {data.tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} — ${t.precio.toLocaleString()} MXN
                </option>
              ))}
            </Select>
          </div>
        )}

        {data.horarios.length > 0 ? (
          <ClaseCalendar
            key={selected ?? "todas"}
            horarios={data.horarios}
            claseNombre={data.claseNombre}
            tipoClaseId={selected ?? undefined}
            tipoClaseNombre={tipoSeleccionado?.nombre}
          />
        ) : (
          <div className="bg-[#f2f0e9] rounded-xl px-5 py-8 text-center">
            <p className="font-serif font-extralight text-xl text-[#403C3C] mb-2">
              Próximamente
            </p>
            <p className="font-sans text-[var(--color-muted)]">
              No hay horarios disponibles por el momento. Escríbenos por WhatsApp y
              te avisamos en cuanto abramos fechas.
            </p>
          </div>
        )}

        {/* WhatsApp */}
        <div className="mt-7 pt-6 border-t border-[var(--color-border)] flex flex-col items-center gap-3">
          <p className="font-sans text-sm text-[var(--color-muted)] text-center">
            ¿Prefieres reservar con una persona?
          </p>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3.5 font-sans text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            <WaIcon className="h-5 w-5" />
            Reservar con WhatsApp
          </a>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
