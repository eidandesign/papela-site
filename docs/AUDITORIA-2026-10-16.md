# Auditoría de seguridad, costos, accesibilidad y cumplimiento — Papela Atelier

**Fecha:** 2026-10-16 · **Alcance:** `papela-site` (www.papela-atelier.com) + `papela-admin` (admin.papela-atelier.com) + proyecto Supabase "Papela" (`qrrqptkcgezposfmkvqy`) + proyectos Vercel `papela-site` / `papela-admin` (team `noflagbrand`).
**Modo:** solo lectura. No se aplicó ninguna migración ni cambio en producción. Los secretos se citan solo por sus últimos 4 caracteres.
**Cómo se verificó:** código de ambos repos, SQL en vivo contra la BD (`pg_policies`, `pg_proc`, `pg_constraint`, advisors), simulación con la anon key pública contra la REST API y Storage, API de Vercel (proyectos, env vars, firewall, errores de runtime), `npm audit`, `curl` de headers/caché en producción, axe-core + Lighthouse sobre 12 páginas.

> Aviso legal: la parte de privacidad es una revisión técnica. La validación final del aviso de privacidad, términos y consentimiento la debe hacer un abogado especializado en datos personales en México (la LFPDPPP se reformó en marzo de 2025 y la autoridad ya no es el INAI).

---

## 1. Resumen ejecutivo — los 5 riesgos más graves

| # | Riesgo | Impacto | Severidad |
|---|---|---|---|
| 1 | **Cualquier cuenta `authenticated` es administrador en la base de datos.** Las policies RLS de clientes, cotizaciones, ventas, cortes, pagos, tareas, mini-sites, stickers y buckets dan `for all` a todo usuario con sesión, sin mirar `profiles.rol`. Las cuentas que el admin crea para empleados del Checador son usuarios normales de Supabase Auth → con su sesión y la publishable key (ambas en el navegador) pueden leer y borrar los datos de los 93 clientes, cotizaciones y ventas directo contra PostgREST, saltándose `requireAdmin`. | Datos de clientes, dinero (borrar ventas/cortes, regalarse premios del Club), legal | **CRÍTICO** |
| 2 | **El webhook de MercadoPago no es idempotente en clases ni talleres.** MP reintenta notificaciones; cada reintento vuelve a descontar cupo (y en clases inserta otra reserva). Cuando no hay cupo responde 409 y MP reintenta durante días: el alumno pagó y no tiene reserva. Tampoco se comparan montos ni se manejan reembolsos/contracargos. | Dinero (sobreventa fantasma, cupos perdidos, cobros sin reserva), operación | **CRÍTICO** |
| 3 | **Next.js con vulnerabilidades críticas publicadas** (`next@16.2.7` sitio, `16.3.4` admin; fix 16.4.2): RCE en `next/og` (el sitio usa `ImageResponse` en rutas públicas `opengraph-image` del Club y cotizaciones), bypass de middleware/proxy (admin), SSRF en optimización de imágenes, DoS. Más `sharp`, `postcss`. | Toma de control del servidor, fuga de datos | **CRÍTICO** |
| 4 | **Infraestructura sin red de seguridad:** Supabase en plan **Free** (sin respaldos diarios ni PITR para datos de clientes y pagos), Vercel aparentemente en **Hobby** (sin Firewall con reglas, sin rate limiting, sin Spend Management; su ToS prohíbe uso comercial), y el rate limiting del código vive en memoria por instancia: en prueba real 135/135 peticiones pasaron sin un solo 429. | Pérdida de datos, costos de tráfico/abuso, cuenta suspendida por ToS | **ALTO** |
| 5 | **Cumplimiento y accesibilidad:** ningún formulario enlaza el aviso de privacidad ni ofrece negarse a finalidades secundarias (LFPDPPP art. 17); 109 botones "+" del catálogo sin nombre accesible; heroes de color con contraste 2.5–3.4:1; drawers y menú sin semántica de diálogo. | Legal (multas), exclusión de usuarios, reputación | **ALTO** |

**Hallazgo tranquilizador:** en ninguno de los dos repos ni en la base de datos existe integración server-side de WhatsApp Business API, crons, pg_cron, Edge Functions ni triggers que hagan HTTP. Todo WhatsApp son links `wa.me` (gratis). Los "recordatorios automáticos lunes y un día antes" **no existen en código**: si hoy se envían, es desde una herramienta externa (Meta Business Suite, Zapier, teléfono) que esta auditoría no puede ver. No hay forma de que el sistema actual dispare mensajes en bucle ni genere costo de mensajería.

---

## 2. Tabla de hallazgos

Severidad: 🔴 CRÍTICO · 🟠 ALTO · 🟡 MEDIO · 🔵 BAJO. Repo: S = papela-site, A = papela-admin, DB = Supabase, V = Vercel.

### 2.1 Supabase (base compartida)

