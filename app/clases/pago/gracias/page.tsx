import Link from "next/link";

export default function PagoGraciasPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 gap-6">
      <div className="w-16 h-16 rounded-full bg-[var(--color-verde)] flex items-center justify-center">
        <svg className="w-8 h-8 text-[var(--color-cremita)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="font-serif italic text-[clamp(2rem,5vw,3.5rem)] text-[var(--color-verde)]">
        ¡Clase reservada!
      </h1>
      <p className="font-sans text-[var(--color-text)] text-lg max-w-md">
        Tu pago fue procesado exitosamente. Te esperamos con los materiales listos.
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
