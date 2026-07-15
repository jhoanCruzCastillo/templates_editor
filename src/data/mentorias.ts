import type { SesionMentoria } from '../types';

// Datos de muestra — prototipo sin integración real de video ni calendario; los enlaces no
// llevan a una reunión real. La grabación de la sesión pasada usa un video de muestra público
// (Big Buck Bunny, Creative Commons) solo para poder previsualizar el reproductor.
export const mentoriasSeed: SesionMentoria[] = [
  {
    id: 'ment-0',
    tema: 'Introducción a la formulación con el Formato 6A',
    mentor: 'Ing. Rocío Salazar',
    fechaISO: '2026-07-10T18:00:00',
    cuposTotales: 12,
    inscritos: ['usr-3'],
    linkReunion: 'https://zoom.us/j/8123456788',
    grabacionUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    preguntas: [
      {
        id: 'preg-1',
        usuarioId: 'usr-3',
        pregunta: '¿Esto aplica también para proyectos de agua y saneamiento?',
        fechaPregunta: '2026-07-10T19:10:00',
        respuesta: 'Sí, la misma lógica de brecha aplica — solo cambia el indicador de producto según el sector.',
        fechaRespuesta: '2026-07-11T09:00:00',
      },
    ],
  },
  {
    id: 'ment-1',
    tema: 'Cómo armar el árbol de causas-efectos',
    mentor: 'Ing. Rocío Salazar',
    fechaISO: '2026-07-17T18:00:00',
    cuposTotales: 12,
    inscritos: [],
    linkReunion: 'https://zoom.us/j/8123456789',
    preguntas: [],
  },
  {
    id: 'ment-2',
    tema: 'Brecha de servicio: demanda, oferta y proyección',
    mentor: 'Ing. Rocío Salazar',
    fechaISO: '2026-07-21T19:00:00',
    cuposTotales: 15,
    inscritos: [],
    linkReunion: 'https://meet.google.com/abc-defg-hij',
    preguntas: [],
  },
  {
    id: 'ment-3',
    tema: 'Costos y cronograma en el Excel del Formato 6A',
    mentor: 'Econ. Luis Farfán',
    fechaISO: '2026-07-24T18:30:00',
    cuposTotales: 10,
    inscritos: [],
    linkReunion: 'https://zoom.us/j/8123456790',
    preguntas: [],
  },
  {
    id: 'ment-4',
    tema: 'Preguntas y respuestas: dudas generales de formulación',
    mentor: 'Ing. Rocío Salazar',
    fechaISO: '2026-07-29T18:00:00',
    cuposTotales: 20,
    inscritos: [],
    linkReunion: 'https://meet.google.com/xyz-uvwq-rst',
    preguntas: [],
  },
];
