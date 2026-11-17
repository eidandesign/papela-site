import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { jsPDF } from "jspdf";
import { MAESTROS_CONFIG } from "./config";
import { CAMPOS_FICHA, type DatosContrato } from "./campos";
import {
  INTRO_BORRADOR,
  MANIFESTACION,
  NOTA_FINAL_BORRADOR,
  TITULO_MODALIDAD,
  clausulas,
} from "./contrato-texto";

// ─────────────────────────────────────────────────────────────────────────────
// PDF del Acuerdo de colaboración, generado en el servidor con los datos que
// llenó el maestro. Carta, una columna, marca de Papela (PP Editorial en los
// títulos, Helvetica en el cuerpo). Lo que el maestro no llenó sale con línea
// para completarlo a mano al firmar.
// ─────────────────────────────────────────────────────────────────────────────

type RGB = [number, number, number];
const C = {
  verde: [18, 83, 92] as RGB,
  terracota: [140, 72, 42] as RGB,
  texto: [64, 60, 60] as RGB,
  muted: [110, 100, 95] as RGB,
  borde: [232, 220, 200] as RGB,
  cremita: [247, 243, 236] as RGB,
  marcaAgua: [240, 233, 222] as RGB,
};

const PAGINA = { w: 612, h: 792 };
const M = { x: 60, top: 64, bottom: 70 };
const ANCHO = PAGINA.w - M.x * 2;
const CUERPO = 9.5;

// La fuente se lee una vez por instancia (outputFileTracingIncludes la incluye
// en la función de Vercel). Si falla, los títulos caen a Times.
let fuenteB64: string | null | undefined;
function fuenteMarca(): string | null {
  if (fuenteB64 !== undefined) return fuenteB64;
  try {
    const f = path.join(process.cwd(), "lib/maestros/fuentes/PPEditorialNew-Regular.ttf");
    fuenteB64 = readFileSync(f).toString("base64");
  } catch {
    fuenteB64 = null;
  }
  return fuenteB64;
}

/** Quita lo que Helvetica estándar no puede dibujar (emoji, símbolos raros). */
export function textoPdf(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\n -~ -ÿ]/g, "")
    .replace(/[ \t]+/g, " ");
}

