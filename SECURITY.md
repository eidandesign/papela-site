# Seguridad

Este archivo era la lista de pendientes de jun-2026 y ya no describe el sistema. El estado vigente vive en:

- `docs/AUDITORIA-2026-10-16.md` — auditoría completa y plan por fases.
- `papela-admin/docs/SEGURIDAD-2026-11-15.md` — refuerzo de nov-2026: qué se corrigió, la migración pendiente y lo que queda abierto.
- `SECURITY_CHECKLIST.md` — revisiones manuales por panel (Vercel, Supabase, MercadoPago).

Reglas que el código asume:

- Precios, nombres de variación y montos salen siempre de la base, nunca del navegador.
- `anon` (la llave pública) solo lee las columnas del catálogo que el sitio muestra; cualquier columna nueva se concede a mano en una migración del admin.
- Los módulos que leen secretos llevan `import "server-only"`.
- Toda redirección construida con parámetros compara el origen del destino con el del sitio.
- Las páginas cuya URL es una credencial (`/club/<token>`, `/cotizacion/<token>`) no cargan GTM ni Pixel.
