import type { Metadata } from "next";

// Link-in-bio para redes: no debe competir con el home en búsquedas.
export const metadata: Metadata = {
  title: "Links",
  robots: { index: false, follow: false },
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
