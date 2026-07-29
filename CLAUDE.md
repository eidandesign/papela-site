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
| `--color-cremita-3` | `#F7F3EC` | Lightest cream — cajas de resumen/total en forms (checkout taller) |
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

(Canela Condensed / `font-display` se eliminó: los .otf nunca existieron en `public/fonts` y ningún componente la usaba.)

**Rules:**
- Section headings on light bg: `font-serif font-extralight text-[#403C3C]` (weight 200 = ultralight)
- Hero heading: `font-serif italic text-[var(--color-cremita)]`, size `text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05]` (clases usa `clamp(2.8rem,6.5vw,5.5rem)`)
- Hero paragraph: `font-sans text-[18px] leading-[24px]` con `text-[var(--color-cremita)]/90` (opacidad alta = más contraste sobre el fondo de color)
- Card titles in info cards: `font-serif italic`
- Body text: `font-sans font-normal`, size 18px for prominent copy
- **`label` utility** (eyebrow/pill de los heroes, definida en `globals.css` con `@utility`): 11px / 15px, Satoshi 500, uppercase, `letter-spacing: 0.22em`. Uso: `className="label text-[var(--color-cremita)]/70"` (el color se deja contextual). Reemplaza el viejo patrón inline `text-[10px] font-medium tracking-[0.22em] uppercase`
- Otras etiquetas chicas (cards, badges): `text-[10px] font-semibold uppercase tracking-widest` — distintas del `label`, NO migrar sin querer

## Layout
- Container width: `w-[90%] mx-auto` (90% of viewport always)
- Horizontal padding on mobile: 20px (`px-5`)
- Horizontal padding on desktop: 80px (`md:px-20`) — only inside containers that need it
- Hero card margin: `mx-5 md:mx-20`
- Section vertical spacing: `py-12 md:py-16`

### Hero section pattern (todas las páginas)
**REGLA CRÍTICA — aplicar siempre, sin excepciones:**

Los heroes son una `section` con `width: 98vw` (margin lateral `1vw`), `rounded-[32px] md:rounded-[48px] overflow-hidden` y fondo de color.

```html
<!-- Patrón correcto — copiar exactamente -->
<section
  className="relative mt-6 rounded-[32px] md:rounded-[48px] overflow-hidden min-h-[80vh] flex flex-col"
  style={{ width: "98vw", marginLeft: "1vw", marginRight: "1vw", backgroundColor: "..." }}
>
  <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
    {/* contenido */}
  </div>
</section>
```