| Sev | Repo | Archivo / objeto | Hallazgo | Solución propuesta |
|---|---|---|---|---|
| 🔴 | DB / A | `shared_access_rls.sql:23-51`, `20260901_mini_sites.sql:131-137`, `20260711_club_stickers_coleccionables.sql:50-56` (policies en producción confirmadas) | Policies `for all using (auth.role()='authenticated')` en `ventas, cortes, productos, pagos_pendientes, clientes, tareas, cotizaciones, talleres, mini_sites, mini_site_blocks, club_stickers, club_sticker_drops, club_mensajes, talleres_inscripciones, clases_reservas, personalizacion_solicitudes`; storage `delete/update` a `authenticated` en los 4 buckets. El rol admin/staff solo existe en los route handlers. | Crear `public.is_admin()` (igual que `club_es_admin()`) y usarlo en RLS: `delete` solo admin en todas; `cortes` select solo admin (o solo hoy); escritura de `club_stickers`, `club_sticker_drops`, `club_mensajes`, `precios_config` solo admin o sin policy (route handler + service role); storage delete/update solo admin. A mediano plazo: quitar policies `authenticated` y que todo pase por `/api/*` con service role (el panel ya consume solo `/api/*`). |
| 🔴 | A | `app/api/checador/empleados/cuenta/route.ts:67-72` | Crea cuentas reales de Supabase Auth para empleados del Checador; el trigger `handle_new_user` las vuelve `staff` → heredan el acceso total anterior. | Rol `checador` en `profiles` con policies mínimas (solo `empleados`/`asistencias`), o checador por PIN con service role sin sesión de Supabase. |
| 🟡 | DB | Policy `anon: insertar reserva con horario válido` en `clases_reservas` (en producción; la migración `20260703_cerrar_reservas_anon.sql` borró otra con nombre distinto) | Cualquiera con la anon key puede insertar reservas ilimitadas con nombre/teléfono/email falsos. El sitio no la usa (solo el webhook con service role inserta). | `drop policy "anon: insertar reserva con horario válido" on public.clases_reservas;` y guardar la migración en el repo. |
| 🟡 | DB | Policy `public_insert_personalizacion` with_check `true` | Insert anon sin límite real (el rate limit del sitio es en memoria, ver V-2). | Rate limit compartido (Upstash) o mover el insert a service role tras validación; purga de filas > 90 días. |
| 🟡 | DB | Advisor `authenticated_security_definer_function_executable` (9 fn) | `confirmar_venta_club`, `siguiente_cotizacion_folio` son SECURITY DEFINER ejecutables por cualquier `authenticated` sin chequeo de rol (las `club_saldo_*` sí verifican `club_es_admin()`). | Aceptable para staff de caja; documentarlo. Revocar `EXECUTE` a `authenticated` en las que solo use el admin vía service role. |
| 🔵 | DB | `decrementar_stock_producto`, `decrementar_stock_variacion` | Ejecutables por `anon` (SECURITY INVOKER; RLS bloquea el update, devuelve `true` igual). | `revoke execute … from public, anon;` |
| 🔵 | DB | Advisor `function_search_path_mutable` | `productos_generar_slug`, `slugify_texto` sin `search_path` fijo. | `alter function … set search_path = public;` |
| 🔵 | DB | Grants por defecto | `anon` y `authenticated` tienen `TRUNCATE, REFERENCES, TRIGGER` a nivel tabla en todo `public` (RLS no cubre TRUNCATE; PostgREST no lo expone, riesgo teórico). | `revoke truncate, references, trigger on all tables in schema public from anon, authenticated;` + `alter default privileges`. |
| 🔵 | DB | Bucket `laboratorio` + tabla `laboratorio_creaciones` | Público, sin policies, sin uso desde ago-2026. | Borrar bucket y tabla. |
| 🔵 | DB | Auth | Leaked password protection desactivada; sin MFA para el admin. | Activar en Auth → Settings; MFA (TOTP) para la cuenta admin. |
| 🔵 | DB | Performance advisors | 20 FK sin índice, 20 policies con `auth.<fn>()` sin `(select …)`, 9 policies permisivas duplicadas, 7 índices sin uso. | Migración de índices + reescribir `auth.role()` → `(select auth.role())`. |

**Simulación con la anon key pública (lo que un visitante puede hacer):** lee `productos` (stock>0), `talleres` (activos), `clases_horarios` (disponibles: precio y cupo) y columnas acotadas de `clases`; el resto de las 38 tablas devuelve 0 filas; listado de los 5 buckets vacío (archivos solo por URL directa, por diseño); `reservar_cupo_*` y `club_saldo_*` → 401. Escrituras posibles: `clases_reservas` y `personalizacion_solicitudes` (arriba). Signup público **deshabilitado** (verificado en `/auth/v1/settings`), 2 usuarios (1 admin, 1 staff). Sin pg_cron, sin Edge Functions, sin realtime. Advisors: 5 INFO (RLS sin policy: `club_operaciones, empleados_sueldos, horarios, laboratorio_creaciones, registros` — correcto, solo service role), 2 WARN search_path, 9 WARN secdef, 1 WARN leaked passwords.

**Plan Free:** no hay spend cap porque no hay cobros; al superar límites (500 MB BD — usa 20 MB; 1 GB storage — usa ≈264 MB, 2 085 imágenes de producto; 5 GB egress/mes) Supabase restringe el proyecto. Lo grave es que **no hay respaldos** (Pro incluye diarios 7 días; PITR es add-on).

### 2.2 Pagos MercadoPago

