import { planes } from '../data/planes';
import type { FacturacionMock } from '../types';

const SEMANAS_ENTRENAMIENTO = 4;
const DIAS_ENTRENAMIENTO = SEMANAS_ENTRENAMIENTO * 7;

export function numeroNivelDe(planId: string): number {
  return planes.find((p) => p.id === planId)?.numeroNivel ?? 1;
}

export function esPlanEntrenamiento(planId: string): boolean {
  return numeroNivelDe(planId) === 0;
}

// Cupo de fichas simultáneas: ejercicios de práctica en Nivel 0, proyectos reales en Nivel 1+.
// El add-on "Plantilla adicional" (nivelesDisponibles: [1,2]) solo aplica fuera del Nivel 0 —
// el plan de entrenamiento no vende cupos extra, ver features de `planes.ts`.
export function limiteFichasSimultaneas(facturacion: FacturacionMock): number {
  const plan = planes.find((p) => p.id === facturacion.planId);
  const base = plan?.limiteFichasBase ?? 3;
  const extra = esPlanEntrenamiento(facturacion.planId) ? 0 : (facturacion.addons?.['plantilla-adicional'] ?? 0);
  return base + extra;
}

function fechaVencimiento(fechaInicioPlan: string): Date {
  const venc = new Date(fechaInicioPlan);
  venc.setDate(venc.getDate() + DIAS_ENTRENAMIENTO);
  return venc;
}

export function entrenamientoVencido(facturacion: FacturacionMock): boolean {
  if (!esPlanEntrenamiento(facturacion.planId) || !facturacion.fechaInicioPlan) return false;
  return Date.now() > fechaVencimiento(facturacion.fechaInicioPlan).getTime();
}

export function diasRestantesEntrenamiento(facturacion: FacturacionMock): number {
  if (!facturacion.fechaInicioPlan) return DIAS_ENTRENAMIENTO;
  const restante = fechaVencimiento(facturacion.fechaInicioPlan).getTime() - Date.now();
  return Math.max(0, Math.ceil(restante / (1000 * 60 * 60 * 24)));
}

// Mentorías grupales en línea: ventaja de los planes Nivel 1 (Profesional) y Nivel 2 (Premium).
export const NIVEL_MENTORIAS = 1;
export function puedeAccederMentorias(numeroNivel: number): boolean {
  return numeroNivel >= NIVEL_MENTORIAS;
}
