import Image from "next/image";
import type { PaqueteClasePublico, TipoClasePublico } from "@/lib/clases-tipos";
import type { HorarioSemanal } from "@/lib/clases";

// Tarjetas de "Clases y paquetes" en la página de la maestra. Todo el contenido
// (nombre, precio, foto, descripción, qué incluye, condiciones) se edita en el
// admin, en el perfil de la maestra. Mismo lenguaje visual que ActividadCard.

const DIAS = ["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"];

const precioMx = (n: number) =>
  `$${n.toLocaleString("es-MX", { maximumFractionDigits: 2 })}`;

function diasTexto(dias: number[]): string | null {
  if (!dias.length || dias.length === 7) return null;
  // Semana empezando en lunes, como el resto del sitio.
  const orden = [...dias].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => DIAS[d]);
  const lista = orden.length === 1 ? orden[0] : `${orden.slice(0, -1).join(", ")} y ${orden.at(-1)}`;
  return `Solo ${lista}`;
}

function duracionTexto(min: number): string | null {
  if (!min) return null;
  if (min % 60 === 0) return `${min / 60} ${min === 60 ? "hora" : "horas"}`;
  if (min > 60) return `${Math.floor(min / 60)} h ${min % 60} min`;
  return `${min} min`;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-[#fdeee8] text-[var(--color-terracota)] text-[11px] font-semibold tracking-[0.18em] uppercase font-sans px-3 py-1 rounded-full">
      {children}
    </span>
  );
}

function Lista({ titulo, items, tono }: { titulo: string; items: string[]; tono: "verde" | "muted" }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="font-sans text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--color-terracota)] mb-2">
        {titulo}
      </p>
      <ul
        className={`flex flex-col gap-1.5 font-sans leading-6 ${
          tono === "verde" ? "text-[15px] text-[var(--color-text)]" : "text-[14px] text-[var(--color-muted)]"
        }`}
      >
        {items.map((x, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                tono === "verde" ? "bg-[var(--color-verde)]" : "bg-[var(--color-terracota)]"
              }`}
            />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Tarjeta({
  nombre,
  imagen,
  chips,
  precio,
  precioNota,
  precioExtra,
  descripcion,
  horarios,
  children,
}: {
  horarios: HorarioSemanal[];
  nombre: string;
  imagen: string | null;
  chips: string[];
  precio: number;
  precioNota: string;
  // Línea bajo el precio (ej. "+ Inscripción anual $350").
  precioExtra?: string;
  descripcion: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col md:flex-row md:items-start gap-5 md:gap-8 bg-[#f2f0e9] rounded-2xl p-5 md:p-6">
      {imagen && (
        <div className="relative w-full md:w-[260px] md:flex-shrink-0 aspect-[4/3] rounded-xl overflow-hidden bg-[#e7d6cf]">
          <Image src={imagen} alt={nombre} fill sizes="(max-width: 768px) 90vw, 260px" className="object-cover" />
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        )}

        <h3 className="font-serif text-[clamp(1.5rem,3vw,2rem)] text-[#403c3c] leading-tight mt-3">{nombre}</h3>

        {precio > 0 && (
          <p className="font-sans text-[var(--color-verde)] text-[17px] font-semibold mt-1">
            {precioMx(precio)} <span className="font-normal text-[var(--color-muted)] text-[15px]">{precioNota}</span>
          </p>
        )}
        {precioExtra && (
          <p className="font-sans text-[15px] text-[var(--color-terracota)] font-semibold mt-0.5">{precioExtra}</p>
        )}

        {horarios.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1" aria-label="Horario">
            {horarios.map((h) => (
              <li key={`${h.dia}-${h.rango}`} className="font-sans text-[15px] leading-6 text-[var(--color-text)]">
                <span className="font-semibold text-[#664917]">{h.dia}</span> {h.rango}
              </li>
            ))}
          </ul>
        )}

        {descripcion && (
          <p className="font-sans text-[var(--color-text)] text-[17px] leading-7 mt-3 whitespace-pre-line">
            {descripcion}
          </p>
        )}

        {children}
      </div>
    </article>
  );
}

export function TipoClaseCard({ tipo, horarios = [] }: { tipo: TipoClasePublico; horarios?: HorarioSemanal[] }) {
  // Con horarios ligados, los días ya se leen en la lista: el chip sobraría.
  const chips = [duracionTexto(tipo.duracion), horarios.length ? null : diasTexto(tipo.dias)].filter(
    (x): x is string => !!x,
  );
  return (
    <Tarjeta
      nombre={tipo.nombre}
      imagen={tipo.imagen}
      chips={chips}
      precio={tipo.precio}
      precioNota="por clase"
      descripcion={tipo.descripcion}
      horarios={horarios}
    />
  );
}

export function PaqueteClaseCard({
  paquete,
  horarios = [],
}: {
  paquete: PaqueteClasePublico;
  horarios?: HorarioSemanal[];
}) {
  const chips = [
    "Paquete",
    paquete.sesiones > 0 ? `${paquete.sesiones} ${paquete.sesiones === 1 ? "clase" : "clases"}` : null,
    paquete.vigenciaDias > 0 ? `Vigencia ${paquete.vigenciaDias} días` : null,
  ].filter((x): x is string => !!x);
  const porClase =
    paquete.sesiones > 1 && paquete.precio > 0
      ? ` · ${precioMx(Math.round((paquete.precio / paquete.sesiones) * 100) / 100)} por clase`
      : "";
  return (
    <Tarjeta
      nombre={paquete.nombre}
      // Dentro de su clase no repite foto: la de la clase ya está arriba.
      imagen={paquete.tipoId ? null : paquete.imagen}
      chips={chips}
      precio={paquete.precio}
      precioNota={`el paquete${porClase}`}
      precioExtra={paquete.inscripcion > 0 ? `+ Inscripción anual ${precioMx(paquete.inscripcion)}` : undefined}
      descripcion={paquete.descripcion}
      horarios={horarios}
    >
      {(paquete.incluye.length > 0 || paquete.condiciones.length > 0) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Lista titulo="Incluye" items={paquete.incluye} tono="verde" />
          <Lista titulo="Condiciones" items={paquete.condiciones} tono="muted" />
        </div>
      )}
    </Tarjeta>
  );
}
