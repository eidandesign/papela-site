// Tarjeta de PRUEBA del Club Creativo (/club/demo) — estado en memoria.
//
// Existe para poder ver y probar la tarjeta, la planilla, las fichas y el
// rascado sin un token real del admin. Las rutas que la sirven
// (app/api/public/club/**) responden 404 fuera de dev/preview, así que estos
// datos nunca llegan a producción.
//
// El estado vive en `globalThis` para sobrevivir al hot-reload del dev server;
// se reinicia al reiniciar el server o con GET /api/public/club/demo?reset=1.

import { ADMIN_ORIGIN, type AlbumItem, type Catalogo, type MensajeClub, type StickerInfo } from "@/components/site/club/clubTipos";

export type PremioDemo = {
  titulo: string;
  url: string | null;
  descripcion: string | null;
  tipo: "descargable" | "fisico";
  imagen: string | null;
};
type DetalleDemo = { historia: string | null; premio: PremioDemo | null };

type EstadoDemo = {
  nombre: string;
  desde: string;
  numero: string;
  estilo: Record<string, unknown>;
  album: AlbumItem[];
  pendientes: number;
  detalles: Record<number, DetalleDemo>;
};

const ESTADO_INICIAL = (): EstadoDemo => ({
  nombre: "Papela Demo",
  desde: "2026-03-14T18:00:00.000Z",
  numero: "10000001",
  estilo: { tema: "atardecer", textura: "ninguna", holo: true, charms: [], colores: ["#f9c5d8", "#9ec5f7", "#fff3b0"] },
  // Ocho coleccionables: más que los 6 espacios de la portada, para poder
  // probar la elección (y que sobre algo en el selector).
  album: [
    { id: 1, cantidad: 1, transferible: false },
    { id: 2, cantidad: 2, transferible: true },   // repetido → se puede regalar
    { id: 3, cantidad: 1, transferible: false },
    { id: 5, cantidad: 1, transferible: false },
    { id: 6, cantidad: 1, transferible: false },
    { id: 7, cantidad: 1, transferible: false },
    { id: 8, cantidad: 1, transferible: false },
    { id: 9, cantidad: 1, transferible: false },
  ],
  pendientes: 2, // dos sorpresas por rascar
  detalles: {
    1: { historia: "El primero de la colección: nació de un boceto en servilleta.", premio: null },
    2: {
      historia: "Una tarde de lluvia en el taller, entre recortes de papel.",
      premio: {
        // Imprimible = imagen: la ficha la usa de vista previa sin necesidad
        // de una imagen aparte.
        titulo: "Planilla de etiquetas",
        url: "/images/back-to-school/planilla-circulares.webp",
        descripcion: "Descárgala e imprímela en casa.",
        tipo: "descargable",
        imagen: null,
      },
    },
    3: { historia: "El favorito de la casa — siempre se agota.", premio: null },
    6: { historia: "Salió de un error de horno que quedó mejor que el plan.", premio: null },
    7: { historia: "Lo dibujó una niña del taller de los sábados.", premio: null },
    8: { historia: "El más pedido en diciembre.", premio: null },
    9: { historia: "Estuvo perdido en un cajón todo un verano.", premio: null },
    5: {
      historia: "Se escondió tres meses antes de aparecer en la vitrina.",
      premio: {
        titulo: "Un llavero de arcilla",
        url: null,
        descripcion: "Pásalo a recoger cuando visites el taller.",
        tipo: "fisico",
        imagen: "/images/back-to-school/bordado-corazon.webp",
      },
    },
  },
});

const g = globalThis as unknown as { __clubDemo?: EstadoDemo; __clubDemoCatalogo?: Catalogo };

export function estadoDemo(): EstadoDemo {
  if (!g.__clubDemo) g.__clubDemo = ESTADO_INICIAL();
  return g.__clubDemo;
}

export function resetDemo(): EstadoDemo {
  g.__clubDemo = ESTADO_INICIAL();
  return g.__clubDemo;
}

// Catálogo: el REAL del admin (público y cacheable) para ver los stickers de
// verdad; si no responde, uno sintético con el logo como imagen.
const CATALOGO_FALLBACK: Catalogo = {
  total: 100,
  hitos: [],
  stickers: Array.from({ length: 14 }, (_, i) => ({
    id: i + 1,
    slug: `demo-${i + 1}`,
    nombre: `Coleccionable ${i + 1}`,
    imagen_url: "/images/Logo-papela-verde.svg",
    rareza: i === 1 ? "legendario" : i === 4 ? "raro" : "comun",
    orden: i + 1,
    como: "compra",
  })) as StickerInfo[],
};

export async function catalogoDemo(): Promise<Catalogo> {
  if (g.__clubDemoCatalogo) return g.__clubDemoCatalogo;
  try {
    const res = await fetch(`${ADMIN_ORIGIN}/api/public/club/stickers`, { next: { revalidate: 3600 } });
    const json = await res.json();
    if (Array.isArray(json?.stickers) && json.stickers.length) {
      // Las imágenes vienen relativas al admin: absolutas para que carguen
      // desde el sitio local.
      g.__clubDemoCatalogo = {
        ...json,
        stickers: json.stickers.map((s: StickerInfo) => ({
          ...s,
          imagen_url: s.imagen_url?.startsWith("http") ? s.imagen_url : `${ADMIN_ORIGIN}${s.imagen_url}`,
        })),
      };
      return g.__clubDemoCatalogo!;
    }
  } catch { /* sin admin a la mano → catálogo sintético */ }
  g.__clubDemoCatalogo = CATALOGO_FALLBACK;
  return g.__clubDemoCatalogo;
}

export const MENSAJES_DEMO: MensajeClub[] = [
  {
    id: "demo-1",
    titulo: "Nuevo taller de acuarela 🎨",
    cuerpo: "Este sábado a las 11:00. Los miembros del Club tienen 10% de descuento.",
    created_at: "2026-07-20T17:00:00.000Z",
  },
  {
    id: "demo-2",
    titulo: "Llegaron coleccionables nuevos",
    cuerpo: "Cinco diseños más se suman al álbum. ¡A completarlos!",
    created_at: "2026-07-12T16:30:00.000Z",
  },
];

// Revela el pendiente más antiguo: sortea un sticker del catálogo y lo pega.
export async function revelarDemo() {
  const st = estadoDemo();
  if (st.pendientes <= 0) return null;
  const catalogo = await catalogoDemo();
  const sticker = catalogo.stickers[Math.floor(Math.random() * catalogo.stickers.length)];
  const yaLo = st.album.find((a) => a.id === sticker.id);
  if (yaLo) {
    yaLo.cantidad += 1;
    yaLo.transferible = true;
  } else {
    st.album.push({ id: sticker.id, cantidad: 1, transferible: false });
    st.detalles[sticker.id] ??= { historia: "Recién llegado a tu álbum ✨", premio: null };
  }
  st.pendientes -= 1;
  return {
    sticker,
    repetido: !!yaLo,
    cantidad: yaLo?.cantidad ?? 1,
    pendientes: st.pendientes,
  };
}
