import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/lib/logger";

/**
 * Rate limiter compartido entre instancias (auditoría 2026-10-16, Fase 1 #7).
 *
 * Con `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` el contador vive en
 * Upstash Redis (ventana deslizante) y lo comparten TODAS las instancias de
 * Vercel. Sin esas variables —o si Redis falla— cae al Map en memoria de
 * siempre (por instancia, suficiente contra bots simples) y lo avisa UNA vez
 * en el log. Misma firma que antes salvo que ahora es async: los routes hacen
 * `await rateLimit(...)`.
 *
 * Mismo archivo que papela-admin/lib/rate-limit.ts — si cambia uno, cambia el otro.
 */

const store = new Map<string, { hits: number; resetAt: number }>();

function prune() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

function rateLimitEnMemoria(key: string, limit: number, windowMs: number): boolean {
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

// ── Upstash ───────────────────────────────────────────────────────────────────
let redis: Redis | null | undefined; // undefined = aún no se decidió
let avisado = false;
// Un Ratelimit por combinación límite/ventana (Upstash exige el límite al construirlo).
const limiters = new Map<string, Ratelimit>();

// Limpia el valor de una variable: espacios y comillas que se cuelan al copiar
// desde el panel de Upstash (lo muestra en formato .env: KEY="valor").
function limpia(v: string | undefined): string {
  return (v ?? "").trim().replace(/^(['"])(.*)\1$/, "$2").trim();
}

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = limpia(process.env.UPSTASH_REDIS_REST_URL);
  const token = limpia(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (url && token) {
    // Una configuración inválida NUNCA debe tirar la petición: se avisa y se
    // cae al contador en memoria (ya pasó: la URL con comillas daba 500 en todo).
    try {
      redis = new Redis({ url, token });
    } catch (error) {
      redis = null;
      if (!avisado) {
        avisado = true;
        logger.error("rateLimit: configuración de Upstash inválida, usando memoria", {}, error);
      }
    }
  } else {
    redis = null;
    if (!avisado && process.env.NODE_ENV === "production") {
      avisado = true;
      logger.warn("rateLimit: sin UPSTASH_REDIS_REST_URL/TOKEN — límite por instancia (memoria)");
    }
  }
  return redis;
}

function getLimiter(r: Redis, limit: number, windowMs: number): Ratelimit {
  const k = `${limit}:${windowMs}`;
  let l = limiters.get(k);
  if (!l) {
    l = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: "papela:rl",
      // Sin analytics: cada llamada sería otro comando (cuenta en la cuota gratis).
      analytics: false,
    });
    limiters.set(k, l);
  }
  return l;
}

/**
 * true = permitido, false = limitado.
 * @param key       Única por endpoint+cliente (ej. "personalizacion:1.2.3.4")
 * @param limit     Peticiones permitidas en la ventana
 * @param windowMs  Ventana en milisegundos
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  let r: Redis | null = null;
  try {
    r = getRedis();
  } catch {
    r = null;
  }
  if (!r) return rateLimitEnMemoria(key, limit, windowMs);
  try {
    const { success } = await getLimiter(r, limit, windowMs).limit(key);
    return success;
  } catch (error) {
    // Redis caído no puede tirar el checkout: se degrada al contador local.
    if (!avisado) {
      avisado = true;
      logger.error("rateLimit: Upstash falló, usando memoria", { key: key.split(":")[0] }, error);
    }
    return rateLimitEnMemoria(key, limit, windowMs);
  }
}

/** IP real del cliente detrás del proxy de Vercel. */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
