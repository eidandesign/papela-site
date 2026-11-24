import { test } from "node:test";
import assert from "node:assert/strict";
import { celdaCsv, serializarCsv } from "../../lib/feed/csv.ts";

// Parser estricto RFC 4180 (solo para los tests): falla ante CSV malformado.
export function parseCsv(texto: string): string[][] {
  assert.ok(texto.endsWith("\r\n"), "el documento termina en CRLF");
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = "";
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (c === '"') {
      // Celda entrecomillada: debe abrir al inicio de la celda.
      assert.equal(celda, "", `comilla a media celda en el índice ${i}`);
      i++;
      let cerrada = false;
      while (i < texto.length) {
        if (texto[i] === '"') {
          if (texto[i + 1] === '"') {
            celda += '"';
            i += 2;
          } else {
            i++;
            cerrada = true;
            break;
          }
        } else {
          celda += texto[i];
          i++;
        }
      }
      assert.ok(cerrada, "celda entrecomillada sin cerrar");
      assert.ok(
        i >= texto.length || texto[i] === "," || texto.startsWith("\r\n", i),
        `basura tras cerrar comillas en el índice ${i}`
      );
    } else if (c === ",") {
      fila.push(celda);
      celda = "";
      i++;
    } else if (texto.startsWith("\r\n", i)) {
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = "";
      i += 2;
    } else {
      assert.notEqual(c, "\n", "LF suelto fuera de comillas");
      assert.notEqual(c, "\r", "CR suelto fuera de comillas");
      celda += c;
      i++;
    }
  }
  assert.equal(celda, "", "el documento termina en CRLF (sin celda colgando)");
  assert.equal(fila.length, 0, "el documento termina en CRLF (sin fila colgando)");
  return filas;
}

test("celda simple pasa sin comillas", () => {
  assert.equal(celdaCsv("Libreta flores"), "Libreta flores");
});

test("celda con coma va entre comillas", () => {
  assert.equal(celdaCsv("Libreta, pasta dura"), '"Libreta, pasta dura"');
});

test("comillas dobles se escapan doblándolas", () => {
  assert.equal(celdaCsv('Libreta "Flores" grande'), '"Libreta ""Flores"" grande"');
});

test("saltos de línea quedan dentro de comillas", () => {
  assert.equal(celdaCsv("línea 1\nlínea 2"), '"línea 1\nlínea 2"');
  assert.equal(celdaCsv("línea 1\r\nlínea 2"), '"línea 1\r\nlínea 2"');
});

test("round-trip: lo serializado se parsea de vuelta idéntico", () => {
  const filas = [
    ["id", "title", "description"],
    ["1", 'Con "comillas", coma', "varias\nlíneas, con coma"],
    ["2", "simple", ""],
  ];
  const csv = serializarCsv(filas);
  assert.deepEqual(parseCsv(csv), filas);
});

test("registros separados por CRLF y cierre con CRLF final", () => {
  const csv = serializarCsv([
    ["a", "b"],
    ["1", "2"],
  ]);
  assert.equal(csv, "a,b\r\n1,2\r\n");
});
