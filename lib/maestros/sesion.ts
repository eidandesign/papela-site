import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { MAESTROS_CONFIG } from "./config";

// ─────────────────────────────────────────────────────────────────────────────
// Sesión de /colabora/maestros: contraseña compartida validada en el servidor
// y una cookie firmada (HMAC-SHA256), HttpOnly + Secure + SameSite=Lax.
//
// Variables de entorno (NUNCA en el repo ni en el frontend):
//   MAESTROS_PASSWORD        la contraseña que se comparte con los maestros
//   MAESTROS_SESSION_SECRET  llave para firmar la cookie (≥ 32 caracteres)
//
// Revocar el acceso de todos: cambiar MAESTROS_PASSWORD. La sesión guarda una
// huella de la contraseña con la que se abrió, así que al cambiarla todas las
// cookies anteriores dejan de valer al instante.
//
// Migrar a cuentas por maestro (pendiente, a propósito no se construye aún):
// `sub` hoy es "compartido"; con cuentas sería el id del maestro, y
// `sesionValida` consultaría si ese maestro sigue activo (revocación
// individual) y qué versión del contrato aceptó. El formato del token ya lleva
// `v` para poder cambiarlo sin romper las cookies vivas a medias.
// ─────────────────────────────────────────────────────────────────────────────

export const COOKIE_MAESTROS = "papela_maestros";
/** La cookie solo viaja a esta ruta (la página y su descarga del contrato). */
export const COOKIE_PATH = "/colabora/maestros";

export type SesionMaestros = {
  v: 1;
  /** "compartido" mientras el acceso sea con una sola contraseña. */
  sub: string;
  /** Emitida / vence, en segundos UNIX. */
  iat: number;
  exp: number;
  /** Huella de la contraseña vigente al iniciar sesión. */
  pf: string;
};

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function secreto(): string | null {
  const s = process.env.MAESTROS_SESSION_SECRET?.trim();
  return s && s.length >= 32 ? s : null;
}

function password(): string | null {
  const p = process.env.MAESTROS_PASSWORD;
  return p && p.trim().length > 0 ? p : null;
}

/** true si el acceso está configurado en este entorno. */
export function accesoConfigurado(): boolean {
  return secreto() !== null && password() !== null;
}

function huella(secret: string, pass: string): string {
  return createHmac("sha256", secret).update(`pf:${pass}`).digest("base64url").slice(0, 16);
}

function firmar(secret: string, cuerpo: string): string {
  return createHmac("sha256", secret).update(cuerpo).digest("base64url");
}

function igualesSeguro(a: string, b: string): boolean {
  // Se comparan los hashes (mismo largo siempre) en tiempo constante.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Compara lo escrito contra MAESTROS_PASSWORD en tiempo constante. */
export function passwordCorrecta(intento: string): boolean {
  const pass = password();
  if (!pass || !secreto()) return false;
  return igualesSeguro(intento, pass);
}

export function crearToken(ahora = Date.now()): string | null {
  const secret = secreto();
  const pass = password();
  if (!secret || !pass) return null;
  const iat = Math.floor(ahora / 1000);
  const payload: SesionMaestros = {
    v: 1,
    sub: "compartido",
    iat,
    exp: iat + MAESTROS_CONFIG.sesion.duracionDias * 24 * 60 * 60,
    pf: huella(secret, pass),
  };
  const cuerpo = b64url(JSON.stringify(payload));
  return `${cuerpo}.${firmar(secret, cuerpo)}`;
}

export function verificarToken(token: string | undefined | null, ahora = Date.now()): SesionMaestros | null {
  if (!token || token.length > 1024) return null;
  const secret = secreto();
  const pass = password();
  if (!secret || !pass) return null;

  const [cuerpo, firma, ...resto] = token.split(".");
  if (!cuerpo || !firma || resto.length > 0) return null;
  if (!igualesSeguro(firma, firmar(secret, cuerpo))) return null;

  let payload: SesionMaestros;
  try {
    payload = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (payload?.v !== 1 || typeof payload.exp !== "number" || typeof payload.sub !== "string") return null;
  if (payload.exp * 1000 <= ahora) return null; // sesión vencida
  if (payload.pf !== huella(secret, pass)) return null; // cambió la contraseña
  return payload;
}

export function opcionesCookie(maxAgeSeg: number) {
  return {
    httpOnly: true,
    // En desarrollo (http://localhost) Safari descarta las cookies Secure.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const, // Lax: el link abierto desde WhatsApp sí conserva la sesión
    path: COOKIE_PATH,
    maxAge: maxAgeSeg,
  };
}

/** Sesión vigente de la petición actual (Server Components, acciones y routes). */
export async function leerSesion(): Promise<SesionMaestros | null> {
  const store = await cookies();
  return verificarToken(store.get(COOKIE_MAESTROS)?.value);
}
