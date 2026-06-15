import Link from "next/link";

export default function PagoPendientePage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 gap-6">
      <div className="w-16 h-16 rounded-full bg-[#c9a84c] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </div>
      <h1 className="font-serif italic text-[clamp(2rem,5vw,3.5rem)] text-[#c9a84c]">
        Pago pendiente
      </h1>
      <p className="font-sans text-[var(--color-text)] text-lg max-w-md">
        Tu pago está siendo procesado. Te notificaremos cuando se confirme tu lugar.
      </p>
      <Link
        href="/clases"
        className="bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        Ver más clases
      </Link>
    </section>
  );
}
