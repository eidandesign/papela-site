// Verificador de los bancos de Dopamina. Correr con: npx tsx scripts/verifica-bancos.ts
// Revisa: conteos, duplicados exactos dentro de cada banco, y palabras
// significativas repetidas ENTRE bancos (producían frases tipo
// "una luna curiosa... en la luna"). Aparte revisa la biblioteca de retos
// opcionales (retos-extra). Sale con código 1 si algo falla.

import { OBJETOS, ACCIONES, CIERRES } from "../lib/dopamina/bancos";
import { RETOS_EXTRA, type CategoriaRetoExtra } from "../lib/dopamina/retos-extra";

const STOPWORDS = new Set([
  "un", "una", "unos", "unas", "el", "la", "los", "las", "lo",
  "de", "del", "en", "al", "a", "y", "o", "con", "sin", "por", "para",
  "sobre", "bajo", "entre", "dentro", "junto", "mientras", "durante", "desde",
  "su", "sus", "que", "se", "muy", "más", "como", "es", "ante",
]);

function palabras(frase: string): string[] {
  return frase
    .toLowerCase()
    .split(/[\s,]+/)
    .filter((p) => p.length > 2 && !STOPWORDS.has(p));
}

const bancos = { OBJETOS, ACCIONES, CIERRES } as const;
let fallo = false;

// 0 · La plantilla arranca con "Dibuja": ninguna entrada debe usar ese verbo.
for (const [nombre, banco] of Object.entries(bancos)) {
  for (const item of banco) {
    if (item.toLowerCase().includes("dibuj")) {
      console.log(`❌ "${item}" en ${nombre} repite el verbo de la plantilla (Dibuja...)`);
      fallo = true;
    }
  }
}

// 1 · Conteos
for (const [nombre, banco] of Object.entries(bancos)) {
  console.log(`${nombre}: ${banco.length} entradas`);
  if (banco.length < 200) {
    console.log(`  ⚠️  menos de 200`);
    fallo = true;
  }
}

// 2 · Duplicados exactos dentro de cada banco
for (const [nombre, banco] of Object.entries(bancos)) {
  const vistos = new Set<string>();
  for (const item of banco) {
    if (vistos.has(item)) {
      console.log(`❌ duplicado en ${nombre}: "${item}"`);
      fallo = true;
    }
    vistos.add(item);
  }
}

// 3 · Palabras significativas compartidas entre bancos
const porBanco = Object.entries(bancos).map(([nombre, banco]) => {
  const mapa = new Map<string, string[]>();
  for (const item of banco) {
    for (const p of palabras(item)) {
      mapa.set(p, [...(mapa.get(p) ?? []), item]);
    }
  }
  return { nombre, mapa };
});

for (let i = 0; i < porBanco.length; i++) {
  for (let j = i + 1; j < porBanco.length; j++) {
    const a = porBanco[i];
    const b = porBanco[j];
    for (const [palabra, itemsA] of a.mapa) {
      const itemsB = b.mapa.get(palabra);
      if (itemsB) {
        console.log(
          `❌ "${palabra}" en ${a.nombre} (${itemsA.join("; ")}) y ${b.nombre} (${itemsB.join("; ")})`
        );
        fallo = true;
      }
    }
  }
}

// 4 · Retos opcionales: deben leerse como INSTRUCCIÓN después de "Reto:".
// Un sustantivo suelto ("Puntillismo.") se lee como etiqueta y una narración
// sin imperativo ("Algo acaba de salir mal.") como mensaje de error.
const MAX_RETO = 64; // ~2 renglones en mobile
const vistosRetos = new Set<string>();
let totalRetos = 0;
for (const cat of Object.keys(RETOS_EXTRA) as CategoriaRetoExtra[]) {
  for (const reto of RETOS_EXTRA[cat].retos) {
    totalRetos++;
    if (vistosRetos.has(reto)) {
      console.log(`❌ reto duplicado: "${reto}"`);
      fallo = true;
    }
    vistosRetos.add(reto);
    if (!reto.endsWith(".")) {
      console.log(`❌ reto sin punto final: "${reto}"`);
      fallo = true;
    }
    if (reto.split(/\s+/).length < 3) {
      console.log(`❌ reto demasiado corto (¿sustantivo suelto?): "${reto}"`);
      fallo = true;
    }
    if (reto.length > MAX_RETO) {
      console.log(`❌ reto de ${reto.length} caracteres (máx ${MAX_RETO}): "${reto}"`);
      fallo = true;
    }
  }
}
console.log(`RETOS_EXTRA: ${totalRetos} retos en ${Object.keys(RETOS_EXTRA).length} categorías`);

if (!fallo) console.log("✓ Bancos limpios");
process.exit(fallo ? 1 : 0);
