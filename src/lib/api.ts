import { sectores as sectoresMock } from '../data/sectores';
import { plantillas as plantillasMock } from '../data/plantillas';
import { ejemplos as ejemplosMock } from '../data/ejemplos';
import { actividadReciente as actividadMock } from '../data/actividad';
import type { Sector, Plantilla, Ejemplo, ActividadReciente } from '../types';

// Capa de acceso a datos.
// Hoy devuelve mocks; para conectar con el backend real (CodeIgniter),
// reemplazar cada función por un fetch() a la API REST correspondiente.

export function getSectores(): Sector[] {
  return sectoresMock;
}

export function getSectorById(id: string): Sector | undefined {
  return sectoresMock.find((s) => s.id === id);
}

export function getPlantillasBySector(sectorId: string): Plantilla[] {
  return plantillasMock.filter((p) => p.sectorId === sectorId);
}

export function getPlantillaById(id: string): Plantilla | undefined {
  return plantillasMock.find((p) => p.id === id);
}

export function getEjemplosByPlantilla(plantillaId: string): Ejemplo[] {
  return ejemplosMock.filter((e) => e.plantillaId === plantillaId);
}

export function getActividadReciente(): ActividadReciente[] {
  return actividadMock;
}

export function getMetricas() {
  const totalSectores = sectoresMock.filter((s) => s.activo).length;
  const totalPlantillas = sectoresMock.reduce((sum, s) => sum + s.cantidadPlantillas, 0);
  const totalEjemplos = sectoresMock.reduce((sum, s) => sum + s.cantidadEjemplos, 0);
  return { totalSectores, totalPlantillas, totalEjemplos };
}