| Sev | Repo | Archivo:línea | Hallazgo | Solución |
|---|---|---|---|---|
| 🔴 | S | `app/api/webhooks/mercadopago/route.ts:163-209` | Clases: sin lookup por `payment_id`; `clases_reservas` no tiene columna ni UNIQUE por pago; cada reintento de MP llama `reservar_cupo_clase` e inserta otra reserva. Sin cupo → 409 → MP reintenta días. | Columna `payment_id text unique`; RPC transaccional `registrar_reserva_pagada(payment_id, horario, …)` con `insert … on conflict do nothing` y descuento solo si insertó; sin cupo → guardar `estado_reserva='sin_cupo'`, responder 200 y alertar para reembolso. |
| 🔴 | S | `…/mercadopago/route.ts:75-103` | Talleres: descuenta cupo (`:82`) antes del insert (`:94`); el UNIQUE de `payment_id` sí existe pero el error del insert no se revisa → reintento = cupo descontado dos veces. | Invertir orden: insert primero; `23505` → 200 y salir; si insertó → descontar. |
| 🟠 | S | `app/api/checkout/route.ts:44-72` | El cliente elige `tipoClaseId` (fija el precio) y no se cruza con `clases_horarios.tipo_clase_id`; puede pagar el tipo más barato en un horario de adultos. Igual con paquetes si omite `tipoClaseId`. | Leer `tipo_clase_id` del horario y exigir coincidencia (o la heurística de `lib/clases-matching.ts` en servidor). |
| 🟠 | S | `…/mercadopago/route.ts:64-67, 98, 155, 202` | No compara `transaction_amount` ni `currency_id` con lo esperado; sobreescribe `monto_total` con lo que diga MP. | Comparar con precio/monto del pedido; si difiere → `estado='revisar'`. |
| 🟠 | S | `…/mercadopago/route.ts:64-67` | `refunded`, `charged_back`, `cancelled` se ignoran: stock y cupo nunca se reponen. | Manejar esos estados y reponer (RPC inversa) + log de error. |
| 🟡 | S | `app/api/checkout/route.ts:28-36`, `talleres/checkout:54`, `tienda/checkout:84,107` | Nada aparta inventario al crear la preferencia; en tienda el webhook marca pagado aunque el decremento devuelva `false`. Sin validación de fecha futura ni `cupo>0` en clases. | Validar cupo/fecha; `expiration_date_to` corto (30 min) en la preferencia; `pagado_sin_stock` + alerta; proceso de reembolso (`/v1/payments/{id}/refunds`). |
| 🟡 | S | `…/mercadopago/route.ts:108-159` | Tienda: idempotencia read-then-write (dos webhooks concurrentes descuentan dos veces). | `update … set estado='procesando' where external_reference=$1 and estado='pendiente' returning *` como primer paso. |
| 🟡 | S | `app/api/checkout/route.ts` (sin `rateLimit`), `lib/rateLimit.ts` | Único checkout sin rate limit; los otros lo tienen solo en memoria. Tienda inserta una fila `tienda_pedidos` pendiente por intento antes de llamar a MP. | Rate limit compartido; purga de pedidos `pendiente` > 48 h. |
| 🟡 | S | `app/api/checkout/route.ts:16,80,86,96`; `tienda/checkout:30-36,131,177-179` | `claseNombre`, `actividad`, `fechaHora`, `variacionNombre`, `direccionEnvio` del body entran a la preferencia de MP y a jsonb sin tipo/longitud. | Validar tipos y longitudes; tomar nombres del catálogo; whitelist de llaves. |
| 🟡 | S | `…/mercadopago/route.ts:18, 31` | Comparación de firma no constant-time; solo acepta `data.id` (no `id`); no valida frescura de `ts`. | `crypto.timingSafeEqual`; `data.id ?? id`; rechazar `ts` > 5 min. |
| 🟡 | S | `lib/ga4.ts:50-65`, `app/*/pago/gracias/page.tsx` | Cada visita con `?payment_id=N` consulta a MP con el access token (sin rate limit); con un id ajeno se pasa monto + nombre del ítem al cliente (sin PII). | Rate limit; devolver al cliente solo lo mínimo. |
| 🔵 | S | checkouts y webhook | Sin `maxDuration`; timeout del SDK por defecto (5 s); 404/409 del webhook provocan reintentos inútiles. | Responder 200 + alerta en casos no recuperables. |
| 🔵 | A | `app/api/clases-reservas/route.ts:53-60, 112-122` | Cupo con read-modify-write (carrera entre cajas). | Usar la RPC atómica. |

**Bien hecho:** precios 100 % del servidor (tienda, talleres, clases con service role; envío fijo en servidor); HMAC-SHA256 con manifest correcto y fallo cerrado sin secret; re-consulta del pago a MP; `tienda_pedidos` service-only con `external_reference` UNIQUE; `talleres_inscripciones.payment_id` UNIQUE; RPC de cupo/stock atómicas con `FOR UPDATE`; `back_urls`/`notification_url` fijas a `SITE_URL`; access token solo server-side; `/pago/gracias` valida contra el pago real; logs sin PII ni tokens.

### 2.3 WhatsApp, crons y bucles

| Sev | Repo | Hallazgo | Solución |
|---|---|---|---|
| ℹ️ | S+A+DB | **No existe envío server-side de WhatsApp** (0 resultados para `graph.facebook.com`, Twilio, Cloud API, SDKs de mensajería; sin `vercel.json`, sin `app/api/cron`, sin pg_cron/pg_net/http, 0 Edge Functions). Solo links `wa.me`. | Si se conecta la Cloud API en el futuro, construir ANTES: tabla `mensajes_enviados` (idempotencia por reserva+plantilla), tope diario, interruptor `WHATSAPP_ENVIOS=off`, consentimiento con fecha/origen/texto, opt-out respetado, separación transaccional/promocional. |
| 🟡 | S+A | Consentimiento: 0 resultados para "acepto/consentimiento/opt-in/darme de baja" en checkouts, `ReservaModal`, `PersonalizacionForm`, alta de clientes. Se recaba teléfono sin checkbox ni columnas de consentimiento. | Ver 2.7 (P1/P2). Deuda a resolver antes de cualquier envío promocional. |
| 🟡 | A | `app/api/listas/extraer:121`, `mini-sites/menu/extraer:149`, `menu/imagen:29`, `menu/imagen/editar:89` | IA/imágenes (Gemini, Claude Opus `max_tokens 16000`, Freepik) autenticados pero **sin cuota**: cualquier staff o sesión robada quema créditos sin límite; hasta 6 llamadas a Gemini por request; fallback a Claude si falta `GEMINI_API_KEY`. | `rateLimit(\`ia:${user.id}\`)` + contador diario; alertas de gasto en Anthropic/Freepik. |
| ✅ 2026-10-17 | S+A | `lib/rateLimit.ts`, `lib/rate-limit.ts` | Rate limit en memoria por instancia: inefectivo en Fluid Compute (prueba: 135/135 → 200). | Hecho en Fase 1 #7: Upstash Ratelimit con fallback a memoria; faltan las variables `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` en Vercel. |
| 🔵 | A | `components/checador/RecordatorioChecador.tsx:63-83` | Polling de `/api/checador` cada 1 min en turno / 15 min fuera, en todas las páginas y pestañas del personal. Con cleanup correcto. | Subir intervalo o usar visibilidad de pestaña. |
| 🔵 | A | `app/api/public/mini-sites/track` | POST público, 120/min/IP × 50 eventos = hasta 6 000 filas/min con service role; `miniSiteId` es público → métricas infladas; sin retención. | Tope por `(site, visitor)`, dedupe de page_view por día, purga > 90 días. |
| ✅ | S+A | `useEffect`/fetch: revisados 50+ efectos; deps primitivas o `useCallback` estables; intervalos con cleanup; sin realtime ni server actions. | — |

