import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
// Configuración central de /colabora/maestros (página privada para maestros).
//
// ⚠️ CONFIDENCIAL: las cifras de aquí (tarifa por clase, recargo de talleres)
// solo deben llegar al navegador DESPUÉS de validar la contraseña. Por eso este
// módulo es `server-only`: si un componente cliente lo importara, el build
// falla en vez de meter las cifras en un chunk público de JavaScript.
//
// Cambiar un número aquí actualiza la página y los contratos PDF a la vez, sin
// tocar el diseño.
// ─────────────────────────────────────────────────────────────────────────────

export const MAESTROS_CONFIG = {
  clases: {
    /** Lo que Papela paga al maestro por cada clase impartida y confirmada (MXN). */
    tarifaPorClase: 800,
    horasPorClase: 2,
    cupoMaximo: 10,
    /** Alumnos inscritos que se necesitan para abrir la clase. */
    minimoParaAbrir: 3,
    /**
     * Bono único por cada alumno NUEVO que el maestro refiere directamente y
     * que se inscribe, paga y asiste a su primera clase elegible (MXN).
     */
    bonoAlumnoReferido: 100,
  },
  talleres: {
    /**
     * Recargo comercial de REFERENCIA sobre el costo base que propone el
     * maestro (a partir de este %). No es margen neto: de ahí salen espacio,
     * publicidad, snacks, bebidas y operación.
     */
    recargoReferenciaPct: 30,
  },
  /** Descuento en la tienda de Papela para los maestros que colaboran (%). */
  descuentoMaestros: 15,
  /** Aviso mínimo para cambios y cancelaciones, como regla de planeación. */
  avisoCambiosHoras: 48,
  contrato: {
    /**
     * false = el contrato es un BORRADOR en revisión jurídica: la página dice
     * "Documento pendiente de aprobación legal" y el PDF lleva la leyenda de
     * borrador. Pasarlo a true solo con aprobación interna y legal.
     */
    aprobado: false,
    version: "Borrador nov-2026",
  },
  /** Datos de Papela que se precargan en el contrato. */
  papela: {
    nombre: "Papela Atelier",
    representante: "Adan Careta Hernández",
    // Misma dirección que la ficha de Google (layout.tsx). Falta el número
    // exterior: completarlo aquí cuando se confirme.
    domicilio: "C. Hidalgo, C.P. 72830, Heroica Puebla de Zaragoza, Puebla",
  },
  sesion: {
    duracionDias: 7,
  },
} as const;

/** "$800 MXN" — sin decimales cuando el monto es entero. */
export function pesos(n: number): string {
  const tieneCentavos = Math.round(n * 100) % 100 !== 0;
  return `$${n.toLocaleString("es-MX", {
    minimumFractionDigits: tieneCentavos ? 2 : 0,
    maximumFractionDigits: 2,
  })} MXN`;
}
