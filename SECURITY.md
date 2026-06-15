# Seguridad — pendientes que requieren acción manual

Auditoría: 2026-06-15. Los arreglos a nivel de código ya están aplicados (ver abajo).
Lo siguiente **no se puede resolver desde el repo** y debe hacerse en Supabase / MercadoPago.

## 🔴 CRÍTICO

### 1. Verificar y forzar RLS (Row Level Security) en Supabase
El mismo `anon key` se usa en el navegador y en el servidor (no hay `service_role`). Toda la
seguridad de la BD depende de las políticas RLS, que **no están en el repo y no son auditables
desde el código**. La BD es compartida con `admin.papela-atelier.com`, así que un RLS débil
también expone el panel admin.

Auditar estado actual en el SQL editor de Supabase:
```sql
select relname, relrowsecurity from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r';

select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies where schemaname = 'public';
```

Forzar RLS + solo lectura pública para `anon` (ajustar nombres de columnas reales):
```sql
alter table public.productos        enable row level security;
alter table public.talleres         enable row level security;
alter table public.clases           enable row level security;
alter table public.clases_horarios  enable row level security;

create policy "anon read productos en stock" on public.productos
  for select to anon using (stock > 0);
create policy "anon read talleres activos" on public.talleres
  for select to anon using (activo = true);
create policy "anon read clases activas" on public.clases
  for select to anon using (activa = true);
create policy "anon read horarios disponibles" on public.clases_horarios
  for select to anon using (estado = 'disponible' and cupo_disponible > 0);
-- NO crear políticas INSERT/UPDATE/DELETE para anon.
```
Las escrituras (crear pedido, decrementar cupo) deben ir desde el servidor con `service_role`.

### 2. Webhook firmado de MercadoPago + confirmación de pago server-side
Hoy el flujo termina en una redirección a `/pago/gracias`, que cualquiera puede abrir sin pagar.
No hay endpoint que reciba la notificación IPN ni que valide la firma. Falta:
- Crear `app/api/webhooks/mercadopago/route.ts`.
- Configurar `notification_url` en la preferencia.
- Validar `x-signature` + `x-request-id` con el secreto del webhook (HMAC-SHA256).
- Consultar el `payment.id` a la API de MP y solo tras `approved` persistir el pedido.
- Tratar las páginas `/pago/*` como puramente informativas.

### 3. Persistencia de pedido + decremento atómico de stock/cupo
Ningún endpoint registra el pedido ni reduce `cupo_total`/`stock`. El mismo cupo puede venderse
ilimitadamente (race condition). Mover el decremento al webhook con una función Postgres:
```sql
create or replace function reservar_cupo_taller(p_taller uuid, p_cant int)
returns boolean language plpgsql security definer as $$
begin
  update talleres set cupo_total = cupo_total - p_cant
  where id = p_taller and cupo_total >= p_cant;
  return found;
end; $$;
```

## 🟠 ALTO / MEDIO (recomendado antes de escalar tráfico)
- **Rate limiting** en `/api/checkout` y `/api/talleres/checkout` (Vercel Firewall o `@upstash/ratelimit`).
- **Rotar el token de MercadoPago** (`APP_USR-...`) por higiene y usar credenciales de *test* en desarrollo.
- Definir `NEXT_PUBLIC_SITE_URL` en producción (el código ya usa `lib/site.ts` como fallback fijo).

## ✅ Ya arreglado en código (este commit)
- `back_urls` de pago fijadas a `SITE_URL` (antes derivaban del header `Origin` → open-redirect).
- Validación server-side de PII (nombre/email/teléfono) en checkout de talleres.
- `getProductoById` ya no usa `select("*")` (columnas explícitas).
- `getClaseBySlug` filtra `activa = true`.
- Cabeceras de seguridad (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, Permissions-Policy).
