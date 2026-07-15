import type { SesionMentoria } from '../types';

// Datos de muestra — prototipo sin integración real de video ni calendario; los enlaces no
// llevan a una reunión real.
export const mentoriasSeed: SesionMentoria[] = [
  {
    id: 'ment-1',
    tema: 'Cómo armar el árbol de causas-efectos',
    mentor: 'Ing. Rocío Salazar',
    fechaISO: '2026-07-17T18:00:00',
    cuposTotales: 12,
    inscritos: [],
    linkReunion: 'https://zoom.us/j/8123456789',
  },
  {
    id: 'ment-2',
    tema: 'Brecha de servicio: demanda, oferta y proyección',
    mentor: 'Ing. Rocío Salazar',
    fechaISO: '2026-07-21T19:00:00',
    cuposTotales: 15,
    inscritos: [],
    linkReunion: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'ment-3',
    tema: 'Costos y cronograma en el Excel del Formato 6A',
    mentor: 'Econ. Luis Farfán',
    fechaISO: '2026-07-24T18:30:00',
    cuposTotales: 10,
    inscritos: [],
    linkReunion: 'https://zoom.us/j/8123456790',
  },
  {
    id: 'ment-4',
    tema: 'Preguntas y respuestas: dudas generales de formulación',
    mentor: 'Ing. Rocío Salazar',
    fechaISO: '2026-07-29T18:00:00',
    cuposTotales: 20,
    inscritos: [],
    linkReunion: 'https://meet.google.com/xyz-uvwq-rst',
  },
];