- **`flex flex-col`** en la section, **`flex-1 flex flex-col items-center justify-center`** en el div interno — así el contenido se centra en el espacio disponible.
- **`pt-[140px] md:pt-[180px]`** — clearance del navbar (~140px mobile, ~180px desktop). El pt desplaza el punto de centrado hacia abajo para que el navbar no tape el contenido.
- **`min-h-[80vh]`** (NO `h-[80vh]`) — el hero crece con el contenido en mobile.
- **NUNCA** poner `justify-center` en la section ni `md:justify-center` — el navbar ocupa espacio en ambos breakpoints.
- Referencia exacta: `HeroExperience.tsx` línea 329 usa este mismo patrón.

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
| `QuickAddButton` | `components/site/QuickAddButton.tsx` | Círculo `+` que expande a pill `− N +` con spring animation. Capped al stock. Usa `e.stopPropagation()` para no disparar el drawer padre. NO se usa en productos con variaciones (ahí el `+` abre el drawer) |
| `ProductCard` | `components/site/ProductCard.tsx` | Client component, onClick → `productDrawerStore.open()`. Prop `fullWidth` para grids; `variant="catalog"` = tarjeta compacta Figma (imagen cuadrada, título serif). Si el producto tiene variaciones, el `+` abre el drawer; si no, muestra QuickAddButton |
| `ProductCarousel` | `components/site/ProductCarousel.tsx` | Fila única con scroll horizontal + flechas circulares verdes (solo desktop, se ocultan en los extremos). `gap-8` (32px). Usado en home (Libretas/Favoritos) y `/productos`. Patrón de spacers `w-[5vw]` |
| `ProductDrawer` | `components/site/ProductDrawer.tsx` | Portal. Mobile: `top-0 h-full left-[15%] rounded-l-3xl`. Desktop: `sm:left-auto sm:max-w-lg sm:rounded-none`. Footer fijo con WhatsApp + AddToCartButton. **Selector de variaciones**: thumbnails (solo stock ≥ 1) que cambian imagen/precio/color/medida/stock al hacer click |
| `ClaseCalendar` | `components/site/ClaseCalendar.tsx` | Mobile: lista de filas (fecha pill + detalles + Reservar). Desktop: grid 5–7 col (Sáb/Dom solo si hay horarios en fin de semana). Nav por semana con mes serif grande + "Semana N". Los horarios son DISPONIBILIDAD de la maestra: el tipo de clase elegido (pills en `ReservaModal`) define precio/duración. Empate horario↔tipo en `lib/clases-matching.ts`: `tipo_clase_id` exacto si el admin lo asignó, si no heurística por días disponibles del tipo. **El precio SIEMPRE sale del tipo** (niños/adultos pagan distinto): slot ambiguo va sin etiqueta, muestra "Desde $mín" y su CTA dice "Elegir clase" (scrollea al selector) — el precio crudo del horario solo se usa/cobra con maestras sin tipos (legado). Al reservar se manda el tipo resuelto al checkout (cobra precio del tipo server-side). El modal NO remonta el calendario al cambiar de clase (conserva la semana navegada) |
| `ClearCartOnMount` | `components/site/ClearCartOnMount.tsx` | Limpia el carrito al montar (usado en `/tienda/pago/gracias`) |
| `TarjetaClub` | `components/site/TarjetaClub.tsx` | **Tarjeta del Club Creativo** (`/club/[token]`, ruta standalone en `ConditionalShell` + `noindex`). Los datos viven en el admin: `GET/PATCH https://admin.papela-atelier.com/api/public/club/<token>` + catálogo `GET .../club/stickers` (CORS abierto). Pase vertical estilo wallet (layout mockup jul-2026): header con título foil + **N.º de socio** (ya NO hay talón punteado ni QR), **portada de 6 coleccionables** (óvalos `rounded-[50%]`: el miembro **elige** cuáles van ahí — ver `estilo.portada` abajo —, sticker suelto sin fondo blanco, **tap abre su `FichaSticker`**, los que traen premio llevan 🎁 + pill blanca "Ganaste un premio"; espacio libre = óvalo punteado con **`+`** que abre `SelectorPortada`, y si no hay nada suelto que poner el `+` va tenue y no interactivo), contador X/100 centrado, "Ver mi planilla completa" con flecha circular), nombre foil + fecha abajo (con `timeZone` de `lib/fecha`), pill "🎁 Rascar" si hay pendientes, botón compartir. Personalización: tema **"color"** (primera opción del editor: mezcla de **3 colores** libres vía `<input type="color">` → `estilo.colores` [c1,c2,c3] — repetir un color reduce la mezcla; base c1+c2 con **deriva animada** `club-fondo-drift`, el **c3 es una mancha grande que DEAMBULA por la tarjeta** (`club-orbita-x` 31s + `club-orbita-y` 23s desacopladas — camino casi aleatorio), **grano SVG denso en 2 capas** (`GRANO_COLOR_URI`: overlay 0.75 + normal 0.16) para textura — solo en este tema, las fotos van limpias; tinta calculada por **luminancia WCAG** — oscura si el promedio es claro) + 14 fondos de **IMAGEN** en `public/images/club/fondos/<id>.jpg` (grupos auras/arte/brillos, cada uno define `ink` clara u oscura; `<id>-thumb.jpg` ~3KB para los swatches; la foto va FIJA `inset-0` + `cover`, sin deriva ni grano encima — conserva su resolución; "gises" se eliminó jul-2026); 7 texturas, holo, 4 charms arrastrables → PATCH con whitelist en el admin (ids viejos tipo `verde` caen al default `atardecer` vía `temaValido()`; originales de referencia en `public/images/fondos tarjetas/`, no usados por el código). Tilt 3D + `prefers-reduced-motion`. **Campana de notificaciones** (en `MenuClub`): aviso de stickers pendientes + mensajes del negocio (`GET .../club/mensajes`). El aviso "por revelar" es un **toast sobre la tarjeta que se va solo a los 3 s** (ya no se descarta con ✕): reaparece cada vez que cambia el número de pendientes y se congela mientras el puntero/foco está encima; después sigue disponible en la campana. En localStorage (`papela_club_notifs_<token>`) solo quedan los mensajes ya leídos. Fix iOS: `isolation:isolate` + `-webkit-mask-image` en el contenedor de la tarjeta (esquinas redondeadas vs hijos con transform animado) |
| `club/demo` (tarjeta de prueba) | `lib/club-demo.ts` + `app/api/public/club/**` | **`/club/demo`** = tarjeta funcional sin token del admin, para desarrollar y testear. El sitio se sirve a sí mismo la API (`/api/public/club/*`) con estado **en memoria** (`globalThis`, sobrevive al hot-reload). Trae 4 coleccionables (uno repetido ×2 regalable, dos con premio: descargable y físico), 2 sorpresas por rascar y 2 avisos. El catálogo son los **stickers reales** del admin (fetch server-side, con fallback sintético si no responde). Funciona rascar, personalizar (PATCH), regalar (código `DEMO-xxxx`) y canjear (cualquier código que empiece con `DEMO`). Reset: `GET /api/public/club/demo?reset=1`. **Solo dev y previews de Vercel** — `CLUB_DEMO_ON` (en `clubTipos.ts`) es false en producción y todas las rutas responden 404. El origen de la API lo elige `clubOrigen(token)`/`clubApi(token)`: el admin para tokens reales, el propio sitio para `demo` |
| `MenuClub` | `components/site/club/MenuClub.tsx` | **Menú de la tarjeta** (header, sticky): pastilla *liquid glass* con la **campana** (badge de no leídos) + **hamburguesa animada** (`components/site/AnimatedBurger.tsx`, extraída del navbar y compartida con él). Al abrir despliega: Personalizar tarjeta · Compartir · Ver mi planilla completa. Cierra con tap fuera o Escape. El vidrio va en **claro** (`rgba(255,255,255,.62)` + blur/saturate, tinta verde), no en negro como el navbar del sitio: aquí flota sobre el fondo crema y sobre la tarjeta, donde el negro se ve gris y baja el contraste. Los botones "Personalizar"/compartir bajo la tarjeta se eliminaron; "Ver mi planilla" sigue además dentro de la tarjeta |
| `SelectorPortada` + `HojaClub` | `components/site/club/` | `SelectorPortada` = hoja "Elige tu coleccionable" (solo lo suyo que no esté ya en la portada). `HojaClub` = el bottom sheet compartido (velo + panel, sube desde abajo en mobile / fade+escala en `sm+`, cierre animado con `SALIDA_MS` y Escape). Las clases `club-hoja*`/`club-velo*`/`club-marco-holo` viven en `globals.css` |
| **Portada de la tarjeta** | `estilo.portada` (jsonb) | Ids de los 6 coleccionables que el miembro puso en los óvalos. Vacío = todavía no elige y la tarjeta se rellena sola (premios primero); la primera edición materializa esa selección. Se pone/quita desde la ficha ("Poner/Quitar de mi portada", con aviso si ya hay 6) o desde el `+`. ⚠️ El admin **sanea el estilo con whitelist**: `portada` se agregó a `saneaEstilo` en `papela-admin/app/api/public/club/[token]/route.ts` — **requiere deploy del admin**. Mientras tanto (y como respaldo) el site la guarda en `localStorage` (`papela_club_portada_<token>`); cuando el server la devuelve, manda el server |
| `FichaSticker` | `components/site/club/FichaSticker.tsx` | **Ficha de un coleccionable** (bottom sheet) compartida por la tarjeta y la planilla: historia, **copiar sticker** (botón circular colgado en la esquina inferior derecha del recuadro del sticker, que lleva `p-5` para que el botón no tape el dibujo; ✓ al copiar y mensajes de respaldo debajo), premio (`🎁 Ganaste un premio` — descargable o físico; bloque **alineado a la izquierda** con vista previa: usa `premio.imagen` o, si el imprimible ES una imagen (`premio.url` termina en png/jpg/webp/…), el archivo mismo — un PDF se queda sin miniatura) y regalo de repetidos (código 72h + WhatsApp). Sin `mio` renderiza la versión misteriosa (`Silueta`). En la tarjeta, los stickers del preview son botones que la abren |
| `PlanillaClub` | `components/site/club/PlanillaClub.tsx` | Planilla SIMPLE (mockup jul-2026): logo Papela + flecha atrás + "Mi planilla Papela" + X/100 y la cuadrícula. Obtenidos a color con ×N (sin etiqueta "Común"; raros/legendarios con **marco holográfico animado** `.club-marco-holo`); no obtenidos = **SILUETA** (componente `Silueta`: la imagen real con `brightness(0)` a baja opacidad — misterio; si el asset 404ea se esconde vía onError + chequeo naturalWidth y queda solo el N.º); sin definir = "?". **Tap en cualquier definido → ficha** (bottom sheet): historia + **"Copiar sticker"** (`copiarImagen` en clubTipos: ClipboardItem con Promise —Safari—, conversión a PNG por canvas, respaldos descarga → abrir pestaña; requiere el header CORS de `/images/colleccionables` en el next.config del admin) + premio descargable (solo dueños, vía `stickers.detalles` del GET por token) + **Regalar** repetidos (código 72h, WhatsApp); versión misteriosa (silueta grande) para no obtenidos. Canje de código de regalo como link discreto al pie |
| **Dopamina** | `components/site/dopamina/` + `lib/dopamina/` | Juego del Club Creativo (`/club-creativo/dopamina`, **standalone** en `ConditionalShell` — sin navbar/footer, botón "← Salir" propio). Diseño Figma jul-2026: lienzo redondeado a pantalla completa cuyo **fondo cambia de color por ronda** (morado `#483699` → azul `#3E6D94` → rosa `#9E5A5A`; crossfade de capas sólidas por opacity — nunca animar background-color por frame) y termina en verde para cronómetro/cierre. En la pantalla del reto el fondo **deriva en bucle** por 5 colores de marca (`COLORES_RETO`, un paso cada 4.2 s con fundido de 2.2 s; se apaga con `prefers-reduced-motion`) — el `backgroundColor` de la `section` sigue al color activo para que a media transición no se asome un tercer color. 3 rondas de **burbujas de vidrio líquido** dispersas por todo el lienzo (9 posiciones % en `CampoBurbujas`, escala móvil vía `--burbuja-escala` en `.dopa-canvas`): vidrio = gradientes + sombras (**NUNCA backdrop-filter** — carísimo en móvil) con la **palabra borrosa dentro** (`filter: blur(5px)` estático); al tocar explota (onda + partículas, componente `Estallido`) y la palabra queda en su lugar + llena su **slot punteado** bajo el título. Movimiento: dos envoltorios anidados porque cada animación necesita su propio `transform` — `.dopa-deriva` (translateX, 11–19 s) por fuera y `.dopa-flota` (translateY + jiggle de membrana, 4.5–6 s) por dentro; ciclos desacoplados = camino que casi no se repite. El botón conserva su transform libre para el hover/tap de framer. Cada 5.5–12 s una pompa **revienta sola** (`Estallido suave`, sin revelar nada) y al segundo brota otra en su lugar con el mismo contenido — como el texto va borroso nadie nota que es la misma, y no se pierde ninguna opción; logo Papela grande al centro. Reto y elección de tiempo **fusionados** en una pantalla (rosa); la frase del reto va **sin caja**, con el tratamiento de los heroes del sitio (`font-serif italic` cremita, `leading-[1.05]`, `clamp(2rem,4.8vw,3.75rem)` — por debajo del clamp de los heroes porque es una oración larga, no un título); cuenta 3·2·1 + cronómetro de aro delgado (timestamp de fin, no ticks); final "Reto completado" (**sin galería ni subida de fotos** — se eliminaron jul-2026). Frase "Dibuja {objeto} {acción} {cierre}." con **bancos de ~200+ por categoría** en `lib/dopamina/bancos.ts` (OBJETOS incluye 90 **personajes famosos** — Disney/Pixar, música, cine y futbol — como nombres propios sin artículo), validados por `scripts/verifica-bancos.ts` (conteos, duplicados, palabras repetidas ENTRE bancos y el verbo "dibuj-") — **correr el verificador tras editar los bancos**. Memoria anti-repetición: lo revelado va a localStorage (`papela_dopa_recientes`, últimas 45) y se excluye del reparto siguiente. El juego arranca directo en burbujas (sin bienvenida); "¿Cómo se juega?" vive en la landing como **modal** (`SeccionDopamina`, portal a body — los ScrollReveal con transform atrapan a los `fixed`). Accesibilidad: aria-live para revelaciones/fases, burbujas `<button>` con aria-label, `MotionConfig reducedMotion="user"`. Analítica: eventos `dopa_*` al dataLayer de GTM (`lib/dopamina/analitica.ts`). ⚠️ La tabla `laboratorio_creaciones` + bucket `laboratorio` siguen en Supabase (migración 20260728) pero YA NADIE los usa — quedaron por si vuelve la galería. ⚠️ NO usar Supabase Auth para usuarios públicos: el RLS del admin trata `authenticated` como admin |
| `RascaSticker` | `components/site/club/RascaSticker.tsx` | Overlay de **rascado** de sticker sorpresa: al abrir hace POST `/revelar` (el sticker YA fue sorteado server-side al otorgarse — el dedo solo destapa) y pinta canvas rascable (destination-out, umbral geométrico de celdas 10×10 ≥62%). "Rascar después" no pierde nada (ya es del miembro). Tipos/consts compartidos en `components/site/club/clubTipos.ts` |

