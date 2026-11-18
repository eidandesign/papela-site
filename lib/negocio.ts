// Datos del negocio (NAP: nombre, dirección, teléfono) — ÚNICA fuente para el
// JSON-LD, el footer y la página de ubicación. Deben coincidir LETRA POR LETRA
// con la ficha de Google Business Profile: la consistencia es la señal que
// conecta el sitio con la ficha en Maps para las búsquedas "papelería en
// Puebla / Lomas de Angelópolis". Si cambia algo en la ficha, cambia aquí.
import { SITE_URL } from "@/lib/site";

export const NEGOCIO = {
  nombre: "Papela Atelier",
  telefono: "+52 221 186 5590",
  telefonoE164: "+522211865590",
  email: "hola@papela-atelier.com",
  direccion: {
    calle: "C. Hidalgo",
    colonia: "Lomas de Angelópolis",
    ciudad: "Heroica Puebla de Zaragoza",
    estado: "Puebla",
    cp: "72830",
    pais: "MX",
  },
  // Coordenadas de la ficha de Google Maps ya verificada (18-nov-2026). Antes
  // el JSON-LD traía 19.006,-98.285 — a ~4 km, en otra colonia.
  geo: { lat: 18.9727475, lng: -98.2873644 },
  // CID de la ficha en Google Maps (estable aunque cambie la URL larga).
  mapsUrl: "https://maps.google.com/?cid=14897200247367122614",
  comoLlegarUrl: "https://www.google.com/maps/dir/?api=1&destination=18.9727475,-98.2873644",
  mapaEmbedUrl:
    "https://maps.google.com/maps?q=Papela+Atelier,+C.+Hidalgo,+Lomas+de+Angel%C3%B3polis,+Puebla&z=16&hl=es&output=embed",
  horario: [
    { dias: "Lunes a viernes", abre: "10:00", cierra: "19:00", schema: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
    { dias: "Sábado", abre: "10:00", cierra: "15:30", schema: ["Saturday"] },
    { dias: "Domingo", abre: "12:00", cierra: "19:00", schema: ["Sunday"] },
  ],
  redes: {
    instagram: "https://instagram.com/papela.atelier",
    tiktok: "https://tiktok.com/@papela.atelier",
    facebook: "https://www.facebook.com/papelaatelier/",
  },
  url: SITE_URL,
} as const;

/** "C. Hidalgo, Lomas de Angelópolis, 72830 Heroica Puebla de Zaragoza, Pue." */
export const DIRECCION_LINEA = `${NEGOCIO.direccion.calle}, ${NEGOCIO.direccion.colonia}, ${NEGOCIO.direccion.cp} ${NEGOCIO.direccion.ciudad}, Pue.`;
