"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { TZ } from "@/lib/fecha";
import type { SaldoTarjeta } from "./clubTipos";

// Saldo Papela (cashback) en la tarjeta del miembro — SOLO consulta. El
// canje se autoriza en caja: aquí no hay ningún botón que descuente saldo.
// Los datos vienen del admin (GET /api/public/club/[token] → `saldo`); una
// tarjeta contra un admin viejo no trae el campo y el bloque no se pinta.

const fmt = (centavos: number) => {
  const pesos = centavos / 100;
  return pesos.toLocaleString("es-MX", {
    style: "currency", currency: "MXN",
    minimumFractionDigits: Number.isInteger(pesos) ? 0 : 2, maximumFractionDigits: 2,
  });
};
const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", timeZone: TZ });
const fechaMov = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: TZ });

const TIPO: Record<string, string> = {
  cashback: "Cashback por tu compra",
  canje: "Usaste tu saldo",
  bono: "Bono",
  ajuste: "Ajuste",
  vencimiento: "Saldo vencido",
  reverso: "Corrección",
};

export default function SaldoPapela({ saldo }: { saldo: SaldoTarjeta }) {
  const [abierto, setAbierto] = useState(false);
  const tiene = saldo.disponibleCentavos > 0;
  const movs = saldo.movimientos ?? [];
  // Sin saldo, sin historial y sin programa activo no hay nada que contar.
  if (!tiene && movs.length === 0 && !saldo.programa?.activo) return null;

  return (
    <section
      aria-labelledby="saldo-papela-titulo"
      className="w-full max-w-[380px] mt-5 rounded-3xl bg-white border border-[var(--color-border)] shadow-[0_10px_30px_rgba(18,83,92,0.08)] overflow-hidden"
    >
      <div className="px-5 pt-5 pb-4">
        <p id="saldo-papela-titulo" className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-verde)]">
          Saldo Papela
        </p>
        <p className="font-serif text-[38px] leading-none text-[var(--color-text)] mt-1.5 tabular-nums">
          {fmt(saldo.disponibleCentavos)}
        </p>
        <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">
          {tiene
            ? "Úsalo en tu próxima compra: dilo en caja y lo aplicamos a tu cuenta."
            : saldo.programa?.activo
              ? `Con cada compra ganas ${saldo.programa.porcentaje}% de lo que pagues en Saldo Papela.`
              : "Tu crédito del Club aparecerá aquí."}
        </p>
        {saldo.proximoVencimiento && saldo.proximoVencimiento.centavos > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-cremita-3)] px-3 py-1.5 text-xs font-semibold text-[var(--color-terracota)]">
            ⏳ {fmt(saldo.proximoVencimiento.centavos)} vencen el {fechaCorta(saldo.proximoVencimiento.venceAt)}
          </p>
        )}
      </div>

      {movs.length > 0 && (
        <div className="border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="saldo-papela-movs"
            className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-[var(--color-text)]"
          >
            Mis últimos movimientos
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${abierto ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {abierto && (
            <ul id="saldo-papela-movs" className="px-5 pb-4 divide-y divide-[var(--color-border)]">
              {movs.map((m, i) => (
                <li key={i} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--color-text)]">{TIPO[m.tipo] ?? "Movimiento"}</p>
                    <p className="text-[11px] text-[var(--color-muted)]">{fechaMov(m.fecha)}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums flex-shrink-0 ${m.montoCentavos >= 0 ? "text-[var(--color-verde)]" : "text-[var(--color-terracota)]"}`}>
                    {m.montoCentavos >= 0 ? "+" : "−"}{fmt(Math.abs(m.montoCentavos))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="px-5 pb-4 text-[11px] text-[var(--color-muted)]">
        El Saldo Papela es crédito promocional: no es transferible ni se cambia por efectivo.
      </p>
    </section>
  );
}