## Mobile horizontal scroll pattern
Used in info cards and Instagram carousels. Key rules:
- Container: `flex gap-4 overflow-x-auto snap-x snap-mandatory` with `style={{ scrollbarWidth: "none", scrollPaddingLeft: "20px" }}`
- First and last child: `<div className="flex-shrink-0 w-5" aria-hidden="true" />` (spacer, NOT padding — padding on overflow containers is clipped by browsers)
- Cards: `snap-start flex-shrink-0` with `width: "72vw"`
- The **section wrapper must NOT have `px-5`** — padding clips the horizontal overflow. Put padding only on the text content above the scroller.

## Supabase
- URL: `https://qrrqptkcgezposfmkvqy.supabase.co`
- Client: `lib/supabase/client.ts` (browser, anon), `lib/supabase/server.ts` (RSC, anon), `lib/supabase/admin.ts` (`createAdminClient`, **service role** — solo server: webhook de pagos y checkout, bypassa RLS; requiere env `SUPABASE_SERVICE_ROLE_KEY`)
- `lib/productos.ts` — `getProductos(categoria?)`, `getProductoById(id)` — direct Supabase queries

### productos table columns
`id, nombre, categoria, precio, stock, descripcion, imagen_url, created_at, color, medida, tags`
- `tags` is a `text[]` array — used for coleccion filtering (e.g. `["libretas"]`, `["favoritos"]`)
- Filter in-stock: `.gt("stock", 0)`
- No `slug` column — use `id` for URLs
- `categoria = "Tienda"` for products shown on the public site
- **Variaciones**: viven en la columna `atributos` (jsonb) → `atributos.variaciones[]`. NO hay tabla aparte. `productos.stock` = suma de los stocks de variaciones; `imagen_url` = imagen de la variación portada. El admin lee stock con `stockEfectivo()` = suma de variaciones (ignora `productos.stock` cuando hay variaciones)

