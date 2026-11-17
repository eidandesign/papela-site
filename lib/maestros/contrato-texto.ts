import "server-only";
import { MAESTROS_CONFIG, pesos } from "./config";
import type { Modalidad } from "./campos";

// ─────────────────────────────────────────────────────────────────────────────
// Texto del Acuerdo de colaboración (borradores de nov-2026 para revisión
// jurídica). Vive en el servidor: el PDF se arma en
// app/colabora/maestros/contrato/route.ts solo para quien tiene sesión, así
// que el contrato nunca existe como archivo público ni en un chunk de JS.
// Las cifras salen de config.ts (cambiar allá actualiza el contrato).
// ─────────────────────────────────────────────────────────────────────────────

export type Clausula = { titulo: string; texto: string };

export const TITULO_MODALIDAD: Record<Modalidad, string> = {
  clases: "Clases recurrentes",
  talleres: "Talleres especiales",
};

export const INTRO_BORRADOR =
  "Borrador de contrato de prestación de servicios sujeto a revisión jurídica y a la naturaleza real de la relación. No firmar con campos pendientes.";

export const MANIFESTACION =
  "Ambas partes manifiestan su voluntad de colaborar bajo los términos siguientes, sin perjuicio de las disposiciones legales imperativas que resulten aplicables.";

export const NOTA_FINAL_BORRADOR =
  "Nota: borrador de trabajo. Requiere validación jurídica, datos fiscales y revisión específica de posibles implicaciones laborales y de protección de datos antes de su uso.";

function especificas(m: Modalidad): Clausula[] {
  const { clases, talleres, avisoCambiosHoras } = MAESTROS_CONFIG;
  if (m === "clases") {
    return [
      {
        titulo: "Objeto",
        texto:
          "EL PRESTADOR impartirá clases creativas de la disciplina indicada en el Anexo A al final de este documento. La preparación pedagógica y conducción de cada sesión estarán a su cargo; PAPELA organizará la operación comercial e inscripciones de las clases.",
      },
      {
        titulo: "Duración, cupo y confirmación",
        texto: `Cada sesión tendrá una duración de ${clases.horasPorClase} horas, con cupo máximo de ${clases.cupoMaximo} participantes. Fechas y horarios se acordarán por escrito. Una sesión se considerará confirmada cuando PAPELA lo comunique expresamente al PRESTADOR.`,
      },
      {
        titulo: "Honorarios y pagos",
        texto: `PAPELA pagará al PRESTADOR ${pesos(clases.tarifaPorClase)} por cada sesión efectivamente impartida y previamente confirmada, independientemente de que asistan entre una y ${clases.cupoMaximo === 10 ? "diez" : clases.cupoMaximo} personas. Los impuestos, comprobantes y forma de pago se regirán por la legislación aplicable y lo indicado en el Anexo A. No se garantiza un número mínimo de sesiones futuras.`,
      },
      {
        titulo: "Bono por incorporación de nuevos alumnos",
        texto: [
          `PAPELA podrá otorgar al PRESTADOR un incentivo de ${pesos(clases.bonoAlumnoReferido)} por cada nuevo alumno referido directamente por este, siempre que la persona se inscriba, realice su pago y asista por primera vez a una clase elegible organizada por PAPELA.`,
          "Para recibir el incentivo, el alumno deberá identificar al PRESTADOR como la persona que lo recomendó durante su proceso de inscripción.",
          "El bono se otorgará por única ocasión por alumno y no generará comisiones sobre clases posteriores, renovaciones o futuras inscripciones.",
          "Los incentivos se registrarán y pagarán conforme al calendario de pagos acordado entre las partes, sujeto a las disposiciones legales aplicables.",
          "Este beneficio no autoriza al PRESTADOR a utilizar datos personales de alumnos registrados en PAPELA para captación comercial externa.",
        ].join("\n"),
      },
      {
        titulo: "Aportaciones de PAPELA",
        texto:
          "PAPELA facilitará espacio, mobiliario, materiales y herramientas previstos para la actividad, además de promoción, diseño, gestión de inscripciones y cobros, y snacks. Los materiales extraordinarios deben autorizarse antes de adquirirse.",
      },
      {
        titulo: "Obligaciones del prestador",
        texto:
          "Preparar contenidos y dinámicas, impartir la sesión con diligencia y trato respetuoso, cuidar herramientas, avisar incidencias, respetar medidas de seguridad y no cobrar ni recibir inscripciones por cuenta propia respecto de las clases organizadas por PAPELA, salvo autorización expresa.",
      },
      {
        titulo: "Cancelaciones y cambios",
        texto: `Cualquier parte informará cambios tan pronto como sea posible; como regla de planeación, con al menos ${avisoCambiosHoras} horas de anticipación salvo caso fortuito o fuerza mayor. Si PAPELA cancela una sesión ya confirmada, las partes aplicarán la compensación previamente pactada en el Anexo A, cuando corresponda. Una sesión no impartida no genera automáticamente el honorario completo.`,
      },
    ];
  }
  return [
    {
      titulo: "Objeto",
      texto:
        "EL PRESTADOR desarrollará y facilitará el taller especial descrito en el Anexo A de este documento. El concepto, contenido, duración, fecha y requisitos se aprobarán por escrito antes de su difusión.",
    },
    {
      titulo: "Costo base y precio al público",
      texto: `El PRESTADOR propondrá un costo base que especifique qué comprende, por participante o por evento. PAPELA determinará el precio final al público aplicando sobre el costo base un recargo comercial a partir del ${talleres.recargoReferenciaPct}%, que considera operación, publicidad, espacio, bebidas, snacks y otros costos; ello no equivale a un margen neto del ${talleres.recargoReferenciaPct}%. El precio y la remuneración definitivos se documentarán en el Anexo A.`,
    },
    {
      titulo: "Materiales y herramientas",
      texto:
        "La distribución de compras, aportaciones, préstamo de herramientas, consumibles y responsabilidad por materiales se detallará en el Anexo A. Ninguna compra o costo adicional podrá imputarse a la otra parte sin aprobación previa por escrito.",
    },
    {
      titulo: "Aportaciones de PAPELA",
      texto:
        "PAPELA proporcionará espacio y mobiliario, promoción y diseño, gestión de reservas y cobros, snacks y bebidas, así como apoyo logístico. Las aportaciones adicionales dependerán de lo acordado expresamente.",
    },
    {
      titulo: "Obligaciones del prestador",
      texto:
        "El PRESTADOR preparará y guiará el taller, informará requerimientos técnicos, coordinará las herramientas que asuma, atenderá a las personas participantes con respeto, cumplirá medidas de seguridad y no captará cobros o reservaciones por fuera de PAPELA en relación con ese taller.",
    },
    {
      titulo: "Inscripciones, liquidación y cancelaciones",
      texto:
        "El cupo, mínimo de inscripciones, anticipos, fecha de corte, política de devoluciones, remuneración del maestro y momento de liquidación se definirán antes de publicar el evento. En caso de cancelación, cada parte asumirá únicamente los conceptos aprobados y las consecuencias expresamente pactadas, sin perjuicio de obligaciones legales.",
    },
  ];
}