export function nombreArchivoContrato(d: DatosContrato): string {
  const base = d.modalidad === "clases" ? "Clases" : "Talleres";
  const persona = (d.valores.nombre ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `Papela-Acuerdo-${base}${persona ? `-${persona}` : ""}.pdf`;
}

export function generarContratoPdf(d: DatosContrato): ArrayBuffer {
  const { papela, contrato } = MAESTROS_CONFIG;
  const v = d.valores;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  doc.setProperties({
    title: `Acuerdo de colaboración - ${TITULO_MODALIDAD[d.modalidad]}`,
    author: "Papela Atelier",
    subject: contrato.aprobado ? "Acuerdo de colaboración" : "Borrador para revisión",
  });

  const fuente = fuenteMarca();
  if (fuente) {
    doc.addFileToVFS("PPEditorialNew-Regular.ttf", fuente);
    doc.addFont("PPEditorialNew-Regular.ttf", "PPEditorial", "normal");
  }
  const serif = () => doc.setFont(fuente ? "PPEditorial" : "times", "normal");
  const sans = (estilo: "normal" | "bold" = "normal") => doc.setFont("helvetica", estilo);
  const color = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

  // Se dibuja ANTES del contenido de cada página. Guarda y restaura la fuente:
  // una página nueva puede abrirse a media cláusula (asegura → nuevaPagina) y
  // el párrafo sigue escribiendo con el estado que haya quedado.
  const marcaAgua = () => {
    if (contrato.aprobado) return;
    const prevFuente = doc.getFont();
    const prevTam = doc.getFontSize();
    const prevColor = doc.getTextColor();
    sans("bold");
    doc.setFontSize(96);
    color(C.marcaAgua);
    // jsPDF rota alrededor del inicio del texto: se calcula el inicio para
    // que el centro de la palabra quede en el centro de la hoja.
    const ang = (35 * Math.PI) / 180;
    const w = doc.getTextWidth("BORRADOR");
    const cx = PAGINA.w / 2 + 18;
    const cy = PAGINA.h / 2 + 30;
    doc.text("BORRADOR", cx - (w / 2) * Math.cos(ang), cy + (w / 2) * Math.sin(ang), { angle: 35 });
    doc.setFont(prevFuente.fontName, prevFuente.fontStyle);
    doc.setFontSize(prevTam);
    doc.setTextColor(prevColor);
  };

  let y = M.top;
  marcaAgua();

  const nuevaPagina = () => {
    doc.addPage();
    marcaAgua();
    y = M.top;
  };
  const asegura = (alto: number) => {
    if (y + alto > PAGINA.h - M.bottom) nuevaPagina();
  };

  const parrafo = (texto: string, opts: { tam?: number; c?: RGB; ancho?: number; x?: number } = {}) => {
    const tam = opts.tam ?? CUERPO;
    sans();
    doc.setFontSize(tam);
    color(opts.c ?? C.texto);
    const lineas: string[] = doc.splitTextToSize(textoPdf(texto), opts.ancho ?? ANCHO);
    const alto = tam * 1.47;
    // Párrafos cortos no se parten (evita una línea huérfana al inicio de página).
    if (lineas.length <= 6) asegura(alto * lineas.length);
    for (const l of lineas) {
      asegura(alto);
      doc.text(l, opts.x ?? M.x, y);
      y += alto;
    }
  };

  const tituloSeccion = (t: string, espacioMin = 60) => {
    y += 10;
    asegura(espacioMin);
    sans("bold");
    doc.setFontSize(9);
    color(C.verde);
    doc.setCharSpace(0.6);
    doc.text(textoPdf(t.toUpperCase()), M.x, y);
    doc.setCharSpace(0);
    y += 16;
  };

  // Etiqueta + valor; sin valor, una línea para llenar a mano.
  const dato = (label: string, valor: string | undefined, x: number, ancho: number) => {
    sans();
    doc.setFontSize(8);
    color(C.muted);
    doc.text(textoPdf(label), x, y);
    const yValor = y + 13;
    if (valor) {
      doc.setFontSize(CUERPO);
      color(C.texto);
      const l: string[] = doc.splitTextToSize(textoPdf(valor), ancho);
      doc.text(l.slice(0, 2), x, yValor);
      return l.length > 1 ? 30 : 22;
    }
    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.8);
    doc.line(x, yValor + 2, x + ancho, yValor + 2);
    return 22;
  };
  const filaDatos = (items: { label: string; valor?: string }[]) => {
    asegura(36);
    const gap = 16;
    const w = (ANCHO - gap * (items.length - 1)) / items.length;
    let alto = 0;
    items.forEach((it, i) => {
      alto = Math.max(alto, dato(it.label, it.valor, M.x + i * (w + gap), w));
    });
    y += alto + 8;
  };

  // ── Encabezado ────────────────────────────────────────────────────────────
  sans("bold");
  doc.setFontSize(8);
  color(C.terracota);
  doc.setCharSpace(1.2);
  doc.text("PAPELA ATELIER  ·  LO QUE IMAGINAS COMIENZA AQUÍ", M.x, y);
  doc.setCharSpace(0);
  y += 34;
  serif();
  doc.setFontSize(30);
  color(C.verde);
  doc.text("Acuerdo de colaboración", M.x, y);
  y += 26;
  doc.setFontSize(17);
  color(C.terracota);
  doc.text(TITULO_MODALIDAD[d.modalidad], M.x, y);
  y += 22;

  if (!contrato.aprobado) {
    const lineas: string[] = (() => {
      sans();
      doc.setFontSize(8.5);
      return doc.splitTextToSize(textoPdf(INTRO_BORRADOR), ANCHO - 24);
    })();
    const alto = 26 + lineas.length * 12;
    doc.setFillColor(...C.cremita);
    doc.setDrawColor(...C.borde);
    doc.roundedRect(M.x, y, ANCHO, alto, 8, 8, "FD");
    sans("bold");
    doc.setFontSize(8);
    color(C.terracota);
    doc.text("DOCUMENTO PENDIENTE DE APROBACIÓN LEGAL", M.x + 12, y + 16);
    sans();
    doc.setFontSize(8.5);
    color(C.texto);
    doc.text(lineas, M.x + 12, y + 30);
    y += alto + 6;
  }

  // ── Partes ────────────────────────────────────────────────────────────────
  tituloSeccion("Datos de las partes", 120);
  sans("bold");
  doc.setFontSize(CUERPO);
  color(C.texto);
  doc.text("PAPELA", M.x, y);
  y += 14;
  filaDatos([
    { label: "Nombre comercial", valor: papela.nombre },
    { label: "Representante", valor: papela.representante },
  ]);
  filaDatos([{ label: "Domicilio", valor: papela.domicilio }]);
  y += 4;
  asegura(90);
  sans("bold");
  doc.setFontSize(CUERPO);
  color(C.texto);
  doc.text("EL/LA PRESTADOR/A", M.x, y);
  y += 14;
  filaDatos([{ label: "Nombre completo", valor: v.nombre }]);
  filaDatos([
    { label: "Teléfono", valor: v.telefono },
    { label: "Correo", valor: v.correo },
  ]);
  filaDatos([
    { label: "Domicilio", valor: v.domicilio },
    { label: "Instagram", valor: v.instagram ? `@${v.instagram}` : undefined },
  ]);
  y += 2;
  parrafo(MANIFESTACION, { c: C.muted, tam: 9 });

  // ── Cláusulas ─────────────────────────────────────────────────────────────
  clausulas(d.modalidad).forEach((c, i) => {
    tituloSeccion(`${i + 1}. ${c.titulo}`);
    // Una cláusula puede traer varios párrafos separados por "\n".
    c.texto.split("\n").forEach((p, j) => {
      if (j > 0) y += 5;
      parrafo(p);
    });
  });

  // ── Anexo A ───────────────────────────────────────────────────────────────
  // Arranca en la misma hoja si queda buen espacio; si no, en una nueva.
  if (PAGINA.h - M.bottom - y < 340) nuevaPagina();
  else {
    y += 26;
    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.8);
    doc.line(M.x, y, M.x + ANCHO, y);
    y += 34;
  }
  serif();
  doc.setFontSize(20);
  color(C.verde);
  doc.text("Anexo A · Ficha particular de la actividad", M.x, y);
  y += 18;
  parrafo(
    "Completar antes de firmar. Este anexo forma parte del acuerdo y precisa modalidad, fechas, materiales, costos, pagos y cancelaciones de cada actividad.",
    { c: C.muted, tam: 9 },
  );
  y += 8;
  const colLabel = 190;
  for (const campo of CAMPOS_FICHA[d.modalidad]) {
    sans();
    doc.setFontSize(9);
    const lab: string[] = doc.splitTextToSize(textoPdf(campo.label), colLabel - 12);
    const valor = v[campo.id];
    const val: string[] = valor ? doc.splitTextToSize(textoPdf(valor), ANCHO - colLabel) : [];
    const alto = Math.max(lab.length, val.length, 1) * 12 + 18;
    asegura(alto);
    color(C.muted);
    doc.text(lab, M.x, y + 14);
    if (valor) {
      color(C.texto);
      doc.setFontSize(CUERPO);
      doc.text(val, M.x + colLabel, y + 14);
    } else {
      doc.setDrawColor(...C.borde);
      doc.setLineWidth(0.8);
      doc.line(M.x + colLabel, y + 16, M.x + ANCHO, y + 16);
    }
    y += alto;
    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.5);
    doc.line(M.x, y, M.x + ANCHO, y);
  }

  // ── Firmas ────────────────────────────────────────────────────────────────
  y += 16;
  tituloSeccion("Firmas", contrato.aprobado ? 160 : 215); // firmas + nota final juntas
  const lugar = v.lugarFirma || "____________________________";
  parrafo(`Leído y aceptado en ${lugar}, a ______ de __________________ de ________.`);
  y += 56;
  asegura(50);
  const anchoFirma = (ANCHO - 40) / 2;
  const firma = (x: number, rol: string, nombre: string) => {
    doc.setDrawColor(...C.texto);
    doc.setLineWidth(0.6);
    doc.line(x, y, x + anchoFirma, y);
    sans("bold");
    doc.setFontSize(9);
    color(C.texto);
    doc.text(rol, x, y + 14);
    sans();
    color(C.muted);
    doc.text(textoPdf(nombre), x, y + 27);
  };
  firma(M.x, "PAPELA", `${papela.representante} · Representante`);
  firma(M.x + anchoFirma + 40, "EL/LA PRESTADOR/A", v.nombre ? v.nombre : "Nombre y firma");
  y += 48;

  if (!contrato.aprobado) {
    y += 10;
    parrafo(NOTA_FINAL_BORRADOR, { c: C.muted, tam: 8.5 });
  }

  // ── Pie en todas las páginas ──────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...C.borde);
    doc.setLineWidth(0.5);
    doc.line(M.x, PAGINA.h - 44, M.x + ANCHO, PAGINA.h - 44);
    sans();
    doc.setFontSize(7.5);
    color(C.muted);
    doc.text(
      textoPdf(`PAPELA ATELIER · Acuerdo de colaboración · ${TITULO_MODALIDAD[d.modalidad]} · ${contrato.version}`),
      M.x,
      PAGINA.h - 30,
    );
    doc.text(`Página ${p} de ${total}`, M.x + ANCHO, PAGINA.h - 30, { align: "right" });
  }

  return doc.output("arraybuffer");
}
