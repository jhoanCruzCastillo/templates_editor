import type { Seccion } from '../types';

// Base de conocimiento del "Asesor de IA 24/7" (Nivel 1) — sin backend ni LLM real: coincidencia
// de palabras clave contra un glosario curado (de los Anexos 7/11 del MEF) y contra la ayuda que
// el admin cargó por subsección. Si no encuentra nada, responde honestamente que no sabe.

interface TerminoGlosario {
  terminos: string[];
  definicion: string;
  fuente: string;
}

const glosario: TerminoGlosario[] = [
  {
    terminos: ['tasa social de descuento', 'tsd'],
    definicion: 'Es del **8%** general (Anexo 11). Si el horizonte de evaluación supera 20 años, desde el año 21 se usan tasas decrecientes: 5,5% (años 21-49), 4,0% (50-74), 3,0% (75-99), 2,0% (100-199) y 1,0% (200 a más).',
    fuente: 'Anexo 11 — Parámetros de Evaluación Social',
  },
  {
    terminos: ['precio social de la mano de obra', 'psmo', 'mano de obra calificada', 'mano de obra no calificada'],
    definicion: 'El costo de mercado se ajusta con un factor de corrección según región (Lima, Costa, Sierra, Selva) y nivel de calificación. Ejemplo: mano de obra no calificada en Sierra usa el factor 0,42.',
    fuente: 'Anexo 11 — Parámetros de Evaluación Social',
  },
  {
    terminos: ['precio social de la divisa', 'psd', 'factor de corrección de la divisa'],
    definicion: 'El Factor de Corrección de la Divisa es **1,08** — se usa para convertir costos en dólares a su equivalente social en soles.',
    fuente: 'Anexo 11 — Parámetros de Evaluación Social',
  },
  {
    terminos: ['costo social por fallecimiento prematuro', 'valor estadístico de la vida'],
    definicion: 'Es de **S/ 465,784.50** por persona fallecida prematuramente — se usa para monetizar beneficios en proyectos que reducen mortalidad evitable.',
    fuente: 'Anexo 11 — Parámetros de Evaluación Social',
  },
  {
    terminos: ['precio social del carbono', 'gases de efecto invernadero'],
    definicion: 'Es de **US$ 30 por tonelada de CO2** equivalente — aplica a proyectos con reducción medible de emisiones.',
    fuente: 'Anexo 11 — Parámetros de Evaluación Social',
  },
  {
    terminos: ['brecha oferta demanda', 'brecha de servicio', 'brecha oferta-demanda'],
    definicion: 'Es la diferencia entre la demanda proyectada y la oferta optimizada (o la oferta actual si no se pudo optimizar), calculada a lo largo de todo el horizonte de evaluación.',
    fuente: 'Anexo 7 — Contenido mínimo del Perfil',
  },
  {
    terminos: ['árbol de causas', 'árbol de problemas', 'causas y efectos', 'causas-problema-efectos'],
    definicion: 'Sistematiza el problema central identificado en el diagnóstico junto con sus causas (directas/indirectas) y sus efectos (directos/indirectos), sustentado con evidencia del diagnóstico.',
    fuente: 'Anexo 7 — Contenido mínimo del Perfil',
  },
  {
    terminos: ['unidad formuladora'],
    definicion: 'Es el órgano responsable de formular el proyecto de inversión — elabora la ficha técnica o el estudio de preinversión.',
    fuente: 'Directiva N° 001-2019-EF/63.01',
  },
  {
    terminos: ['unidad productora'],
    definicion: 'Es el conjunto de recursos (infraestructura, equipos, personal) que provee actualmente el bien o servicio que el proyecto busca mejorar o ampliar.',
    fuente: 'Anexo 7 — Contenido mínimo del Perfil',
  },
  {
    terminos: ['van social', 'valor actual neto social'],
    definicion: 'Es el indicador principal de la metodología Costo-Beneficio: la diferencia entre beneficios y costos sociales, descontados a la Tasa Social de Descuento. Un VAN social positivo respalda la viabilidad del proyecto.',
    fuente: 'Anexo 7 — Contenido mínimo del Perfil',
  },
];

export interface RespuestaAsesor {
  texto: string;
  fuente?: string;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buscarEnGlosario(pregunta: string): RespuestaAsesor | null {
  const p = normalizar(pregunta);
  for (const entrada of glosario) {
    if (entrada.terminos.some((t) => p.includes(normalizar(t)))) {
      return { texto: entrada.definicion, fuente: entrada.fuente };
    }
  }
  return null;
}

export function buscarEnAyudas(pregunta: string, secciones: Seccion[]): RespuestaAsesor | null {
  const palabrasClave = normalizar(pregunta).split(' ').filter((w) => w.length > 3);
  if (palabrasClave.length === 0) return null;

  let mejor: { texto: string; fuente: string; score: number } | null = null;
  for (const seccion of secciones) {
    for (const sub of seccion.subsecciones) {
      if (!sub.ayuda?.trim()) continue;
      const texto = normalizar(sub.ayuda);
      const score = palabrasClave.reduce((acc, w) => acc + (texto.includes(w) ? 1 : 0), 0);
      if (score > 0 && (!mejor || score > mejor.score)) {
        mejor = { texto: sub.ayuda, fuente: `Ayuda de ${sub.codigo} — ${sub.nombre}`, score };
      }
    }
  }
  return mejor ? { texto: mejor.texto, fuente: mejor.fuente } : null;
}
