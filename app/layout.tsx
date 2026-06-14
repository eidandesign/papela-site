import type { Metadata } from "next";
import "./globals.css";
import SiteNavbar from "@/components/site/Navbar";
import SiteFooter from "@/components/site/Footer";

export const metadata: Metadata = {
  title: "Papela Atelier",
  description: "Papelería, diseño, talleres y clases de arte en Puebla.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteNavbar />
        <main className="pt-16 flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
