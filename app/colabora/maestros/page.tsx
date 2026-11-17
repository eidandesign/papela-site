import Image from "next/image";
import Link from "next/link";
import HeroSection from "@/components/site/HeroSection";
import ScrollReveal from "@/components/site/ScrollReveal";
import WhatsAppLink from "@/components/site/WhatsAppLink";
import AccesoMaestros from "@/components/site/maestros/AccesoMaestros";
import ModalidadesToggle from "@/components/site/maestros/ModalidadesToggle";
import {
  ArrowRightIcon,
  ArrowRightStartOnRectangleIcon,
  BuildingStorefrontIcon,
  CakeIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  MegaphoneIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { MAESTROS_CONFIG, pesos } from "@/lib/maestros/config";
import { leerSesion } from "@/lib/maestros/sesion";
import { salir } from "./actions";

// /colabora/maestros — página privada que Papela comparte con los maestros.
// Sin sesión SOLO se pinta la pantalla de contraseña: ni las cifras ni las
// políticas ni el contrato llegan al HTML. Con sesión, todo se arma aquí en el
// servidor con las cifras de lib/maestros/config.ts.
export const dynamic = "force-dynamic";

const CACAO = "#422526";

export default async function MaestrosPage() {
  const sesion = await leerSesion();
  if (!sesion) return <Acceso />;
  return <Contenido />;
}

// ── Sin sesión ───────────────────────────────────────────────────────────────
function Acceso() {
  return (
    <HeroSection bgColor={CACAO} showRibbon={false}>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
        <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-5 md:mb-8">
          <span className="label text-[var(--color-cremita)]/85">Colaboración maestros</span>
        </span>
        <h1 className="font-serif italic text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-4 md:mb-6">
          Un espacio para quienes enseñan con nosotros
        </h1>
        <p className="font-sans text-[16px] md:text-[18px] leading-[22px] md:leading-[24px] text-[var(--color-cremita)]/90 max-w-md mb-8 md:mb-10">
          Escribe la contraseña que te compartió el equipo de Papela para entrar.
        </p>
        <AccesoMaestros />
        <WhatsAppLink
          ubicacion="maestros_acceso"
          texto="Hola Papela 🌿 soy maestro/a y necesito la contraseña de la página de colaboración."
          className="mt-6 font-sans text-sm text-[var(--color-cremita)]/85 underline underline-offset-4 hover:text-[var(--color-cremita)]"
        >
          ¿No tienes la contraseña? Escríbenos
        </WhatsAppLink>
      </div>
    </HeroSection>
  );
}

// ── Con sesión ───────────────────────────────────────────────────────────────
function Titulo({ eyebrow, titulo, texto, id }: { eyebrow: string; titulo: string; texto?: string; id?: string }) {
  return (
    // Mismos estilos de título que las tarjetas de /club-creativo (Tarjeta de
    // Lealtad): etiqueta terracota, serif recto en café #4A3B31, texto #403C3C.
    <div className="max-w-2xl mx-auto text-center mb-8 md:mb-12">
      <p className="label text-[var(--color-terracota)] mb-3">{eyebrow}</p>
      <h2 id={id} className="font-serif text-[clamp(2rem,3vw,2.6rem)] leading-none text-[#4A3B31]">
        {titulo}
      </h2>
      {texto && <p className="font-sans text-[16px] md:text-[18px] leading-[24px] md:leading-[26px] text-[#403C3C]/85 mt-4">{texto}</p>}
    </div>
  );
}

function Lista({ items, claro = false }: { items: string[]; claro?: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((t) => (
        <li key={t} className="flex gap-3 font-sans text-[16px] leading-[24px]">
          <CheckIcon aria-hidden="true" className={`shrink-0 w-5 h-5 mt-0.5 ${claro ? "text-[var(--color-rosa-papel)]" : "text-[var(--color-verde)]"}`} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Contenido() {
  const { clases, talleres, descuentoMaestros } = MAESTROS_CONFIG;

  const principios = [
    {
      titulo: "Tú pones tu talento",
      texto: "Diseñas los contenidos y conduces cada sesión con autonomía. Tu forma de enseñar es lo que hace especial la experiencia.",
    },
    {
      titulo: "Papela pone la casa",
      texto: "Nos encargamos del espacio, la promoción, las inscripciones y el seguimiento con los alumnos para que tú te concentres en crear.",
    },
    {
      titulo: "Cuidamos a la comunidad",
      texto: "Trato respetuoso, seguridad en cada actividad y cuidado de los datos de quienes vienen a aprender.",
    },
  ];

  const beneficios = [
    { icono: BuildingStorefrontIcon, titulo: "Espacio y mobiliario", texto: "Un lugar listo para tu clase o taller." },
    { icono: WrenchScrewdriverIcon, titulo: "Materiales y herramientas", texto: "En clases recurrentes, los previstos para la actividad. En talleres, lo que acordemos juntos." },
    { icono: MegaphoneIcon, titulo: "Promoción y diseño", texto: "Anuncios, redes y piezas gráficas desde las cuentas de Papela." },
    { icono: ClipboardDocumentCheckIcon, titulo: "Inscripciones y seguimiento", texto: "Recibimos las reservas y damos seguimiento a cada alumno por ti." },
    { icono: CakeIcon, titulo: "Snacks y bebidas", texto: "Snacks en las clases; snacks y bebidas en los talleres." },
    { icono: SparklesIcon, titulo: "Apoyo logístico", texto: "Te acompañamos en la preparación y el día de la actividad." },
  ];

  const pasos = [
    { titulo: "Conoce cómo trabajamos", texto: "Revisa las dos formas de colaborar y lo que pone Papela." },
    { titulo: "Envía tu propuesta", texto: "Toca «Me interesa» y cuéntanos qué te gustaría impartir. Te toma unos minutos." },
    { titulo: "Revisamos y firmamos juntos", texto: "Revisamos tu propuesta y, una vez aprobada, firmamos el acuerdo y abrimos inscripciones." },
  ];

  return (
    <>
      <HeroSection bgColor={CACAO} showRibbon={false}>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
          <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-5 md:mb-8">
            <span className="label text-[var(--color-cremita)]/85">Colaboración maestros</span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.4rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl mb-4 md:mb-6">
            Enseñemos juntos en Papela Atelier
          </h1>
          <p className="font-sans text-[16px] md:text-[18px] leading-[22px] md:leading-[24px] text-[var(--color-cremita)]/90 max-w-xl">
            Aquí te contamos cómo trabajamos, las formas de colaborar y lo que acordamos para cuidar tu talento y a nuestra comunidad.
          </p>
        </div>
      </HeroSection>

      {/* Cómo trabajamos */}
      <section aria-labelledby="como-trabajamos" className="w-[90%] mx-auto py-12 md:py-16">
        <Titulo
          id="como-trabajamos"
          eyebrow="Cómo trabajamos"
          titulo="Tu talento & nuestra casa"
          texto="Buscamos maestros que disfruten compartir lo que saben y queremos que colaborar sea claro y justo desde el primer día."
        />
        {/* La casa: foto de la fachada a la izquierda y los tres puntos a la
            derecha (en celular, la foto arriba). La foto original es cuadrada y
            trae las esquinas redondeadas; el recorte (object-position) deja
            fuera esas esquinas y centra el letrero y la entrada. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 md:gap-6 items-stretch">
          <ScrollReveal className="h-full">
            <div className="relative w-full h-full aspect-[4/3] lg:aspect-auto lg:min-h-[480px] rounded-[28px] overflow-hidden bg-[var(--color-cremita-2)]">
              <Image
                src="/images/papela-fachada.jpg"
                alt="Fachada de Papela Atelier: letrero de madera, la entrada a la papelería y la terraza con plantas"
                fill
                sizes="(min-width: 1024px) 50vw, 90vw"
                className="object-cover object-[45%_60%]"
              />
            </div>
          </ScrollReveal>
          <div className="flex flex-col gap-4">
            {principios.map((p, i) => (
              <ScrollReveal key={p.titulo} delay={0.08 + i * 0.08} className="flex-1">
                <article className="h-full rounded-[24px] bg-white border border-[var(--color-border)] p-6 md:p-7 flex items-center">
                  <div>
                    <h3 className="font-serif text-[clamp(1.5rem,2vw,1.8rem)] leading-none text-[#4A3B31] mb-2">{p.titulo}</h3>
                    <p className="font-sans text-[16px] leading-[24px] text-[#403C3C]/85">{p.texto}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Modalidades */}
      <section aria-labelledby="modalidades" className="w-[90%] mx-auto py-12 md:py-16">
        <Titulo
          id="modalidades"
          eyebrow="Dos formas de colaborar"
          titulo="Clases recurrentes y talleres especiales"
          texto="Elige una para ver cómo funciona. Puedes dar las dos."
        />
        <ModalidadesToggle
          opciones={[
            {
              id: "clases",
              label: "Clases recurrentes",
              panel: (
                  <article className="h-full rounded-[28px] bg-[var(--color-verde)] text-[var(--color-cremita)] p-7 md:p-10 flex flex-col">
                    <h3 className="font-serif italic text-[clamp(1.8rem,3vw,2.4rem)] leading-tight text-center mb-6">Tu clase, cada semana</h3>
                    <div className="rounded-2xl bg-black/20 px-5 py-5 mb-7 text-center">
                      <p className="font-serif text-[clamp(2.4rem,5vw,3.4rem)] leading-none text-[var(--color-pistache)]">{pesos(clases.tarifaPorClase)}</p>
                      <p className="font-sans text-[15px] text-[var(--color-cremita)]/90 mt-2">
                        por cada clase de {clases.horasPorClase} horas impartida
                      </p>
                    </div>
                    <Lista
                      claro
                      items={[
                        `Pago fijo por clase, ya sea que asista 1 alumno o el cupo completo de ${clases.cupoMaximo}.`,
                        `Abrimos la clase con un mínimo de ${clases.minimoParaAbrir} alumnos inscritos.`,
                        "Fechas, horarios y forma de pago los definimos juntos.",
                      ]}
                    />
                    {/* Bono por alumno nuevo referido (cláusula del contrato de clases) */}
                    {/* Un solo bloque: línea arriba lo separa de la lista y los tres
                        renglones van con el mismo espacio corto entre sí. */}
                    <div className="mt-8 border-t border-white/15 pt-6">
                      <p className="label text-[var(--color-cremita)]/85">Bono por alumno nuevo</p>
                      <p className="font-serif text-[1.6rem] leading-none text-[var(--color-pistache)] mt-2">
                        {pesos(clases.bonoAlumnoReferido)} por cada alumno que venga por ti
                      </p>
                      <p className="font-sans text-[15px] leading-[22px] text-[var(--color-cremita)]/90 mt-2">
                        Cuando se inscribe, paga y toma su primera clase. Solo pídele que diga tu nombre.
                      </p>
                    </div>
                  </article>
              ),
            },
            {
              id: "talleres",
              label: "Talleres especiales",
              panel: (
                  <article className="h-full rounded-[28px] bg-[var(--color-verde)] text-[var(--color-cremita)] p-7 md:p-10 flex flex-col">
                    <h3 className="font-serif italic text-[clamp(1.8rem,3vw,2.4rem)] leading-tight text-center mb-6">Un evento con tu sello</h3>
                    <div className="rounded-2xl bg-black/20 px-5 py-5 mb-7 text-center">
                      <p className="font-serif text-[clamp(2.4rem,5vw,3.4rem)] leading-none text-[var(--color-pistache)]">
                        Tú pones el precio
                      </p>
                      <p className="font-sans text-[15px] text-[var(--color-cremita)]/90 mt-2">
                        Papela agrega {talleres.recargoReferenciaPct}% a tu precio
                      </p>
                    </div>
                    <Lista
                      claro
                      items={[
                        `El ${talleres.recargoReferenciaPct}% cubre espacio, publicidad, snacks y operación.`,
                        "Dependiendo del taller, nosotros podemos poner algunos materiales o tú los agregas al costo.",
                        "Fecha, cupo, anticipos y cuándo se te paga se acuerdan antes de publicar el taller.",
                      ]}
                    />
                  </article>
              ),
            },
          ]}
        />
      </section>

      {/* Lo que pone Papela */}
      <section aria-labelledby="beneficios" className="w-[90%] mx-auto py-12 md:py-16">
        <Titulo id="beneficios" eyebrow="Beneficios" titulo="Lo que pone Papela" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {beneficios.map((b) => (
            <div key={b.titulo} className="flex gap-4 rounded-[20px] bg-[var(--color-cremita-3)] p-5">
              <span aria-hidden="true" className="shrink-0 w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                <b.icono className="w-5 h-5 text-[var(--color-verde)]" />
              </span>
              <div>
                <h3 className="font-sans font-semibold text-[16px] text-[var(--color-text)]">{b.titulo}</h3>
                <p className="font-sans text-[15px] leading-[22px] text-[var(--color-muted)] mt-1">{b.texto}</p>
              </div>
            </div>
          ))}

          {/* Beneficio destacado: descuento en la tienda para quienes son parte de Papela. */}
          <div className="sm:col-span-2 lg:col-span-3 rounded-[24px] bg-[var(--color-verde)] text-[var(--color-cremita)] px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center gap-3 md:gap-10">
            <p className="font-serif text-[clamp(2.6rem,5vw,3.8rem)] leading-none text-[var(--color-pistache)] shrink-0">
              {descuentoMaestros}% de descuento
            </p>
            <div>
              <p className="label text-[var(--color-cremita)]/85">Al ser parte de Papela</p>
              <p className="font-sans text-[16px] md:text-[17px] leading-[24px] text-[var(--color-cremita)]/90 mt-2 max-w-md">
                en todo lo de la tienda de Papela, y muchos otros beneficios que te iremos compartiendo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flujo */}
      <section aria-labelledby="como-empezamos" className="w-[90%] mx-auto py-12 md:py-16">
        <Titulo id="como-empezamos" eyebrow="Cómo empezamos" titulo="De la idea a tu primera clase" />
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pasos.map((p, i) => (
            <li key={p.titulo} className="rounded-[24px] bg-[var(--color-rosa-papel)]/35 p-6">
              <span className="font-serif text-[2.6rem] leading-none text-[var(--color-cacao)]">{i + 1}</span>
              <h3 className="font-sans font-semibold text-[17px] text-[var(--color-cacao)] mt-4">{p.titulo}</h3>
              <p className="font-sans text-[15px] leading-[22px] text-[var(--color-text)] mt-1.5">{p.texto}</p>
            </li>
          ))}
        </ol>

        {/* "Me interesa" lleva al formulario paso a paso (/colabora/maestros/solicitud). */}
        <div className="mt-10 md:mt-12 flex flex-col items-center gap-4 text-center">
          <Link
            href="/colabora/maestros/solicitud"
            className="group relative overflow-hidden inline-flex items-center justify-center gap-2 h-14 px-9 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans font-semibold text-base focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-verde)]"
          >
            <span className="absolute inset-0 bg-black/15 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
            <span className="relative">Me interesa</span>
            <ArrowRightIcon aria-hidden="true" className="relative w-5 h-5" />
          </Link>
          <form action={salir}>
            <button
              type="submit"
              className="cursor-pointer inline-flex items-center gap-2 h-11 px-4 rounded-full font-sans text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[var(--color-verde)]"
            >
              <ArrowRightStartOnRectangleIcon aria-hidden="true" className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
