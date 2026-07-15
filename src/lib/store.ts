import { sectores as sectoresSeed } from '../data/sectores';
import { plantillas as plantillasSeed } from '../data/plantillas';
import { ejemplos as ejemplosSeed } from '../data/ejemplos';
import { actividadReciente as actividadSeed } from '../data/actividad';
import { usuarios as usuariosSeed } from '../data/usuarios';
import { mentoriasSeed } from '../data/mentorias';
import type { Sector, Plantilla, Ejemplo, ActividadReciente, Usuario, Sesion, CatalogoExcelPlantilla, ArchivoExcel, FacturacionMock, SesionMentoria } from '../types';
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
  usuarios: 'pf_usuarios',
  facturacion: 'pf_facturacion',
  mentorias: 'pf_mentorias',
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

// IDs de sectores/plantillas que vinieron del seed original (v9 y anteriores). Al reseedear, todo
// item existente cuyo id esté en esta lista se REEMPLAZA por la versión nueva del seed (así se
// pueden corregir datos de demo desactualizados) — cualquier otro item existente (creado por el
// propio usuario, con id generado por generateId()) se preserva tal cual.
const SEED_IDS_V9 = {
  sectores: ['sec-1', 'sec-2', 'sec-3', 'sec-4', 'sec-5', 'sec-6'],
  plantillas: [
    'plt-1', 'plt-2', 'plt-3', 'plt-fmt-5a', 'plt-fmt-5b', 'plt-fmt-7a',
    'plt-ioarr-7c-opt', 'plt-ioarr-7c-amp', 'plt-ioarr-7d-rep', 'plt-ioarr-7e-reh',
    'plt-4', 'plt-5', 'plt-perfil-1', 'plt-perfil-sal-1',
  ],
};

function reseedReplacingKnown<T extends { id: string }>(key: string, seed: T[], knownOldIds: string[]): void {
  const existingRaw = localStorage.getItem(key);
  const existing: T[] = existingRaw ? JSON.parse(existingRaw) : [];
  const known = new Set(knownOldIds);
  const seedIds = new Set(seed.map((s) => s.id));
  const preservados = existing.filter((item) => !known.has(item.id) && !seedIds.has(item.id));
  write(key, [...seed, ...preservados]);
}

// Ids de las fichas de demo del cliente "Juan Pérez" (usr-3) agregadas en v12 — se insertan si
// faltan aunque `pf_ejemplos` ya exista, sin tocar ninguna ficha real creada por un usuario.
const CLIENTE_DEMO_EJEMPLO_IDS = ['ej-demo-cliente-1', 'ej-demo-cliente-2', 'ej-demo-cliente-3', 'ej-demo-cliente-4'];

// Versión NUMÉRICA del seed — antes se comparaba como string ('10' < '9' es true léxicamente),
// lo que hubiera impedido reseedear correctamente al pasar de un dígito a dos.
// v14: se agrega el catálogo de sesiones de mentoría grupal (ventaja del plan Nivel 1+).
const SEED_VERSION = 14;

