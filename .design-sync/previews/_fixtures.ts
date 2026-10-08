// Real Papela catalog items (admin public API, oct-2026) shared by the previews.
const IMG = "https://qrrqptkcgezposfmkvqy.supabase.co/storage/v1/object/public/producto-imagenes/";

export const agenda = {
  id: "a5a129fc-6a3e-4846-b712-d856f9be3942",
  nombre: "Agenda 2027",
  precio: 380,
  stock: 15,
  imagen_url: IMG + "1791147578187-2eelg3v1ejd.jpg",
  categoria: "Tienda",
  descripcion: "Agenda semanal 2027 con portadas de arte clásico, 14×20 cm.",
  color: null,
  medida: "14×20 cm",
  variaciones: [
    { id: "v-vang", nombre: "VanG.", precio: 380, stock: 2, imagen_url: IMG + "1791147578187-2eelg3v1ejd.jpg", color: null, tamano: null },
    { id: "v-rosas", nombre: "Rosas", precio: 380, stock: 3, imagen_url: IMG + "1791147650671-5256skmzsk5.jpg", color: null, tamano: null },
    { id: "v-vg", nombre: "V.G", precio: 380, stock: 3, imagen_url: IMG + "1791147870410-mg30khjbiwk.jpg", color: null, tamano: null },
  ],
};

export const acuarelas = {
  id: "6f691a22-4ae5-4a38-9f00-e1af5b5894a5",
  nombre: "Acuarelas Giorgione",
  precio: 170,
  stock: 2,
  imagen_url: IMG + "1791147306379-xsnwfescaj.jpg",
  categoria: "Tienda",
  descripcion: "Estuche de acuarelas, 60 colores.",
  color: null,
  medida: null,
  variaciones: [],
};

export const botones = {
  id: "30dda7fa-a650-453b-9a17-cf91b0f37f0c",
  nombre: "Botones Duo",
  precio: 56,
  stock: 10,
  imagen_url: IMG + "1790018878939-1xuq8n60a2i.jpg",
  categoria: "Tienda",
  descripcion: "2 botones chicos.",
  color: null,
  medida: null,
  variaciones: [],
};

export const charm = {
  id: "b82984fe-169e-4240-adc5-b73a0c796229",
  nombre: "Acrylic Charm",
  precio: 148,
  stock: 3,
  imagen_url: IMG + "1787163410113-rmaiimgfdn.jpg",
  categoria: "Tienda",
  descripcion: null,
  color: null,
  medida: null,
  variaciones: [],
};

export const businessNotebook = {
  id: "ee559547-9284-4726-b5eb-1b46d1defbef",
  nombre: "Business notebook",
  precio: 106,
  stock: 5,
  imagen_url: IMG + "1782755034781-lglwvhacv6m.jpg",
  categoria: "Tienda",
  descripcion: "Weekly planner de rayas, 100 hojas, con elástico.",
  color: null,
  medida: null,
  variaciones: [
    { id: "v-rosa", nombre: "Notebook rosa", precio: 106, stock: 3, imagen_url: IMG + "1782755034781-lglwvhacv6m.jpg", color: "Rosa", tamano: null },
    { id: "v-aqua", nombre: "Notebook verde aqua", precio: 106, stock: 2, imagen_url: IMG + "1782755081410-k0p779asrh.jpg", color: "Verde aqua", tamano: null },
  ],
};

export const album = {
  id: "40b70a1d-2a29-40c7-ad04-b3eed510ede5",
  nombre: "Album Fotografico",
  precio: 76,
  stock: 4,
  imagen_url: IMG + "1791148473075-cdbg80rw0zk.jpg",
  categoria: "Tienda",
  descripcion: null,
  color: null,
  medida: null,
  variaciones: [],
};

export const productos = [agenda, acuarelas, botones, businessNotebook, charm, album];

// ── content batch (FaqSection / OcasionesPills / CategoriasStack / ActividadesGrid / TalleresGallery)
// The site's own public/ images, served from production so they resolve inside the bundle.
const SITE_IMG = "https://www.papela-atelier.com/images/";

