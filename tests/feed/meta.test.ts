import { test } from "node:test";
import assert from "node:assert/strict";
import type { ArticuloCatalogo } from "../../lib/feed/catalogo.ts";
import {
  CATEGORIA_GOOGLE_POR_TAG,
  ENCABEZADOS_META,
  descripcionFallback,
  filaMeta,
  filasMeta,
  precioMeta,
} from "../../lib/feed/meta.ts";

function articulo(extra: Partial<ArticuloCatalogo> = {}): ArticuloCatalogo {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    grupoId: null,
    nombre: "Libreta flores",
    variante: null,
    descripcion: "Una libreta bonita",
    precio: 249,
    stock: 5,
    disponible: true,
    url: "https://www.papela-atelier.com/productos/libreta-flores",
    imagen: "https://cdn.example.com/foto.jpg",
    imagenesExtra: [],
    marca: null,
    tags: ["libretas"],
    ...extra,
  };
}

function comoObjeto(a: ArticuloCatalogo): Record<string, string> {
  const fila = filaMeta(a);
  assert.equal(fila.length, ENCABEZADOS_META.length);
  return Object.fromEntries(ENCABEZADOS_META.map((h, i) => [h, fila[i]]));
}

test("encabezados exactos de Meta, en orden", () => {
  assert.deepEqual(
    [...ENCABEZADOS_META],
    [
      "id",
      "item_group_id",
      "title",
      "description",
      "availability",
      "condition",
      "price",
      "link",
      "image_link",
      "additional_image_link",
      "brand",
      "quantity_to_sell_on_facebook",
      "google_product_category",
      "product_type",
      "pattern",
    ]
  );
});

test("precio con dos decimales + MXN", () => {
  assert.equal(precioMeta(249), "249.00 MXN");
  assert.equal(precioMeta(1250.5), "1250.50 MXN");
});

test("fila de producto simple", () => {
  const o = comoObjeto(articulo());
  assert.equal(o.id, "11111111-1111-4111-8111-111111111111");
  assert.equal(o.item_group_id, "");
  assert.equal(o.title, "Libreta flores");
  assert.equal(o.description, "Una libreta bonita");
  assert.equal(o.availability, "in stock");
  assert.equal(o.condition, "new");
  assert.equal(o.price, "249.00 MXN");
  assert.equal(o.link, "https://www.papela-atelier.com/productos/libreta-flores");
  assert.equal(o.image_link, "https://cdn.example.com/foto.jpg");
  assert.equal(o.brand, "Papela Atelier"); // fallback obligatorio
  assert.equal(o.quantity_to_sell_on_facebook, "5");
  assert.equal(
    o.google_product_category,
    "Office Supplies > General Office Supplies > Paper Products > Notebooks & Notepads"
  );
  assert.equal(o.product_type, "libretas");
  assert.equal(o.pattern, "");
});

test("fila de variante: item_group_id y pattern", () => {
  const o = comoObjeto(
    articulo({
      id: "aaaa1111-1111-4111-8111-111111111111",
      grupoId: "11111111-1111-4111-8111-111111111111",
      nombre: "Libreta flores – Rosas",
      variante: "Rosas",
    })
  );
  assert.equal(o.id, "aaaa1111-1111-4111-8111-111111111111");
  assert.equal(o.item_group_id, "11111111-1111-4111-8111-111111111111");
  assert.equal(o.title, "Libreta flores – Rosas");
  assert.equal(o.pattern, "Rosas");
});

test("agotado → out of stock y cantidad 0, sin borrar la fila", () => {
  const o = comoObjeto(articulo({ disponible: false, stock: 0 }));
  assert.equal(o.availability, "out of stock");
  assert.equal(o.quantity_to_sell_on_facebook, "0");
});

test("marca capturada gana sobre el fallback", () => {
  const o = comoObjeto(articulo({ marca: "Mossery" }));
  assert.equal(o.brand, "Mossery");
});

test("descripción vacía usa el fallback con el nombre", () => {
  const o = comoObjeto(articulo({ descripcion: null }));
  assert.equal(o.description, descripcionFallback("Libreta flores"));
  assert.ok(o.description.startsWith("Libreta flores en Papela Atelier"));
});

test("título se trunca a 150 y descripción a 5,000", () => {
  const o = comoObjeto(
    articulo({ nombre: "x".repeat(200), descripcion: "y".repeat(6000) })
  );
  assert.equal(o.title.length, 150);
  assert.equal(o.description.length, 5000);
});

test("additional_image_link: dedupe (incluida la principal) y tope de 20", () => {
  const muchas = Array.from({ length: 30 }, (_, i) => `https://cdn.example.com/${i}.jpg`);
  const o = comoObjeto(
    articulo({
      imagen: "https://cdn.example.com/0.jpg",
      // Repetida + la principal coladas a propósito.
      imagenesExtra: [...muchas, "https://cdn.example.com/1.jpg"],
    })
  );
  const extras = o.additional_image_link.split(",");
  assert.equal(extras.length, 20);
  assert.equal(new Set(extras).size, 20);
  assert.ok(!extras.includes("https://cdn.example.com/0.jpg"));
});

test("additional_image_link separa con coma", () => {
  const o = comoObjeto(
    articulo({ imagenesExtra: ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"] })
  );
  assert.equal(o.additional_image_link, "https://cdn.example.com/a.jpg,https://cdn.example.com/b.jpg");
});

test("tag sin mapa conocido deja google_product_category vacío", () => {
  const o = comoObjeto(articulo({ tags: ["shely"] }));
  assert.equal(o.google_product_category, "");
  assert.equal(o.product_type, "shely");
});

test("mapa de categorías: entradas verificadas contra la taxonomía de Google", () => {
  // Las cadenas deben ser EXACTAS; aquí se fija la forma general.
  for (const categoria of Object.values(CATEGORIA_GOOGLE_POR_TAG)) {
    assert.ok(categoria.includes(" > "), categoria);
  }
  assert.equal(
    CATEGORIA_GOOGLE_POR_TAG.plumones,
    "Office Supplies > Office Instruments > Writing & Drawing Instruments > Markers & Highlighters > Markers"
  );
});

test("tag sin-meta: el artículo queda fuera del feed por completo", () => {
  const { filas, excluidosSinMeta } = filasMeta([
    articulo(),
    articulo({ id: "22222222-2222-4222-8222-222222222222", tags: ["sin-meta", "libretas"] }),
  ]);
  assert.equal(filas.length, 1);
  assert.equal(excluidosSinMeta, 1);
  assert.equal(filas[0][0], "11111111-1111-4111-8111-111111111111");
});

test("sin-meta jamás se usa como product_type ni para la categoría", () => {
  // Un artículo con sin-meta no entra al feed, pero filaMeta tampoco debe
  // usar el tag si se mapeara directo.
  const o = comoObjeto(articulo({ tags: ["sin-meta"] }));
  assert.equal(o.product_type, "");
  assert.equal(o.google_product_category, "");
});
