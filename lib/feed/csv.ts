// ─────────────────────────────────────────────────────────────────────────────
// Serialización CSV a mano, conforme a RFC 4180. Sin dependencias a propósito:
// son ~180 filas y una librería de CSV no se justifica en un repo público.
//
// Reglas (RFC 4180 §2):
//  - Una celda que contiene coma, comilla doble, CR o LF va entre comillas.
//  - Las comillas dobles dentro de una celda entrecomillada se escapan
//    doblándolas ("" por ").
//  - Los registros se separan con CRLF.
// ─────────────────────────────────────────────────────────────────────────────

/** Escapa una celda según RFC 4180. */
export function celdaCsv(valor: string): string {
  if (/[",\r\n]/.test(valor)) {
    return `"${valor.replaceAll('"', '""')}"`;
  }
  return valor;
}

/** Serializa filas (la primera suele ser el encabezado) a un documento CSV. */
export function serializarCsv(filas: readonly (readonly string[])[]): string {
  return filas.map((fila) => fila.map(celdaCsv).join(",")).join("\r\n") + "\r\n";
}
