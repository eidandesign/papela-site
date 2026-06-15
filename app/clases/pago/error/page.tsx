import Link from "next/link";

export default function PagoErrorPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 gap-6">
      <div className="w-16 h-16 rounded-full bg-[var(--color-terracota)] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="font-serif italic text-[clamp(2rem,5vw,3.5rem)] text-[var(--color-terracota)]">
        Algo salió mal
      </h1>
      <p className="font-sans text-[var(--color-text)] text-lg max-w-md">
        No pudimos procesar tu pago. No se realizó ningún cargo. Intenta de nuevo o escríbenos.
      </p>
      <div className="flex gap-4">
        <Link
          href="/clases"
          className="border-2 border-[var(--color-verde)] text-[var(--color-verde)] font-sans px-8 py-3 rounded-xl hover:opacity-80 transition-opacity"
        >
          Volver a clases
        </Link>
        <a
          href="https://wa.me/522211865590"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[var(--color-verde)] text-[var(--color-cremita)] font-sans px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Escríbenos
        </a>
      </div>
    </section>
  );
}
