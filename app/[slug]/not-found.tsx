import Link from "next/link";
import SiteNavbar from "@/components/site/Navbar";
import SiteFooter from "@/components/site/Footer";

// 404 de un slug de Mini Site que no existe (o está en borrador). ConditionalShell
// trata las rutas de un segmento como standalone, así que aquí se vuelve a
// pintar el navbar/footer del sitio para que el 404 se vea como el resto.
export default function MiniSiteNotFound() {
  return (
    <>
      <SiteNavbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24 text-center">
        <div className="max-w-md">
          <p className="font-serif text-4xl text-[var(--color-verde)] mb-3">404</p>
          <h1 className="font-serif text-2xl text-[var(--color-text)] mb-2">Esta página no existe</h1>
          <p className="text-sm text-[var(--color-muted)] mb-6">Revisa el link o vuelve al inicio de Papela Atelier.</p>
          <Link href="/" className="inline-flex items-center justify-center rounded-full bg-[var(--color-verde)] text-[var(--color-cremita)] px-6 py-3 font-semibold">
            Ir al inicio
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
