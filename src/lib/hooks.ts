import { useMemo } from 'react';
import { useAppContext } from './context';
import { generarFacturacionDefault } from './store';

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

export function useEjemplo(id: string) {
  const { ejemplos } = useAppContext();
  return useMemo(() => ejemplos.find((e) => e.id === id), [ejemplos, id]);
}

export function useCatalogoExcel(plantillaId: string) {
  const { excelCatalogos } = useAppContext();
  return useMemo(() => excelCatalogos[plantillaId] ?? { archivos: [] }, [excelCatalogos, plantillaId]);
}

export function useExcelEjemplo(ejemploId: string) {
  const { excelEjemplos } = useAppContext();
  return useMemo(() => excelEjemplos[ejemploId] ?? null, [excelEjemplos, ejemploId]);
}

export function useActividadReciente() {
  const { actividad } = useAppContext();
  return actividad;
}

export function useUsuarios() {
  const { usuarios } = useAppContext();
  return usuarios;
}

export function useFacturacion(usuarioId: string) {
  const { facturacion } = useAppContext();
  return useMemo(() => facturacion[usuarioId] ?? generarFacturacionDefault(), [facturacion, usuarioId]);
}

export function useMetricas() {
  const { getMetricas } = useAppContext();
  return useMemo(() => getMetricas(), [getMetricas]);
}
