import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE ROLE key — bypassa RLS. Úsalo SOLO en código de
 * servidor que necesita escribir tablas protegidas (webhook de pagos, checkout):
 * - `tienda_pedidos` tiene RLS "service only" (nadie más puede leer/escribir).
 * - decrementar stock en `productos` (RLS deja escribir solo a authenticated).
 *
 * NUNCA lo importes en un componente cliente: expondría la service role key.
 * Requiere la env `SUPABASE_SERVICE_ROLE_KEY` (no la `NEXT_PUBLIC_*`).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_URL). " +
        "Requerida para el webhook de pagos y el checkout de tienda."
    );
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
