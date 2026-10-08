import { ScrollReveal } from "papela-ds";

// Default (direction="up"): section heading block from /personaliza fades in
// and rises 28px when it enters the viewport.
export const Default = () => (
  <div className="p-8 bg-[var(--color-bg)]" style={{ width: 640 }}>
    <ScrollReveal>
      <div className="text-center max-w-2xl mx-auto">
        <p className="label text-[var(--color-terracota)] mb-4">Para qué ocasiones</p>
        <h2 className="font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight mb-4">
          Personalización para todos tus momentos
        </h2>
        <p className="font-sans text-[17px] leading-[26px] text-[var(--color-muted)]">
          En Papela podemos crear detalles personalizados para:
        </p>
      </div>
    </ScrollReveal>
  </div>
);

// direction="left": copy column slides in from the left (form section).
export const FromLeft = () => (
  <div className="p-8 bg-[var(--color-bg)]" style={{ width: 640 }}>
    <ScrollReveal direction="left">
      <div className="max-w-md">
        <p className="label text-[var(--color-terracota)] mb-4">Si tienes una idea</p>
        <h2 className="font-serif italic text-[#403C3C] text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.1]">
          Podemos hacerla realidad
        </h2>
      </div>
    </ScrollReveal>
  </div>
);

// Staggered cards (delay={i * 0.06}) as in the "Qué podemos personalizar" grid.
export const Staggered = () => (
  <div className="p-8 bg-[var(--color-bg)] grid grid-cols-3 gap-6" style={{ width: 760 }}>
    {["Stickers personalizados", "Cake toppers", "Tazas personalizadas"].map((t, i) => (
      <ScrollReveal key={t} delay={i * 0.06}>
        <article className="flex h-full flex-col gap-3 rounded-2xl border-2 border-[#C2D2D4] bg-[#DCE6E7] p-7">
          <span className="font-sans text-[13px] font-bold tracking-[2px] text-[#5E7E86]">0{i + 1}</span>
          <h3 className="font-serif italic text-[24px] leading-tight text-[#403C3C]">{t}</h3>
        </article>
      </ScrollReveal>
    ))}
  </div>
);