### 2.4 Costos de hosting y abuso de tráfico (Vercel)

| Sev | Hallazgo | Solución |
|---|---|---|
| 🟠 | Plan del team: la API de facturación responde `costs_not_found` → muy probablemente **Hobby**. Hobby no tiene Spend Management, Firewall con reglas custom ni rate limiting, y su ToS prohíbe uso comercial (tienda con MercadoPago). API de firewall: `config not found` en ambos proyectos (sin reglas). | VERIFICAR plan; si es Hobby, pasar a Pro ($20/mes) y activar Spend Management con **pausa**, reglas de rate limit en `/api/*` y Bot Protection. |
| 🟡 | `lib/mini-sites.ts:159` (`cache: "no-store"`) y admin `api/public/mini-sites/[slug]/route.ts:31` (`no-store`) | Mini sites de clientes 100 % dinámicos: cada visita (y cada 404 de slug basura) = función del sitio + función del admin + query. | `next: { revalidate: 60 }` o tags + `revalidateTag` al publicar; `s-maxage=60, swr=300` en el admin. |
| 🟡 | `public/` | Admin: 13 PNG de coleccionables de 0.7–1.3 MB (28 MB) servidos cross-origin a la tarjeta del Club (> 15 MB por planilla). Sitio: JPG/PNG de 0.5–0.9 MB sin optimizar (`images.unoptimized: true`). | Convertir a WebP ≤ 200 KB y renombrar (`minimumCacheTTL` 31 días). |
| 🔵 | `next.config.ts` | `remotePatterns` solo Supabase storage (bien acotado); Cloudinary NO está (CLAUDE.md desalineado); `unoptimized: true` por la cuota de jul-2026. | Documentar; si se reactiva la optimización, acotar `qualities`/`deviceSizes`. |
| 🔵 | `/club/<token>`, `/cotizacion/<token>` | Token inexistente → HTTP 200 con `no-store` (invocación por cada slug basura, indexable). | `notFound()` cuando la API devuelve 404. |
| ✅ | ISR `revalidate=60` en 17 páginas con `HIT` real; `productos`/`talleres` del admin con `s-maxage=60, swr=300`; videos en Cloudinary; sin PDFs locales; 0 errores de runtime en 7 días en el sitio (admin: 4 refresh-token benignos). | — |

### 2.5 Admin (auth)

| Sev | Archivo:línea | Hallazgo | Solución |
|---|---|---|---|
| 🔴 | (ver 2.1) | Rol admin/staff cosmético fuera de los route handlers. | `is_admin()` en RLS. |
| 🟡 | `lib/club.ts:38-40`, `lib/cotizacion.ts:43-44` | Tokens públicos = slug adivinable + 6 hex (24 bits); folio secuencial visible en cotizaciones; el rate limit que lo "hace inviable" es en memoria. Exponen nombre, saldo, movimientos, premios / ítems y totales. | Sufijo ≥ 10 hex (40 bits), una línea en cada generador; rate limit compartido. |
| 🟡 | `app/api/public/mini-sites/track/route.ts:24` | Ver 2.3. | — |
| 🔵 | `app/auth/login/page.tsx:22` | Sin rate limit de login propio ni MFA. | Rate limit de GoTrue (verificar) + MFA admin. |
| 🔵 | `lib/club.ts:64`, `api/public/productos:62`, `talleres:37` | Fallback silencioso a la publishable key si falta el service role. | Lanzar error como `lib/supabase-admin.ts`. |
| 🔵 | `lib/club.ts:8-12`, `lib/mini-sites/api.ts:6-10` | CORS `*` con `POST/PATCH` (sin cookies; aceptable). | Restringir a `papela-atelier.com` + previews. |
| 🔵 | `next.config.ts` | CSP con `unsafe-eval` en prod; sin `Permissions-Policy`; HSTS sin `preload`. | `unsafe-eval` solo en dev; añadir `Permissions-Policy`. |
| ✅ | `proxy.ts` usa `getUser()`, 401 JSON en `/api`, excluye solo `api/public`; **todos** los route handlers revalidan sesión (`requireUser`/`requireAdmin`); ledger de saldo blindado con SECURITY DEFINER + `club_es_admin()`; `empleados_sueldos` sin policies; `me/password` valida la actual; `profiles.rol` no editable por el usuario; sin signup en código; `auth/callback` sin open redirect. | — |

### 2.6 Secretos, dependencias, headers

