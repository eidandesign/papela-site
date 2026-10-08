# design-sync notes — papela-site → Claude Design ("Papela Design System")

## How this repo is synced
- papela-site is a Next.js app, not a published library. `.design-sync/build-ds.mjs`
  (cfg.buildCmd) synthesizes the "package" the converter expects in `.design-sync/pkg/`:
  - `index.ts` re-exports the components listed in `pkg/components.json` (export name → file
    in components/site). **To add/remove a synced component, edit components.json** (+ a
    category stub in `.design-sync/docs/<Name>.md` and the `docsMap` entry in config).
  - `types/` = real .d.ts via `tsc` (emitDeclarationOnly) — the props contract.
  - `papela.css` = `app/globals.css` compiled by Tailwind v4 (`@tailwindcss/postcss`), scanning
    the whole repo + `.design-sync/previews` + an `@source inline()` safelist (the vocabulary
    the conventions header teaches). **Always run build-ds BEFORE package-build** — previews
    add Tailwind classes, and CSS compiled before a preview existed lacks them.
  - PP Editorial .otf files are copied into `pkg/fonts/` (the converter only copies fonts that
    live inside the package dir) and the @font-face urls rewritten to `./fonts/`.
- Shims (pkg/tsconfig.json `paths`, honored by the converter's tsconfig-paths plugin):
  `next/image` → plain `<img>` (honors `fill`), `next/link` → `<a>`, `next/navigation` →
  `usePathname`/`useRouter`/`useSearchParams` stand-ins. `@/*` → repo root.
- Satoshi comes from Fontshare via the `@import url(...)` that globals.css already has
  (`runtimeFontPrefixes: ["Satoshi"]`).
- Component groups come from frontmatter-only stubs in `.design-sync/docs/` via `docsMap`.
- **Root-path public/ assets** (`/site/logo-ring.svg` = AnimatedLogo's CSS mask ring, `/images/...` =
  Footer club banner, TalleresGallery photo pool) don't exist next to the bundle. build-ds bundles a
  COPY of components/site (`pkg/src/`, gitignored) with `"/site/|/images/|/icons/|/videos/|/logo/` root
  paths rewritten to `https://www.papela-atelier.com/...` (production serves public/ with CORS `*`).
  Types/JSDoc still come from the originals. ⇒ Designs depend on the live site for those images.
- Bundle also exports the Zustand stores (`useCartStore`, `useProductDrawerStore`, `cartKey`,
  `COSTO_ENVIO`) and a curated Heroicons set (`ICONS` in build-ds; excluded from the component list
  via `componentSrcMap: null`). Adding an icon = add to ICONS + a `null` entry in config.

## Environment
- No playwright browser cache on this Mac: `playwright` (lib only) is installed in `.ds-sync/`
  and pointed at the system Chrome: `export DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`
  before package-validate / package-capture.

## Capture gotchas
- package-capture freezes the clock (`page.clock.setFixedTime`). GSAP caches `Date.now` and
  `matchMedia` at bundle load, so GSAP entrance animations (HeroSection's SplitText title,
  badge, paragraph) never leave frame 0 → the review sheet shows the hero colour block with
  no text. This is a harness artifact; in a live browser / Claude Design it renders fully.
  HeroSection was graded from a live-clock headless Chrome screenshot (no setFixedTime,
  4 s wait). A `matchMedia` reduced-motion override from the preview does NOT help (GSAP
  captured matchMedia before the preview script ran) — don't retry it.
- The Claude desktop Browser pane also pauses rAF — not usable for animation screenshots.
- Preview card body has 24px padding; HeroSection is `98vw` wide, so its preview wraps it in a
  `margin: -24px` frame and the card is `cardMode: single` at 1280x760.

- **framer-motion opacity entrances freeze at 0 too** (SiteNavbar header/pill, ScrollReveal,
  FaqSection heading via ScrollReveal, drawer/HojaInferior backdrops, OcasionesPills desktop pop-in via
  GSAP). Those cells were graded from `.design-sync/live-shot.mjs <url> <out.png> [w h waitMs]`
  (live clock, no `page.clock`; serve ds-bundle first with `.ds-sync/storybook/http-serve.mjs`). Panels that tween x/y DO land.
- package-capture's `settle()` awaits `img.decode()` with no timeout — a 404 image hangs capture
  forever — both on a 404 image AND on a `loading="lazy"` image outside the viewport (never loads).
  The next/image shim is therefore always `loading="eager"`. If capture hangs, look for a dead or
  lazy offscreen image (TalleresGallery, alphabetically after SiteNavbar, was the one).
- Capture viewport is 900px (≥ md): `md:hidden` content is invisible. CategoriasStack and the
  OcasionesPills Mobile story render inside a 390px `<iframe>` via `createPortal` with the page's
  styles cloned in. CategoriasStack's preview reports reduced motion (its documented CSS-sticky
  fallback) because ScrollTrigger watches the top window, not the iframe.

