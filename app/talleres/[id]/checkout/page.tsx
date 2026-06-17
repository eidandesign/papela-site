import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { getTalleres } from "@/lib/talleres";
import TallerCheckoutForm from "@/components/site/TallerCheckoutForm";
import TalleresGallery from "@/components/site/TalleresGallery";

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function TallerCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const talleres = await getTalleres();
  const taller = talleres.find((t) => t.id === id);

  if (!taller) notFound();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="w-[90%] mx-auto pt-[150px] md:pt-[200px] pb-4">
        {/* Heading */}
        <div className="mb-10 md:mb-16 text-center">
          <h1 className="font-serif italic text-[clamp(2rem,4vw,3.5rem)] text-[var(--color-text)] leading-tight mb-3">
            Tu lugar está casi listo
          </h1>
          <p className="font-sans text-[var(--color-muted)] text-base max-w-md mx-auto leading-[24px]">
            Solo completa tus datos y te enviaremos al pago seguro con Mercado Pago.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-10 max-w-[896px] mx-auto items-start">
          {/* Left — taller info */}
          <div className="flex flex-col gap-6 w-full md:w-[428px] md:flex-shrink-0">
            {/* Back button */}
            <Link
              href="/talleres"
              className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[var(--color-verde)] hover:opacity-70 transition-opacity"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver a talleres
            </Link>

            {taller.imagen_url && (
              <div className="relative w-full aspect-square md:h-[444px] md:aspect-auto rounded-2xl overflow-hidden">
                <Image
                  src={taller.imagen_url}
                  alt={taller.titulo}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div>
              {taller.categoria && (
                <span className="text-[10px] font-bold uppercase tracking-[1px] px-3 py-1 rounded-full bg-[var(--color-cremita)] text-[var(--color-verde)] mb-4 inline-block">
                  {taller.categoria}
                </span>
              )}
              <h2 className="font-serif font-extralight text-[clamp(1.5rem,2.5vw,2rem)] text-[var(--color-text)] leading-[40px] mt-2">
                {taller.titulo}
              </h2>
              {taller.instructor_nombre && (
                <p className="font-sans text-sm text-[var(--color-muted)] mt-1">
                  con {taller.instructor_nombre}
                </p>
              )}
              {taller.fecha && (
                <p className="font-sans text-sm text-[var(--color-muted)] mt-2 capitalize">
                  {formatFecha(taller.fecha)}
                  {taller.hora_inicio && (
                    <span className="ml-2">
                      · {taller.hora_inicio}{taller.hora_fin ? ` — ${taller.hora_fin}` : ""}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-2xl p-6 md:p-[33px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] border border-[var(--color-border)] w-full md:flex-1 md:min-w-0">
            <TallerCheckoutForm
              tallerId={taller.id}
              titulo={taller.titulo}
              precio={taller.precio}
              cupoTotal={taller.cupo_total ?? 10}
            />
          </div>
        </div>
      </div>

      {/* Galería animada de talleres + texto */}
      <TalleresGallery />
    </div>
  );
}
