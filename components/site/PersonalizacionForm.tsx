"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { inputBase } from "@/lib/ui";
import Select from "@/components/site/Select";

const TIPOS = [
  "Stickers personalizados",
  "Cake toppers",
  "Tazas personalizadas",
  "Vasos personalizados",
  "Etiquetas y empaques",
  "Manualidades y detalles creativos",
  "Otro / varias cosas",
];

const OCASIONES = [
  "Cumpleaños",
  "Graduaciones",
  "Día de las Madres",
  "Día del Padre",
  "Bautizos",
  "Baby showers",
  "Fiestas infantiles",
  "Regalos especiales",
  "Eventos escolares",
  "Emprendimientos",
  "Mesas de dulces",
  "Ramos y arreglos",
  "Detalles corporativos",
  "Otra",
];


export default function PersonalizacionForm() {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: si el campo oculto viene lleno, es un bot
    if (data.get("website")) {
      setEnviado(true);
      return;
    }

    const payload = {
      nombre: String(data.get("nombre") || "").trim(),
      telefono: String(data.get("telefono") || "").trim(),
      email: String(data.get("email") || "").trim(),
      tipo: String(data.get("tipo") || "").trim(),
      ocasion: String(data.get("ocasion") || "").trim(),
      mensaje: String(data.get("mensaje") || "").trim(),
    };

    if (!payload.nombre || !payload.telefono || !payload.mensaje) {
      setError("Por favor completa tu nombre, WhatsApp y la idea que tienes en mente.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/personalizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar tu solicitud.");
      }
      setEnviado(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-cremita-3)] px-8 py-16 text-center">
        <CheckCircleIcon className="h-14 w-14 text-[var(--color-verde)]" aria-hidden="true" />
        <h3 className="font-serif italic text-[28px] leading-tight text-[var(--color-verde)]">
          ¡Recibimos tu idea!
        </h3>
        <p className="max-w-sm font-sans text-[15px] text-[var(--color-muted)]">
          Te contactaremos muy pronto por WhatsApp para platicar los detalles y hacer tu proyecto realidad.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-cremita-3)] p-6 md:p-8"
      noValidate
    >
      <div className="flex flex-col gap-4">
        {/* Honeypot anti-spam (oculto a usuarios reales) */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="label text-[var(--color-terracota)]">
              Nombre *
            </label>
            <input id="nombre" name="nombre" type="text" required maxLength={100} className={inputBase} placeholder="Tu nombre" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="telefono" className="label text-[var(--color-terracota)]">
              WhatsApp *
            </label>
            <input id="telefono" name="telefono" type="tel" required maxLength={30} className={inputBase} placeholder="Tu número" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="label text-[var(--color-terracota)]">
            Correo (opcional)
          </label>
          <input id="email" name="email" type="email" maxLength={150} className={inputBase} placeholder="tucorreo@ejemplo.com" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo" className="label text-[var(--color-terracota)]">
              ¿Qué quieres personalizar?
            </label>
            <Select id="tipo" name="tipo" defaultValue="">
              <option value="" disabled>Elige una opción</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ocasion" className="label text-[var(--color-terracota)]">
              ¿Para qué ocasión?
            </label>
            <Select id="ocasion" name="ocasion" defaultValue="">
              <option value="" disabled>Elige una opción</option>
              {OCASIONES.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="mensaje" className="label text-[var(--color-terracota)]">
            Cuéntanos tu idea *
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            required
            maxLength={1000}
            rows={4}
            className={`${inputBase} resize-none`}
            placeholder="Describe lo que tienes en mente: colores, frases, temática, cantidad, fecha que necesitas…"
          />
        </div>

        {error && (
          <p className="font-sans text-[14px] text-[var(--color-terracota)]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="group relative mt-2 inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--color-verde)] px-6 py-4 font-sans text-[16px] text-[var(--color-cremita)] transition-opacity disabled:opacity-60"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            {enviando ? "Enviando…" : "Enviar mi idea"}
            {!enviando && <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />}
          </span>
        </button>

        <p className="text-center font-sans text-[13px] text-[var(--color-muted)]">
          Te respondemos por WhatsApp para afinar los detalles.
        </p>
      </div>
    </form>
  );
}