| Sev | Repo | Hallazgo | Solución |
|---|---|---|---|
| 🔴 | S+A | `next@16.2.7` / `16.3.4`: `npm audit --omit=dev` → 1 crítica (Next: bypass de middleware/proxy, DoS Server Actions, SSRF, cache confusion, DoS Image Optimization SVG, RCE `next/og`), 4 altas (`sharp`, `postcss`, `source-map-js`, `nanoid`). El sitio usa `ImageResponse` en `app/club/[token]/opengraph-image.tsx` y `app/cotizacion/[token]/opengraph-image.tsx` (públicas). | `npm i next@16.4.2` en ambos + `npm audit fix` (sin `--force`). |
| 🟡 | S | `lib/supabase/admin.ts`, `lib/clases-tipos.ts`, `lib/ga4.ts` (y A: `lib/supabase-admin.ts`, `lib/club.ts`) | Sin `import "server-only"`; `lib/clases-tipos.ts` ya se importa (solo `import type`) desde componentes cliente. | Añadir `import "server-only"`. |
| 🟡 | S | `next.config.ts` | Sin CSP global (solo `frame-ancestors` en `/mini-site-preview`). | Al menos `frame-ancestors`, `base-uri 'self'`, `form-action`, `object-src 'none'`. |
| 🔵 | V | Env admin `MAGNIFIC_API_KEY` tipo `encrypted` (legacy) → `securityIssues: readable-secret`. | Recrear como *Sensitive*. |
| 🔵 | V | `MERCADOPAGO_ACCESS_TOKEN` de producción también en `preview`. | Credenciales de test en preview. |
| 🔵 | S | `.claude/settings.local.json` con la publishable key, solo ignorado por gitignore global. | Añadir a `.gitignore` del repo. |
| 🔵 | S | `x-powered-by: Next.js`; HSTS del apex sin `includeSubDomains; preload`. | `poweredByHeader: false`; HSTS en Vercel → Domains. |
| 🔵 | S+A | Deps atrasadas: `mercadopago 3.1.0→3.6.1`, `supabase-js 2.108→2.118`, `@supabase/ssr 0.12.0→0.12.7`. | Actualizar. |
| ✅ | Cero secretos en código, historial de git (`git log -S` por 6 patrones) ni bundles `.next/static`; `.env*` ignorados y nunca commiteados; ninguna variable sensible con `NEXT_PUBLIC_`; service role y token MP solo en route handlers; anon keys son `sb_publishable_*`; HSTS/nosniff/Referrer/Permissions-Policy en el sitio; CSP + `frame-ancestors 'none'` + XFO DENY en el admin. | — |

### 2.7 Accesibilidad (WCAG 2.2 AA) — sitio público

Automático: Playwright + axe-core 4.11 sobre 12 páginas (`/freebies` y `/ilustrador` no existen → 404). Lighthouse home: Performance 65 (LCP 9.5 s), Accessibility 93, Best Practices 73. JSON en el scratchpad de la sesión.

| Página | Critical | Serious | Principal causa |
|---|---|---|---|
| `/` | 14 | 0 | `button-name` (QuickAddButton), `heading-order` |
| `/productos` | 95 | 0 | `button-name` ×95, `landmark-unique` |
| `/talleres` | 0 | 25 | contraste tarjetas pasadas `opacity-60` (2.1–2.9:1) y `#6e645f`/`#e7d8cf` 4.14:1 |
| `/clases` | 0 | 6 | navbar `cremita/80` sobre `#4F8674` = 2.76:1 |
| `/servicios` | 0 | 3 | blanco sobre `#25D366` 1.98:1; label cremita/70 4.32:1 |
| `/nosotros` | 0 | 2 | cremita/60 3.59:1 |
| `/personaliza` | 0 | 4 | pills `#946233`/`#f0e6d0` 4.17:1 |
| `/back-to-school` | 0 | 2 | cremita sobre `#c4846a` 2.48:1 |
| `/links` | 0 | 0 | sin `<main>` ni `<h1>` (5 moderate) |
| `/club-creativo`, `/privacidad` | 0 | 0 | solo `region` (botón WhatsApp flotante) |

