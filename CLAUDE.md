# Papela Atelier — Design System & Dev Guide

## Stack
- Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion
- Supabase (shared with admin.papela-atelier.com)
- Icons: **Heroicons** (`@heroicons/react/24/solid` or `/outline`) — always use this library
- Images: Next.js `<Image>` component always
- Video: Cloudinary URLs via `<video>` tag with `autoPlay muted loop playsInline`

## Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#F0EFEB` | Page background |
| `--color-verde` | `#12535C` | Primary — all CTAs, headings on light bg |
| `--color-cremita` | `rgb(243,230,207)` | Cream — text on dark bg |
| `--color-cremita-2` | `#F0E6D0` | Subtle cream accents |
| `--color-terracota` | `#8C482A` | Accent labels |
| `--color-text` | `#403C3C` | Body text on white/light bg |
| `--color-muted` | `rgb(110,100,95)` | Secondary text |
| `--color-border` | `rgb(232,220,200)` | Borders |

**Info cards colors:** `#F0D9CC` (talleres), `#C9D3C0` (clases), `#CED8D9` (personaliza)

## Typography
| Token | Font | Usage |
|---|---|---|
| `font-serif` | PP Editorial New | Headings, display text |
| `font-sans` | Satoshi | Body, UI labels |
| `font-display` | Canela Condensed | Decorative display |

**Rules:**
- Section headings on light bg: `font-serif font-extralight text-[#403C3C]` (weight 200 = ultralight)
- Hero heading: `font-serif italic text-[var(--color-cremita)]`
- Card titles in info cards: `font-serif italic`
- Body text: `font-sans font-normal`, size 18px for prominent copy
- Small labels: `text-xs font-semibold uppercase tracking-widest`

## Layout
- Container width: `w-[90%] mx-auto` (90% of viewport always)
- Horizontal padding on mobile: 20px (`px-5`)
- Horizontal padding on desktop: 80px (`md:px-20`) — only inside containers that need it
- Hero card margin: `mx-5 md:mx-20`
- Section vertical spacing: `py-12 md:py-16`

## CTAs / Buttons
- **Primary CTA:** `bg-[var(--color-verde)]` with `text-[var(--color-cremita)]`
- Arrow icon: `ArrowRightIcon` from Heroicons solid
- Hover animation: fill slides left→right (`origin-left scale-x-0 group-hover:scale-x-100`)
- Outline button: verde border + verde text, fills on hover with slide animation
- Arrow buttons (circular): `w-10 h-10 rounded-full bg-[var(--color-verde)]`

## Components
| Component | Path | Notes |
|---|---|---|
| `SiteNavbar` | `components/site/Navbar.tsx` | Dual state: large (not scrolled) / floating glass (scrolled). Logo se oculta cuando menú mobile está abierto. Header sube a `z-[100001]` cuando menuOpen para mostrar la X |
| `TextCarousel` | `components/site/TextCarousel.tsx` | Two diagonal ribbons, bg-color, text `#403C3C` |
| `SiteFooter` | `components/site/Footer.tsx` | Big "papela atelier" display text, verde social icons |
| `BackToTop` | `components/site/BackToTop.tsx` | Client component for scroll-to-top |
| `ScrollReveal` | `components/site/ScrollReveal.tsx` | Framer Motion scroll reveal wrapper |
| `CartButton` | `components/site/CartButton.tsx` | ShoppingBagIcon + badge terracota con count, renderiza CartDrawer |
| `CartDrawer` | `components/site/CartDrawer.tsx` | Portal, slide desde derecha, selector recoger/envío, totales, CTA → `/tienda/checkout` |
| `AddToCartButton` | `components/site/AddToCartButton.tsx` | Chequea `cantidad >= stock`. Prop `fullWidth` para usar en drawers |
| `QuickAddButton` | `components/site/QuickAddButton.tsx` | Círculo `+` que expande a pill `− N +` con spring animation. Capped al stock. Usa `e.stopPropagation()` para no disparar el drawer padre |
| `ProductCard` | `components/site/ProductCard.tsx` | Client component, onClick → `productDrawerStore.open()`. Contiene QuickAddButton |
| `ProductDrawer` | `components/site/ProductDrawer.tsx` | Portal. Mobile: `top-0 h-full left-[15%] rounded-l-3xl`. Desktop: `sm:left-auto sm:max-w-lg sm:rounded-none`. Footer fijo con WhatsApp + AddToCartButton |
| `ProductosCatalog` | `components/site/ProductosCatalog.tsx` | Grid con filtros de categoría. Cards abren ProductDrawer (no navegan a `/productos/[slug]`) |
| `ClaseCalendar` | `components/site/ClaseCalendar.tsx` | Mobile: lista de filas (fecha pill + detalles + Reservar). Desktop: grid 5 col. Nav por semana con mes serif grande + "Semana N" |
| `ClearCartOnMount` | `components/site/ClearCartOnMount.tsx` | Limpia el carrito al montar (usado en `/tienda/pago/gracias`) |

## Mobile horizontal scroll pattern
Used in info cards and Instagram carousels. Key rules:
- Container: `flex gap-4 overflow-x-auto snap-x snap-mandatory` with `style={{ scrollbarWidth: "none", scrollPaddingLeft: "20px" }}`
- First and last child: `<div className="flex-shrink-0 w-5" aria-hidden="true" />` (spacer, NOT padding — padding on overflow containers is clipped by browsers)
- Cards: `snap-start flex-shrink-0` with `width: "72vw"`
- The **section wrapper must NOT have `px-5`** — padding clips the horizontal overflow. Put padding only on the text content above the scroller.

