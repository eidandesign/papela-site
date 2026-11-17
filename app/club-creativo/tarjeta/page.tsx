import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import ScrollReveal from "@/components/site/ScrollReveal";
import { TarjetaAnatomiaVisual, TarjetaAnatomiaLeyenda } from "@/components/site/club/TarjetaAnatomia";
import { TarjetasFlotantesFondo, TarjetasFlotantesAbanico } from "@/components/site/club/TarjetasFlotantes";
import MonedaPapela from "@/components/site/club/MonedaPapela";
import WhatsAppLink from "@/components/site/WhatsAppLink";

// Página que explica la Tarjeta de Lealtad del Club Creativo (nov-2026).
// Las reglas salen del admin (tabla `club_cashback_config` + cómo se han
// registrado las ventas): 5% de cashback en compras de $100 o más, calculado
// sobre lo pagado en dinero (no sobre lo pagado con Coins); cada abono vence a
// los 365 días (`vigencia_dias`, nov-17-2026; los Coins ganados antes no
// vencen porque el admin fija `vence_at` al acreditar);
// se puede pagar hasta el 100% con Coins. Cada compra da 1 estampita y su
// rareza depende del monto (`estampitas_niveles`: raro desde $200,
// legendario desde $500). Los premios de ejemplo son reales de `club_stickers`.
// ⚠️ Si cambian en el admin, actualizar PROGRAMA y PREMIOS aquí.
// Diseño (nov-2026, Figma "Website 2025" nodo 466-2): hero CLARO con tarjetas
// flotando (nombres inventados) → Papela Coins (par Cacao, monedas flotando)
// → estampitas → cómo funciona → anatomía → FAQ → CTA terracota. Se quitaron
// "Cómo se consigue", "Reglas" y la caja de ejemplo de los Coins; esa info
// quedó en las preguntas frecuentes.
const PROGRAMA = {
  porcentaje: 5,
  compraMinima: 100,
  vigencia: "1 año",
  raroDesde: 200,
  legendarioDesde: 500,
  ejemploCompra: 500,
};

const PREMIOS: Record<"comun" | "raro" | "legendario", string[]> = {
  comun: ["Impresiones a color", "Sacapuntas metálico", "10% en tu próxima compra", "Bolsita de diamantina", "Lápiz con las tablas"],
  raro: ["Cerámica mini", "20% en tu próxima clase de arte", "Botón personalizado", "Lápiz con semilla", "Impresión fotográfica"],
  legendario: ["Cabalgata en Calpan", "Planilla de stickers personalizada", "Tarjetas de presentación con diseño"],
};

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Tarjeta de Lealtad — Club Creativo Papela" },
  description: `Gratis: gana ${PROGRAMA.porcentaje}% en Papela Coins en cada compra y una estampita sorpresa que puede traer premio. Así funciona la Tarjeta de Lealtad de Papela.`,
  alternates: { canonical: "https://www.papela-atelier.com/club-creativo/tarjeta" },
  openGraph: {
    title: "Tarjeta de Lealtad — Club Creativo Papela",
    description: "Papela Coins, estampitas con premios y una tarjeta que es solo tuya.",
  },
};

const mxn = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });
const mxn0 = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

const TEXTO_WA = "Hola Papela 🌿 quiero mi Tarjeta de Lealtad del Club Creativo";

type VarianteCta = "blanco" | "terracota";
const CTA: Record<VarianteCta, { base: string; relleno: string }> = {
  // Hero claro: pastilla blanca, letra verde, se rellena de cremita
  blanco: {
    base: "bg-white text-[var(--color-verde)] shadow-[0_8px_24px_rgba(18,83,92,0.12)]",
    relleno: "bg-[var(--color-cremita-2)]",
  },
  // CTA final: terracota con letra cremita, se rellena de verde
  terracota: {
    base: "bg-[var(--color-terracota)] text-[var(--color-cremita)]",
    relleno: "bg-[var(--color-verde)]",
  },
};

