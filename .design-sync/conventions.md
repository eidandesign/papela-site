# Papela — how to build with this design system

Papela is a stationery shop and creative workshop space in Puebla, Mexico. Copy is in **Spanish (Mexico)**, warm and direct. Call the place "Papela", never "el atelier". Prices are written `$380 MXN`.

## Setup
- No provider or wrapper is needed. Components read global CSS only. Load `styles.css`: it brings in the tokens, the compiled Tailwind utilities, PP Editorial New (`fonts/`) and Satoshi (Fontshare).
- The page background is `var(--color-bg)` (#F0EFEB) and body text is `var(--color-text)` in Satoshi. `body` already sets both.
- Cart, product drawer and cart drawer state live in Zustand stores that ship in the bundle: `useCartStore` (`addItem`, `updateCantidad`, `removeItem`, `clearCart`; key items with `cartKey({ productoId, variacionId })`; `COSTO_ENVIO` = 80) and `useProductDrawerStore` (`open(producto)`, `close()`). `ProductCard` opens `ProductDrawer` and `CartButton` renders its own `CartDrawer`, so mount `<ProductDrawer />` once per page wherever ProductCards appear.

## Styling idiom: Tailwind utilities + CSS custom properties
Style your own layout with Tailwind classes. Brand colors are tokens, used either as theme utilities or as `var()` inside arbitrary values. Both compile:

| Token | Value | Theme utility | Use |
|---|---|---|---|
| `--color-verde` | #12535C | `bg-verde` `text-verde` `border-verde` | every primary CTA, headings on light |
| `--color-cremita` | rgb(243,230,207) | `text-cremita` `bg-cremita` | text on colored/dark backgrounds |
| `--color-cremita-2` / `-3` | #F0E6D0 / #F7F3EC | `bg-cremita-2` `bg-cremita-3` | image placeholders / form and summary boxes |
| `--color-terracota` | #8C482A | `text-terracota` | eyebrow labels, accents |
| `--color-text` / `--color-muted` | #403C3C / rgb(110,100,95) | `text-text` `text-muted` | body / secondary text |
| `--color-border` | rgb(232,220,200) | `border-border` | hairlines, inputs |
| `--color-bg` | #F0EFEB | `bg-bg` | page background |

Info-card fills: `#F0D9CC` (talleres), `#C9D3C0` (clases), `#CED8D9` (personaliza). Hero colors by page: verde (default), `#5E7E86` personaliza, `#C4846A` talleres, `#4F8674` clases.

Typography (only two families):
- `font-serif` = PP Editorial New. Use it for headings and display text. Section headings on light backgrounds: `font-serif font-extralight text-[#403C3C] text-[clamp(2rem,4vw,3rem)] leading-tight`. Hero titles: `font-serif italic text-cremita text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05]`. Card titles: `font-serif italic`.
- `font-sans` = Satoshi, for body text and UI. Prominent copy is `text-[18px] leading-[24px]`.
- `label` is a custom utility for eyebrows and hero pills (11px, uppercase, 0.22em tracking). Example: `className="label text-terracota"`.

Layout: content containers are `w-[90%] mx-auto` (not max-w-7xl). Sections use `py-12 md:py-16`, cards use `rounded-2xl`, and pills and buttons use `rounded-full`.

Icons: Heroicons 24/solid ship in the bundle. Available: `ArrowRightIcon` (on every CTA), `ArrowLeftIcon`, `ChevronLeftIcon`/`ChevronRightIcon`/`ChevronDownIcon`, `PlusIcon`, `MinusIcon`, `XMarkIcon`, `CheckIcon`, `CheckCircleIcon`, `SparklesIcon`, `StarIcon`, `HeartIcon`, `ShoppingBagIcon`, `MapPinIcon`, `ClockIcon`, `CalendarDaysIcon`, `ScissorsIcon`, `SwatchIcon`, `AcademicCapIcon`, `CakeIcon`, `UserGroupIcon`, `BuildingStorefrontIcon`, `PhoneIcon`, `EnvelopeIcon`. Size them with `w-4 h-4` (inline) or `w-5 h-5`. Don't hand-draw SVG icons.

Images: the site's own assets live at `https://www.papela-atelier.com/images/...` and product photos are on Supabase storage. Always use absolute URLs; root paths like `/images/x.jpg` don't resolve in a design.

## Primary CTA (there is no Button component; this is the house pattern)
```jsx
<a href="#" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[var(--color-verde)] px-7 py-3.5 text-sm font-semibold text-[var(--color-cremita)]">
  <span className="absolute inset-0 bg-black/10 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
  <span className="relative">Apartar lugar</span>
</a>
```
Outline variant: `border border-[var(--color-verde)] text-[var(--color-verde)]`, with the hover span set to `bg-[var(--color-verde)]` and `hover:text-[var(--color-cremita)]`.

## Page heroes: always use `HeroSection`
`HeroSection` is the rounded colored hero (98vw wide, `min-h-[80vh]`). Pass `bgColor`, and lay out the children exactly like this (the top padding leaves room for the navbar):
```jsx
<HeroSection bgColor="#5E7E86">
  <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-20 pt-[140px] md:pt-[180px] pb-16 md:pb-20">
    <span data-hero-badge className="inline-flex items-center border border-[var(--color-cremita)]/40 rounded-full px-5 py-2 mb-8">
      <span className="label text-[var(--color-cremita)]/70">Hecho a la medida</span>
    </span>
    <h1 className="font-serif italic text-[clamp(2.5rem,5.5vw,5rem)] leading-[1.05] text-[var(--color-cremita)] max-w-2xl mb-6">Creamos piezas únicas para cada ocasión</h1>
    <p className="font-sans text-[var(--color-cremita)]/90 text-[18px] leading-[24px] max-w-lg">…</p>
  </div>
</HeroSection>
```
The hero animates its `h1`, its first `p` and `[data-hero-badge]` on load. For a compact hero, use `className="!min-h-0" showRibbon={false} showInk={false}`.

A typical page is `SiteNavbar` → `HeroSection` → sections on `--color-bg` (`ProductCarousel`, info cards, `FaqSection`…) → `SiteFooter`.

## Where the truth lives
Read `styles.css` and `_ds_bundle.css` (the token block is at the top under `:root`) before inventing styles. Each component's props are in `components/<group>/<Name>/<Name>.d.ts` and its usage examples in `<Name>.prompt.md`. Product data follows the `Producto` shape in `ProductCard.d.ts` (`id, nombre, precio, stock, imagen_url, variaciones?`).