const COMUNES: Clausula[] = [
  {
    titulo: "Protección de datos y confidencialidad",
    texto:
      "El PRESTADOR usará datos personales de alumnos únicamente para finalidades necesarias y autorizadas de la actividad; no copiará ni conservará bases de datos, teléfonos, perfiles, listas o información privada para comercialización propia. Deberá adoptar precauciones razonables y comunicar incidentes de seguridad a PAPELA sin demora. Al finalizar, devolverá o eliminará los datos cuando proceda, salvo conservación legalmente exigida. La información comercial no pública identificada como confidencial tampoco podrá divulgarse.",
  },
  {
    titulo: "No captación de alumnos",
    texto:
      "Durante la colaboración, el PRESTADOR no realizará acciones dirigidas de captación comercial utilizando datos o relaciones de alumnos obtenidos a través de PAPELA para desviar las inscripciones de actividades organizadas por PAPELA hacia ofertas externas competidoras. Esto no impide actividad profesional independiente, relaciones preexistentes ni solicitudes espontáneas no originadas en uso indebido de información.",
  },
  {
    titulo: "Redes sociales, imagen y menores",
    texto:
      "No buscará, seguirá, agregará, etiquetará o contactará por iniciativa propia a alumnos a partir de información obtenida en PAPELA para captación comercial. Las fotografías y publicaciones que identifiquen participantes requieren autorización apropiada; tratándose de menores, deberán observarse permisos y cuidados especiales. Las cuentas oficiales de PAPELA gestionarán anuncios y reservas de sus actividades.",
  },
  {
    titulo: "Reputación y comunicaciones",
    texto:
      "Ambas partes actuarán de buena fe y se abstendrán de divulgar información confidencial o realizar conductas ilícitas que causen daños acreditables. PAPELA podrá ejercer las acciones legales que procedan frente a incumplimientos o actos ilícitos. Esta cláusula no restringe opiniones legítimas, críticas de buena fe, denuncias, declaraciones veraces ni el ejercicio de derechos.",
  },
  {
    titulo: "Terminación anticipada",
    texto:
      "PAPELA podrá comunicar en cualquier momento su decisión de no continuar con nuevas actividades y terminar este acuerdo mediante aviso escrito. Ante incumplimientos graves podrá suspender la colaboración de inmediato, respetando derechos y obligaciones exigibles. Se pagarán servicios prestados, y los compromisos sobre sesiones o talleres confirmados se resolverán conforme a este contrato, su Anexo A y la legislación aplicable. No se pretende renunciar a derechos irrenunciables.",
  },
  {
    titulo: "Naturaleza de la relación",
    texto:
      "Las partes manifiestan su intención de colaborar mediante servicios específicos, conservando el PRESTADOR autonomía técnica en la conducción educativa. Sin embargo, reconocen que la naturaleza jurídica de la relación depende de las condiciones reales de prestación, incluida la existencia de subordinación, y no de la denominación del documento.",
  },
  {
    titulo: "Ley aplicable y solución de diferencias",
    texto:
      "Las partes buscarán resolver de buena fe cualquier diferencia mediante comunicación escrita. Se aplicarán las normas mexicanas y las disposiciones de orden público pertinentes; la competencia de autoridades se determinará conforme a la ley, sin limitar derechos laborales ni de consumidores cuando correspondan.",
  },
];

export function clausulas(m: Modalidad): Clausula[] {
  return [...especificas(m), ...COMUNES];
}
