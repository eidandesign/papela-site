import Image from "next/image";
import Link from "next/link";
import { getClases } from "@/lib/clases";

export const revalidate = 60;

export default async function ClasesPage() {
  const maestras = await getClases();

  return (
    <>
      {/* ── Hero ── */}
      <section className="mx-5 md:mx-20 mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden bg-[#5d7c80] flex flex-col items-center justify-center text-center px-8 md:px-16 pt-36 pb-24 md:pb-28">
        <span className="inline-flex items-center border border-[var(--color-cremita)]/60 rounded-full px-6 py-2 mb-8">
          <span className="font-sans text-[var(--color-cremita)] text-[13px] tracking-[2px] uppercase">
            Clases Creativas
          </span>
        </span>

        <h1 className="font-serif italic text-[clamp(2.8rem,6.5vw,5.5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-4xl mb-8">
          Clases creativas para volver a conectar con tus manos
        </h1>

        <p className="font-sans text-[var(--color-cremita)]/75 text-lg leading-relaxed max-w-2xl">
          Pinta, dibuja, modela y crea en un espacio pensado para aprender con calma, explorar materiales y disfrutar el proceso. En Papela tenemos clases para niños, jóvenes y adultos, con maestras que acompañan cada proyecto paso a paso.
        </p>
      </section>

      {/* ── Intro card ── */}
      <section className="w-[90%] mx-auto py-12 md:py-16">
        <div className="bg-[#f2f0e9] rounded-2xl overflow-hidden flex flex-col md:flex-row items-center gap-8 px-8 md:pl-16 md:pr-3 py-10 md:py-3">
          {/* Text */}
          <div className="flex-1 flex flex-col gap-5 py-8">
            <h2 className="font-serif font-extralight text-[clamp(2rem,3.5vw,3rem)] text-black leading-snug">
              A veces solo hace falta una mesa, buenos materiales y alguien que te guíe.
            </h2>
            <p className="font-sans text-[var(--color-text)] text-[17px] leading-relaxed">
              Nuestras clases están pensadas para que cada persona avance a su ritmo: desde quien quiere aprender una técnica desde cero, hasta quien busca un momento creativo para desconectarse, practicar y crear algo propio.
            </p>
          </div>
          {/* Image */}
          <div className="flex-1 relative h-[320px] md:h-[344px] w-full rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 md:max-w-[45%]">
            <Image
              src="/images/clases.avif"
              alt="Clase en Papela Atelier"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Maestras grid ── */}
      <section className="w-[90%] mx-auto pb-20">
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
              <article key={maestra.id} className="bg-[#e7d6cf] rounded-2xl p-[32px] flex flex-col gap-4 transition-[transform,box-shadow,border-color] duration-400 ease-out cursor-pointer border-2 border-transparent hover:border-[#d6bdb2] hover:shadow-[4px_6px_0px_#d6bdb2] hover:-translate-y-1">
                {/* Photo + name badge */}
                <div className="relative h-[272px] rounded-xl overflow-hidden flex items-end p-5">
                  {maestra.foto ? (
                    <Image
                      src={maestra.foto}
                      alt={maestra.nombre}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cremita)] to-[#c9d3c0]" />
                  )}
                  {/* Name chip */}
                  <div className="relative z-10 px-2 py-1">
                    <span className="font-serif text-white text-[2.5rem] leading-[2.5rem] tracking-[0.5px] whitespace-nowrap">
                      {maestra.nombre.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-4 flex-1">
                  {/* Técnicas */}
                  {maestra.tecnicas?.join(", ") && (
                    <div className="flex flex-col gap-3">
                      <span className="bg-[#fdeee8] text-black text-[12px] tracking-[2px] uppercase font-sans px-2 py-1 rounded-[10px] self-start">
                        Técnicas
                      </span>
                      <p className="font-sans text-[var(--color-text)] text-[17px] leading-relaxed">
                        {maestra.tecnicas?.join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Descripción */}
                  {maestra.descripcion && (
                    <div className="flex flex-col gap-3">
                      <span className="bg-[#fdeee8] text-black text-[12px] tracking-[2px] uppercase font-sans px-2 py-1 rounded-[10px] self-start">
                        Descripción
                      </span>
                      <p className="font-sans text-[var(--color-text)] text-[17px] leading-relaxed">
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
                  Apartar clase con {maestra.nombre}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
