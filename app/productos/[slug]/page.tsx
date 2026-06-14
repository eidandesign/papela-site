export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <section className="flex items-center justify-center min-h-[60vh]">
      <h1 className="font-serif text-4xl text-[var(--color-verde)]">{slug}</h1>
    </section>
  );
}
