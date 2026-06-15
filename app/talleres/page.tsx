import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { getTalleres } from "@/lib/talleres";

export const revalidate = 60;

function formatFecha(fecha: string | null) {
  if (!fecha) return "";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}

function NivelBadge({ nivel }: { nivel: string | null }) {
  if (!nivel) return null;
  const colors: Record<string, string> = {
    principiante: "bg-[#C9D3C0] text-[#2b3a2e]",
    intermedio: "bg-[#CED8D9] text-[#1e2d36]",
    avanzado: "bg-[#F0D9CC] text-[#3a2e2b]",
  };
  const key = nivel.toLowerCase();
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${colors[key] ?? "bg-[var(--color-cremita-2)] text-[var(--color-text)]"}`}>
      {nivel}
    </span>
  );
}

export default async function TalleresPage() {
  const talleres = await getTalleres();

  return (
    <>
      {/* Hero */}
      <section
        className="relative mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden h-[80vh] flex flex-col justify-center"
        style={{ backgroundColor: "#C4846A", width: '98vw', marginLeft: '1vw', marginRight: '1vw' }}
      >
        <div className="px-10 md:px-20 py-20 md:py-28 flex flex-col items-center text-center">
          <span className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
            <span className="font-sans text-[10px] font-medium tracking-[0.22em] uppercase text-[var(--color-cremita)]/70">
              Próximos Talleres
            </span>
          </span>
          <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-6">
            Aprende, crea y llévate un momento inolvidable
          </h1>
          <p className="font-sans text-[var(--color-cremita)]/70 text-base max-w-lg leading-relaxed">
            Con nuestros talleres aprendes, son recreativos pero los maestros están preparados para enseñar con la experiencia necesaria en su rama.
          </p>
        </div>
      </section>

      {/* Taller cards */}
      <section className="w-[90%] mx-auto py-16 space-y-6">
        {talleres.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif font-extralight text-[2rem] text-[#403C3C] mb-3">Próximamente</p>
            <p className="text-[var(--color-muted)]">Estamos preparando nuevos talleres. ¡Vuelve pronto!</p>
          </div>
        ) : (
          talleres.map((taller) => (
            <article key={taller.id} className="bg-[var(--color-cremita-2)]/60 rounded-2xl overflow-hidden">
              {/* Tags row */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  {taller.categoria && (
                    <span className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-[var(--color-cremita)] text-[var(--color-verde)]">
                      {taller.categoria}
                    </span>
                  )}
                  <NivelBadge nivel={taller.nivel} />
                </div>
                {taller.activo && (
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Activo
                  </span>
                )}
              </div>

              {/* Main content */}
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative w-full md:w-[420px] flex-shrink-0 h-[260px] md:h-auto md:min-h-[340px] m-3 rounded-xl overflow-hidden">
                  {taller.imagen_url ? (
                    <Image src={taller.imagen_url} alt={taller.titulo} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-cremita)] to-[var(--color-cremita-2)]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    {taller.fecha && (
                      <p className="text-xs font-medium text-[var(--color-muted)] mb-3 flex items-center gap-2">
                        <span>{formatFecha(taller.fecha)}</span>
                        {taller.hora_inicio && (
                          <>
                            <span className="w-px h-3 bg-[var(--color-border)]" />
                            <span>{taller.hora_inicio}{taller.hora_fin ? ` — ${taller.hora_fin}` : ""}</span>
                          </>
                        )}
                      </p>
                    )}

                    <h2 className="font-serif font-extralight text-[clamp(1.8rem,3vw,2.8rem)] text-[#403C3C] leading-tight mb-4">
                      {taller.titulo}
                    </h2>

                    {taller.instructor_nombre && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-cremita)] overflow-hidden relative flex-shrink-0">
                          {taller.instructor_foto_url && (
                            <Image src={taller.instructor_foto_url} alt={taller.instructor_nombre} fill className="object-cover" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wide">
                            {taller.instructor_nombre}
                          </span>
                          {taller.instructor_instagram && (
                            <a
                              href={`https://instagram.com/${taller.instructor_instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Instagram de ${taller.instructor_nombre}`}
                              className="text-xs text-[var(--color-terracota)] hover:opacity-70 transition-opacity"
                            >
                              @{taller.instructor_instagram}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {taller.descripcion && (
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-6 max-w-md line-clamp-4">
                        {taller.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-1">Inversión</p>
                      <p className="font-serif font-extralight text-[2rem] text-[#403C3C] leading-none">
                        ${taller.precio.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      href={`/talleres/${taller.id}`}
                      aria-label={`Ver detalle de ${taller.titulo}`}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] hover:opacity-80 transition-opacity"
                    >
                      <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}
