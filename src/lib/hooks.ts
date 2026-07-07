import { useMemo } from 'react';
import { useAppContext } from './context';

export function useSectores() {
  const { sectores } = useAppContext();
  return sectores;
}

export function useSector(id: string) {
  const { sectores } = useAppContext();
  return useMemo(() => sectores.find((s) => s.id === id), [sectores, id]);
}

export function usePlantillasBySector(sectorId: string) {
  const { plantillas } = useAppContext();
  return useMemo(() => plantillas.filter((p) => p.sectorId === sectorId), [plantillas, sectorId]);
}

export function usePlantilla(id: string) {
  const { plantillas } = useAppContext();
  return useMemo(() => plantillas.find((p) => p.id === id), [plantillas, id]);
}

export function useEjemplos(plantillaId: string) {
  const { ejemplos } = useAppContext();
  return useMemo(() => ejemplos.filter((e) => e.plantillaId === plantillaId), [ejemplos, plantillaId]);
}

export function useActividadReciente() {
  const { actividad } = useAppContext();
  return actividad;
}

export function useMetricas() {
  const { getMetricas } = useAppContext();
  return useMemo(() => getMetricas(), [getMetricas]);
}
