// Contenido de las "clases/talleres" que imparte cada maestra.
// HARDCODE temporal: hoy no existe tabla en Supabase para esto. Si más adelante
// se quiere editar desde el admin, migrar a una tabla `clases_actividades` +
// API pública, igual que el resto del sitio. Mientras tanto se edita aquí.

export type MaterialGrupo = {
  // Subtítulo opcional para listas con variantes (ej. "Proyecto Van Gogh").
  titulo?: string;
  items: string[];
};

export type Actividad = {
  titulo: string;
  edades: string; // ej. "4 a 8 años" — se muestra como badge
  descripcion: string;
  materialesNota?: string; // texto introductorio antes de la(s) lista(s)
  materiales: MaterialGrupo[];
  imagen?: string; // opcional; si falta se muestra un placeholder
};

const ACTIVIDADES: Record<string, Actividad[]> = {
  // Celia Adriana Lara Rojas — Vitralart
  celia: [
    {
      titulo: "Modelado de figuras",
      edades: "4 a 8 años",
      imagen: "/images/modelado-figuras-papela.jpg",
      descripcion:
        "En estas actividades los niños reproducen objetos de uso cotidiano, animales o plantas para ir soltando su creatividad y aprender a formar con sus manos objetos en tercera dimensión.",
      materialesNota:
        "Pueden elegir plastilina de colores, Play-Doh o fomi flexible. Dependiendo de cuál elijan, serían los siguientes colores:",
      materiales: [
        {
          items: [
            "Barras de plastilina de colores marca Jovi (10 piezas)",
            "Play-Doh de colores (amarillo, rojo, azul, blanco y negro)",
            "Fomi flexible de colores (amarillo, rojo, azul, blanco y negro)",
            "Estiques de modelado",
            "Moldes de letras y figuras (se pueden proporcionar a préstamo o comprarlos en tienda)",
          ],
        },
      ],
    },
    {
      titulo: "Proyectos inspirados en artistas",
      edades: "4 a 8 años",
      imagen: "/images/inspirados-artistas-papela.jpg",
      descripcion:
        "Utilizando como inspiración a artistas como Van Gogh, Monet, Mondrian, Warhol, entre otros, creamos proyectos en donde manejamos manchas, repeticiones, espirales y armonía de colores en patrones reconocibles que les ayuden a comprender el arte y a buscar su propio estilo.",
      materialesNota:
        "Dependiendo del artista que se vea por clase será el material a comprar. Podríamos empezar con dos proyectos a elegir en la primera semana:",
      materiales: [
        {
          titulo: "Proyecto Van Gogh",
          items: [
            "Lienzo 30x40 cm",
            "Fécula de maíz (160 gr)",
            "Resistol 850 (110 gr)",
            "Témperas escolares (amarillo, azul, rojo, blanco y negro)",
            "Lápiz HB",
            "Borrador",
            "Sacapuntas",
            "Godete de plástico",
            "Juego de espátulas de plástico",
          ],
        },
        {
          titulo: "Proyecto Warhol",
          items: [
            "Lienzo 30x40 cm",
            "Pincel plano sintético no. 5",
            "Pincel redondo sintético no. 3",
            "Lápiz HB",
            "Borrador",
            "Sacapuntas",
            "Godete de plástico",
            "Témperas escolares (amarillo, azul, rojo, blanco y negro)",
            "Washi tape o masking tape azul",
          ],
        },
      ],
    },
    {
      titulo: "Pintura en tela",
      edades: "8 años en adelante",
      imagen: "/images/pintura-tela.jpg",
      descripcion:
        "En esta actividad podrán personalizar un estuche escolar, su gorra, sus tennis, una totebag o alguna prenda que deseen, para expandir su creatividad en el diseño y aprender a aplicar pintura acrílica en la tela, mientras aprenden jugando técnicas como el degradado, flotado, salpicado, texturas, etc.",
      materiales: [
        {
          items: [
            "Superficie de tela a pintar (gorra, totebag, estuche, tennis, playeras, etc.)",
            "Pinceles para tela marca Condor de lengua de gato o pinceles planos de cerda natural en los números: no. 2, no. 4 y no. 8",
            "Pincel para delinear sintético 0 (también puede ser 00)",
            "Pinturas acrílicas (amarillo, azul, rojo, negro, blanco y magenta)",
            "Godete de plástico",
            "Papel caple del tamaño del proyecto a elegir",
            "Pegamento Multicolage Acrilex",
            "Estenciles de figuras (algunos se pueden proporcionar a préstamo o venderlos en tienda)",
            "Material opcional: piedras de brillitos para tela y pintura con diamantina para tela marca Acrilex (solo si quieren ponerle brillos a su diseño)",
          ],
        },
      ],
    },
    {
      titulo: "Modelado en arcilla",
      edades: "8 años en adelante",
      imagen: "/images/modelado-arcillla-papela.jpg",
      descripcion:
        "Estas actividades ayudan con la psicomotricidad infantil, ya que mejoran la coordinación ojo-mano, la fuerza muscular y la destreza en los niños. A la vez aprenden a crear figuras de su preferencia en tercera dimensión, la proporción de los objetos que crean y el manejo de las estructuras en el equilibrio de su pieza.",
      materiales: [
        {
          items: [
            "Arcilla de secado al aire 250 gr",
            "Estiques de modelado",
            "Pinturas acrílicas (rojo, azul, amarillo, blanco y negro)",
            "Pinceles sintéticos (no. 0, no. 2, no. 4 y no. 8)",
            "Aerosol Aerocomex transparente brillante",
            "Niveladores para placas (se pueden proporcionar a préstamo)",
            "Moldes de galletas para figuras (se pueden proporcionar a préstamo)",
          ],
        },
      ],
    },
    {
      titulo: "Dibujo artístico principiantes",
      edades: "8 años en adelante",
      imagen: "/images/dibujando-papela.jpg",
      descripcion:
        "Utilizando carboncillo, gises secos y pastel, lápices de colores o acuarelas, los niños realizarán diversas actividades para iniciar con las bases del dibujo: aprenden a observar su entorno, el uso de las proporciones de objetos y personas, luces y sombras, así como la composición del cuadro.",
      materialesNota:
        "Comenzamos con lápices de colores y de ahí partimos a usar distintos materiales para aplicar diferentes técnicas, e incluso mezclarlos para generar texturas. El material para iniciar sería:",
      materiales: [
        {
          items: [
            "Caja de lápices de colores marca Prismacolor Junior 24 colores o Faber-Castell 24 colores",
            "Lápiz 2H, HB y 5B",
            "Block Marquilla blanco 24x33 cm de 20 hojas",
            "Esfumino no. 3",
            "Goma",
            "Sacapuntas",
          ],
        },
      ],
    },
  ],
};

// Lista por si una maestra no tiene contenido propio todavía.
const ACTIVIDADES_DEFAULT: Actividad[] = [];

export function getActividades(slug: string): Actividad[] {
  return ACTIVIDADES[slug] ?? ACTIVIDADES_DEFAULT;
}

// Etiqueta de público/edad que se muestra como badge en la tarjeta del listado.
// HARDCODE — no existe campo en Supabase. Editar aquí por maestra.
const PUBLICO: Record<string, string> = {
  celia: "Niños y adultos",
};

export function getPublico(slug: string): string | null {
  return PUBLICO[slug] ?? null;
}