## Preview conventions
- Shared real catalog data lives in `.design-sync/previews/_fixtures.ts` (products from the
  admin public API, Supabase-storage image URLs — public, absolute, load anywhere).
- Select: the DS gives `disabled` no visual treatment, so no Disabled story.
- Store-driven stories reset `useCartStore.setState({...})` at render — `papela-cart` persists in
  localStorage across story loads. Drawers open in a useEffect via the real APIs
  (`openCart()`, `useProductDrawerStore.getState().open(p)`).
- PersonalizacionForm success state: fill honeypot `input[name="website"]` + `form.requestSubmit()`
  (no network). Column cells clip ~700px — keep stacked stories short.
- `w-[130px]` (non-md) isn't in the CSS; AnimatedLogo preview sizes via a wrapper div.
- Not covered (deliberately): navbar light-page (`onLight`) state — pathname shim reads the real URL;
  navbar with cart badge (localStorage leak across stories); mobile menu (card is 1280 wide).
  The shim could honor a `?pathname=` param if a light-page story is wanted later.
- ProductDrawer card is single at 900x1150 (square image eats a 760px viewport).

## Re-sync (one command after the first sync)
```
node .design-sync/build-ds.mjs        # ALWAYS first (CSS + types + asset-rewritten copy)
# fetch _ds_sync.json from the project → .design-sync/.cache/remote-sync.json, then:
export DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```
On a fresh clone: re-stage `.ds-sync/` (cp from the skill), `cd .ds-sync && npm i esbuild ts-morph @types/react playwright`,
(`.design-sync/live-shot.mjs` imports playwright from `.ds-sync/node_modules`).

## Re-sync risks (what can silently go stale)
- **Production dependency:** logo ring, footer banner and TalleresGallery photos load from
  www.papela-atelier.com at runtime. Renaming/removing files in public/ breaks them in Claude Design
  too. Fixture images (`_fixtures.ts`) are Supabase product photos + production /images — a deleted
  product image empties those preview cards.
- **Fixture data is a snapshot** (oct-2026 catalog, Celia's actividades, personaliza categorías).
  Prices/products in previews won't follow the admin.
- **Safelist vocabulary** in build-ds (`@source inline`) is what conventions.md promises the design
  agent. Editing one without the other breaks styling silently — re-run the conventions validation
  (grep each class in ds-bundle/_ds_bundle.css).
- **Animated components were graded from live-clock shots**, not capture sheets: HeroSection,
  SiteNavbar, ScrollReveal, FaqSection, OcasionesPills (desktop), TalleresGallery, plus drawer/
  HojaInferior backdrops. A carried-forward grade on these was never visible in a capture sheet.
- **Shims** (next/image eager <img>, next/link <a>, next/navigation) approximate Next.js; a
  component that starts using another next/* module (next/script, next/dynamic, server actions)
  will fail to bundle — add a shim in pkg/shims + pkg/tsconfig.json paths.
- **Stores/icons export lists** live in build-ds (STORES, ICONS); conventions.md enumerates them.
- Toolchain at first sync: node 24.10, tailwindcss 4.3.1, next 16.2.7, react 19.2.4, design-sync 2.1.293.
