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
// El premio es de dos naturalezas: un ARCHIVO que el miembro descarga e
// imprime, o un PRODUCTO físico que recoge en la tienda (por eso `url` puede
// venir vacía). `tipo`/`imagen` son opcionales: una tarjeta abierta contra un
// admin aún sin desplegar sigue leyendo el premio como descargable.
export type PremioSticker = {
  titulo: string;
  url: string | null;
  descripcion: string | null;
  tipo?: "descargable" | "fisico";
  imagen?: string | null;
};
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

// Copiar una IMAGEN al portapapeles (para pegarla como sticker en redes).
// Safari exige crear el ClipboardItem con una Promise DENTRO del gesto del
// usuario, y el portapapeles solo acepta image/png — se convierte por canvas
// si el asset viene en otro formato. Respaldos en orden: descargar el archivo
// y, si el fetch está bloqueado (CORS), abrir la imagen para guardarla a mano.
export type ResultadoCopiaImagen = "copiado" | "descargado" | "abierto" | false;

export async function copiarImagen(src: string, nombre: string): Promise<ResultadoCopiaImagen> {
  const aPng = async (blob: Blob): Promise<Blob> => {
    if (blob.type === "image/png") return blob;
    const bmp = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0);
    return new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob falló"))), "image/png"),
    );
  };
  const traer = () =>
    fetch(src).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.blob();
    });

  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": traer().then(aPng) })]);
      return "copiado";
    }
  } catch { /* sin permiso o sin soporte → respaldo */ }

  try {
    const blob = await traer();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombre.toLowerCase().replace(/\s+/g, "-")}.${blob.type === "image/png" ? "png" : blob.type.split("/")[1] || "png"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return "descargado";
  } catch { /* fetch bloqueado → que la guarde a mano */ }

  // OJO: con la feature "noopener", window.open devuelve null AUNQUE la
  // pestaña abra — se abre normal y se corta el opener a mano para poder
  // distinguir éxito (referencia) de popup bloqueado (null).
  const w = window.open(src, "_blank");
  if (!w) return false;
  w.opener = null;
  return "abierto";
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
