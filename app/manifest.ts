import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Papela Atelier",
    short_name: "Papela",
    description: "Papelería creativa, talleres y clases de arte en Puebla.",
    start_url: "/",
    display: "standalone",
    background_color: "#F0EFEB",
    theme_color: "#12535C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
