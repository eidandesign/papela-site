// Eventos de analítica de Dopamina (juego del Club Creativo).
// El sitio ya usa Google Tag Manager (dataLayer en layout.tsx): empujamos
// eventos con prefijo `dopa_` para configurarlos desde GTM sin tocar código.
//
// Eventos emitidos:
//   dopa_entrada {desde}           — llegó al juego (desde=club si vino de la landing)
//   dopa_como_se_juega             — abrió el modal "¿Cómo se juega?"
//   dopa_inicio_partida            — se repartieron burbujas (nueva partida)
//   dopa_burbujas_completas        — explotó las 3 burbujas
//   dopa_duracion_elegida {seg}    — eligió duración (arranca el cronómetro)
//   dopa_reto_terminado {antes}    — terminó (antes=true si pulsó "¡Terminé!")
//   dopa_volver_jugar              — reinició partida desde el final
//   dopa_ver_club                  — volvió a Club Creativo desde el final

export function eventoDopa(evento: string, datos?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer?.push({ event: `dopa_${evento}`, ...datos });
}
