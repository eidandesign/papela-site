"use client";

export default function BackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="hover:text-[var(--color-verde)] transition-colors"
    >
      Volver arriba ↑
    </button>
  );
}