| Sev | Archivo:línea | Hallazgo | Solución |
|---|---|---|---|
| 🔴 | `components/site/QuickAddButton.tsx:79-125` | 109 botones (−, N, +) sin nombre accesible en home/catálogo. | `aria-label="Agregar {nombre} al carrito"` / "Quitar uno" / "Ver carrito ({n})"; `type="button"`. |
| 🔴 | `app/satisfaccion-talleres/page.tsx:199,229-245,254` (y `satisfaccion-clases`) | Labels sin `htmlFor`, estrellas sin `aria-label`/estado, input "Otro" solo con placeholder. | `useId`+`htmlFor`, `aria-label="N de 5"` + `aria-pressed`, `fieldset/legend`. |
| 🟠 | `ProductDrawer.tsx:80-87`, `CartDrawer.tsx:63-70`, `Navbar.tsx:116-134` | Drawers y menú mobile sin `role="dialog"`/`aria-modal`, sin mover/restaurar foco, sin trap; CartDrawer y menú no cierran con Escape. | Patrón de `HojaInferior.tsx:53-67` + trap (`inert`) como hook compartido. |
| 🟠 | `app/personaliza/page.tsx:69-77`, hero `/clases` (`#4F8674`), `/back-to-school` (`#c4846a`), `Navbar.tsx:247` | Texto cremita sobre fondos claros: 2.5–3.5:1. | Oscurecer fondos (`#4A6670`, `#3E6A5B`, `#A8694F`) o tinta oscura; navbar `onLight` en esos heroes. |
| 🟠 | `ReservaModal.tsx:292`, servicios | Botón WhatsApp `#25D366` con blanco = 1.98:1. | Texto verde oscuro o verde de marca. |
| 🟠 | `Footer.tsx:75`, `HeroExperience.tsx:336`, patrón `label` del CLAUDE.md | Eyebrow `cremita/70` a 11px = 4.33:1 (no es texto grande). | Opacidad ≥ 0.85. |
| 🟠 | `TextCarousel.tsx:9-13,57-58`; `app/page.tsx:167-174`; `BackToSchoolPlane.tsx:111` | Marquee y videos autoplay sin pausa ni `prefers-reduced-motion`; texto repetido 5× para lectores. | `aria-hidden` en copias, `animation-play-state: paused` con reduced-motion/hover, botón pausa. |
| 🟡 | `ConditionalShell.tsx:41,44`; `app/links/page.tsx:100`; `app/page.tsx:97,120` | Sin skip link; `/links` sin `main`/`h1`; h3 tras h1 en home; botón WhatsApp fuera de landmarks. | Skip link, `<main id>`, `h1` sr-only, `h2`. |
| 🟡 | `lib/ui.ts:5,10`, `tienda/checkout/page.tsx:53,187`, `TallerCheckoutForm.tsx:63` | `outline-none` con solo borde 1px; placeholders `muted/60-70` 2.5–3.0:1. | `focus-visible:ring-2 … ring-offset-2`; placeholders `/80`. |
| 🟡 | Formularios (personalización, talleres, tienda) | Sin `autocomplete`/`inputMode`; errores sin `aria-invalid`/`aria-describedby`; carrito sin `aria-live`. | Añadir. |
| 🟡 | `TarjetaClub.tsx:954-962` | Charms arrastrables solo con puntero (2.5.7). | `tabIndex=0` + flechas. |
| 🔵 | `Navbar.tsx:286,402`, `ProductCarousel.tsx:49`, `CartDrawer.tsx:185-204`, `links` SVGs | `nav` sin `aria-label`, nombres de logo inconsistentes, carruseles con el mismo nombre, selector de entrega sin `aria-pressed`, SVGs sin `aria-hidden`. | — |
| ✅ | `lang="es-MX"`; alts desde la BD en productos/talleres/maestras y `alt=""` en decorativas; `ReservaModal` con `role="dialog"`+Escape+radiogroup; reduced-motion en ScrollReveal/heroes/TarjetaClub/Dopamina; `ProductCard` es `<Link>` con `focus-visible`; contraste base de marca sólido (verde/bg 7.55:1, cremita/verde 7.04:1); targets ≥ 24 px. | — |

### 2.8 Privacidad y legal (México)

| Sev | Archivo | Hallazgo | Solución |
|---|---|---|---|
| 🟠 | `PersonalizacionForm.tsx:104-203`, `TallerCheckoutForm.tsx:70-202`, `tienda/checkout/page.tsx:152-229`, `satisfaccion-*`, `ReservaModal`/`ClaseCalendar`, `club-creativo/page.tsx:80` | **Ningún formulario enlaza el aviso de privacidad** ni muestra aviso corto al recabar datos (art. 17 LFPDPPP). El único enlace está en el footer (`Footer.tsx:30`). | Bajo cada botón de envío: "Al enviar aceptas nuestro [Aviso de privacidad]" + finalidad en una línea. |
| 🟠 | `app/privacidad/page.tsx:119-134` | Sin mecanismo para negarse a finalidades secundarias (promociones) al recabar; solo "escribiéndonos". | Checkbox no marcado "Quiero recibir novedades" o nota de negativa junto a cada formulario. |
| 🟡 | `app/privacidad/page.tsx:60` | Identidad y domicilio del responsable incompletos (solo "Papela Atelier, Puebla"); el JSON-LD sí publica calle y CP. | Razón social o nombre del titular + domicilio completo. |
| 🟡 | `app/layout.tsx:175-209` | GTM, GA4 y Meta Pixel cargan sin consentimiento previo (no obligatorio en MX; el aviso sí informa). `ga_client_id` viaja en `metadata` de la preferencia de MP y al Measurement Protocol — no mencionado en el aviso. | Mencionar en el aviso; opcional Consent Mode v2 / `globalPrivacyControl`. |
| 🟡 | `app/satisfaccion-*` (Formspree, standalone) | Datos a proveedor extranjero sin enlace al aviso en la página. | Enlace al aviso. |
| 🔵 | `app/w/route.ts` | El mensaje semanal de WhatsApp (manual, externo) debe incluir cómo darse de baja. | Texto de baja en el mensaje; registro de bajas. |
| ✅ | Aviso completo en lo sustantivo (datos por flujo, finalidades, transferencias nombradas incl. internacionales, ARCO, revocación, cookies/GTM/Pixel/localStorage, menores, conservación, cambios, fecha); términos publicados; datos mínimos en todos los formularios (sin IP/UA en personalización); no se guardan datos de tarjeta; no hay envíos promocionales por email/WhatsApp en el sistema. | — |

---

## 3. VERIFICAR MANUALMENTE (no visible desde código/API)

