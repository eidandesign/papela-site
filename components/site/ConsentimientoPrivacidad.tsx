"use client";

import Link from "next/link";

/**
 * Bloque de privacidad para todo formulario que pide datos personales
 * (auditoría 2026-10-16, Fase 1 #9 — LFPDPPP art. 8 y 16): enlace al aviso
 * de privacidad + texto corto de aceptación + casilla para NEGARSE a recibir
 * promociones (finalidad secundaria; si no la marca, se entiende que acepta).
 *
 * Controlado: el padre guarda `sinPromociones` y lo manda al servidor.
 * `name` deja la casilla disponible en FormData para formularios no
 * controlados (PersonalizacionForm).
 */
export default function ConsentimientoPrivacidad({
  accion = "enviar",
  sinPromociones,
  onChange,
  name = "sinPromociones",
  tono = "claro",
  className = "",
}: {
  // Verbo del botón: "enviar", "pagar", "reservar"…
  accion?: string;
  sinPromociones?: boolean;
  onChange?: (valor: boolean) => void;
  name?: string;
  // "claro" = sobre fondo claro (texto muted) · "oscuro" = sobre fondo verde.
  tono?: "claro" | "oscuro";
  className?: string;
}) {
  const texto = tono === "oscuro" ? "text-[var(--color-cremita)]/90" : "text-[var(--color-muted)]";
  const link = tono === "oscuro" ? "text-[var(--color-cremita)]" : "text-[var(--color-verde)]";
  const id = `consent-${name}`;

  return (
    <div className={`flex flex-col gap-2.5 font-sans text-[13px] leading-snug ${texto} ${className}`}>
      <p>
        Al {accion} aceptas nuestro{" "}
        <Link href="/privacidad" target="_blank" rel="noopener" className={`${link} underline underline-offset-2`}>
          Aviso de privacidad
        </Link>
        . Usamos tus datos solo para atender tu solicitud.
      </p>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5">
        <input
          id={id}
          name={name}
          type="checkbox"
          value="1"
          checked={sinPromociones}
          onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-verde)]"
        />
        <span>No quiero recibir promociones ni novedades de Papela.</span>
      </label>
    </div>
  );
}
