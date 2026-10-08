import { AnimatedBurger } from "papela-ds";

const Tile = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-center rounded-2xl p-10" style={{ background: bg }}>
    {children}
  </div>
);

// Closed: three lines (short middle line), verde on light pages.
export const Default = () => (
  <Tile bg="var(--color-bg)">
    <AnimatedBurger isOpen={false} color="#12535C" />
  </Tile>
);

// Open: top/bottom lines cross into an X, middle line collapses.
export const Abierta = () => (
  <Tile bg="var(--color-bg)">
    <AnimatedBurger isOpen color="#12535C" />
  </Tile>
);

// Over a colored hero / the verde mobile menu: cremita lines.
export const SobreVerde = () => (
  <Tile bg="var(--color-verde)">
    <div className="flex items-center gap-10">
      <AnimatedBurger isOpen={false} color="#F3E6CF" />
      <AnimatedBurger isOpen color="#F3E6CF" />
    </div>
  </Tile>
);
