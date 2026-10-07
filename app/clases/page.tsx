import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { getClasesConHorarios, getHorariosSemanales } from "@/lib/clases";
import { getPaquetesClase, getTiposClase } from "@/lib/clases-tipos";
import { esReservable } from "@/lib/clases-matching";
import HeroSection from "@/components/site/HeroSection";
import { ClaseBloque, PaquetesSueltos } from "@/components/site/ClaseOferta";

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
  const [maestras, tiposClase, paquetesClase] = await Promise.all([
    getClasesConHorarios(),
    getTiposClase(),
    getPaquetesClase(),
  ]);
  const hayClases = tiposClase.some((t) => maestras.some((m) => m.id === t.claseId));

  return (
    <>
      {/* ── Hero ── */}
      {/* Hero compacto: el mismo de Catálogo (/productos), solo el título */}
      <HeroSection bgColor="#4F8674" className="!min-h-0" showRibbon={false} showInk={false}>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 md:px-20 pt-[140px] md:pt-[170px] pb-14 md:pb-16">
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-3xl">
            Clases creativas para volver a conectar con tus manos
          </h1>
        </div>
      </HeroSection>

      {/* ── Clases de Papela: la clase es lo que importa, no quién la da ── */}
      <section className="w-[90%] mx-auto pt-12 md:pt-16 pb-12 md:pb-16">
        <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,3rem)] text-black leading-tight text-center mb-8 md:mb-10">
          Nuestras clases
        </h2>

        {!hayClases ? (
          <div className="py-24 text-center">
            <p className="font-serif font-extralight text-[2rem] text-[#403C3C] mb-3">Próximamente</p>
            <p className="text-[var(--color-muted)]">Estamos preparando nuevas clases. ¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {maestras.flatMap((maestra) => {
              const tipos = tiposClase.filter((t) => t.claseId === maestra.id);
              const paquetes = paquetesClase.filter((p) => p.claseId === maestra.id);
              const reservables = maestra.horarios.filter((h) => esReservable(h, tipos));
              const sinClase = paquetes.filter((p) => !p.tipoId || !tipos.some((t) => t.id === p.tipoId));
              return [
                ...tipos.map((t) => (
                  <ClaseBloque
                    key={t.id}
                    tipo={t}
                    paquetes={paquetes.filter((p) => p.tipoId === t.id)}
                    horarioSemanal={getHorariosSemanales(maestra.horarios.filter((h) => h.tipo_clase_id === t.id))}
                    horariosReservables={reservables}
                    tipos={tipos}
                    maestraNombre={maestra.nombre}
                    whatsapp={maestra.whatsapp}
                  />
                )),
                ...(sinClase.length
                  ? [
                      <div key={`sueltos-${maestra.id}`} className="col-span-full">
                        <PaquetesSueltos paquetes={sinClase} maestraNombre={maestra.nombre} whatsapp={maestra.whatsapp} />
                      </div>,
                    ]
                  : []),
              ];
            })}
          </div>
        )}
      </section>

      {/* ── Club de Arcilla banner ── */}
      <section className="w-[90%] mx-auto pb-12 md:pb-16">
        <div className="relative rounded-[32px] md:rounded-[48px] overflow-hidden">
          <Image
            src="/images/fondo_arcilla_banner.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="90vw"
          />

          <Image
            src="/images/linea_rosa_club.png"
            alt=""
            width={3078}
            height={729}
            aria-hidden="true"
            className="absolute inset-x-0 top-10 md:top-1/2 md:-translate-y-1/2 w-full h-auto pointer-events-none"
          />

          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10 px-8 md:px-14 py-14 md:py-6">
            {/* Texto */}
            <div className="flex-1 flex flex-col items-center text-center gap-3">
              <Image
                src="/images/club_arcilla_nombre.png"
                alt="Club de Arcilla"
                width={457}
                height={204}
                className="w-[220px] md:w-[300px] h-auto"
              />
              <p className="font-serif text-[var(--color-cremita)] text-lg md:text-xl">
                Todos los Jueves de 5:00 a 7:00 pm
              </p>
              <p className="flex items-center gap-1.5 font-sans text-[var(--color-cremita)]/80 text-sm">
                <MapPinIcon aria-hidden="true" className="w-4 h-4 flex-shrink-0" />
                Lomas de Angelópolis – Papela Atelier
              </p>
              <a
                href={`https://wa.me/522211865590?text=${encodeURIComponent("Hola Papela 🌿 quiero unirme al Club de Arcilla")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-verde)] px-6 py-2.5 font-sans text-sm font-semibold text-[var(--color-cremita)] hover:opacity-90 transition-opacity"
              >
                ¡Quiero Unirme!
              </a>
            </div>

            {/* Foto */}
            <div className="relative w-full md:w-[58%] aspect-[1508/750] flex-shrink-0">
              <Image
                src="/images/clases_club_arcilla.png"
                alt="Sesión del Club de Arcilla en Papela Atelier"
                fill
                className="object-contain"
                sizes="(min-width: 768px) 58vw, 90vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Maestras: foto chica, nombre y su descripción en 3 renglones ── */}
      {maestras.length > 0 && (
        <section className="w-[90%] mx-auto pt-4 pb-16 md:pb-24">
          <h2 className="font-serif font-extralight text-[clamp(1.8rem,3.5vw,3rem)] text-black leading-tight text-center mb-8 md:mb-10">
            Nuestras maestras
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {maestras.map((maestra) => (
              <Link
                key={maestra.id}
                href={`/clases/${maestra.slug}`}
                className="group flex flex-col rounded-2xl bg-white border border-[var(--color-border)] p-5 shadow-[0_2px_14px_rgba(64,60,60,0.06)] hover:border-[var(--color-verde)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-verde)]"
              >
                {/* Foto chica + nombre */}
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden bg-[#e7d6cf]">
                    {maestra.foto && (
                      <Image src={maestra.foto} alt="" fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <h3 className="font-serif italic text-[#664917] text-2xl leading-tight">{maestra.nombre}</h3>
                </div>
                {maestra.descripcion && (
                  <p className="mt-4 font-sans text-[15px] leading-6 text-[var(--color-text)] line-clamp-3">{maestra.descripcion}</p>
                )}
                <span className="mt-auto pt-4 font-sans text-sm font-semibold text-[var(--color-verde)]">Conocer más</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
