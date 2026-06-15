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
| `SiteNavbar` | `components/site/Navbar.tsx` | Dual state: large (not scrolled) / floating glass (scrolled) |
| `TextCarousel` | `components/site/TextCarousel.tsx` | Two diagonal ribbons, bg-color, text `#403C3C` |
| `SiteFooter` | `components/site/Footer.tsx` | Big "papela atelier" display text, verde social icons |
| `BackToTop` | `components/site/BackToTop.tsx` | Client component for scroll-to-top |

## Supabase
- URL: `https://qrrqptkcgezposfmkvqy.supabase.co`
- Client: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (RSC)
- `lib/productos.ts` — `getProductos(categoria?)`, `getProductoById(id)`

### productos table columns
`id, nombre, categoria, precio, stock, descripcion, imagen_url, created_at, color, medida`
- Filter in-stock: `.gt("stock", 0)`
- No `slug` column — use `id` for URLs

## Pages built
- `/` — Homepage (hero, carousel, info cards, nosotros, libretas, favoritos, instagram, footer)
- `/productos` — Catálogo grid from Supabase
- `/productos/[slug]` — Product detail (stub)
- `/talleres` — (in progress)

## Conventions
- All pages are Server Components (`async`) with `export const revalidate = 60`
- Client components: add `"use client"` only when needed (event handlers, hooks)
- No `max-w-7xl` — use `w-[90%] mx-auto` instead
- Images always use `<Image>` from next/image with `fill` + `object-cover` inside a relative container
- Never use inline SVG for icons — use Heroicons