## Supabase
- URL: `https://qrrqptkcgezposfmkvqy.supabase.co`
- Client: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (RSC)
- `lib/productos.ts` — `getProductos(categoria?)`, `getProductoById(id)` — direct Supabase queries

### productos table columns
`id, nombre, categoria, precio, stock, descripcion, imagen_url, created_at, color, medida, tags`
- `tags` is a `text[]` array — used for coleccion filtering (e.g. `["libretas"]`, `["favoritos"]`)
- Filter in-stock: `.gt("stock", 0)`
- No `slug` column — use `id` for URLs
- `categoria = "Tienda"` for products shown on the public site

## Admin API (productos públicos)
The homepage carousels do NOT query Supabase directly — they consume the admin's public API:

```
GET https://admin.papela-atelier.com/api/public/productos?coleccion=libretas
GET https://admin.papela-atelier.com/api/public/productos?coleccion=favoritos
```

- Implemented in `lib/productos-publicos.ts` → `getProductosPorColeccion(coleccion: string)`
- Returns `{ productos: Producto[] }` — same shape as `lib/productos.ts`
- Filters by `categoria = "Tienda"` AND `tags` array contains the coleccion value
- `revalidate: 60` — refreshes every minute
- **Admin middleware** (`/Users/adanch/Documents/papela-admin/middleware.ts`) excludes `api/public` from auth so the endpoint is public

To add a new carousel: call `getProductosPorColeccion("nueva-coleccion")` and tag products in the admin with that string.

## Instagram section (homepage)
- 3 static images in `public/images/`: `instagram-1.jpg`, `Instagram-2.jpg`, `Instagram-3.jpg`
- Desktop: 3-column grid (`hidden md:grid grid-cols-3 gap-4`)
- Mobile: horizontal snap scroll (same pattern as info cards)
- All images link to `https://instagram.com/papela.atelier`
- Uses `width={0} height={0}` + `w-full h-auto` on `<Image>` so natural aspect ratio shows without cropping

## Tienda (e-commerce)
Flujo completo: catálogo → drawer → carrito → checkout → MercadoPago → webhook → gracias/error

- **Zustand stores**: `lib/stores/cartStore.ts` (persist localStorage `papela-cart`) y `lib/stores/productDrawerStore.ts`
- **Checkout API**: `app/api/tienda/checkout/route.ts` — valida stock en Supabase, inserta en `tienda_pedidos`, crea Preference MP
- **Webhook**: `app/api/webhooks/mercadopago/route.ts` — valida firma HMAC, distingue por `external_reference` prefix (`tienda:`, `taller:`, clase sin prefix), decrementa stock atómicamente vía RPC
- **`tienda_pedidos` columns**: `id, external_reference, items (jsonb), tipo_envio, estado, payment_id, monto_total, comprador_nombre, comprador_email, comprador_telefono, direccion_envio (jsonb), created_at`
- **Envío**: $80 MXN fijo (`COSTO_ENVIO` en cartStore). Opciones: `recoger` | `envio`
- Los productos NO navegan a `/productos/[slug]` — abren `ProductDrawer` via Zustand store

## Logger
`lib/logger.ts` — logger estructurado JSON para producción
- Uso: `logger.error("mensaje", { campo: valor }, error)`
- Emite: `{"level":"error","message":"...","timestamp":"...","env":"production","context":{...},"error":{"name":"...","stack":"..."}}`
- Vercel indexa estos logs automáticamente. Para conectar Sentry: agregar `Sentry.captureException(error)` dentro de `emit()` — un solo cambio cubre todos los puntos de error
- **Nunca usar `console.error` directo** — siempre `logger.error()`

## Pages built
- `/` — Homepage (hero, text carousel, info cards, nosotros, libretas carousel, favoritos carousel, instagram, footer)
- `/productos` — Catálogo grid desde Supabase, filtros por categoría, abre ProductDrawer
- `/productos/[slug]` — Product detail (existe pero cards ya no navegan aquí — usan drawer)
- `/tienda/checkout` — Form comprador + dirección + resumen pedido
- `/tienda/pago/gracias|error|pendiente` — Páginas resultado MercadoPago
- `/talleres` — Activo
- `/clases` — Activo con ClaseCalendar responsive
- `/clases/[slug]` — Hero con foto maestra como fondo, calendario de horarios

## Homepage carousels (app/page.tsx)
```ts
const [libretas, favoritos, igPosts] = await Promise.all([
  getProductosPorColeccion("libretas"),
  getProductosPorColeccion("favoritos"),
  // ig is static images, no fetch needed
])
```

## Conventions
- All pages are Server Components (`async`) with `export const revalidate = 60`
- Client components: add `"use client"` only when needed (event handlers, hooks)
- No `max-w-7xl` — use `w-[90%] mx-auto` instead
- Images always use `<Image>` from next/image with `fill` + `object-cover` inside a relative container, OR `width={0} height={0}` + `w-full h-auto` for natural aspect ratio
- Never use inline SVG for icons — use Heroicons
- Allowed image domains in `next.config.ts`: Supabase storage + Cloudinary

## Related repos
- **Admin:** `/Users/adanch/Documents/papela-admin` → deployed at `admin.papela-atelier.com`
- **Site:** `/Users/adanch/Documents/papela-site` → deployed at `papela-atelier.com`
- Both share the same Supabase project