function CtaPedir({ ubicacion, variante }: { ubicacion: string; variante: VarianteCta }) {
  const v = CTA[variante];
  return (
    <WhatsAppLink
      ubicacion={ubicacion}
      texto={TEXTO_WA}
      itemName="Tarjeta de Lealtad"
      lead={{ tipo: "club", item_name: "Tarjeta de Lealtad" }}
      className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full font-sans text-[15px] font-semibold px-7 py-3.5 ${v.base}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out ${v.relleno}`}
      />
      <span className="relative">Pedir mi tarjeta</span>
      <ArrowRightIcon className="relative w-4 h-4" aria-hidden="true" />
    </WhatsAppLink>
  );
}

// Encabezados del diseño nov-2026: eyebrow chico + título serif ITÁLICA
// (ya no extralight), centrados en "Cómo funciona" y "Anatomía".
function Encabezado({ eyebrow, titulo, texto, centrado = false }: { eyebrow: string; titulo: string; texto?: string; centrado?: boolean }) {
  return (
    <ScrollReveal className={centrado ? "text-center" : ""}>
      <p className="label text-[var(--color-muted)] mb-3">{eyebrow}</p>
      <h2 className={`font-serif italic text-[#403C3C] text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] mb-4 ${centrado ? "mx-auto" : ""} max-w-3xl`}>
        {titulo}
      </h2>
      {texto && (
        <p className={`font-sans text-[16px] leading-[24px] text-[var(--color-muted)] max-w-2xl ${centrado ? "mx-auto" : ""}`}>{texto}</p>
      )}
    </ScrollReveal>
  );
}

const PASOS = [
  { n: "01", titulo: "Pide tu tarjeta", texto: "En caja o por WhatsApp. Es gratis y te mandamos tu enlace personal: vive en tu celular, sin app ni contraseña." },
  { n: "02", titulo: "Compra como siempre", texto: `Cada compra suma ${PROGRAMA.porcentaje}% en Papela Coins y te da una estampita sorpresa para rascar.` },
  { n: "03", titulo: "Disfruta tus recompensas", texto: "Paga con tus Coins y reclama en caja los premios que traen tus estampitas." },
];

const NIVELES = [
  { clave: "comun" as const, nombre: "Común", img: "flor", monto: `Compras de hasta ${mxn0(PROGRAMA.raroDesde - 1)}`, bg: "#F0D9CC" },
  { clave: "raro" as const, nombre: "Raro ✦", img: "monstera", monto: `Compras desde ${mxn0(PROGRAMA.raroDesde)}`, bg: "#EEC3D7" },
  { clave: "legendario" as const, nombre: "Legendario ★", img: "caballo", monto: `Compras desde ${mxn0(PROGRAMA.legendarioDesde)}`, bg: "#E8C9A8" },
];

const PREGUNTAS = [
  { p: "¿Cuánto cuesta?", r: "Nada. La Tarjeta de Lealtad del Club Creativo es gratuita." },
  {
    p: "¿Cuánto cashback me dan?",
    r: `El ${PROGRAMA.porcentaje}% de lo que pagas, en compras de ${mxn0(PROGRAMA.compraMinima)} o más. En una compra de ${mxn0(PROGRAMA.ejemploCompra)} ganas ${mxn((PROGRAMA.ejemploCompra * PROGRAMA.porcentaje) / 100)} en Papela Coins.`,
  },
  {
    p: "¿Se acumula? ¿Cómo lo uso?",
    r: "Sí, tus Coins se van sumando compra tras compra. Para usarlos, avísanos en caja: pagas parte o el total de tu compra con ellos. No hay mínimo para usarlos.",
  },
  {
    p: "¿Mis Papela Coins vencen?",
    r: `Sí: cada abono dura ${PROGRAMA.vigencia} desde el día en que lo ganas. En tu tarjeta ves cuánto vence y en qué fecha, y al pagar con Coins se usan primero los más próximos a vencer.`,
  },
  {
    p: "Si pago con Coins, ¿también gano cashback?",
    r: `Sí, sobre la parte que pagas con dinero. Por ejemplo, si tu compra es de $350 y usas $200 en Coins, ganas ${PROGRAMA.porcentaje}% de los $150 restantes.`,
  },
  {
    p: "¿Es un sello por compra? ¿Cuántos necesito para un regalo?",
    r: `No hay que juntar sellos: cada compra te da una estampita y cada estampita es su propia sorpresa. Algunas traen un premio directo, sin importar cuántas tengas. Entre más grande la compra, más rara la estampita: común hasta ${mxn0(PROGRAMA.raroDesde - 1)}, rara desde ${mxn0(PROGRAMA.raroDesde)} y legendaria desde ${mxn0(PROGRAMA.legendarioDesde)}.`,
  },
  {
    p: "¿Todas las estampitas traen premio?",
    r: "No, más o menos la mitad. Las demás son para coleccionar, lucir en tu portada o regalar si te salen repetidas.",
  },
  {
    p: "¿Cómo reclamo un premio?",
    r: "Abre la estampita en tu tarjeta y enséñala en caja. Los premios descargables (como imprimibles) los bajas directo desde la ficha.",
  },
  {
    p: "¿Qué pasa si me sale una repetida?",
    r: "Puedes regalarla a otro miembro del Club con un código de un solo uso que dura 72 horas.",
  },
  {
    p: "¿Puedo compartir mi tarjeta?",
    r: "Tu tarjeta es personal e intransferible y vive en un enlace: quien lo tenga puede verla, así que compártelo solo con quien quieras.",
  },
];

export default function TarjetaLealtadPage() {
  return (
    <>
      {/* Hero claro (sin fondo de color): las tarjetas flotan alrededor */}
      <section
        className="relative mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden min-h-[80vh] lg:min-h-[88vh] flex flex-col"
        style={{ width: "98vw", marginLeft: "1vw", marginRight: "1vw", backgroundColor: "var(--color-bg)" }}
      >
        <TarjetasFlotantesFondo />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <p className="label text-[var(--color-verde)] mb-5 md:mb-6">Club Creativo · Tarjeta de Lealtad</p>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-verde)] max-w-2xl mb-5 md:mb-6">
            Cada compra te regresa algo
          </h1>
          <p className="font-sans text-[18px] leading-[24px] text-[#403C3C] max-w-md mb-10">
            {PROGRAMA.porcentaje}% en Papela Coins y una estampita sorpresa en cada compra. Gratis y ya activa.
          </p>
          <CtaPedir ubicacion="tarjeta_lealtad_hero" variante="blanco" />
          <TarjetasFlotantesAbanico />
        </div>
      </section>

      {/* Papela Coins — par Cacao, con monedas flotando */}
      <section className="w-[90%] mx-auto pt-16 md:pt-24 pb-12 md:pb-16">
        <ScrollReveal>
          <div className="relative rounded-[32px] md:rounded-[40px] bg-[var(--color-cacao)] px-7 pt-20 pb-24 md:px-16 md:py-24">
            <MonedaPapela tam={112} className="absolute left-[3%] top-[-28px] md:left-[4%] md:top-[2%]" retraso={0} />
            <MonedaPapela tam={60} className="absolute right-[8%] top-[4%] md:right-[22%] md:top-[6%]" retraso={-2.5} t2={5} t3={6} />
            <MonedaPapela tam={104} className="hidden sm:block absolute right-[4%] top-[38%]" retraso={-4} t2={7} t3={8} />
            <MonedaPapela tam={62} className="absolute left-[12%] bottom-[-30px] md:left-[16%]" retraso={-1.5} t2={5.5} t3={6.5} />

            <div className="relative max-w-xl mx-auto text-center">
              <p className="label text-[var(--color-rosa-papel)] mb-4">Cashback</p>
              <h2 className="font-serif italic text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-[var(--color-rosa-papel)] mb-4">
                Papela Coins
              </h2>
              <p className="font-sans text-[17px] leading-[25px] text-[var(--color-cremita)] mb-8">
                Dinero que vuelve a ti: {PROGRAMA.porcentaje}% en cada compra de {mxn0(PROGRAMA.compraMinima)} o más.
              </p>
              <ul className="inline-flex flex-col gap-3 text-left font-sans text-[15px] leading-[22px] text-[var(--color-cremita)]/90">
                <li className="flex gap-3"><ArrowPathIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-rosa-papel)]" aria-hidden="true" /><span><strong className="font-semibold text-[var(--color-cremita)]">Se acumulan</strong> compra tras compra.</span></li>
                <li className="flex gap-3"><ShoppingBagIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-rosa-papel)]" aria-hidden="true" /><span><strong className="font-semibold text-[var(--color-cremita)]">Se canjean en caja:</strong> pagas parte o el total de tu compra con ellos, sin mínimo.</span></li>
                <li className="flex gap-3"><DevicePhoneMobileIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-rosa-papel)]" aria-hidden="true" /><span><strong className="font-semibold text-[var(--color-cremita)]">Siempre a la vista</strong> en tu tarjeta.</span></li>
                <li className="flex gap-3"><ClockIcon className="w-5 h-5 mt-0.5 shrink-0 text-[var(--color-rosa-papel)]" aria-hidden="true" /><span><strong className="font-semibold text-[var(--color-cremita)]">Duran {PROGRAMA.vigencia}</strong> desde que los ganas.</span></li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Estampitas: título a la izquierda, texto a la derecha */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-4 md:gap-10 md:items-end mb-8 md:mb-10">
            <h2 className="font-serif italic text-[#403C3C] text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05]">
              Una estampita en cada compra, sin juntar sellos
            </h2>
            <p className="font-sans text-[16px] leading-[24px] text-[var(--color-muted)] max-w-xl md:pb-2">
              Aquí no cuentas sellos: cada compra te da una estampita sorpresa que rascas en tu tarjeta, y cada una es su propio premio. Su rareza depende del monto de tu compra.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NIVELES.map((nv, i) => (
            <ScrollReveal key={nv.clave} delay={i * 0.08} className="h-full">
              <div className="h-full rounded-[28px] p-7 flex flex-col" style={{ backgroundColor: nv.bg }}>
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-cacao)] mb-1.5">{nv.monto}</p>
                    <h3 className="font-serif italic text-[30px] leading-tight text-[var(--color-cacao)]">{nv.nombre}</h3>
                  </div>
                  <div className="relative w-20 h-20 shrink-0 -mt-1">
                    <Image src={`/images/club/preview/${nv.img}.webp`} alt="" fill sizes="80px" className="object-contain" />
                  </div>
                </div>
                <p className="font-sans text-[13px] font-semibold text-[var(--color-cacao)] mb-2.5">Premios que puedes encontrar</p>
                <ul className="flex flex-wrap gap-2">
                  {PREMIOS[nv.clave].map((pr) => (
                    <li key={pr} className="rounded-full bg-white/65 px-3 py-1.5 font-sans text-[13px] leading-tight text-[var(--color-cacao)]">
                      {pr}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <Encabezado eyebrow="Cómo funciona" titulo="Cómo funciona" centrado />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-10">
          {PASOS.map((paso, i) => (
            <ScrollReveal key={paso.n} delay={i * 0.08} className="h-full">
              <div className="h-full rounded-[28px] bg-white/60 border border-[var(--color-border)] p-7 md:p-8">
                <p className="font-serif italic text-[var(--color-verde)] text-[44px] leading-none mb-6">{paso.n}</p>
                <h3 className="font-serif italic text-[26px] leading-tight text-[#403C3C] mb-3">{paso.titulo}</h3>
                <p className="font-sans text-[16px] leading-[24px] text-[var(--color-muted)]">{paso.texto}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Anatomía de la tarjeta */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <Encabezado
          eyebrow="Anatomía"
          titulo="Conoce tu tarjeta"
          texto="Así se ve tu tarjeta en el celular. Cada número es algo que puedes hacer con ella."
          centrado
        />
        <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 lg:gap-16 items-center">
          <ScrollReveal>
            <TarjetaAnatomiaVisual />
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <TarjetaAnatomiaLeyenda />
          </ScrollReveal>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="w-[90%] mx-auto py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16">
        <ScrollReveal>
          <p className="label text-[var(--color-terracota)] mb-3">Dudas</p>
          <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3.25rem)] leading-[1.1]">
            Preguntas frecuentes
          </h2>
        </ScrollReveal>
        <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {PREGUNTAS.map((q) => (
            <details key={q.p} className="group py-5">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="font-serif italic text-[22px] leading-tight text-[#403C3C]">{q.p}</span>
                <ChevronDownIcon
                  className="w-5 h-5 shrink-0 text-[var(--color-verde)] transition-transform duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="font-sans text-[16px] leading-[24px] text-[var(--color-muted)] mt-3 max-w-2xl">{q.r}</p>
            </details>
          ))}
          <p className="font-sans text-[14px] text-[var(--color-muted)] pt-5">
            Consulta las reglas completas en nuestros{" "}
            <Link href="/terminos" className="text-[var(--color-verde)] underline underline-offset-2">
              términos y condiciones
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="w-[90%] mx-auto pt-6 pb-16 md:pb-24">
        <ScrollReveal>
          <div className="rounded-[32px] md:rounded-[48px] bg-[#E0D2CA] px-7 py-12 md:px-16 md:py-16 flex flex-col items-center text-center">
            <h2 className="font-serif italic text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] text-[#4A3B31] mb-4 max-w-2xl">
              Empieza a juntar recompensas
            </h2>
            <p className="font-sans text-[18px] leading-[26px] text-[#403C3C]/85 max-w-lg mb-8">
              Escríbenos por WhatsApp o pídela en tu próxima visita. Empiezas a ganar desde tu siguiente compra.
            </p>
            <CtaPedir ubicacion="tarjeta_lealtad_final" variante="terracota" />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
