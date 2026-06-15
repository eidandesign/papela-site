import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClaseBySlug } from "@/lib/clases";
import ClaseCalendar from "@/components/site/ClaseCalendar";

export const revalidate = 60;

export default async function ClaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const maestra = await getClaseBySlug(slug);

  if (!maestra) notFound();

  return (
    <>
      {/* ── Hero ── */}
      <section className="mx-5 md:mx-20 mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden bg-[#5d7c80] flex flex-col items-center justify-center text-center px-8 md:px-16 pt-36 pb-24">
        <h1 className="font-serif italic text-[clamp(2.8rem,6.5vw,5.5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-4xl mb-4">
          {maestra.nombre}
        </h1>
        {maestra.tecnicas?.length > 0 && (
          <p className="font-sans text-[var(--color-cremita)]/75 text-lg">
            {maestra.tecnicas.join(" · ")}
          </p>
        )}
      </section>

      {/* ── Content ── */}
      <section className="w-[90%] mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left — Photo + info */}
          <div className="flex flex-col gap-8">
            {maestra.foto && (
              <div className="relative h-[380px] rounded-2xl overflow-hidden">
                <Image
                  src={maestra.foto}
                  alt={maestra.nombre}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {maestra.descripcion && (
              <div>
                <span className="bg-[#fdeee8] text-black text-[12px] tracking-[2px] uppercase font-sans px-2 py-1 rounded-[10px]">
                  Descripción
                </span>
                <p className="mt-3 font-sans text-[var(--color-text)] text-[18px] leading-relaxed">
                  {maestra.descripcion}
                </p>
              </div>
            )}

            {maestra.experiencia && (
              <div>
                <span className="bg-[#fdeee8] text-black text-[12px] tracking-[2px] uppercase font-sans px-2 py-1 rounded-[10px]">
                  Experiencia
                </span>
                <p className="mt-3 font-sans text-[var(--color-text)] text-[18px] leading-relaxed">
                  {maestra.experiencia}
                </p>
              </div>
            )}
          </div>

          {/* Right — Calendar */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-serif font-extralight text-[clamp(1.5rem,2.5vw,2rem)] text-[var(--color-text)] mb-1">
                Elige tu horario
              </h2>
              <p className="font-sans text-[var(--color-muted)] text-sm">
                Selecciona el día y hora que más te acomode.
              </p>
            </div>

            {maestra.horarios.length > 0 ? (
              <ClaseCalendar horarios={maestra.horarios} claseNombre={maestra.nombre} />
            ) : (
              <div className="bg-[#f2f0e9] rounded-xl px-5 py-8 text-center">
                <p className="font-serif font-extralight text-xl text-[#403C3C] mb-2">Próximamente</p>
                <p className="font-sans text-[var(--color-muted)]">
                  No hay horarios disponibles por el momento.
                </p>
              </div>
            )}

            <Link href="/clases" className="text-center font-sans text-sm text-[var(--color-muted)] hover:text-[var(--color-verde)] transition-colors">
              ← Ver todas las clases
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