| # | Qué | Dónde | Qué buscar |
|---|---|---|---|
| V1 | Plan y Spend Management de Vercel | vercel.com → team `noflagbrand` → Settings → Billing / Spend Management | Plan (Hobby vs Pro). Si Pro: tope mensual con **"Pause production deployment"** activado + alertas 50/80/100 %. |
| V2 | Firewall y bots | Vercel → proyecto `papela-site` y `papela-admin` → Firewall | Bot Protection ON, reglas de rate limit en `/api/checkout`, `/api/tienda/checkout`, `/api/talleres/checkout`, `/api/personalizacion`, `/api/public/*` (admin). Conocer dónde está **Attack Challenge Mode** (botón manual). |
| V3 | HSTS del apex | Vercel → Domains → `papela-atelier.com` | HSTS con includeSubDomains + preload. |
| V4 | Env var legacy | Vercel → `papela-admin` → Settings → Environment Variables → `MAGNIFIC_API_KEY` | Recrear como Sensitive. Confirmar `GEMINI_API_KEY` y `FREEPIK_API_KEY` en Production. |
| V5 | Plan y respaldos de Supabase | supabase.com → org `noflagbrand` → Billing; proyecto Papela → Database → Backups | Plan Free (confirmado por API). Pro ($25/mes) para respaldos diarios; considerar PITR. Mientras tanto: `pg_dump` semanal manual. |
| V6 | Spend cap Supabase | Org → Billing → Cost Control | En Free no aplica; en Pro dejar **Spend Cap ON**. |
| V7 | Auth | Proyecto → Authentication → Providers → Email | "Allow new users to sign up" **OFF** (confirmado por API `disable_signup=true`); Settings → "Leaked password protection" ON; MFA para la cuenta admin; rate limits de Auth por defecto. |
| V8 | Policy real de `precios_config` y `club_mensajes` | Supabase → Database → Policies | Coinciden con las migraciones (confirmado en `pg_policies`: `precios_config` select/insert/update a authenticated; `club_mensajes` all a authenticated). |
| V9 | Webhook MP | mercadopago.com.mx → Tus integraciones → app → Webhooks | URL `https://www.papela-atelier.com/api/webhooks/mercadopago`, evento `payment`, secret igual a `MERCADOPAGO_WEBHOOK_SECRET` (…6724). Revisar historial de notificaciones fallidas (409/500) → reservas pagadas sin registrar. |
| V10 | Credenciales MP | Misma app → Credenciales | Rotar el access token de producción (`APP_USR-…9939`, en `.env.local` desde jun-2026); usar credenciales de test en preview/dev. |
| V11 | WhatsApp Business | business.facebook.com → WhatsApp Manager | Si existen envíos de recordatorios desde Meta Business Suite/terceros: plantillas aprobadas, opt-in documentado, límite de conversaciones y método de pago con tope. **No hay nada en código.** |
| V12 | GA4 / Meta | GA4 Admin → Data collection; Events Manager | Retención de datos, anonimización, que el aviso coincida. |
| V13 | Mini sites de clientes | Admin → Mini Sites | Que el contrato con cada cliente cubra contenido de terceros alojado en el dominio y datos de sus visitantes (`mini_site_events`). |

---

## 4. Plan de corrección por prioridad (espera aprobación)

### Fase 0 — esta semana, sin cambios de arquitectura (≈ 1 día)
1. **Next 16.4.2 + `npm audit fix`** en ambos repos; deploy. (2.6)
2. **Migración RLS mínima**: `is_admin()`; `delete` solo admin en las 16 tablas; `cortes` select admin; escritura de `club_stickers`/`club_sticker_drops`/`club_mensajes`/`precios_config` solo admin; storage delete/update solo admin; drop de la policy anon de `clases_reservas`; revokes de `decrementar_stock_*` y TRUNCATE; `search_path` en 2 funciones; `laboratorio` fuera. (2.1) — *Probar con la cuenta staff y con una cuenta de checador antes de aplicar.*
3. **Webhook MP idempotente**: columna `payment_id unique` en `clases_reservas`; invertir orden en talleres; candado `estado='procesando'` en tienda; comparar monto; 200 + alerta en 404/409. (2.2)
4. **Checkout de clases**: validar `tipoClaseId` contra el horario; rate limit. (2.2)
5. `import "server-only"` en los 5 archivos; `.gitignore` de `.claude/settings.local.json`; `poweredByHeader: false`.
6. Decisión de planes: **Vercel Pro + Supabase Pro** (≈ $45/mes) → V1, V2, V5. Mientras: `pg_dump` manual y rotar el token de MP (V10).

