// Club Creativo — tipos y constantes compartidos entre la tarjeta, la
// planilla de coleccionables y el rascado. Los DATOS viven en el admin.

export const ADMIN_ORIGIN = "https://admin.papela-atelier.com";
export const CLUB_API = `${ADMIN_ORIGIN}/api/public/club`;

export type Rareza = "comun" | "raro" | "legendario";

export type StickerInfo = {
  id: number;
  slug: string;
  nombre: string;
  imagen_url: string; // ruta en el admin (/images/colleccionables/*.png)
  rareza: Rareza;
  orden: number; // número de espacio en la planilla (1..100)
  como: "compra" | "reto";
};

export type Catalogo = {
  total: number; // 100
  hitos: { en: number; premio: string }[];
  stickers: StickerInfo[];
};

// Lo que el miembro tiene (del GET de su tarjeta).
export type AlbumItem = { id: number; cantidad: number; transferible: boolean };
export type MisStickers = { obtenidos: number; pendientes: number; album: AlbumItem[] };

export const RAREZA_LABEL: Record<Rareza, string> = {
  comun: "Común",
  raro: "Raro ✦",
  legendario: "Legendario ★",
};

export function stickerSrc(origen: string, s: StickerInfo) {
  return s.imagen_url.startsWith("http") ? s.imagen_url : `${origen}${s.imagen_url}`;
}
