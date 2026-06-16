import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getClases } from "@/lib/clases";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Clases de arte en Puebla — Papela Atelier" },
  description:
    "Clases regulares de pintura, acuarela y acrílico en Puebla con maestras especializadas. Para principiantes y niveles avanzados. Aprende a tu ritmo.",
  alternates: { canonical: "https://www.papela-atelier.com/clases" },
  openGraph: {
    title: "Clases de arte en Puebla — Papela Atelier",
    description:
      "Clases regulares de pintura y técnicas artísticas para todos los niveles en Puebla.",
    images: [{ url: "/images/clases.avif", alt: "Clases de arte Papela Atelier Puebla" }],
  },
};

export default async function ClasesPage() {
  const maestras = await getClases();

  return (
    <>
      {/* ── Hero ── */}
      <section className="mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden bg-[#4F8674] flex flex-col items-center justify-start md:justify-center text-center px-8 md:px-16 min-h-[80vh] pt-[140px] pb-16 md:py-0" style={{width: '98vw', marginLeft: '1vw', marginRight: '1vw'}}>
        <span className="inline-flex items-center border border-[var(--color-cremita)]/60 rounded-full px-6 py-2 mb-8">
          <span className="label text-[var(--color-cremita)]">
            Clases Creativas
          </span>
        </span>

        <h1 className="font-serif italic text-[clamp(2.8rem,6.5vw,5.5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-4xl mb-8">
          Clases creativas para volver a conectar con tus manos
        </h1>

        <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-2xl">
          Pinta, dibuja, modela y crea en un espacio pensado para aprender con calma, explorar materiales y disfrutar el proceso. En Papela tenemos clases para niños, jóvenes y adultos, con maestras que acompañan cada proyecto paso a paso.
        </p>
      </section>

      {/* ── Maestras grid ── */}
      <section className="w-[90%] mx-auto pt-20 pb-20">
        {/* Section heading */}
        <div className="flex flex-col items-center text-center mb-12 gap-4">
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,3rem)] text-black leading-tight">
            Crear se disfruta más cuando alguien te guía con calma
          </h2>
          <p className="font-sans text-[var(--color-text)] text-[17px] leading-relaxed max-w-xl">
            En Papela creemos que una buena clase no se trata solo de aprender una técnica, sino de sentirse acompañado mientras pruebas, te equivocas, descubres materiales y le das forma a tus ideas.
          </p>
        </div>

        {/* Cards */}
        {maestras.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif font-extralight text-[2rem] text-[#403C3C] mb-3">Próximamente</p>
            <p className="text-[var(--color-muted)]">Estamos preparando nuevas clases. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maestras.map((maestra) => (
              <article
                key={maestra.id}
                className="bg-[#e7d8cf] border-2 border-[#d6bdb2] rounded-2xl p-[26px] flex flex-col gap-4 transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[4px_6px_0px_#d6bdb2] hover:-translate-y-1"
              >
                {/* Foto + overlay del nombre */}
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#d6bdb2]">
                  {maestra.foto ? (
                    <Image
                      src={maestra.foto}
                      alt={maestra.nombre}
                      fill
                      sizes="(max-width: 768px) 90vw, 400px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cremita)] to-[#c9d3c0]" />
                  )}
                  <div className="absolute bottom-4 left-3 max-w-[90%] bg-[#f9eae3] rounded-2xl px-6 md:px-8 py-3">
                    <p className="font-serif italic text-[#664917] text-2xl leading-8">
                      {maestra.nombre}
                    </p>
                    {maestra.tecnicas?.length > 0 && (
                      <p className="font-sans text-[#403c3c] text-sm leading-tight">
                        {maestra.tecnicas.join(" · ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="flex flex-col gap-4 flex-1">
                  {maestra.tecnicas?.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <span className="self-start bg-[#fdeee8] text-black text-[12px] tracking-[2px] uppercase font-sans px-2 py-1 rounded-[10px]">
                        Técnicas
                      </span>
                      <p className="font-sans text-[#403c3c] text-[17px] leading-relaxed">
                        {maestra.tecnicas.join(", ")}
                      </p>
                    </div>
                  )}

                  {maestra.descripcion && (
                    <div className="flex flex-col gap-3">
                      <span className="self-start bg-[#fdeee8] text-black text-[12px] tracking-[2px] uppercase font-sans px-2 py-1 rounded-[10px]">
                        Descripción
                      </span>
                      <p className="font-sans text-[#403c3c] text-[17px] leading-relaxed">
                        {maestra.descripcion}
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/clases/${maestra.slug}`}
                  className="mt-auto w-full bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans text-base text-center py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Ver detalles y de clases
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Intro card ── */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <div className="bg-[#EAE6DC] rounded-2xl flex flex-col md:flex-row items-center gap-10 md:gap-[148px] px-8 md:px-20 py-14 md:py-[72px]">
          {/* Text */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <h2 className="font-serif font-extralight text-[clamp(2rem,3.5vw,3rem)] text-black leading-[1.17]">
              A veces solo hace falta una mesa, buenos materiales y alguien que te guíe.
            </h2>
            <p className="font-sans text-[var(--color-text)] text-[clamp(1rem,1.3vw,1.5rem)] leading-[1.35]">
              Nuestras clases están pensadas para que cada persona avance a su ritmo: desde quien quiere aprender una técnica desde cero, hasta quien busca un momento creativo para desconectarse, practicar y crear algo propio.
            </p>
          </div>
          {/* Image */}
          <div className="relative w-full md:w-[486px] h-[320px] md:h-[440px] flex-shrink-0 rounded-[20px] overflow-hidden">
            <Image
              src="/images/clases.avif"
              alt="Clase en Papela Atelier"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
