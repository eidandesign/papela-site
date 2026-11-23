"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  LockClosedIcon,
  MapPinIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { useCartStore, COSTO_ENVIO, cartKey, type TipoEnvio } from "@/lib/stores/cartStore";
import { irACheckout } from "@/lib/analitica";
import ConsentimientoPrivacidad from "@/components/site/ConsentimientoPrivacidad";
import { NEGOCIO, DIRECCION_LINEA } from "@/lib/negocio";

const ESTADOS_MX = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas",
  "Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Guanajuato",
  "Guerrero","Hidalgo","Jalisco","México","Michoacán","Morelos","Nayarit",
  "Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí",
  "Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas",
];

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  calle: string;
  colonia: string;
  cp: string;
  ciudad: string;
  estado: string;
  referencias: string;
}

const empty: FormData = {
  nombre: "", email: "", telefono: "", calle: "", colonia: "", cp: "", ciudad: "", estado: "", referencias: "",
};

function Field({
  label, name, value, onChange, type = "text", placeholder = "", required = true,
  autoComplete, inputMode, maxLength, pattern, title,
}: {
  label: string; name: keyof FormData; value: string;
  onChange: (k: keyof FormData, v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
  autoComplete?: string; inputMode?: "text" | "tel" | "email" | "numeric"; maxLength?: number;
  pattern?: string; title?: string;
}) {
  const fieldId = `checkout-field-${name}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
        {label}{required ? <span className="text-[var(--color-terracota)]"> *</span> : <span className="normal-case tracking-normal font-normal"> (opcional)</span>}
      </label>
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        pattern={pattern}
        title={title}
        className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 font-sans text-base sm:text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/60 focus:outline-none focus:border-[var(--color-verde)] focus:ring-2 focus:ring-[var(--color-verde)]/15 transition-all"
      />
    </div>
  );
}

/** Número de sección: circulito verde + título serif, como guía visual del flujo. */
function SeccionTitulo({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="w-7 h-7 shrink-0 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] text-sm font-sans font-semibold flex items-center justify-center">
        {n}
      </span>
      <h2 className="font-serif font-extralight text-xl text-[#403C3C]">{children}</h2>
    </div>
  );
}

const METODOS_PAGO = [
  { Icon: CreditCardIcon, label: "Tarjeta de crédito y débito" },
  { Icon: CalendarDaysIcon, label: "Meses sin intereses" },
  { Icon: BanknotesIcon, label: "Efectivo en OXXO" },
  { Icon: BuildingLibraryIcon, label: "Transferencia SPEI" },
];

function ResumenItems() {
  const { items, openCart } = useCartStore();
  return (
    <ul className="flex flex-col divide-y divide-[var(--color-border)]">
      {items.map((item) => (
        <li key={cartKey(item)} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="relative w-14 h-14 flex-shrink-0">
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-[var(--color-cremita-2)]">
              {item.imagenUrl && (
                <Image src={item.imagenUrl} alt={item.nombre} fill sizes="56px" className="object-cover" />
              )}
            </div>
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] text-[10px] font-bold flex items-center justify-center" aria-label={`Cantidad: ${item.cantidad}`}>
              {item.cantidad}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm text-[var(--color-text)] leading-snug truncate">{item.nombre}</p>
            {item.variacionNombre && (
              <p className="font-sans text-xs text-[var(--color-muted)] mt-0.5 truncate">{item.variacionNombre}</p>
            )}
            {item.cantidad > 1 && (
              <p className="font-sans text-xs text-[var(--color-muted)] mt-0.5">${item.precio.toLocaleString()} c/u</p>
            )}
          </div>
          <p className="font-sans text-sm font-medium text-[var(--color-text)] flex-shrink-0">
            ${(item.precio * item.cantidad).toLocaleString()}
          </p>
        </li>
      ))}
      <li className="pt-3">
        <button type="button" onClick={openCart} className="font-sans text-xs font-semibold text-[var(--color-verde)] underline underline-offset-2">
          Editar carrito
        </button>
      </li>
    </ul>
  );
}

function ResumenTotales() {
  const { tipoEnvio, subtotal, total } = useCartStore();
  const esEnvio = tipoEnvio === "envio";
  return (
    <div className="rounded-xl bg-[var(--color-cremita-3)] p-5 flex flex-col gap-2 text-sm font-sans">
      <div className="flex justify-between text-[var(--color-muted)]">
        <span>Subtotal</span>
        <span>${subtotal().toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-[var(--color-muted)]">
        <span>{esEnvio ? "Envío nacional" : "Recoger en tienda"}</span>
        <span>{esEnvio ? `$${COSTO_ENVIO}` : "Gratis"}</span>
      </div>
      <div className="flex justify-between items-baseline font-semibold text-[var(--color-text)] pt-2 border-t border-[var(--color-border)] mt-1">
        <span>Total</span>
        <span className="text-lg">${total().toLocaleString()} <span className="text-xs font-normal text-[var(--color-muted)]">MXN</span></span>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, tipoEnvio, setTipoEnvio, total, closeCart } = useCartStore();
  const [form, setForm] = useState<FormData>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sinPromociones, setSinPromociones] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // El carrito vive en localStorage: el server renderiza esta página vacía
  // (null). Esperar al montaje evita el mismatch de hidratación.
  const [mounted, setMounted] = useState(false);
  // Intentional: gates the persisted-cart content so SSR and first client render match.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0) router.replace("/productos");
  }, [mounted, items, router]);

  // Close cart drawer if open when landing here
  useEffect(() => { closeCart(); }, [closeCart]);

  // Un error del servidor puede quedar fuera de pantalla: llevar al usuario a él.
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

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
              ...(form.referencias.trim() ? { referencias: form.referencias.trim() } : {}),
            }
          : null;

      const res = await fetch("/api/tienda/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productoId: i.productoId,
            cantidad: i.cantidad,
            variacionId: i.variacionId ?? null,
            variacionNombre: i.variacionNombre ?? null,
          })),
          tipoEnvio,
          compradorNombre: form.nombre,
          compradorEmail: form.email,
          compradorTelefono: form.telefono,
          direccionEnvio,
          sinPromociones,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Error al crear el pago");
      }
      const data = await res.json();
      irACheckout(data.checkoutUrl, "producto", data.analitica);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  if (!mounted || items.length === 0) return null;

  const esEnvio = tipoEnvio === "envio";

  const opcionEnvio = (tipo: TipoEnvio, activo: boolean, Icon: typeof TruckIcon, titulo: string, precio: string, detalle: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={activo}
      onClick={() => setTipoEnvio(tipo)}
      className={`flex items-start gap-3 rounded-2xl border-2 bg-white px-4 py-4 text-left transition-colors ${
        activo
          ? "border-[var(--color-verde)]"
          : "border-[var(--color-border)] hover:border-[var(--color-verde)]/40"
      }`}
    >
      <span className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${activo ? "border-[var(--color-verde)] bg-[var(--color-verde)]" : "border-[var(--color-border)]"}`}>
        {activo && <CheckIcon className="w-3 h-3 text-[var(--color-cremita)]" strokeWidth={3} />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center justify-between gap-2">
          <span className="font-sans text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
            <Icon className="w-[18px] h-[18px] text-[var(--color-verde)]" />
            {titulo}
          </span>
          <span className={`font-sans text-xs font-bold ${precio === "Gratis" ? "text-[var(--color-verde)]" : "text-[var(--color-text)]"}`}>{precio}</span>
        </span>
        <span className="block font-sans text-xs text-[var(--color-muted)] mt-1 leading-relaxed">{detalle}</span>
      </span>
    </button>
  );

  return (
    <section className="w-[90%] mx-auto pt-40 md:pt-32 pb-20">
      {/* Back + pasos */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Link
          href="/productos"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Seguir comprando
        </Link>
        <ol className="flex items-center gap-1.5 font-sans text-xs text-[var(--color-muted)]" aria-label="Pasos de la compra">
          <li className="flex items-center gap-1 text-[var(--color-verde)]">
            <CheckIcon className="w-3.5 h-3.5" /> Carrito
          </li>
          <ChevronRightIcon aria-hidden="true" className="w-3 h-3" />
          <li className="font-semibold text-[var(--color-text)]" aria-current="step">Tus datos</li>
          <ChevronRightIcon aria-hidden="true" className="w-3 h-3" />
          <li>Pago seguro</li>
        </ol>
      </div>

      <h1 className="font-serif font-extralight text-[clamp(2rem,4vw,3rem)] text-[#403C3C] mb-8 md:mb-10">
        Finalizar compra
      </h1>

      {/* Resumen colapsable — solo móvil, para ver el total desde el inicio */}
      <details className="lg:hidden group rounded-2xl border border-[var(--color-border)] bg-white mb-8 open:pb-5">
        <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className="font-sans text-sm font-semibold text-[var(--color-verde)] flex items-center gap-2">
            Resumen del pedido
            <ChevronDownIcon className="w-4 h-4 transition-transform group-open:rotate-180" />
          </span>
          <span className="font-sans text-sm font-semibold text-[var(--color-text)]">${total().toLocaleString()} MXN</span>
        </summary>
        <div className="px-5 flex flex-col gap-4">
          <ResumenItems />
          <ResumenTotales />
        </div>
      </details>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-start">

        {/* ── Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">

          {error && (
            <div ref={errorRef} role="alert" className="rounded-xl bg-[#F6D9CF] px-4 py-3 text-sm font-sans text-[#8C482A]">
              <strong>No pudimos continuar:</strong> {error}
            </div>
          )}

          {/* 1 · Entrega */}
          <div className="flex flex-col gap-4">
            <SeccionTitulo n={1}>¿Cómo quieres recibir tu pedido?</SeccionTitulo>
            <div role="radiogroup" aria-label="Forma de entrega" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {opcionEnvio("recoger", !esEnvio, BuildingStorefrontIcon, "Recoger en tienda", "Gratis", "Listo el mismo día o al siguiente. Te avisamos cuando esté empacado.")}
              {opcionEnvio("envio", esEnvio, TruckIcon, "Envío a domicilio", `$${COSTO_ENVIO}`, "A todo México por paquetería. Te mandamos tu guía de rastreo.")}
            </div>

            {!esEnvio && (
              <div className="rounded-2xl bg-[var(--color-cremita-2)] px-5 py-4 flex gap-3">
                <MapPinIcon className="w-5 h-5 shrink-0 text-[var(--color-verde)] mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <p className="font-sans text-sm font-semibold text-[var(--color-verde)]">Papela Atelier</p>
                  <p className="font-sans text-sm text-[var(--color-muted)]">{DIRECCION_LINEA}</p>
                  <a href={NEGOCIO.comoLlegarUrl} target="_blank" rel="noopener noreferrer" className="font-sans text-xs font-semibold text-[var(--color-verde)] underline underline-offset-2 mt-1">
                    Cómo llegar
                  </a>
                </div>
              </div>
            )}

            {esEnvio && (
              <div className="flex flex-col gap-4">
                <Field label="Calle y número" name="calle" value={form.calle} onChange={setField} placeholder="Av. Reforma 123 Int. 4" autoComplete="street-address" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Colonia" name="colonia" value={form.colonia} onChange={setField} placeholder="Centro Histórico" />
                  <Field label="Código postal" name="cp" value={form.cp} onChange={setField} placeholder="72000" autoComplete="postal-code" inputMode="numeric" maxLength={5} pattern="[0-9]{5}" title="5 dígitos" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Ciudad / Municipio" name="ciudad" value={form.ciudad} onChange={setField} placeholder="Puebla" autoComplete="address-level2" />
                  <div className="flex flex-col gap-1">
                    <label htmlFor="checkout-field-estado" className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
                      Estado <span className="text-[var(--color-terracota)]">*</span>
                    </label>
                    <select
                      id="checkout-field-estado"
                      value={form.estado}
                      onChange={(e) => setField("estado", e.target.value)}
                      required
                      autoComplete="address-level1"
                      className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 font-sans text-base sm:text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-verde)] focus:ring-2 focus:ring-[var(--color-verde)]/15 transition-all"
                    >
                      <option value="" disabled>Selecciona…</option>
                      {ESTADOS_MX.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Field label="Referencias para la entrega" name="referencias" value={form.referencias} onChange={setField} placeholder="Casa blanca con portón café, entre calle 5 y 7" required={false} maxLength={200} />
              </div>
            )}
          </div>

          {/* 2 · Datos de contacto */}
          <div className="flex flex-col gap-4">
            <SeccionTitulo n={2}>Tus datos</SeccionTitulo>
            <Field label="Nombre completo" name="nombre" value={form.nombre} onChange={setField} placeholder="Ana García" autoComplete="name" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Correo" name="email" value={form.email} onChange={setField} type="email" placeholder="ana@correo.com" autoComplete="email" inputMode="email" />
              <Field label="Teléfono / WhatsApp" name="telefono" value={form.telefono} onChange={setField} type="tel" placeholder="222 123 4567" autoComplete="tel" inputMode="tel" />
            </div>
            <p className="-mt-1 font-sans text-sm text-[var(--color-muted)]">
              Al correo te mandamos la confirmación{esEnvio ? " y la guía de envío" : ""}; tu teléfono es solo para avisarte de tu pedido.
            </p>
          </div>

          {/* 3 · Pago */}
          <div className="flex flex-col gap-4">
            <SeccionTitulo n={3}>Pago seguro</SeccionTitulo>

            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 flex flex-col gap-4">
              <p className="font-sans text-sm text-[var(--color-text)]">
                Al continuar irás a <strong>Mercado Pago</strong> para elegir cómo pagar:
              </p>
              <ul className="flex flex-wrap gap-2">
                {METODOS_PAGO.map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 font-sans text-xs text-[var(--color-text)]">
                    <Icon className="w-4 h-4 text-[var(--color-verde)]" />
                    {label}
                  </li>
                ))}
              </ul>
              <p className="font-sans text-xs text-[var(--color-muted)] flex items-start gap-1.5">
                <LockClosedIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Pago cifrado y procesado por Mercado Pago. Nunca vemos ni guardamos los datos de tu tarjeta.
              </p>
            </div>

            <ConsentimientoPrivacidad accion="continuar al pago" sinPromociones={sinPromociones} onChange={setSinPromociones} />

            <button
              type="submit"
              disabled={loading}
              className="group relative overflow-hidden rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] py-4 font-sans text-sm font-semibold transition-opacity disabled:opacity-60 w-full"
            >
              <span className="absolute inset-0 bg-black/10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span aria-hidden="true" className="w-4 h-4 rounded-full border-2 border-[var(--color-cremita)]/40 border-t-[var(--color-cremita)] animate-spin" />
                    Llevándote a Mercado Pago…
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="w-4 h-4" />
                    Ir a pagar · ${total().toLocaleString()} MXN
                  </>
                )}
              </span>
            </button>

            <p className="text-xs text-center text-[var(--color-muted)]">
              ¿Dudas con tu pedido? Revisa nuestros{" "}
              <Link href="/terminos" className="underline underline-offset-2 hover:text-[var(--color-verde)]">cambios y devoluciones</Link>.
            </p>
          </div>
        </form>

        {/* ── Order summary (desktop) ───────────────────────── */}
        <aside className="hidden lg:flex lg:sticky lg:top-32 rounded-2xl border border-[var(--color-border)] bg-white p-6 flex-col gap-5">
          <h2 className="font-serif font-extralight text-xl text-[#403C3C]">
            Tu pedido
          </h2>
          <ResumenItems />
          <ResumenTotales />
          <p className="font-sans text-xs text-[var(--color-muted)] flex items-center gap-1.5">
            <LockClosedIcon className="w-3.5 h-3.5 shrink-0" />
            Compra protegida con Mercado Pago
          </p>
        </aside>
      </div>
    </section>
  );
}
