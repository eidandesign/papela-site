import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { createClient } from "@/lib/supabase/server";
import TallerCheckoutForm from "@/components/site/TallerCheckoutForm";

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

  const supabase = await createClient();
  const { data: taller } = await supabase
    .from("talleres")
    .select("id, titulo, precio, cupo_total, imagen_url, fecha, hora_inicio, hora_fin, categoria, instructor_nombre")
    .eq("id", id)
    .eq("activo", true)
    .single();

  if (!taller) notFound();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="w-[90%] mx-auto pt-28 md:pt-32 pb-12 md:pb-20">
        {/* Back button */}
        <Link
          href="/talleres"
          className="inline-flex items-center gap-2 text-sm font-sans font-medium text-[var(--color-verde)] hover:opacity-70 transition-opacity mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver a talleres
        </Link>

        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="font-serif italic text-[clamp(2rem,4vw,3.5rem)] text-[var(--color-text)] leading-tight mb-2">
            Tu lugar está casi listo
          </h1>
          <p className="font-sans text-[var(--color-muted)] text-base max-w-md mx-auto">
            Solo completa tus datos y te enviaremos al pago seguro con Mercado Pago. Al finalizar, recibirás un correo con la confirmación de tu reserva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Left — taller info */}
          <div className="flex flex-col gap-6">
            {taller.imagen_url && (
              <div className="relative w-full h-[280px] md:h-[360px] rounded-2xl overflow-hidden">
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
                <span className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-[var(--color-cremita)] text-[var(--color-verde)] mb-3 inline-block">
                  {taller.categoria}
                </span>
              )}
              <h2 className="font-serif font-extralight text-[clamp(1.5rem,2.5vw,2rem)] text-[var(--color-text)] leading-tight mt-2">
                {taller.titulo}
              </h2>
              {taller.instructor_nombre && (
                <p className="font-sans text-sm text-[var(--color-muted)] mt-1">
                  con {taller.instructor_nombre}
                </p>
              )}
              {taller.fecha && (
                <p className="font-sans text-sm text-[var(--color-muted)] mt-3 capitalize">
                  {formatFecha(taller.fecha)}
                  {taller.hora_inicio && (
                    <span className="ml-2">
                      · {taller.hora_inicio}{taller.hora_fin ? ` — ${taller.hora_fin}` : ""}
                    </span>
                  )}
                </p>
              )}
            </div>

            <p className="font-serif font-extralight text-[2.5rem] text-[var(--color-text)] leading-none">
              Más de 100 personas ya han creado en Papela Atelier.
            </p>
            <p className="font-sans text-[var(--color-muted)] text-sm leading-relaxed">
              Cada taller en Papela es una experiencia para relajarte, aprender algo nuevo y llevarte algo hecho por ti. No necesitas experiencia, solo ganas de pasar un rato bonito.
            </p>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--color-border)]">
            <TallerCheckoutForm
              tallerId={taller.id}
              titulo={taller.titulo}
              precio={taller.precio}
              cupoTotal={taller.cupo_total ?? 10}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
