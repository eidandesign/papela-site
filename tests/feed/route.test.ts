import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { GET } from "../../app/feed/meta.csv/route.ts";
import type { ProductoFeedApi } from "../../lib/feed/catalogo.ts";

const FOTO = "https://cdn.example.com/foto.jpg";

function producto(extra: Partial<ProductoFeedApi> = {}): ProductoFeedApi {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    nombre: "Libreta flores",
    slug: "libreta-flores",
    descripcion: "Una libreta bonita",
    precio: 249,
    stock: 5,
    imagen_url: FOTO,
    imagenes: [FOTO],
    tags: ["libretas"],
    ...extra,
  };
}

const fetchOriginal = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

function apiResponde(body: unknown, status = 200) {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(body), { status })) as typeof fetch;
}

test("camino feliz: 200 text/csv con encabezado + filas", async () => {
  apiResponde({ productos: [producto()] });
  const res = await GET();
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/csv; charset=utf-8");
  assert.equal(
    res.headers.get("cache-control"),
    "public, s-maxage=900, stale-while-revalidate=3600"
  );
  const lineas = (await res.text()).trimEnd().split("\r\n");
  assert.equal(lineas.length, 2); // encabezado + 1 fila
  assert.ok(lineas[0].startsWith("id,item_group_id,title,"));
  assert.ok(lineas[1].includes("249.00 MXN"));
});

test("API caído → lanza (ISR conserva el feed anterior, nunca 200 vacío)", async () => {
  apiResponde({}, 503);
  await assert.rejects(GET(), /503/);
});

test("catálogo vacío → lanza", async () => {
  apiResponde({ productos: [] });
  await assert.rejects(GET(), /vacío/);
});

test("todos los productos con sin-meta → lanza (el guard corre TRAS la exclusión)", async () => {
  apiResponde({
    productos: [
      producto({ tags: ["sin-meta", "libretas"] }),
      producto({ id: "22222222-2222-4222-8222-222222222222", tags: ["sin-meta"] }),
    ],
  });
  await assert.rejects(GET(), /vacío/);
});
