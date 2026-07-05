import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente anónimo SIN cookies para consultas públicas desde Server Components.
// A diferencia de lib/supabase/server.ts (que llama a cookies() y fuerza render
// dinámico en cada request), este cliente permite que las páginas que lo usan
// se prerendericen y cacheen con ISR (`export const revalidate`).
// Solo para lecturas públicas con la anon key — nunca para sesiones ni escrituras.
let client: SupabaseClient | null = null;

export function createPublicClient(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
