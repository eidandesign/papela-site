"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { CheckIcon, PlusIcon } from "@heroicons/react/24/solid";

// Animación de "cómo compartir una estampita" (nov-2026, a petición del dueño)
// para SeccionHistorias. Un ciclo de 4 escenas que corresponde 1:1 con los
// pasos de la izquierda (el paso activo se resalta):
//   0 · la portada de la tarjeta y un dedo que toca al Caballito
//   1 · se abre su ficha y se lee el inicio de su historia
//   2 · el dedo toca el botón de copiar → ✓ "¡Copiado!"
//   3 · aparece una historia de Instagram y el sticker cae pegado en ella
// Solo corre mientras está en pantalla. Con prefers-reduced-motion no hay
// ciclo: se queda en la escena final (todo visible) y ningún paso se apaga.
// Todo es adorno (aria-hidden); los pasos son una lista normal.

export type Paso = { titulo: string; texto: string };

const DURACION = [2600, 3000, 2400, 3600]; // ms por escena
const HISTORIA =
  "En una granja rodeada de campos dorados vivía un caballo café llamado Copo, porque en la frente tenía una manchita blanca como de nube…";

/** El "dedo": círculo blanco que llega y hace tap */
function Dedo({ className = "" }: { className?: string }) {
  return (
    <motion.span
      className={`absolute z-30 w-10 h-10 rounded-full bg-white/85 ring-2 ring-[var(--color-verde)]/40 shadow-[0_6px_16px_rgba(0,0,0,0.25)] pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 1.6, x: 30, y: 30 }}
      animate={{ opacity: [0, 1, 1, 0.9, 0], scale: [1.6, 1, 0.75, 1, 1], x: [30, 0, 0, 0, 0], y: [30, 0, 0, 0, 0] }}
      transition={{ duration: 1.5, times: [0, 0.35, 0.55, 0.7, 1], ease: "easeOut", delay: 0.35 }}
    />
  );
}

export default function HistoriaAnimada({ pasos, children }: { pasos: Paso[]; children?: ReactNode }) {
  const reducida = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.35 });
  const [escena, setEscena] = useState(0);
  const [vuelta, setVuelta] = useState(0); // remonta las animaciones al reiniciar el ciclo
  const [tocado, setTocado] = useState(false); // el dedo ya tocó "copiar" en la escena 2

  useEffect(() => {
    if (reducida || !visible) return;
    const t = setTimeout(() => {
      setEscena((e) => {
        if (e === 3) {
          setVuelta((v) => v + 1);
          setTocado(false);
          return 0;
        }
        return e + 1;
      });
    }, DURACION[escena]);
    return () => clearTimeout(t);
  }, [escena, visible, reducida]);

  // En la escena 2 el botón cambia a ✓ justo cuando el dedo lo toca
  useEffect(() => {
    if (escena !== 2) return;
    const t = setTimeout(() => setTocado(true), 1050);
    return () => clearTimeout(t);
  }, [escena]);

  const esc = reducida ? 3 : escena;
  const fichaAbierta = esc >= 1;
  const copiado = esc >= 3 || (esc === 2 && tocado);

  return (
    <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Encabezado + pasos (el activo se resalta mientras corre la animación) */}
      <div className="lg:order-1">
      {children}
      <ol className="space-y-5">
        {pasos.map((p, i) => {
          const activo = reducida || i === esc;
          return (
            <li key={p.titulo} className={`flex gap-4 transition-opacity duration-500 ${activo ? "opacity-100" : "opacity-45"}`}>
              <span
                className={`shrink-0 w-9 h-9 rounded-full font-serif italic text-[18px] flex items-center justify-center transition-colors duration-500 ${
                  activo && !reducida ? "bg-[var(--color-tinta)] text-white" : "bg-[var(--color-tinta)]/15 text-[var(--color-tinta)]"
                }`}
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-serif italic text-[22px] leading-tight text-[#403C3C]">{p.titulo}</h3>
                <p className="font-sans text-[15px] leading-[22px] text-[var(--color-muted)]">{p.texto}</p>
              </div>
            </li>
          );
        })}
      </ol>
      </div>

      {/* Escenario */}
      <div aria-hidden="true" className="relative mx-auto w-full max-w-[520px] h-[440px] sm:h-[500px] lg:order-2">
        {/* 3 · historia de Instagram con el sticker pegado */}
        <AnimatePresence>
          {esc === 3 && (
            <motion.div
              key={`story-${vuelta}`}
              className="absolute right-2 top-0 w-[165px] sm:w-[230px] aspect-[9/16] rounded-[30px] overflow-hidden shadow-[0_24px_44px_rgba(1,67,117,0.28)]"
              initial={{ opacity: 0, scale: 0.85, rotate: 0, y: 30 }}
              animate={{ opacity: 1, scale: 1, rotate: 4, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image src="/images/club/fondos/horizonte.jpg" alt="" fill sizes="230px" className="object-cover" />
              <div className="absolute inset-x-0 top-3 px-3 flex gap-1">
                <span className="h-[3px] flex-1 rounded-full bg-white/90" />
                <span className="h-[3px] flex-1 rounded-full bg-white/40" />
              </div>
              <motion.div
                className="absolute left-1/2 top-[34%] -ml-[48px] sm:-ml-[65px] w-[96px] h-[96px] sm:w-[130px] sm:h-[130px]"
                initial={{ scale: 2.2, rotate: 20, opacity: 0 }}
                animate={{ scale: 1, rotate: -8, opacity: 1 }}
                transition={{ delay: reducida ? 0 : 0.6, type: "spring", stiffness: 260, damping: 16 }}
              >
                <Image src="/images/club/preview/caballo.webp" alt="" fill sizes="130px" className="object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.3)]" />
              </motion.div>
              <motion.p
                className="absolute inset-x-0 bottom-[16%] text-center font-sans text-[13px] font-bold text-white px-4 [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducida ? 0 : 1.1, duration: 0.4 }}
              >
                ¡Me salió Copo! 🐴
                <br />
                <span className="font-semibold">@papela.atelier</span>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 0 · la portada de la tarjeta (se esconde cuando abre la ficha) */}
        <motion.div
          className="absolute left-0 bottom-0 w-[245px] sm:w-[300px] rounded-[26px] overflow-hidden text-white shadow-[0_20px_44px_rgba(64,60,60,0.2)] -rotate-[3deg]"
          animate={{ opacity: fichaAbierta ? 0 : 1, scale: fichaAbierta ? 0.94 : 1 }}
          transition={{ duration: 0.45 }}
        >
          <Image src="/images/club/fondos/atardecer.jpg" alt="" fill sizes="300px" className="object-cover" />
          <div className="relative px-5 pt-5 pb-2 flex items-start justify-between">
            <p className="font-serif text-[22px] leading-none">Tu nombre</p>
            <p className="font-serif text-[18px] leading-none">$148.50</p>
          </div>
          <div className="relative grid grid-cols-3 gap-y-3 justify-items-center px-5 pt-3 pb-6">
            {["flor", "monstera", "caballo"].map((s) => (
              <span key={s} className="relative flex items-center justify-center w-[64px] h-[78px]">
                <Image src={`/images/club/preview/${s}.webp`} alt="" width={56} height={56} className="w-[54px] h-[54px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]" />
                {s === "caballo" && esc === 0 && !reducida && <Dedo key={`dedo0-${vuelta}`} className="left-3 top-5" />}
              </span>
            ))}
            {["esfera", "", ""].map((s, i) =>
              s ? (
                <span key={s} className="flex items-center justify-center w-[64px] h-[78px]">
                  <Image src={`/images/club/preview/${s}.webp`} alt="" width={56} height={56} className="w-[54px] h-[54px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]" />
                </span>
              ) : (
                <span key={i} className="flex items-center justify-center w-[64px] h-[78px] rounded-[50%] border border-dashed border-white/70">
                  <PlusIcon className="w-4 h-4" />
                </span>
              ),
            )}
          </div>
          <p className="relative px-5 pb-5 font-serif italic text-[20px]">Club Creativo</p>
        </motion.div>

        {/* 1–3 · la ficha de la estampita */}
        <AnimatePresence>
          {fichaAbierta && (
            <motion.div
              key={`ficha-${vuelta}`}
              className="absolute left-0 bottom-0 w-[245px] sm:w-[300px] rounded-[26px] bg-white p-5 shadow-[0_20px_44px_rgba(64,60,60,0.2)]"
              initial={{ opacity: 0, y: 60, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -3 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative rounded-2xl bg-[var(--color-cremita-3)] p-5 flex items-center justify-center">
                <motion.div
                  className="relative w-[110px] h-[110px]"
                  animate={esc === 3 && !reducida ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image src="/images/club/preview/caballo.webp" alt="" fill sizes="110px" className="object-contain" />
                </motion.div>
                {/* Botón copiar (como en FichaSticker) */}
                <motion.span
                  className="absolute -bottom-3 -right-3 w-11 h-11 rounded-full flex items-center justify-center shadow-[0_6px_16px_rgba(18,83,92,0.25)] ring-4 ring-white"
                  animate={{
                    backgroundColor: copiado ? "#12535C" : "#FFFFFF",
                    color: copiado ? "#F3E6CF" : "#12535C",
                    scale: esc === 2 && !reducida ? [1, 1, 0.85, 1.1, 1] : 1,
                  }}
                  transition={{ duration: esc === 2 ? 1.5 : 0.3, times: esc === 2 ? [0, 0.4, 0.55, 0.75, 1] : undefined }}
                >
                  {copiado ? <CheckIcon className="w-5 h-5" /> : <DocumentDuplicateIcon className="w-5 h-5" />}
                </motion.span>
                {esc === 2 && !reducida && <Dedo key={`dedo2-${vuelta}`} className="-bottom-5 -right-5" />}
                <AnimatePresence>
                  {copiado && (
                    <motion.span
                      className="absolute -bottom-9 right-0 rounded-full bg-[var(--color-verde)] px-2.5 py-1 font-sans text-[11px] font-bold text-[var(--color-cremita)] whitespace-nowrap"
                      initial={{ opacity: 0, y: -6, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      ¡Copiado!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-terracota)]">Legendario ★</p>
                <p className="font-serif italic text-[24px] leading-tight text-[#403C3C] mb-2">Caballito</p>
                {/* La historia "se lee": se descubre línea por línea */}
                <motion.p
                  className="font-sans text-[13px] leading-[19px] text-[var(--color-muted)]"
                  initial={reducida ? false : { clipPath: "inset(0 0 100% 0)" }}
                  animate={{ clipPath: "inset(0 0 0% 0)" }}
                  transition={{ duration: 1.6, delay: 0.5, ease: "linear" }}
                >
                  {HISTORIA}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
