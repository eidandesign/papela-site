import Image from "next/image";
import { CheckIcon } from "@heroicons/react/24/solid";
import ScrollReveal from "@/components/site/ScrollReveal";

// "Cada estampita tiene su historia" (nov-2026, a petición del dueño) para
// /club-creativo/tarjeta: cuenta que cada coleccionable trae un cuento propio y
// que se puede COPIAR para pegarlo como sticker en redes, con los pasos reales
// de FichaSticker (el botón de copiar vive en la esquina inferior derecha del
// recuadro de la estampita; si el celular no deja copiar, se descarga).
// La historia de ejemplo es la real del Caballito (`club_stickers`, slug
// caballo), recortada.

const PASOS = [
  { titulo: "Abre tu estampita", texto: "Tócala en tu portada o en tu planilla completa." },
  { titulo: "Lee su historia", texto: "Cada una trae un cuento propio, escrito para ella." },
  { titulo: "Toca copiar", texto: "Es el botón redondo en la esquina de la estampita." },
  { titulo: "Pégala en tus redes", texto: "En tu historia de Instagram, en WhatsApp o donde quieras, como sticker." },
];

export default function SeccionHistorias() {
  return (
    <section className="w-[90%] mx-auto py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Texto + pasos */}
        <ScrollReveal>
          <p className="label text-[var(--color-muted)] mb-3">Para compartir</p>
          <h2 className="font-serif italic text-[#403C3C] text-[clamp(2.25rem,4vw,3.25rem)] leading-[1.05] mb-4">
            Cada estampita tiene su propia historia
          </h2>
          <p className="font-sans text-[16px] leading-[24px] text-[var(--color-muted)] max-w-xl mb-8">
            Ninguna es solo un dibujo: todas traen un cuento que descubres al abrirlas. Y si te encanta una, cópiala y compártela en tus redes como sticker.
          </p>
          <ol className="space-y-5">
            {PASOS.map((p, i) => (
              <li key={p.titulo} className="flex gap-4">
                <span className="shrink-0 w-9 h-9 rounded-full bg-[var(--color-tinta)] text-white font-serif italic text-[18px] flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-serif italic text-[22px] leading-tight text-[#403C3C]">{p.titulo}</h3>
                  <p className="font-sans text-[15px] leading-[22px] text-[var(--color-muted)]">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="font-sans text-[13px] leading-[19px] text-[var(--color-muted)] mt-6 max-w-md">
            Si tu celular no deja copiar imágenes, la estampita se descarga para que la subas desde tu galería.
          </p>
        </ScrollReveal>

        {/* Ilustración: la ficha de la estampita → una historia de Instagram */}
        <ScrollReveal delay={0.1}>
          <div aria-hidden="true" className="relative mx-auto w-full max-w-[520px] h-[430px] sm:h-[500px]">
            {/* Pantalla de "historia" con el sticker ya pegado */}
            <div className="absolute right-2 top-0 w-[165px] sm:w-[230px] aspect-[9/16] rounded-[30px] overflow-hidden shadow-[0_24px_44px_rgba(1,67,117,0.28)] rotate-[4deg]">
              <Image src="/images/club/fondos/horizonte.jpg" alt="" fill sizes="230px" className="object-cover" />
              <div className="absolute inset-x-0 top-3 px-3 flex gap-1">
                <span className="h-[3px] flex-1 rounded-full bg-white/90" />
                <span className="h-[3px] flex-1 rounded-full bg-white/40" />
              </div>
              <div className="absolute left-1/2 top-[34%] -translate-x-1/2 -rotate-[8deg] w-[96px] h-[96px] sm:w-[130px] sm:h-[130px]">
                <Image src="/images/club/preview/caballo.webp" alt="" fill sizes="130px" className="object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.3)]" />
              </div>
              <p className="absolute inset-x-0 bottom-[16%] text-center font-sans text-[13px] font-bold text-white px-4 [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">
                ¡Me salió Copo! 🐴
                <br />
                <span className="font-semibold">@papela.atelier</span>
              </p>
            </div>

            {/* Ficha de la estampita (como en la tarjeta real) */}
            <div className="absolute left-0 bottom-0 w-[245px] sm:w-[300px] rounded-[26px] bg-white p-5 shadow-[0_20px_44px_rgba(64,60,60,0.2)] -rotate-[3deg]">
              <div className="relative rounded-2xl bg-[var(--color-cremita-3)] p-5 flex items-center justify-center">
                <div className="relative w-[110px] h-[110px]">
                  <Image src="/images/club/preview/caballo.webp" alt="" fill sizes="110px" className="object-contain" />
                </div>
                {/* Botón copiar, como en FichaSticker, recién tocado */}
                <span className="absolute -bottom-3 -right-3 w-11 h-11 rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] flex items-center justify-center shadow-[0_6px_16px_rgba(18,83,92,0.35)] ring-4 ring-white">
                  <CheckIcon className="w-5 h-5" />
                </span>
                <span className="absolute -bottom-9 right-0 rounded-full bg-[var(--color-verde)] px-2.5 py-1 font-sans text-[11px] font-bold text-[var(--color-cremita)] whitespace-nowrap">
                  ¡Copiado!
                </span>
              </div>
              <div className="mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">Legendario ★</p>
                <p className="font-serif italic text-[24px] leading-tight text-[#403C3C] mb-2">Caballito</p>
                <p className="font-sans text-[13px] leading-[19px] text-[var(--color-muted)]">
                  En una granja rodeada de campos dorados vivía un caballo café llamado Copo, porque en la frente tenía una manchita blanca como de nube…
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
