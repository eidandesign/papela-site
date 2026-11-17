"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rateLimit";
import { logger } from "@/lib/logger";
import { MAESTROS_CONFIG } from "@/lib/maestros/config";
import {
  COOKIE_MAESTROS,
  accesoConfigurado,
  crearToken,
  opcionesCookie,
  passwordCorrecta,
} from "@/lib/maestros/sesion";

export type EstadoAcceso = { error: string | null };

// Mensaje genérico a propósito: no dice si la contraseña existe, si está mal
// escrita ni si el acceso está apagado.
const ERROR_GENERICO = "No pudimos validar el acceso. Revisa la contraseña o escríbenos.";

const INTENTOS = 6;
const VENTANA_MS = 15 * 60 * 1000;

export async function entrar(_prev: EstadoAcceso, formData: FormData): Promise<EstadoAcceso> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!(await rateLimit(`maestros-acceso:${ip}`, INTENTOS, VENTANA_MS))) {
    return { error: "Demasiados intentos. Espera unos minutos y vuelve a probar." };
  }

  const intento = String(formData.get("password") ?? "").slice(0, 200);
  if (!accesoConfigurado()) {
    logger.error("maestros: falta MAESTROS_PASSWORD o MAESTROS_SESSION_SECRET (≥32 caracteres)");
    return { error: ERROR_GENERICO };
  }
  if (!intento || !passwordCorrecta(intento)) return { error: ERROR_GENERICO };

  const token = crearToken();
  if (!token) return { error: ERROR_GENERICO };

  const store = await cookies();
  store.set(COOKIE_MAESTROS, token, opcionesCookie(MAESTROS_CONFIG.sesion.duracionDias * 24 * 60 * 60));
  redirect("/colabora/maestros");
}

export async function salir(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_MAESTROS, "", opcionesCookie(0));
  redirect("/colabora/maestros");
}
