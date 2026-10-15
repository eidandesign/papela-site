// Analítica del sitio: un solo punto para mandar eventos a GTM (dataLayer)
// y replicar los de conversión al Meta Pixel (fbq). Ambos se cargan en
// app/layout.tsx. Todo va con guardas: si GTM o el Pixel están bloqueados
// (adblock, sin consentimiento, SSR), track() no hace nada y el sitio sigue igual.
//
// En GTM una sola etiqueta "GA4 Event" con el nombre {{Event}} cubre todos:
//   activador ^(pa_|dopa_).*|^(select_item|begin_checkout|generate_lead|purchase)$

export type ItemCategory = "clase" | "taller" | "producto";

type Moneda = { value: number; currency: "MXN" };

/** Eventos del sitio y sus parámetros (los `dopa_*` del juego van aparte, ver eventoDopa). */
export type EventosSitio = {
  pa_click_whatsapp: { ubicacion: string; item_name?: string };
  pa_click_instagram: { ubicacion: string };
  pa_click_tiktok: { ubicacion: string };
  pa_click_telefono: { ubicacion: string };
  pa_click_como_llegar: { ubicacion: string };
  select_item: { item_name: string; item_category: ItemCategory };
  begin_checkout: { item_name: string; item_category: ItemCategory } & Moneda;
  generate_lead: { tipo: "cotizacion" | "personalizacion" | "club"; item_name?: string };
  purchase: { transaction_id: string; item_name: string; item_category: ItemCategory } & Moneda;
};

export type EventoSitio = keyof EventosSitio;

/** Equivalencias con los eventos estándar del Meta Pixel. */
const PIXEL: Partial<Record<EventoSitio, string>> = {
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  generate_lead: "Lead",
  pa_click_whatsapp: "Contact",
};

type Ventana = Window & {
  dataLayer?: Record<string, unknown>[];
  fbq?: (accion: "track", evento: string, datos?: Record<string, unknown>, opciones?: { eventID?: string }) => void;
};

/** Empuja un evento crudo al dataLayer (sin réplica al Pixel). */
export function pushDataLayer(evento: string, datos?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const w = window as Ventana;
    // Mismo patrón que el snippet de GTM: si aún no carga, el push queda en
    // cola y GTM lo procesa al llegar.
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: evento, ...datos });
  } catch {
    // La analítica nunca debe romper la página.
  }
}

export function track<E extends EventoSitio>(evento: E, datos: EventosSitio[E]) {
  pushDataLayer(evento, datos as Record<string, unknown>);

  const pixel = PIXEL[evento];
  if (!pixel || typeof window === "undefined") return;
  try {
    const w = window as Ventana;
    if (typeof w.fbq !== "function") return;
    const d = datos as Record<string, unknown>;
    const params: Record<string, unknown> = {};
    if (typeof d.value === "number") params.value = d.value;
    if (d.currency) params.currency = d.currency;
    if (d.item_name) params.content_name = d.item_name;
    if (d.item_category) params.content_category = d.item_category;
    if (d.ubicacion) params.ubicacion = d.ubicacion;
    if (d.tipo) params.content_category = d.tipo;
    // eventID = transaction_id: si algún día se manda Purchase por la
    // Conversions API, Meta deduplica con este id.
    const opciones = typeof d.transaction_id === "string" ? { eventID: d.transaction_id } : undefined;
    w.fbq("track", pixel, params, opciones);
  } catch {
    // idem
  }
}