## Admin API (productos públicos)
The homepage carousels do NOT query Supabase directly — they consume the admin's public API:

```
GET https://admin.papela-atelier.com/api/public/productos?coleccion=libretas
GET https://admin.papela-atelier.com/api/public/productos?coleccion=favoritos
```

- Implemented in `lib/productos-publicos.ts` → `getProductosPorColeccion(coleccion)` y `getProductosPublicos()` (todos los públicos, sin filtrar por colección — usado por `/productos`)
- Returns `{ productos: ProductoPublico[] }` — `Producto` + `tags?: string[]` (la API NO expone `categoria`). Cada producto trae `variaciones[]` (`{id, nombre, precio, stock, imagen_url, color, tamano, ...}`) + `precio_min/max`. `lib/productos-publicos.ts` normaliza y **filtra: solo variaciones con stock ≥ 1 y solo productos disponibles** (regla "mostrar solo lo que tenga ≥1 en stock")
- Filters by `categoria = "Tienda"` (y, con `?coleccion=`, además `tags` contiene ese valor)
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
- **Checkout API**: `app/api/tienda/checkout/route.ts` — usa `createAdminClient()` (service role). Valida stock **agregado por producto Y por variación**, inserta en `tienda_pedidos` (verifica error), crea Preference MP
- **Webhook**: `app/api/webhooks/mercadopago/route.ts` — usa `createAdminClient()` (service role). Valida firma HMAC, distingue por `external_reference` prefix (`tienda:`, `taller:`, clase sin prefix). Si la línea trae `variacionId` descuenta esa variación vía RPC `decrementar_stock_variacion(p_id, p_variacion_id, p_cant)` (actualiza `atributos.variaciones` y re-sincroniza `productos.stock`); si no, `decrementar_stock_producto`
- **RLS crítico**: `tienda_pedidos` es "service only" (`qual=false`) y `productos` solo deja escribir a authenticated → el webhook/checkout DEBEN usar el cliente service role (con la anon key fallan en silencio). RPC en `papela-admin/supabase/migrations/20260629_decrementar_stock_variacion.sql`
- **`tienda_pedidos` columns**: `id, external_reference, items (jsonb), tipo_envio, estado, payment_id, monto_total, comprador_nombre, comprador_email, comprador_telefono, direccion_envio (jsonb), created_at`. `items[]` ahora incluye `variacionId` y `variacionNombre`
- **Envío**: $80 MXN fijo (`COSTO_ENVIO` en cartStore). Opciones: `recoger` | `envio`
- Los productos NO navegan a `/productos/[slug]` — abren `ProductDrawer` via Zustand store