export function initStore() {
  // v10: sectores y plantillas alineados al catálogo real de fichas técnicas (ver memoria de
  // proyecto "Proyecto José Herrera") — se reemplazan los sectores/plantillas de demo (v9 y
  // anteriores) por la lista real, preservando cualquier sector/plantilla creado por el usuario.
  // v11: IOARR pasa de 4 plantillas (una por tipología, incorrecto) a 3 plantillas reales por
  // régimen (07-C, 07-D, 07-E) — las 4 tipologías son transversales/no excluyentes dentro de cada
  // documento, ver [[ioarr-tipologias-transversales]]. `Plantilla.tipologiaIoarr` (único) pasa a
  // `tipologiasIoarr` (array).
  // v12: se agregan 4 fichas de demo (mock) del cliente "Juan Pérez" para poblar "Mis fichas".
  // v13: plt-1 y plt-perfil-sal-1 se marcan `disponibleNivel0` (catálogo curado del plan Pedagógico).
  const ver = Number(localStorage.getItem(KEYS.initialized)) || 0;
  if (ver < SEED_VERSION) {
    reseedReplacingKnown(KEYS.sectores, sectoresSeed, SEED_IDS_V9.sectores);
    reseedReplacingKnown(KEYS.plantillas, plantillasSeed, SEED_IDS_V9.plantillas);
    if (!localStorage.getItem(KEYS.ejemplos)) {
      write(KEYS.ejemplos, ejemplosSeed);
    } else {
      const existentes = read<Ejemplo[]>(KEYS.ejemplos, []);
      const idsExistentes = new Set(existentes.map((e) => e.id));
      const nuevas = ejemplosSeed.filter((e) => CLIENTE_DEMO_EJEMPLO_IDS.includes(e.id) && !idsExistentes.has(e.id));
      if (nuevas.length) write(KEYS.ejemplos, [...existentes, ...nuevas]);
    }
    if (!localStorage.getItem(KEYS.actividad)) write(KEYS.actividad, actividadSeed);
    if (!localStorage.getItem(KEYS.usuarios)) write(KEYS.usuarios, usuariosSeed);
    if (!localStorage.getItem(KEYS.mentorias)) write(KEYS.mentorias, mentoriasSeed);
    localStorage.setItem(KEYS.initialized, String(SEED_VERSION));
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

// --- Usuarios ---

export function loadUsuarios(): Usuario[] {
  return read<Usuario[]>(KEYS.usuarios, usuariosSeed);
}

export function saveUsuarios(data: Usuario[]): void {
  write(KEYS.usuarios, data);
}

// --- Mentorías grupales ---

export function loadMentorias(): SesionMentoria[] {
  const data = read<SesionMentoria[]>(KEYS.mentorias, mentoriasSeed);
  // Compatibilidad con registros guardados antes de que existiera `linkReunion`.
  for (const sesion of data) {
    if (!sesion.linkReunion) {
      sesion.linkReunion = mentoriasSeed.find((m) => m.id === sesion.id)?.linkReunion ?? 'https://zoom.us/j/8123456789';
    }
  }
  return data;
}

export function saveMentorias(data: SesionMentoria[]): void {
  write(KEYS.mentorias, data);
}

// --- Facturación (datos de muestra — sin pasarela de pago real) ---

export function loadFacturacion(): Record<string, FacturacionMock> {
  const data = read<Record<string, FacturacionMock>>(KEYS.facturacion, {});
  // Compatibilidad con registros guardados antes de que existieran `planId`/`addons`/`metodoPago`.
  for (const registro of Object.values(data)) {
    if (!registro.planId) registro.planId = 'nivel-1';
    if (!registro.addons) registro.addons = {};
    if (!registro.metodoPago) registro.metodoPago = 'tarjeta';
  }
  return data;
}

export function saveFacturacion(data: Record<string, FacturacionMock>): void {
  write(KEYS.facturacion, data);
}

export function generarFacturacionDefault(): FacturacionMock {
  const hoy = new Date();
  const renovacion = new Date(hoy);
  renovacion.setMonth(renovacion.getMonth() + 1);
  const facturaMesPasado = new Date(hoy);
  facturaMesPasado.setMonth(facturaMesPasado.getMonth() - 1);
  const facturaDosMeses = new Date(hoy);
  facturaDosMeses.setMonth(facturaDosMeses.getMonth() - 2);

  return {
    planId: 'nivel-1',
    plan: 'Nivel 1 — Profesional',
    precio: '$150',
    periodicidad: 'Mensual',
    cancelada: false,
    fechaRenovacion: renovacion.toLocaleDateString('es-PE'),
    metodoPago: 'tarjeta',
    tarjetaMarca: 'Visa',
    tarjetaUltimos4: '4242',
    facturas: [
      { id: generateId(), fecha: facturaMesPasado.toLocaleDateString('es-PE'), total: '$150.00', estado: 'Pagado' },
      { id: generateId(), fecha: facturaDosMeses.toLocaleDateString('es-PE'), total: '$150.00', estado: 'Pagado' },
    ],
    addons: {},
  };
}

// --- Autenticación ---

export function findUsuario(usuario: string, password: string): Usuario | null {
  return (
    loadUsuarios().find(
      (u) =>
        u.usuario.toLowerCase() === usuario.trim().toLowerCase() &&
        u.password === password &&
        u.estado !== 'inactivo',
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
