"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";

export default function TallerCheckoutForm({
  tallerId,
  titulo,
  precio,
  cupoTotal,
}: {
  tallerId: string;
  titulo: string;
  precio: number;
  cupoTotal: number;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const total = precio * cantidad;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      setError("Por favor llena nombre y correo electrónico.");
      return;
    }
    setEstado("loading");
    setError("");

    try {
      const res = await fetch("/api/talleres/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tallerId,
          cantidad,
          nombreUsuario: nombre.trim(),
          emailUsuario: email.trim(),
          telefonoUsuario: telefono.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Sin URL de pago");
      }
    } catch {
      setEstado("error");
      setError("Algo salió mal. Intenta de nuevo.");
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-[var(--color-text)] font-sans text-base bg-white outline-none transition-colors ${
      focusedField === field
        ? "border-[var(--color-verde)]"
        : "border-[var(--color-border)]"
    }`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Resumen */}
      <div className="bg-[var(--color-cremita)] rounded-xl p-5 border-l-4 border-[var(--color-verde)]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-verde)] mb-1">
          Apartando
        </p>
        <p className="font-serif font-extralight text-[1.4rem] text-[var(--color-text)] leading-tight">
          {titulo}
        </p>
        <p className="font-sans text-sm text-[var(--color-verde)] mt-1 font-medium">
          ${precio.toLocaleString("es-MX")} MXN por persona
        </p>
      </div>

      {/* Nombre */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-verde)]">
          Nombre completo <span className="text-[var(--color-terracota)]">*</span>
        </label>
        <input
          type="text"
          placeholder="Ana Martínez"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onFocus={() => setFocusedField("nombre")}
          onBlur={() => setFocusedField(null)}
          className={inputClass("nombre")}
          required
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-verde)]">
          Correo electrónico <span className="text-[var(--color-terracota)]">*</span>
        </label>
        <input
          type="email"
          placeholder="ana@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
          className={inputClass("email")}
          required
        />
      </div>

      {/* Teléfono */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-verde)]">
          Teléfono <span className="text-[var(--color-muted)] normal-case tracking-normal font-normal text-xs">(opcional)</span>
        </label>
        <input
          type="tel"
          placeholder="222 123 4567"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          onFocus={() => setFocusedField("telefono")}
          onBlur={() => setFocusedField(null)}
          className={inputClass("telefono")}
        />
      </div>

      {/* Cantidad */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-verde)]">
          Número de personas <span className="text-[var(--color-terracota)]">*</span>
        </label>
        <div className="flex items-center gap-3 border border-[var(--color-border)] rounded-xl px-4 py-3 bg-white w-fit">
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            disabled={cantidad <= 1}
            aria-label="Menos personas"
            className="w-8 h-8 rounded-full border border-[var(--color-verde)] flex items-center justify-center text-[var(--color-verde)] disabled:opacity-30 disabled:border-[var(--color-border)] transition-opacity"
          >
            <MinusIcon className="w-3 h-3" />
          </button>
          <span className="font-sans font-semibold text-lg text-[var(--color-text)] min-w-[1.5rem] text-center">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.min(cupoTotal, c + 1))}
            disabled={cantidad >= cupoTotal}
            aria-label="Más personas"
            className="w-8 h-8 rounded-full border border-[var(--color-verde)] bg-[var(--color-verde)]/10 flex items-center justify-center text-[var(--color-verde)] disabled:opacity-30 transition-opacity"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
          <span className="font-sans text-sm text-[var(--color-muted)] ml-1">
            {cantidad === 1 ? "persona" : "personas"} · máx {cupoTotal}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between bg-[var(--color-cremita)] rounded-xl px-5 py-4">
        <span className="font-sans text-sm text-[var(--color-muted)]">
          {cantidad} × ${precio.toLocaleString("es-MX")}
        </span>
        <span className="font-serif font-extralight text-[1.8rem] text-[var(--color-verde)] leading-none">
          ${total.toLocaleString("es-MX")}{" "}
          <span className="font-sans text-sm font-normal text-[var(--color-muted)]">MXN</span>
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-[var(--color-terracota)] bg-[#F0D9CC] border border-[#d6bdb2] rounded-xl px-4 py-3 font-sans">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={estado === "loading"}
        className="w-full bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans font-semibold text-base py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {estado === "loading"
          ? "Procesando..."
          : `Pagar $${total.toLocaleString("es-MX")} MXN →`}
      </button>

      <p className="text-center font-sans text-xs text-[var(--color-muted)]">
        🔒 Pago seguro con MercadoPago
      </p>
    </form>
  );
}
