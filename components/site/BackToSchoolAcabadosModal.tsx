"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";
import { useAcabadosModalStore } from "@/lib/stores/acabadosModalStore";
import { ACABADOS, BORDADOS } from "@/lib/back-to-school-data";
import { wa, Foto } from "./BackToSchoolUI";

type Tab = "acabados" | "bordados";

// Modal de bottom sheet que aparece al elegir un paquete en /back-to-school:
// pregunta si quieren agregar acabados/bordados antes de mandar el WhatsApp,
// y arma el mensaje final con todo lo que hayan elegido (o nada, si solo
// tocan "Continuar").
export default function BackToSchoolAcabadosModal() {
  const [mounted, setMounted] = useState(false);
  const { paquete, close } = useAcabadosModalStore();
  const isOpen = paquete !== null;

  const [tab, setTab] = useState<Tab>("acabados");
  // Solo se puede elegir una opción por categoría (acabado y bordado son
  // excluyentes entre sí, no acumulables).
  const [selAcabado, setSelAcabado] = useState<string | null>(null);
  const [selBordado, setSelBordado] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Selección limpia cada vez que se abre un paquete nuevo.
  useEffect(() => {
    if (paquete) {
      setTab("acabados");
      setSelAcabado(null);
      setSelBordado(null);
    }
  }, [paquete]);

  if (!mounted) return null;

  const acabadoElegido = ACABADOS.find((a) => a.nombre === selAcabado) ?? null;
  const bordadoElegido = BORDADOS.find((b) => b.nombre === selBordado) ?? null;
  const totalExtras = (acabadoElegido?.precio ?? 0) + (bordadoElegido?.precio ?? 0);

  const continuar = () => {
    if (!paquete) return;
    const lineas = [
      `Hola Papela, me interesa el Paquete ${paquete.nombre} ($${paquete.precio}) de etiquetas escolares Back to School.`,
    ];
    if (acabadoElegido) {
      lineas.push("", `Acabado: ${acabadoElegido.nombre} (+$${acabadoElegido.precio})`);
    }
    if (bordadoElegido) {
      lineas.push("", `Bordado: ${bordadoElegido.nombre} (+$${bordadoElegido.precio})`);
    }
    if (totalExtras > 0) {
      lineas.push("", `Total aproximado: $${paquete.precio + totalExtras} MXN`);
    }
    lineas.push("", "¿Me pueden compartir más información?");
    window.open(wa(lineas.join("\n")), "_blank", "noopener,noreferrer");
    close();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && paquete && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 z-[9998]"
          />

          {/* Mobile: bottom sheet pegado al borde inferior. Desktop (sm+):
              mismo panel pero centrado en la pantalla, no anclado abajo. */}
          <div
            className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4"
            onClick={close}
          >
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="mx-auto flex max-h-[85vh] w-full flex-col rounded-t-[28px] bg-[var(--color-bg)] shadow-2xl sm:max-w-lg sm:rounded-[28px]"
            >
              {/* Header */}
              <div className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 pb-4 pt-6">
                <div>
                  <p className="label mb-1 text-[var(--color-terracota)]">Paquete {paquete.nombre}</p>
                  <h3 className="font-serif italic text-[22px] leading-tight text-[#403C3C]">¿Quieres agregar algún acabado?</h3>
                </div>
                <button
                  onClick={close}
                  aria-label="Cerrar"
                  className="shrink-0 rounded-full bg-black/5 p-2 transition-colors hover:bg-black/10"
                >
                  <XMarkIcon className="h-5 w-5 text-[#403C3C]" />
                </button>
              </div>
  
              {/* Tabs */}
              <div className="flex flex-shrink-0 gap-2 px-6 pt-4">
                <button
                  type="button"
                  onClick={() => setTab("acabados")}
                  className={`flex-1 rounded-full px-4 py-2.5 text-center font-sans text-[13px] font-semibold transition-colors ${
                    tab === "acabados"
                      ? "bg-[var(--color-verde)] text-[var(--color-cremita)]"
                      : "border border-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  Acabados{acabadoElegido ? " (1)" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("bordados")}
                  className={`flex-1 rounded-full px-4 py-2.5 text-center font-sans text-[13px] font-semibold transition-colors ${
                    tab === "bordados"
                      ? "bg-[var(--color-verde)] text-[var(--color-cremita)]"
                      : "border border-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  Bordados{bordadoElegido ? " (1)" : ""}
                </button>
              </div>
  
              {/* Opciones */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {tab === "acabados" ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ACABADOS.map((a) => {
                      const active = selAcabado === a.nombre;
                      return (
                        <button
                          key={a.nombre}
                          type="button"
                          onClick={() => setSelAcabado(active ? null : a.nombre)}
                          aria-pressed={active}
                          className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${
                            active
                              ? "border-[var(--color-verde)] bg-[var(--color-verde)]/10"
                              : "border-[var(--color-border)] bg-white/60"
                          }`}
                        >
                          <Foto
                            src={a.imagen}
                            alt={`Acabado ${a.nombre}`}
                            tint="#DCE6E7"
                            className="h-14 w-14 shrink-0 rounded-xl"
                          />
                          <span className="flex-1">
                            <span className="block font-serif italic text-[15px] text-[#403C3C]">{a.nombre}</span>
                            <span className="block font-sans text-[12px] text-[var(--color-muted)]">+${a.precio} MXN</span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                              active ? "border-[var(--color-verde)] bg-[var(--color-verde)]" : "border-[var(--color-border)]"
                            }`}
                          >
                            {active && <CheckIcon className="h-4 w-4 text-[var(--color-cremita)]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {BORDADOS.map((b) => {
                      const active = selBordado === b.nombre;
                      return (
                        <button
                          key={b.nombre}
                          type="button"
                          onClick={() => setSelBordado(active ? null : b.nombre)}
                          aria-pressed={active}
                          className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                            active
                              ? "border-[var(--color-verde)] bg-[var(--color-verde)]/10"
                              : "border-[var(--color-border)] bg-white/60"
                          }`}
                        >
                          <span className="font-serif italic text-[15px] text-[#403C3C]">{b.nombre}</span>
                          <span className="flex items-center gap-3">
                            <span className="font-sans text-[13px] text-[var(--color-muted)]">+${b.precio} MXN</span>
                            <span
                              aria-hidden="true"
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                active ? "border-[var(--color-verde)] bg-[var(--color-verde)]" : "border-[var(--color-border)]"
                              }`}
                            >
                              {active && <CheckIcon className="h-4 w-4 text-[var(--color-cremita)]" />}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
  
              {/* Footer */}
              <div className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-[var(--color-border)] px-6 py-5">
                <div>
                  <p className="font-sans text-[12px] text-[var(--color-muted)]">Total estimado</p>
                  <p className="font-serif font-extralight text-[26px] leading-none text-[#403C3C]">
                    ${paquete.precio + totalExtras}{" "}
                    <span className="font-sans text-[12px] text-[var(--color-muted)]">MXN</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={continuar}
                  className="rounded-full bg-[var(--color-verde)] px-7 py-3.5 font-sans text-[15px] font-semibold text-[var(--color-cremita)] transition-opacity hover:opacity-90"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
