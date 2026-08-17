import type { Metadata } from "next";

// La página es "use client" y no puede exportar metadata; el layout aporta
// el noindex (página transaccional, sin valor de búsqueda).
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
