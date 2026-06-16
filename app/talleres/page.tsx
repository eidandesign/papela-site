import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { getTalleres } from "@/lib/talleres";
import TallerDescripcion from "@/components/site/TallerDescripcion";
import TallerGaleriaSection from "@/components/site/TallerGaleriaSection";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Talleres de arte en Puebla — Papela Atelier" },
  description:
    "Talleres presenciales de acuarela, acrílico, cerámica y dibujo en Puebla. Para todos los niveles, con instructores especializados. ¡Llévate algo hecho por ti!",
  alternates: { canonical: "https://www.papela-atelier.com/talleres" },
  openGraph: {
    title: "Talleres de arte en Puebla — Papela Atelier",
    description:
      "Aprende acuarela, acrílico, cerámica y más en nuestros talleres presenciales en Puebla. ¡Llévate algo hecho por ti!",
    images: [{ url: "/images/talleres.avif", alt: "Talleres de arte Papela Atelier Puebla" }],
  },
};

function formatFecha(fecha: string | null) {
  if (!fecha) return "";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}

export default async function TalleresPage() {
  const talleres = await getTalleres();

  return (
    <>
      {/* Hero */}
      <section
        className="relative mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden min-h-[80vh] flex flex-col justify-center"
        style={{ backgroundColor: "#C4846A", width: '98vw', marginLeft: '1vw', marginRight: '1vw' }}
      >
        <div className="px-10 md:px-20 pt-[140px] pb-16 md:py-28 flex flex-col items-center text-center">
          <span className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="label text-[var(--color-cremita)]/70">
              Próximos Talleres
            </span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-6">
            Aprende, crea y llévate un momento inolvidable
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-lg">
            Con nuestros talleres aprendes, son recreativos pero los maestros están preparados para enseñar con la experiencia necesaria en su rama.
          </p>
        </div>
      </section>

      {/* Taller cards */}
      <section className="w-[90%] mx-auto py-16">
        {talleres.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif font-extralight text-[2rem] text-[#403C3C] mb-3">Próximamente</p>
            <p className="text-[var(--color-muted)]">Estamos preparando nuevos talleres. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {talleres.map((taller) => (
              <article
                key={taller.id}
                className="flex flex-col bg-[#e7d8cf] border-2 border-[#d6bdb2] rounded-2xl p-[26px] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[4px_6px_0px_#d6bdb2]"
              >
                {/* Image + thumbnails + lightbox */}
                <TallerGaleriaSection
                  mainImage={taller.imagen_url}
                  galeria={taller.galeria}
                  titulo={taller.titulo}
                  instructorNombre={taller.instructor_nombre}
                  instructorInstagram={taller.instructor_instagram}
                />

                {/* Body */}
                <div className="flex flex-col flex-1 pt-6">
                  <div className="flex flex-col flex-1 items-center gap-[11px] pb-6">
                    {taller.categoria && (
                      <span className="bg-[#f3e6cf] rounded-full px-3 py-1 font-sans font-bold text-[#12535c] text-[10px] tracking-[1px] uppercase leading-[15px]">
                        {taller.categoria}
                      </span>
                    )}

                    <div className="flex flex-col items-center gap-4 w-full border-b border-[#dbc2b3] pb-4">
                      <h2 className="font-serif italic text-[#664917] text-[24px] leading-[32px] text-center">
                        {taller.titulo}
                      </h2>
                      <div className="flex flex-col items-center gap-3 w-full">
                        {taller.fecha && (
                          <p className="font-sans text-[#664a18] text-[20px] leading-[16px] text-center">
                            {formatFecha(taller.fecha)}
                          </p>
                        )}
                        {taller.hora_inicio && (
                          <p className="font-sans text-[#6e645f] text-[14px] leading-[16px]">
                            {taller.hora_inicio}{taller.hora_fin ? ` — ${taller.hora_fin}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {taller.descripcion && (
                      <TallerDescripcion texto={taller.descripcion} />
                    )}
                  </div>

                  {/* Inversión + CTA */}
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="font-sans font-bold text-[#6e645f] text-[10px] tracking-[1px] uppercase leading-[15px]">
                        Inversión
                      </p>
                      <p className="font-serif font-extralight text-[#403c3c] text-[32px] leading-[32px]">
                        ${taller.precio.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/talleres/${taller.id}/checkout`}
                      aria-label={`Apartar lugar en ${taller.titulo}`}
                      className="flex items-center justify-center gap-2 bg-[#12535c] text-[#f3e6cf] rounded-lg px-4 py-3 font-sans text-[16px] leading-[24px] hover:opacity-90 transition-opacity"
                    >
                      Apartar lugar
                      <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
