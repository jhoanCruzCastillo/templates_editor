import { useMemo } from 'react';
import { useAppContext } from './context';
import { useAuth } from './auth';
import { generarFacturacionDefault } from './store';
import { cuentaEfectivaDe } from './permisos';
import { esPlanEntrenamiento, entrenamientoVencido, diasRestantesEntrenamiento, limiteFichasSimultaneas, numeroNivelDe } from './planAcceso';

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

export function usePlantillas() {
  const { plantillas } = useAppContext();
  return plantillas;
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

export function useMentorias() {
  const { mentorias } = useAppContext();
  return mentorias;
}

export function useHistorialCambios() {
  const { historialCambios } = useAppContext();
  return historialCambios;
}

export function useHistorialFicha(ejemploId: string) {
  const { historialCambios } = useAppContext();
  return useMemo(() => historialCambios.filter((c) => c.ejemploId === ejemploId), [historialCambios, ejemploId]);
}

export function useMetricas() {
  const { getMetricas } = useAppContext();
  return useMemo(() => getMetricas(), [getMetricas]);
}

// Estado del plan del cliente/colaborador en sesión (nivel, vigencia del Nivel 0, cupo de fichas
// simultáneas) — la facturación vive bajo la cuenta del titular, no de cada colaborador (ver
// cuentaEfectivaDe).
export function useEstadoEntrenamiento() {
  const { usuarios } = useAppContext();
  const { sesion } = useAuth();
  const cuentaId = sesion ? cuentaEfectivaDe(usuarios, sesion) : '';
  const facturacion = useFacturacion(cuentaId);
  return useMemo(() => ({
    numeroNivel: numeroNivelDe(facturacion.planId),
    esNivel0: esPlanEntrenamiento(facturacion.planId),
    vencido: entrenamientoVencido(facturacion),
    diasRestantes: diasRestantesEntrenamiento(facturacion),
    limiteFichas: limiteFichasSimultaneas(facturacion),
  }), [facturacion]);
}
