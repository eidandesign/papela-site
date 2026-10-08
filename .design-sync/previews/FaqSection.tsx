import { useEffect, useRef } from "react";
import { FaqSection } from "papela-ds";

// Home FAQ: terracota eyebrow + ultralight serif heading, native <details>
// rows with a verde "+" that rotates to "×" when open.
export const Default = () => (
  <div className="bg-[var(--color-bg)]">
    <FaqSection />
  </div>
);

// Same section with the first question expanded (answer in muted Satoshi,
// verde inline link).
export const FirstOpen = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector("details")?.setAttribute("open", "");
  }, []);
  return (
    <div ref={ref} className="bg-[var(--color-bg)]">
      <FaqSection />
    </div>
  );
};
