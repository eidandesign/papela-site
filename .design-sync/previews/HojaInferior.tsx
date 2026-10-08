import { HojaInferior } from "papela-ds";
import { CheckIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

const noop = () => {};
const IMG = "https://qrrqptkcgezposfmkvqy.supabase.co/storage/v1/object/public/producto-imagenes/1791147306379-xsnwfescaj.jpg";

// Page behind the sheet (/clases/<maestra>, "Más información").
const Fondo = () => (
  <div style={{ margin: -24, minHeight: 760, padding: 40, background: "var(--color-bg)" }}>
    <p className="label text-[var(--color-terracota)] mb-4">Más información</p>
    <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight">Clases de Celia</h2>
  </div>
);

const Puntos = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-1.5">
    {items.map((x) => (
      <li key={x} className="flex items-start gap-2 font-sans text-[15px] leading-6 text-[var(--color-text)]">
        <CheckIcon className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--color-verde)]" aria-hidden />
        {x}
      </li>
    ))}
  </ul>
);

// Default ("centro"): centered window on desktop — activity detail as opened
// from ActividadesGrid (image, ages badge, description, materials).
export const Default = () => (
  <>
    <Fondo />
    <HojaInferior abierta onClose={noop} titulo="Proyectos inspirados en artistas">
      <div className="flex flex-col gap-4">
        <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#e7d6cf]">
          <img src={IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <span className="self-start bg-[#fdeee8] text-[var(--color-terracota)] text-[11px] font-semibold tracking-[0.16em] uppercase font-sans px-3 py-1 rounded-full">
          Edades: 4 a 8 años
        </span>
        <p className="font-sans text-[16px] leading-7 text-[var(--color-text)]">
          Utilizando como inspiración a artistas como Van Gogh, Monet, Mondrian, Warhol, entre otros, creamos proyectos en donde manejamos manchas, repeticiones, espirales y armonía de colores en patrones reconocibles que les ayuden a comprender el arte y a buscar su propio estilo.
        </p>
        <div className="flex flex-col gap-3">
          <p className="label text-[var(--color-terracota)]">Materiales</p>
          <p className="font-sans text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--color-terracota)]">Proyecto Van Gogh</p>
          <Puntos items={["Lienzo 30x40 cm", "Fécula de maíz (160 gr)", "Resistol 850 (110 gr)", "Témperas escolares (amarillo, azul, rojo, blanco y negro)", "Lápiz HB"]} />
        </div>
      </div>
    </HojaInferior>
  </>
);

// variante="drawer": full-height right panel on desktop — the class drawer
// from /clases at step 2 ("Tu elección"), with back link + fixed CTA footer.
export const Drawer = () => (
  <>
    <Fondo />
    <HojaInferior
      abierta
      onClose={noop}
      variante="drawer"
      titulo="Tu elección"
      encabezado={
        <button type="button" className="inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[var(--color-verde)] hover:opacity-80">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Otras opciones
        </button>
      }
      pie={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <a className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-6 py-3 font-sans text-sm font-semibold text-[var(--color-text)]">
            Por WhatsApp
          </a>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-verde)] px-6 py-3 font-sans text-sm font-semibold text-[var(--color-cremita)]">
            Pagar en línea
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl bg-[#f2f0e9] px-5 py-4">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-terracota)]">Club de Arcilla · Paquete</p>
          <p className="mt-1 font-serif text-xl text-[#403c3c]">Paquete mensual</p>
          <dl className="mt-3 flex flex-col gap-1.5">
            {[["Opción", "4 clases · vigencia 30 días"], ["Duración", "2 horas"], ["Horario", "Jueves de 06:00 p.m. a 08:00 p.m."]].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[96px_1fr] gap-3 font-sans text-[15px] leading-6">
                <dt className="text-[var(--color-muted)]">{k}</dt>
                <dd className="text-[var(--color-text)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <p className="label text-[var(--color-terracota)] mb-2">Incluye</p>
          <Puntos items={["Arcilla y herramientas durante la clase", "Horneado de tus piezas", "Esmaltes de colores"]} />
        </div>
        <div className="font-sans text-[15px]">
          <div className="flex justify-between gap-3 text-[var(--color-text)]">
            <span>Paquete (4 clases)</span>
            <span>$1,400</span>
          </div>
          <div className="flex justify-between gap-3 mt-2 pt-2 border-t border-[var(--color-border)] font-semibold text-[var(--color-verde)]">
            <span>Total</span>
            <span>$1,400 MXN</span>
          </div>
          <p className="mt-2 rounded-xl bg-[#fdeee8] px-3 py-2 text-sm text-[var(--color-terracota)]">
            La inscripción anual de $300 se paga directamente en Papela.
          </p>
        </div>
      </div>
    </HojaInferior>
  </>
);
