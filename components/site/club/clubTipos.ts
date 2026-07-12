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

// Lo que el miembro tiene (del GET de su tarjeta). `detalles` trae la
// historia y el premio SOLO de los stickers ya revelados (el catálogo
// público no los expone).
export type AlbumItem = { id: number; cantidad: number; transferible: boolean };
export type PremioSticker = { titulo: string; url: string; descripcion: string | null };
export type DetalleSticker = { historia: string | null; premio: PremioSticker | null };
export type MisStickers = {
  obtenidos: number;
  pendientes: number;
  album: AlbumItem[];
  detalles?: Record<number, DetalleSticker>;
};

// Mensajes del negocio (campana de la tarjeta).
export type MensajeClub = { id: string; titulo: string; cuerpo: string; created_at: string };

export const RAREZA_LABEL: Record<Rareza, string> = {
  comun: "Común",
  raro: "Raro ✦",
  legendario: "Legendario ★",
};

export function stickerSrc(origen: string, s: StickerInfo) {
  return s.imagen_url.startsWith("http") ? s.imagen_url : `${origen}${s.imagen_url}`;
}

// Copiar al portapapeles con respaldo: el Clipboard API falla silencioso en
// Safari/webviews o sin permiso; si falla, cae a textarea + execCommand.
// Devuelve si realmente se copió (para mostrar el "✓" solo cuando sí).
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}
