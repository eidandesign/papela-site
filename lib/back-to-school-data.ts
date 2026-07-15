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
