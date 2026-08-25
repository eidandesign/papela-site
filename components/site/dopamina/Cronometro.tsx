"use client";

// Cuenta regresiva (3 · 2 · 1) + cronómetro circular de Dopamina.
// Estilo Figma: aro delgado con el tiempo grande adentro y botón "¡Terminé!".
// El tiempo se calcula contra un timestamp de fin (no acumulando ticks):
// sobrevive a pestañas en segundo plano sin desfasarse.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CURVA_SUAVE } from "@/lib/dopamina/animacion";

const RADIO = 74;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

export default function Cronometro({
  duracionSeg,
  onTermina,
}: {
  duracionSeg: number;
  onTermina: (terminoAntes: boolean) => void;
}) {
  // 3, 2, 1 → null = cronómetro corriendo
  const [cuenta, setCuenta] = useState<number | null>(3);
  const [restante, setRestante] = useState(duracionSeg);
  const finRef = useRef<number>(0);
  const avisado = useRef(false);

  useEffect(() => {
    if (cuenta === null) return;
    const t = setTimeout(() => {
      if (cuenta <= 1) {
        finRef.current = Date.now() + duracionSeg * 1000;
        setCuenta(null);
      } else {
        setCuenta(cuenta - 1);
      }
    }, 900);
    return () => clearTimeout(t);
  }, [cuenta, duracionSeg]);

  useEffect(() => {
    if (cuenta !== null) return;
    const tick = () => {
      const r = Math.max(0, (finRef.current - Date.now()) / 1000);
      setRestante(r);
      if (r <= 0 && !avisado.current) {
        avisado.current = true;
        // Pausa breve para que se vea el "¡Tiempo!" antes del cierre.
        setTimeout(() => onTermina(false), 1600);
      }
    };
    tick();
    const int = setInterval(tick, 250);
    return () => clearInterval(int);
  }, [cuenta, onTermina]);

  const seg = Math.ceil(restante);
  const mm = String(Math.floor(seg / 60)).padStart(2, "0");
  const ss = String(seg % 60).padStart(2, "0");
  const progreso = restante / duracionSeg;
  const acabo = restante <= 0;

  if (cuenta !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[260px]" aria-live="assertive">
        <AnimatePresence mode="wait">
          {/* leading-[1.25] + padding en em: el dígito serif tiene tinta que
              sobresale del em-box (medido ~118% del font-size) y con leading-none
              iOS recorta el glifo al rasterizar la capa animada (scale+opacity).
              La caja holgada mantiene todo el ink dentro del layer.
              Tiempos: cada número vive 900ms — exit 0.2 + entrada 0.45 caben
              dentro del ciclo con mode="wait" sin cortarse a la mitad. */}
          <motion.p
            key={cuenta}
            initial={{ opacity: 0, scale: 2.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ duration: 0.45, ease: CURVA_SUAVE }}
            className="font-serif italic text-[clamp(5rem,18vw,8rem)] leading-[1.25] px-[0.15em] text-white"
          >
            {cuenta}
          </motion.p>
        </AnimatePresence>
        <p className="label text-white/60 mt-6">Prepara tu papel…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[168px] h-[168px]" role="timer" aria-label={`Quedan ${mm}:${ss}`}>
        <svg width="168" height="168" viewBox="0 0 168 168" className="-rotate-90">
          <circle cx="84" cy="84" r={RADIO} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" />
          <circle
            cx="84"
            cy="84"
            r={RADIO}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={CIRCUNFERENCIA * (1 - progreso)}
            style={{ transition: "stroke-dashoffset 0.3s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {acabo ? (
            <motion.p
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-serif italic text-[1.7rem] text-white"
            >
              ¡Tiempo!
            </motion.p>
          ) : (
            <p className="font-sans text-[2.1rem] font-normal tracking-wide tabular-nums text-white">
              {mm}:{ss}
            </p>
          )}
        </div>
      </div>

      {!acabo && (
        <button
          type="button"
          onClick={() => onTermina(true)}
          className="mt-10 rounded-full bg-white text-[var(--color-verde)] font-sans text-[14px] font-semibold px-7 py-3 hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          ¡Terminé!
        </button>
      )}
    </div>
  );
}
