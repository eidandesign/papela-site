export interface Acabado {
  nombre: string;
  texto: string;
  precio: number;
  imagen: string;
}

export interface Bordado {
  nombre: string;
  precio: number;
}

export interface Paquete {
  nombre: string;
  precio: number;
  ideal: string;
  imagen: string;
  tint: string;
  destacado: boolean;
  contenido: string[];
}

// Paquetes de etiquetas escolares. Fuente de verdad única (precio/copy/contenido):
// la usan tanto el grid de desktop (page.tsx) como los tabs de mobile
// (BackToSchoolPaquetesTabs) a través del componente compartido PaqueteCard.
export const PAQUETES: Paquete[] = [
  {
    nombre: "Básico",
    precio: 220,
    ideal: "Para marcar lo esencial con muy buena calidad.",
    imagen: "/images/back-to-school/paquete-basico.jpg",
    tint: "#F0D9CC",
    destacado: false,
    contenido: [
      "54 etiquetas para lápices · 2.7 × 5 cm",
      "10 etiquetas para libros y cuadernos · 8 × 4.5 cm",
      "12 etiquetas multiusos · 6 × 4 cm",
      "15 etiquetas redondas · 5 cm",
    ],
  },
  {
    nombre: "Back to School",
    precio: 360,
    ideal: "Para dejar todo listo desde el inicio del ciclo escolar.",
    imagen: "/images/back-to-school/paquete-bts.jpg",
    tint: "#CED8D9",
    destacado: true,
    contenido: [
      "80 etiquetas para lápices · 2.7 × 5 cm",
      "20 etiquetas para libros y cuadernos · 8 × 4.5 cm",
      "6 etiquetas grandes de siluetas · 10 × 5 cm",
      "12 etiquetas multiusos · 6 × 4 cm",
      "15 etiquetas redondas · 5 cm",
    ],
  },
];

// "Elige el acabado" — 6 tarjetas con imagen (sección informativa) y también
// las opciones del modal de acabados que aparece al elegir un paquete.
export const ACABADOS: Acabado[] = [
  { nombre: "Holográfico", texto: "Cambia de color con el reflejo de la luz.", precio: 80, imagen: "/images/back-to-school/acabado-holografico.jpg" },
  { nombre: "Vinil contra agua", texto: "Resiste más al agua.", precio: 100, imagen: "/images/back-to-school/acabado-vinil.jpg" },
  { nombre: "Acabados Arena", texto: "Agrega un poco de textura y brillo en el acabado.", precio: 200, imagen: "/images/back-to-school/acabado-arena.jpg" },
  { nombre: "Estrellas", texto: "Estrellas holográficas que cambian con la luz.", precio: 80, imagen: "/images/back-to-school/acabado-estrellas.jpg" },
  { nombre: "Corazón", texto: "Cambia de color con el reflejo de la luz.", precio: 80, imagen: "/images/back-to-school/acabado-corazon.jpg" },
  { nombre: "Lluvia holográfica", texto: "Cambia de color con el reflejo de la luz.", precio: 80, imagen: "/images/back-to-school/acabado-lluvia.jpg" },
];

export const BORDADOS: Bordado[] = [
  { nombre: "Nombre bordado", precio: 50 },
  { nombre: "Escudo escolar", precio: 60 },
  { nombre: "Bordado de la mochila", precio: 50 },
];
