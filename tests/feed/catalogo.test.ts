import { test } from "node:test";
import assert from "node:assert/strict";
import { construirCatalogo, type ProductoFeedApi } from "../../lib/feed/catalogo.ts";

const FOTO = "https://cdn.example.com/foto.jpg";
const FOTO_2 = "https://cdn.example.com/foto-2.jpg";
const FOTO_VAR = "https://cdn.example.com/variante.jpg";

function producto(extra: Partial<ProductoFeedApi> = {}): ProductoFeedApi {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    nombre: "Libreta flores",
    slug: "libreta-flores",
    descripcion: "Una libreta bonita",
    precio: 249,
    stock: 5,
    imagen_url: FOTO,
    imagenes: [FOTO, FOTO_2],
    tags: ["libretas"],
    ...extra,
  };
}

test("producto simple → 1 artículo con el uuid del producto", () => {
  const { articulos, sinFoto } = construirCatalogo([producto()]);
  assert.equal(articulos.length, 1);
  assert.equal(sinFoto.length, 0);
  const [a] = articulos;
  assert.equal(a.id, "11111111-1111-4111-8111-111111111111");
  assert.equal(a.grupoId, null);
  assert.equal(a.variante, null);
  assert.equal(a.nombre, "Libreta flores");
  assert.equal(a.url, "https://www.papela-atelier.com/productos/libreta-flores");
  assert.equal(a.imagen, FOTO);
  assert.deepEqual(a.imagenesExtra, [FOTO_2]);
  assert.equal(a.disponible, true);
});

test("producto con variantes → 1 artículo por variante, agrupado por el producto", () => {
  const { articulos } = construirCatalogo([
    producto({
      variaciones: [
        { id: "aaaa1111-1111-4111-8111-111111111111", nombre: "Rosas", precio: 260, stock: 3, imagen_url: FOTO_VAR },
        { id: "bbbb2222-2222-4222-8222-222222222222", nombre: "VanG.", precio: 249, stock: 0, imagen_url: FOTO },
      ],
    }),
  ]);
  assert.equal(articulos.length, 2);
  const [rosas, vang] = articulos;
  assert.equal(rosas.id, "aaaa1111-1111-4111-8111-111111111111");
  assert.equal(rosas.grupoId, "11111111-1111-4111-8111-111111111111");
  assert.equal(rosas.nombre, "Libreta flores – Rosas");
  assert.equal(rosas.variante, "Rosas");
  assert.equal(rosas.precio, 260);
  assert.equal(rosas.imagen, FOTO_VAR);
  // Las dos variantes usan el link del producto.
  assert.equal(rosas.url, vang.url);
  assert.equal(vang.disponible, false);
  assert.equal(vang.stock, 0);
});

test("variante sin foto propia usa la heredada que ya resolvió el API", () => {
  // El API entrega imagen_url ya heredada de la principal cuando la variante
  // no tiene foto propia; el catálogo la toma tal cual.
  const { articulos, sinFoto } = construirCatalogo([
    producto({
      variaciones: [
        { id: "cccc3333-3333-4333-8333-333333333333", nombre: "Lisa", precio: 249, stock: 2, imagen_url: FOTO },
      ],
    }),
  ]);
  assert.equal(sinFoto.length, 0);
  assert.equal(articulos[0].imagen, FOTO);
});

test("fila sin foto (ni propia ni heredada) queda fuera y se reporta", () => {
  const { articulos, sinFoto } = construirCatalogo([
    producto({ nombre: "LLavero", imagen_url: null, imagenes: [] }),
    producto({
      id: "22222222-2222-4222-8222-222222222222",
      nombre: "Sellos",
      variaciones: [
        { id: "dddd4444-4444-4444-8444-444444444444", nombre: "Gato", precio: 90, stock: 1, imagen_url: null },
        { id: "eeee5555-5555-4555-8555-555555555555", nombre: "Perro", precio: 90, stock: 1, imagen_url: FOTO },
      ],
    }),
  ]);
  // Solo sobrevive la variante con foto.
  assert.equal(articulos.length, 1);
  assert.equal(articulos[0].nombre, "Sellos – Perro");
  assert.deepEqual(sinFoto, ["LLavero", "Sellos – Gato"]);
});

test("agotados se conservan como no disponibles (nunca se borran)", () => {
  const { articulos } = construirCatalogo([producto({ stock: 0 })]);
  assert.equal(articulos.length, 1);
  assert.equal(articulos[0].disponible, false);
  assert.equal(articulos[0].stock, 0);
});

test("stock negativo se reporta como 0", () => {
  const { articulos } = construirCatalogo([producto({ stock: -2 })]);
  assert.equal(articulos[0].stock, 0);
  assert.equal(articulos[0].disponible, false);
});

test("sin slug cae al uuid (la ficha redirige 308 al slug)", () => {
  const { articulos } = construirCatalogo([producto({ slug: null })]);
  assert.equal(
    articulos[0].url,
    "https://www.papela-atelier.com/productos/11111111-1111-4111-8111-111111111111"
  );
});

test("marca y descripción vacías se normalizan a null", () => {
  const { articulos } = construirCatalogo([producto({ marca: "  ", descripcion: "" })]);
  assert.equal(articulos[0].marca, null);
  assert.equal(articulos[0].descripcion, null);
});

test("marca capturada viaja; undefined (admin sin deploy) se trata como null", () => {
  const { articulos } = construirCatalogo([
    producto({ marca: "Mossery" }),
    producto({ id: "33333333-3333-4333-8333-333333333333", marca: undefined }),
  ]);
  assert.equal(articulos[0].marca, "Mossery");
  assert.equal(articulos[1].marca, null);
});

test("imagenesExtra excluye la imagen principal de la fila", () => {
  const { articulos } = construirCatalogo([
    producto({
      imagenes: [FOTO, FOTO_2, FOTO_VAR],
      variaciones: [
        { id: "ffff6666-6666-4666-8666-666666666666", nombre: "Rosas", precio: 249, stock: 1, imagen_url: FOTO_2 },
      ],
    }),
  ]);
  assert.deepEqual(articulos[0].imagenesExtra, [FOTO, FOTO_VAR]);
});
