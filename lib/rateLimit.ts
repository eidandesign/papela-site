/**
 * In-process rate limiter — state persists across warm Vercel Fluid Compute
 * invocations on the same instance. Not shared across instances, but effective
 * against naive bots that hammer the same endpoint repeatedly.
 *
 * To upgrade to cross-instance rate limiting: replace the Map with
 * @upstash/ratelimit + @upstash/redis (zero API-surface change here).
 */

const store = new Map<string, { hits: number; resetAt: number }>();

function prune() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key    Unique key (e.g. "personalizacion:1.2.3.4")
 * @param limit  Max requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  prune();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { hits: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.hits >= limit) return false;
  entry.hits++;
  return true;
}

/** Extracts the real client IP from Vercel's forwarded headers. */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