## Personalización (solicitudes por encargo)
- Tabla **`personalizacion_solicitudes`**: `id, nombre, telefono, email, tipo, ocasion, mensaje, estado ('nueva'|'contactada'|'cerrada', default 'nueva'), created_at`
- Migración: `papela-admin/supabase/migrations/20260616_personalizacion_solicitudes.sql` (RLS: insert público anon, gestión solo authenticated)
- El sitio inserta vía `app/api/personalizacion/route.ts` (anon key). ⚠️ El admin **ya no tiene bandeja de solicitudes** (eliminada 2026-07-07): las filas siguen guardándose en la tabla, pero las cotizaciones de clientes se gestionan como proyectos en el admin

## Logger
`lib/logger.ts` — logger estructurado JSON para producción
- Uso: `logger.error("mensaje", { campo: valor }, error)`
- Emite: `{"level":"error","message":"...","timestamp":"...","env":"production","context":{...},"error":{"name":"...","stack":"..."}}`
- Vercel indexa estos logs automáticamente. Para conectar Sentry: agregar `Sentry.captureException(error)` dentro de `emit()` — un solo cambio cubre todos los puntos de error
- **Nunca usar `console.error` directo** — siempre `logger.error()`

## Pages built
- `/` — Homepage (hero, text carousel, info cards, nosotros, libretas carousel, favoritos carousel, instagram, footer)
- `/productos` — Catálogo: solo productos públicos del admin (`getProductosPublicos()`), agrupados en secciones por colección (tags) como el home + sección "Más productos" para los sin tag. Cards abren ProductDrawer
- `/productos/[slug]` — Product detail (existe pero cards ya no navegan aquí — usan drawer)
- `/tienda/checkout` — Form comprador + dirección + resumen pedido
- `/tienda/pago/gracias|error|pendiente` — Páginas resultado MercadoPago
- `/talleres` — Activo. Cards en **grid** (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`) con diseño de tarjeta vertical (Figma): bg `#e7d8cf`, borde `#d6bdb2`, `rounded-2xl p-[26px]`. Estructura: imagen `aspect-square` con **badge flotante del instructor** sobrepuesto (`absolute left-4 bottom-4`, bg `#f9eae3`, nombre serif italic `#664917` + `@instagram`) → pill de categoría (`label`, bg `#f3e6cf`, texto verde) → título serif italic `#664917` → fecha (`#664a18`) + hora (`#6e645f`) con divisor `border-b #dbc2b3` → descripción → fila final `Inversión` + botón verde "Apartar lugar". El diseño NO muestra `nivel` ni indicador "Activo" (siguen en la tabla, solo no se renderizan)
- `/clases` — Activo con ClaseCalendar responsive
- `/clases/[slug]` — Hero con foto maestra como fondo, calendario de horarios
- `/club-creativo` — Landing del Club Creativo (diseño Figma jul-2026): hero verde ("Un espacio para jugar, crear y coleccionar" / "Juegos, premios y muchas cosas que compartir.") + card **Dopamina** (bg `#E6D7CD`, título serif dorado `#664917`, CTA "Jugar Dopamina", link "¿Cómo se juega?" → modal 5 pasos, preview CSS morado con pompas de vidrio) + card **Tarjeta de Lealtad** (bg `#E0D2CA`, placeholder listo para foto real). Solo en el **footer** ("Aprende") — se quitó del navbar por ahora. ⚠️ `ConditionalShell` matchea por segmento exacto: `/club/<token>` es standalone pero `/club-creativo` usa el shell normal
- `/club-creativo/dopamina` — Juego inmersivo (ver componente Dopamina). Standalone (sin shell)
- `/personaliza` — Página informativa de personalización por encargo. Hero color sólido `#5E7E86` + cremita. Secciones: "Qué podemos personalizar" (6 cards numeradas, palette `#DCE6E7`/`#C2D2D4`), "Para qué ocasiones" (14 pills), sección emocional + `PersonalizacionForm`. El form (client) hace POST a `app/api/personalizacion/route.ts` → inserta en tabla `personalizacion_solicitudes` (anon key, valida server-side, honeypot anti-spam). ⚠️ El admin ya no muestra estas solicitudes (bandeja eliminada 2026-07-07); quedan guardadas en la tabla

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
