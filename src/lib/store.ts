import { sectores as sectoresSeed } from '../data/sectores';
import { plantillas as plantillasSeed } from '../data/plantillas';
import { ejemplos as ejemplosSeed } from '../data/ejemplos';
import { actividadReciente as actividadSeed } from '../data/actividad';
import { usuarios } from '../data/usuarios';
import type { Sector, Plantilla, Ejemplo, ActividadReciente, Usuario, Sesion, CatalogoExcelPlantilla, ArchivoExcel } from '../types';
import type { DocumentoJSON } from './schemaExport';

const KEYS = {
  sectores: 'pf_sectores',
  plantillas: 'pf_plantillas',
  ejemplos: 'pf_ejemplos',
  actividad: 'pf_actividad',
  sesion: 'pf_sesion',
  initialized: 'pf_initialized',
  documentos: 'pf_documentos',
  excelCatalogo: 'pf_excel_catalogo',
  excelEjemplos: 'pf_excel_ejemplos',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function initStore() {
  // v9: tipos de columna de tabla alineados a los primitivos del esquema oficial
  const ver = localStorage.getItem(KEYS.initialized);
  if (!ver || ver < '9') {
    write(KEYS.sectores, sectoresSeed);
    write(KEYS.plantillas, plantillasSeed);
    write(KEYS.ejemplos, ejemplosSeed);
    write(KEYS.actividad, actividadSeed);
    localStorage.setItem(KEYS.initialized, '9');
  }
}

// --- Sectores ---

export function loadSectores(): Sector[] {
  return read<Sector[]>(KEYS.sectores, sectoresSeed);
}

export function saveSectores(data: Sector[]): void {
  write(KEYS.sectores, data);
}

// --- Plantillas ---

export function loadPlantillas(): Plantilla[] {
  return read<Plantilla[]>(KEYS.plantillas, plantillasSeed);
}

export function savePlantillas(data: Plantilla[]): void {
  write(KEYS.plantillas, data);
}

// --- Ejemplos ---

export function loadEjemplos(): Ejemplo[] {
  return read<Ejemplo[]>(KEYS.ejemplos, ejemplosSeed);
}

export function saveEjemplos(data: Ejemplo[]): void {
  write(KEYS.ejemplos, data);
}

// --- Actividad ---

export function loadActividad(): ActividadReciente[] {
  return read<ActividadReciente[]>(KEYS.actividad, actividadSeed);
}

export function saveActividad(data: ActividadReciente[]): void {
  write(KEYS.actividad, data);
}

// --- Documentos JSON exportados (esquema oficial) ---

export function loadDocumentos(): Record<string, DocumentoJSON> {
  return read<Record<string, DocumentoJSON>>(KEYS.documentos, {});
}

export function saveDocumentoJSON(clave: string, doc: DocumentoJSON): void {
  const all = loadDocumentos();
  all[clave] = doc;
  write(KEYS.documentos, all);
}

// --- Catálogo de archivos Excel por plantilla ---

export function loadCatalogosExcel(): Record<string, CatalogoExcelPlantilla> {
  return read<Record<string, CatalogoExcelPlantilla>>(KEYS.excelCatalogo, {});
}

export function saveCatalogosExcel(data: Record<string, CatalogoExcelPlantilla>): void {
  write(KEYS.excelCatalogo, data);
}

// --- Copia de archivo Excel por ejemplo (snapshot tomado al crear el ejemplo) ---

export function loadExcelEjemplos(): Record<string, ArchivoExcel> {
  return read<Record<string, ArchivoExcel>>(KEYS.excelEjemplos, {});
}

export function saveExcelEjemplos(data: Record<string, ArchivoExcel>): void {
  write(KEYS.excelEjemplos, data);
}

// --- Autenticación ---

export function findUsuario(usuario: string, password: string): Usuario | null {
  return (
    usuarios.find(
      (u) => u.usuario.toLowerCase() === usuario.trim().toLowerCase() && u.password === password,
    ) ?? null
  );
}

export function loadSesion(): Sesion | null {
  return read<Sesion | null>(KEYS.sesion, null);
}

export function saveSesion(sesion: Sesion): void {
  write(KEYS.sesion, sesion);
}

export function clearSesion(): void {
  localStorage.removeItem(KEYS.sesion);
}

export function generateId(): string {
  return crypto.randomUUID();
}
