import type { Metadata } from "next";
import Image from "next/image";
import ScrollReveal from "@/components/site/ScrollReveal";
import PersonalizacionForm from "@/components/site/PersonalizacionForm";
import OcasionesPills from "@/components/site/OcasionesPills";
import CategoriasStack from "@/components/site/CategoriasStack";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Personaliza — Papela Atelier" },
  description:
    "Stickers, cake toppers, tazas, vasos, etiquetas y detalles hechos a la medida para cumpleaños, bodas, baby showers, emprendimientos y cualquier ocasión. Cuéntanos tu idea y la hacemos realidad.",
  alternates: { canonical: "https://www.papela-atelier.com/personaliza" },
  openGraph: {
    title: "Personaliza — Papela Atelier",
    description:
      "Piezas únicas hechas a la medida para cada ocasión. Stickers, cake toppers, tazas, etiquetas y más.",
    images: [{ url: "/images/personaliza.avif", alt: "Personalización Papela Atelier" }],
  },
};

// Las imágenes viven en /public/images/personaliza/<slug>.jpg.
// Hoy son placeholders; reemplázalas con los exports de Magnific manteniendo el mismo nombre.
const CATEGORIAS = [
  {
    titulo: "Stickers personalizados",
    imagen: "/images/personaliza/stickers.jpg",
    descripcion:
      "Diseñamos e imprimimos stickers para marcas, regalos, empaques, fiestas, libretas, eventos, emprendimientos y proyectos personales.",
  },
  {
    titulo: "Cake toppers",
    imagen: "/images/personaliza/cake-toppers.jpg",
    descripcion:
      "Creamos toppers para pastel con nombres, frases, personajes, temáticas, edades, colores y estilos personalizados para que tu celebración tenga un detalle especial.",
  },
  {
    titulo: "Tazas personalizadas",
    imagen: "/images/personaliza/tazas.jpg",
    descripcion:
      "Personalizamos tazas con nombres, frases, diseños, ilustraciones o ideas especiales para regalar, vender o usar en eventos.",
  },
  {
    titulo: "Vasos personalizados",
    imagen: "/images/personaliza/vasos.jpg",
    descripcion:
      "Hacemos vasos personalizados para fiestas, cumpleaños, despedidas, eventos, regalos corporativos o celebraciones familiares.",
  },
  {
    titulo: "Etiquetas y empaques",
    imagen: "/images/personaliza/etiquetas.jpg",
    descripcion:
      "Creamos etiquetas, tags, tarjetas, fajillas y detalles para empaques de regalos, productos, mesas de dulces o emprendimientos.",
  },
  {
    titulo: "Manualidades y detalles creativos",
    imagen: "/images/personaliza/manualidades.jpg",
    descripcion:
      "Realizamos piezas hechas a la medida con papel, vinil, cartulina, foamy, stickers, recortes, acabados especiales y materiales creativos.",
  },
];

export default function PersonalizaPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden min-h-[80vh] flex flex-col justify-center"
        style={{ backgroundColor: "#5E7E86", width: "98vw", marginLeft: "1vw", marginRight: "1vw" }}
      >
        <div className="px-6 md:px-20 py-[140px] md:py-28 flex flex-col items-center text-center">
          <span className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]/70">Hecho a la medida</span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-6">
            Creamos piezas únicas para cada ocasión
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-lg">
            Stickers, toppers, tazas, etiquetas y detalles hechos especialmente para ti. Si tienes una idea, nosotros la diseñamos y la convertimos en algo físico, bonito y funcional.
          </p>
        </div>
      </section>

      {/* Para qué ocasiones */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="label text-[var(--color-terracota)] mb-4">Para qué ocasiones</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight mb-4">
              Personalización para todos tus momentos
            </h2>
            <p className="font-sans text-[17px] leading-[26px] text-[var(--color-muted)]">
              En Papela podemos crear detalles personalizados para:
            </p>
          </div>
        </ScrollReveal>

        <OcasionesPills />
      </section>

      {/* Qué podemos personalizar */}
      <section className="w-[90%] mx-auto py-16 md:py-20">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="label text-[var(--color-terracota)] mb-4">Qué podemos personalizar</p>
            <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight">
              Creamos piezas únicas para cada ocasión
            </h2>
          </div>
        </ScrollReveal>

        {/* Mobile: tarjetas apiladas que se enciman al hacer scroll */}
        <CategoriasStack categorias={CATEGORIAS} />

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {CATEGORIAS.map((cat, i) => (
            <ScrollReveal key={cat.titulo} delay={i * 0.06}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-[#C2D2D4] bg-[#DCE6E7] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[4px_6px_0px_#C2D2D4]">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={cat.imagen}
                    alt={cat.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <span className="font-sans text-[13px] font-bold tracking-[2px] text-[#5E7E86]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif italic text-[24px] leading-[30px] text-[#1e2d36]">
                    {cat.titulo}
                  </h3>
                  <p className="font-sans text-[15px] leading-[24px] text-[#4a5b62]">
                    {cat.descripcion}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Sección emocional + formulario */}
      <section className="w-[90%] mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="max-w-md">
              <p className="label text-[var(--color-terracota)] mb-4">Si tienes una idea</p>
              <h2 className="font-serif italic text-[#403C3C] text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.1] mb-6">
                Podemos hacerla realidad
              </h2>
              <p className="font-sans text-[17px] leading-[28px] text-[var(--color-muted)] mb-4">
                A veces solo tienes una foto de referencia, una frase, una temática o una idea medio armada. No pasa nada. Nosotros te ayudamos a bajarla, diseñarla y convertirla en algo físico, bonito y funcional.
              </p>
              <p className="font-sans text-[17px] leading-[28px] text-[var(--color-muted)]">
                Nos gusta trabajar proyectos personalizados porque cada pieza cuenta una historia: la tuya.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <PersonalizacionForm />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
