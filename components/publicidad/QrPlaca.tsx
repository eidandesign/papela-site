"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { conUtm } from "@/lib/utm";

// QR sobre placa cremita, generado en el cliente con UTM (fuente pantalla ·
// medio tienda · campaña = id del anuncio). Se renderiza al doble del tamaño
// del lienzo para que siga nítido cuando la pantalla escala a 1080×1920.
// `lado` = el QR en px del lienzo; la placa (margen, radio, texto) escala con él.

export const QR_LADO = 480;

export default function QrPlaca({
  url,
  campaign,
  texto,
  tinta,
  acento,
  lado = QR_LADO,
  revelar,
}: {
  url: string;
  campaign: string;
  texto: string;
  tinta: string;
  acento: string;
  lado?: number;
  /** Segundos: el código se descubre de arriba abajo como un escáner (sin valor = ya visible). */
  revelar?: number;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const destino = conUtm(url, { source: "pantalla", medium: "tienda", campaign });
  const k = lado / QR_LADO;
  const pad = Math.round(72 * k);

  useEffect(() => {
    let vivo = true;
    QRCode.toDataURL(destino, { width: lado * 2, margin: 0, errorCorrectionLevel: "M", color: { dark: "#403C3C", light: "#F3E6CF" } })
      .then((d) => {
        if (vivo) setSrc(d);
      })
      .catch(() => {
        if (vivo) setSrc(null);
      });
    return () => {
      vivo = false;
    };
  }, [destino, lado]);

  return (
    <div
      className="flex flex-col items-center bg-[var(--color-cremita)]"
      style={{ padding: pad, gap: Math.round(36 * k), width: lado + pad * 2, borderRadius: Math.round(64 * k), boxShadow: "0 40px 120px rgba(0,0,0,.25)", borderTop: `${Math.round(16 * k)}px solid ${acento}` }}
    >
      <div style={{ width: lado, height: lado, borderRadius: Math.round(24 * k) }} className="relative overflow-hidden bg-[var(--color-cremita)]">
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" width={lado} height={lado} className="block" style={{ imageRendering: "pixelated" }} />
        )}
        {/* Escáner: una cortina cremita con borde de acento baja y destapa el código. */}
        {revelar !== undefined && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[var(--color-cremita)]"
            initial={{ y: "0%" }}
            animate={{ y: "120%" }}
            transition={{ duration: 0.9, delay: revelar, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="absolute left-0 right-0 top-0" style={{ height: Math.max(6, Math.round(12 * k)), background: acento, boxShadow: `0 0 ${Math.round(40 * k)}px ${acento}` }} />
          </motion.div>
        )}
      </div>
      {texto && (
        <p className="font-sans font-medium text-center leading-[1.15]" style={{ fontSize: Math.max(40, Math.round(56 * k)), color: tinta === "var(--color-text)" ? tinta : "var(--color-text)" }}>
          {texto}
        </p>
      )}
    </div>
  );
}
