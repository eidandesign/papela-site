import TextCarousel from "@/components/site/TextCarousel";

export default function HomePage() {
  return (
    <>
      <TextCarousel />
      <section className="flex items-center justify-center min-h-[60vh]">
        <h1 className="font-serif text-4xl text-[var(--color-verde)]">Papela Atelier</h1>
      </section>
    </>
  );
}
