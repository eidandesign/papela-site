import ScrollReveal from "@/components/site/ScrollReveal";
import HistoriaAnimada from "@/components/site/club/HistoriaAnimada";

// "Cada estampita tiene su historia" (nov-2026, a petición del dueño) para
// /club-creativo/tarjeta: cuenta que cada coleccionable trae un cuento propio y
// que se puede COPIAR para pegarlo como sticker en redes, con los pasos reales
// de FichaSticker (el botón de copiar vive en la esquina inferior derecha del
// recuadro de la estampita; si el celular no deja copiar, se descarga).
// La historia de ejemplo es la real del Caballito (`club_stickers`, slug
// caballo), recortada. La ilustración animada vive en HistoriaAnimada.

const PASOS = [
  { titulo: "Abre tu estampita", texto: "Tócala en tu portada o en tu planilla completa." },
  { titulo: "Lee su historia", texto: "Cada una trae un cuento propio, escrito para ella." },
  { titulo: "Toca copiar", texto: "Es el botón redondo en la esquina de la estampita." },
  { titulo: "Pégala en tus redes", texto: "En tu historia de Instagram, en WhatsApp o donde quieras, como sticker." },
];

export default function SeccionHistorias() {
  return (
    <section className="w-[90%] mx-auto py-12 md:py-16">
      <HistoriaAnimada pasos={PASOS}>
        <ScrollReveal>
          <p className="label text-[var(--color-muted)] mb-3">Para compartir</p>
          <h2 className="font-serif italic text-[#403C3C] text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] mb-4">
            Cada estampita tiene su propia historia
          </h2>
          <p className="font-sans text-[16px] leading-[24px] text-[var(--color-muted)] max-w-xl mb-8">
            Ninguna es solo un dibujo: todas traen un cuento que descubres al abrirlas. Y si te encanta una, cópiala y compártela en tus redes como sticker.
          </p>
        </ScrollReveal>
      </HistoriaAnimada>
      <p className="font-sans text-[13px] leading-[19px] text-[var(--color-muted)] mt-6 max-w-md">
        Si tu celular no deja copiar imágenes, la estampita se descarga para que la subas desde tu galería.
      </p>
    </section>
  );
}