// app/personaliza/page.tsx → CATEGORIAS (passed to CategoriasStack).
export const categoriasPersonaliza = [
  { titulo: "Stickers personalizados", imagen: SITE_IMG + "personaliza/stickers.jpg", descripcion: "Diseñamos e imprimimos stickers para marcas, regalos, empaques, fiestas, libretas, eventos, emprendimientos y proyectos personales." },
  { titulo: "Cake toppers", imagen: SITE_IMG + "personaliza/cake-toppers.jpg", descripcion: "Creamos toppers para pastel con nombres, frases, personajes, temáticas, edades, colores y estilos personalizados para que tu celebración tenga un detalle especial." },
  { titulo: "Tazas personalizadas", imagen: SITE_IMG + "personaliza/tazas.jpg", descripcion: "Personalizamos tazas con nombres, frases, diseños, ilustraciones o ideas especiales para regalar, vender o usar en eventos." },
  { titulo: "Vasos personalizados", imagen: SITE_IMG + "personaliza/vasos.jpg", descripcion: "Hacemos vasos personalizados para fiestas, cumpleaños, despedidas, eventos, regalos corporativos o celebraciones familiares." },
  { titulo: "Etiquetas y empaques", imagen: SITE_IMG + "personaliza/etiquetas.jpg", descripcion: "Creamos etiquetas, tags, tarjetas, fajillas y detalles para empaques de regalos, productos, mesas de dulces o emprendimientos." },
  { titulo: "Manualidades y detalles creativos", imagen: SITE_IMG + "personaliza/manualidades.jpg", descripcion: "Realizamos piezas hechas a la medida con papel, vinil, cartulina, foamy, stickers, recortes, acabados especiales y materiales creativos." },
];

// lib/clases-actividades.ts → ACTIVIDADES.celia (passed to ActividadesGrid on /clases/celia).
export const actividadesCelia = [
  {
    titulo: "Modelado de figuras",
    edades: "4 a 8 años",
    imagen: SITE_IMG + "modelado-figuras-papela.jpg",
    descripcion: "En estas actividades los niños reproducen objetos de uso cotidiano, animales o plantas para ir soltando su creatividad y aprender a formar con sus manos objetos en tercera dimensión.",
    materialesNota: "Pueden elegir plastilina de colores, Play-Doh o fomi flexible.",
    materiales: [{ items: ["Barras de plastilina de colores marca Jovi (10 piezas)", "Play-Doh de colores (amarillo, rojo, azul, blanco y negro)", "Estiques de modelado"] }],
  },
  {
    titulo: "Proyectos inspirados en artistas",
    edades: "4 a 8 años",
    imagen: SITE_IMG + "inspirados-artistas-papela.jpg",
    descripcion: "Utilizando como inspiración a artistas como Van Gogh, Monet, Mondrian, Warhol, entre otros, creamos proyectos en donde manejamos manchas, repeticiones, espirales y armonía de colores en patrones reconocibles que les ayuden a comprender el arte y a buscar su propio estilo.",
    materiales: [{ titulo: "Proyecto Van Gogh", items: ["Lienzo 30x40 cm", "Fécula de maíz (160 gr)", "Resistol 850 (110 gr)"] }],
  },
  {
    titulo: "Pintura en tela",
    edades: "8 años en adelante",
    imagen: SITE_IMG + "pintura-tela.jpg",
    descripcion: "En esta actividad podrán personalizar un estuche escolar, su gorra, sus tennis, una totebag o alguna prenda que deseen, para expandir su creatividad en el diseño y aprender a aplicar pintura acrílica en la tela, mientras aprenden jugando técnicas como el degradado, flotado, salpicado, texturas, etc.",
    materiales: [{ items: ["Superficie de tela a pintar (gorra, totebag, estuche, tennis, playeras, etc.)", "Pinturas acrílicas (amarillo, azul, rojo, negro, blanco y magenta)", "Godete de plástico"] }],
  },
  {
    titulo: "Modelado en arcilla",
    edades: "8 años en adelante",
    imagen: SITE_IMG + "modelado-arcillla-papela.jpg",
    descripcion: "Estas actividades ayudan con la psicomotricidad infantil, ya que mejoran la coordinación ojo-mano, la fuerza muscular y la destreza en los niños. A la vez aprenden a crear figuras de su preferencia en tercera dimensión, la proporción de los objetos que crean y el manejo de las estructuras en el equilibrio de su pieza.",
    materiales: [{ items: ["Arcilla de secado al aire 250 gr", "Estiques de modelado", "Aerosol Aerocomex transparente brillante"] }],
  },
  {
    titulo: "Dibujo artístico principiantes",
    edades: "8 años en adelante",
    imagen: SITE_IMG + "dibujando-papela.jpg",
    descripcion: "Utilizando carboncillo, gises secos y pastel, lápices de colores o acuarelas, los niños realizarán diversas actividades para iniciar con las bases del dibujo: aprenden a observar su entorno, el uso de las proporciones de objetos y personas, luces y sombras, así como la composición del cuadro.",
    materiales: [{ items: ["Caja de lápices de colores Prismacolor Junior 24 colores", "Lápiz 2H, HB y 5B", "Block Marquilla blanco 24x33 cm de 20 hojas"] }],
  },
];