### Fase 1 — 2 semanas · ✅ CÓDIGO LISTO el 2026-10-17 (commits locales en ambos repos, sin push; 3 migraciones SIN aplicar)
7. ✅ **Rate limit compartido** — `lib/rateLimit.ts` (site) y `lib/rate-limit.ts` (admin) usan `@upstash/ratelimit` + `@upstash/redis` (ventana deslizante, prefijo `papela:rl`); misma firma pero `async` (todos los routes hacen `await`). Sin `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` —o si Redis falla— cae al Map en memoria y lo avisa una vez en el log. `/api/checkout` (clases) quedó cubierto (8/5 min por IP). **Pendiente del dueño:** crear la base en Upstash (plan gratis) y poner las 2 variables en los DOS proyectos de Vercel (documentadas en `.env.example` de cada repo).
8. ✅ **Webhook MP** — `refunded`/`charged_back`/`cancelled` llaman a la RPC `webhook_revertir_pago` (repone cupo de clase/taller o stock de tienda, idempotente por estado de la fila; estados nuevos `revertida` / `reembolsado`) — **migración `20261017_webhook_reversiones.sql` SIN APLICAR**: hasta aplicarla el webhook responde 500 en esas notificaciones y MP reintenta (se aplica antes del deploy del site). Las 3 preferencias llevan `expires` + `expiration_date_to` = 30 min (`lib/mercadopago.ts`). Purga de `tienda_pedidos` pendientes > 48 h: RPC `purgar_pedidos_pendientes` + cron de Vercel `GET /api/cron/purgar-pedidos` diario 09:30 UTC (`vercel.json`), protegido con `CRON_SECRET` (**pendiente:** definir la variable en Vercel; sin ella responde 503 y no borra nada). El panel de pedidos del admin ya filtra/pinta "Reembolsado".
9. ✅ **Privacidad** — `components/site/ConsentimientoPrivacidad.tsx` (enlace al aviso + "Al enviar aceptas…" + casilla "No quiero recibir promociones") en `PersonalizacionForm`, `TallerCheckoutForm`, `/tienda/checkout`, ambas encuestas y `ReservaModal` (viaja a `/api/checkout`). La negativa se guarda en `sin_promociones` (**migración `20261017_privacidad_sin_promociones.sql` SIN APLICAR**; mientras tanto el site reintenta el insert sin la columna y deja log) — talleres/clases la mandan en `metadata.sin_promociones` de MP y el webhook la anota; las encuestas la mandan en el correo de Formspree. Aviso: razón social y domicilio con **huecos marcados `[pendiente de confirmar]`** (el dueño debe dar el dato legal), mención de la casilla, de `ga_client_id` y del Measurement Protocol; fecha 17-oct-2026.
10. ✅ **Accesibilidad** — hook `components/site/useDialogo.ts` (foco inicial/restaurado, Escape, `inert` fuera del diálogo, scroll opcional; `data-dialogo-permitir` exime a la hamburguesa) usado por `HojaInferior`, `ProductDrawer`, `CartDrawer`, `ReservaModal` y el menú mobile del Navbar (`role="dialog"`, `aria-modal`, `aria-expanded`). `QuickAddButton` con `aria-label` en −/N/+. Contraste: heroes `#5E7E86→#475F65` (/personaliza), `#4F8674→#396154` (/clases), `#C4846A→#844B34` (/talleres y CTA de /back-to-school) → ≥ 4.5:1 con cremita/85; utility `label` de cremita/70 a /85; botones de WhatsApp con `--color-whatsapp` `#0F7F5A` (5.0:1) en vez de `#25D366` (1.98:1). Encuestas: labels ligados (`htmlFor` o `role="group"` + `aria-labelledby`), chips como `radiogroup`, estrellas con `aria-label`/`aria-pressed`.
11. ✅ Tokens de Club y cotización con sufijo de **10 hex** (`randomBytes(5)`; los viejos de 6 siguen válidos). Cuota diaria de IA (`lib/ia/cuota.ts`: texto 120/usuario y 400/global, imagen 40/usuario y 120/global) en los 4 endpoints. `/club/[token]` y `/cotizacion/[token]` responden **404 real** si el token no tiene formato o el admin lo desconoce (la demo del club no pasa por el admin).
12. ✅ Mini sites: `fetchMiniSite` con `revalidate: 60` + tag `mini-site:<slug>` y `export const revalidate = 60` en `/[slug]`; el admin avisa a `POST /api/revalidate/mini-site` (`MINI_SITES_REVALIDATE_SECRET`, **pendiente:** misma variable en ambos proyectos; sin ella el cambio se ve en ≤ 60 s) al publicar/editar/renovar/sincronizar bloques/borrar. Coleccionables: 51 PNG (28 MB) → WebP ≤ 200 KB (2.7 MB) con `scripts/colleccionables-webp.mjs`; `next.config.ts` del admin reescribe `.png→.webp` hasta aplicar **`20261017_club_stickers_webp.sql` (SIN APLICAR)**, después retirar la reescritura.

**Para cerrar la Fase 1 (orden sugerido):** (1) variables en Vercel: `UPSTASH_REDIS_REST_URL/TOKEN` (site+admin), `CRON_SECRET` (site), `MINI_SITES_REVALIDATE_SECRET` (site+admin); (2) aplicar en Supabase, con OK del dueño, `20261017_webhook_reversiones.sql`, `20261017_privacidad_sin_promociones.sql` y `20261017_club_stickers_webp.sql`; (3) deploy del admin y luego del site; (4) el dueño completa razón social y domicilio en `app/privacidad/page.tsx`; (5) revisar con un abogado el texto de consentimiento.

### Fase 2 — supervisión continua (sección 10 del encargo)
13. **Topes y alertas**: Vercel Spend Management (pausa) + alertas 50/80/100 %; Supabase spend cap + alertas de uso; alertas de gasto en Anthropic/Freepik/Google AI (consolas); tope de conversaciones en WhatsApp Manager si se usa.
14. **Monitoreo de errores**: Sentry (o Vercel Observability) en sitio y admin — `lib/logger.ts` ya centraliza `emit()`, un solo cambio.
15. **Log de mensajería**: tabla `mensajes_enviados(id, canal, destinatario, plantilla, referencia, created_at)` con unique por `(referencia, plantilla)` y vista diaria + alerta por umbral. Se crea solo cuando exista un canal de envío.
16. **Script de auditoría en CI** (`scripts/auditoria.ts` + GitHub Action pre-deploy): RLS activo en todas las tablas y sin policies `using (true)` para `anon` en tablas privadas (consulta a `pg_policies` con service role en CI), `npm audit --omit=dev --audit-level=high`, grep de secretos (gitleaks), axe sobre 5 páginas del preview. Falla el deploy si hay críticos.
17. **`SECURITY_CHECKLIST.md`** en el repo (borrador ya creado junto a este informe) con las revisiones manuales por panel y periodicidad.
18. Revisión trimestral: advisors de Supabase, `npm audit`, rotación de tokens MP/service role, lectura del historial de webhooks fallidos.

---

## 5. Notas de contexto para el dueño
- La base solo tiene 2 usuarios hoy (1 admin, 1 staff) y 93 clientes; el riesgo #1 crece con cada cuenta de empleado que se cree para el Checador.
- `SECURITY.md` (jun-2026) ya está desactualizado: los 3 pendientes críticos de entonces (RLS, webhook firmado, decremento atómico) están resueltos; lo que queda es idempotencia y rol en BD. Conviene reemplazarlo por este informe + el checklist.
- Las carpetas con evidencia (JSON de axe, Lighthouse, cálculo de contraste) quedaron en el scratchpad de la sesión; no se agregaron al repo.
