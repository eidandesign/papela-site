// Atribución: links con UTM para campañas (bio de Instagram/TikTok, anuncios,
// mensaje semanal de WhatsApp). GA4 lee utm_source/medium/campaign/content.

export type Utm = { source: string; medium: string; campaign: string; content?: string };

/** Agrega los UTM a una URL absoluta o relativa al sitio (conserva su query y hash). */
export function conUtm(url: string, utm: Utm): string {
  const absoluta = /^https?:\/\//.test(url);
  const u = new URL(url, "https://www.papela-atelier.com");
  u.searchParams.set("utm_source", utm.source);
  u.searchParams.set("utm_medium", utm.medium);
  u.searchParams.set("utm_campaign", utm.campaign);
  if (utm.content) u.searchParams.set("utm_content", utm.content);
  return absoluta ? u.toString() : `${u.pathname}${u.search}${u.hash}`;
}
