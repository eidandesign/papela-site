// Utilidades de fecha/hora centradas en la zona horaria de México.
//
// Por qué existe esto: las fechas con hora (timestamps) se guardan en UTC y el
// render corre en el servidor de Vercel (UTC). Sin forzar la zona, las horas
// salen corridas (+6h) respecto a México. Siempre formatear y agrupar fechas
// con hora en esta zona para que coincida con lo cargado en el admin.
export const TZ = "America/Mexico_City";

// "YYYY-MM-DD" del día calendario en hora de México (en-CA produce ese formato).
// Útil para agrupar timestamps por día sin que el TZ del runtime cambie el bucket.
export function diaMexico(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Hora legible ("10:00 a.m.") de un timestamp, en hora de México.
export function horaMexico(date: Date): string {
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

// ── Aritmética sobre claves "YYYY-MM-DD" tratadas como fecha calendario pura ──
// (sin zona horaria: se opera en UTC para que el día no se desplace nunca).

function partesClave(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m, d };
}

export function sumarDiasAClave(key: string, dias: number): string {
  const { y, m, d } = partesClave(key);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + dias);
  return dt.toISOString().slice(0, 10);
}

// 0 = Lunes … 6 = Domingo
export function diaSemanaLunes0(key: string): number {
  const { y, m, d } = partesClave(key);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

export function diaDelMes(key: string): number {
  return partesClave(key).d;
}

// "junio de 2026" (se capitaliza en el componente). Formateado en UTC porque la
// clave ya representa una fecha calendario literal, no un instante.
export function mesYAnio(key: string): string {
  const { y, m, d } = partesClave(key);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
