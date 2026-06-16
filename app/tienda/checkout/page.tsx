"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useCartStore, COSTO_ENVIO } from "@/lib/stores/cartStore";

const ESTADOS_MX = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas",
  "Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Guanajuato",
  "Guerrero","Hidalgo","Jalisco","México","Michoacán","Morelos","Nayarit",
  "Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí",
  "Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas",
];

interface FormData {
  nombre: string;
  telefono: string;
  calle: string;
  colonia: string;
  cp: string;
  ciudad: string;
  estado: string;
}

const empty: FormData = {
  nombre: "", telefono: "", calle: "", colonia: "", cp: "", ciudad: "", estado: "",
};

function Field({
  label, name, value, onChange, type = "text", placeholder = "", required = true,
}: {
  label: string; name: keyof FormData; value: string;
  onChange: (k: keyof FormData, v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
        {label}{required && <span className="text-[var(--color-terracota)]"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 font-sans text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-verde)] transition-colors"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, tipoEnvio, subtotal, total, closeCart } = useCartStore();
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) router.replace("/productos");
  }, [items, router]);

  // Close cart drawer if open when landing here
  useEffect(() => { closeCart(); }, [closeCart]);

  const setField = (k: keyof FormData, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const direccionEnvio =
        tipoEnvio === "envio"
          ? {
              calle: form.calle,
              colonia: form.colonia,
              cp: form.cp,
              ciudad: form.ciudad,
              estado: form.estado,
            }
          : null;

      const res = await fetch("/api/tienda/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
          tipoEnvio,
          compradorNombre: form.nombre,
          compradorTelefono: form.telefono,
          direccionEnvio,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Error al crear el pago");
      }
      const data = await res.json();
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  const esEnvio = tipoEnvio === "envio";

  return (
    <section className="w-[90%] mx-auto pt-28 md:pt-32 pb-20">
      {/* Back */}
      <Link
        href="/productos"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors mb-10"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Volver al catálogo
      </Link>

      <h1 className="font-serif font-extralight text-[clamp(2rem,4vw,3rem)] text-[#403C3C] mb-10">
        Finalizar compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">

        {/* ── Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* Datos de contacto */}
          <div className="flex flex-col gap-4">
            <h2 className="font-serif font-extralight text-xl text-[#403C3C]">
              Datos de contacto
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre completo" name="nombre" value={form.nombre} onChange={setField} placeholder="Ana García" />
              <Field label="Teléfono" name="telefono" value={form.telefono} onChange={setField} type="tel" placeholder="222 123 4567" />
            </div>
          </div>

          {/* Dirección de envío */}
          {esEnvio && (
            <div className="flex flex-col gap-4">
              <h2 className="font-serif font-extralight text-xl text-[#403C3C]">
                Dirección de envío
              </h2>
              <Field label="Calle y número" name="calle" value={form.calle} onChange={setField} placeholder="Av. Reforma 123 Int. 4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Colonia" name="colonia" value={form.colonia} onChange={setField} placeholder="Centro Histórico" />
                <Field label="Código postal" name="cp" value={form.cp} onChange={setField} placeholder="72000" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Ciudad / Municipio" name="ciudad" value={form.ciudad} onChange={setField} placeholder="Puebla" />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
                    Estado <span className="text-[var(--color-terracota)]">*</span>
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) => setField("estado", e.target.value)}
                    required
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 font-sans text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-verde)] transition-colors"
                  >
                    <option value="" disabled>Selecciona…</option>
                    {ESTADOS_MX.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Recoger info */}
          {!esEnvio && (
            <div className="rounded-2xl bg-[var(--color-cremita-2)] px-6 py-5 flex flex-col gap-1">
              <p className="font-sans text-sm font-semibold text-[var(--color-verde)]">
                Recoger en el atelier
              </p>
              <p className="font-sans text-sm text-[var(--color-muted)]">
                Nos pondremos en contacto contigo al teléfono que proporcionaste para coordinar la fecha de recoger.
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative overflow-hidden rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] py-4 font-sans text-sm font-semibold transition-opacity disabled:opacity-60 w-full"
          >
            <span className="absolute inset-0 bg-black/10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
            <span className="relative">
              {loading ? "Redirigiendo a MercadoPago…" : "Continuar al pago"}
            </span>
          </button>

          <p className="text-xs text-center text-[var(--color-muted)]">
            Serás redirigido a MercadoPago para completar tu pago de forma segura.
          </p>
        </form>

        {/* ── Order summary ─────────────────────────────────── */}
        <aside className="lg:sticky lg:top-32 rounded-2xl border border-[var(--color-border)] bg-white p-6 flex flex-col gap-5">
          <h2 className="font-serif font-extralight text-xl text-[#403C3C]">
            Tu pedido
          </h2>

          <ul className="flex flex-col gap-4 divide-y divide-[var(--color-border)]">
            {items.map((item) => (
              <li key={item.productoId} className="flex gap-3 pt-4 first:pt-0">
                <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-cremita-2)]">
                  {item.imagenUrl && (
                    <Image src={item.imagenUrl} alt={item.nombre} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-[var(--color-text)] leading-snug truncate">{item.nombre}</p>
                  <p className="font-sans text-xs text-[var(--color-muted)] mt-0.5">Cantidad: {item.cantidad}</p>
                </div>
                <p className="font-sans text-sm font-medium text-[var(--color-text)] flex-shrink-0">
                  ${(item.precio * item.cantidad).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>

          <div className="border-t border-[var(--color-border)] pt-4 flex flex-col gap-2 text-sm font-sans">
            <div className="flex justify-between text-[var(--color-muted)]">
              <span>Subtotal</span>
              <span>${subtotal().toLocaleString()} MXN</span>
            </div>
            <div className="flex justify-between text-[var(--color-muted)]">
              <span>Envío</span>
              <span>{esEnvio ? `$${COSTO_ENVIO} MXN` : "Gratis (recoger)"}</span>
            </div>
            <div className="flex justify-between font-semibold text-base text-[var(--color-text)] pt-2 border-t border-[var(--color-border)] mt-1">
              <span>Total</span>
              <span>${total().toLocaleString()} MXN</span>
            </div>
          </div>

          {/* Entrega badge */}
          <div className={`rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            esEnvio
              ? "bg-[#CED8D9] text-[#1e2d36]"
              : "bg-[#C9D3C0] text-[#2b3a2e]"
          }`}>
            {esEnvio ? "📦 Envío nacional · $80 MXN" : "🏠 Recoger en el atelier · Gratis"}
          </div>
        </aside>
      </div>
    </section>
  );
}
