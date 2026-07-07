import { sectores as sectoresSeed } from '../data/sectores';
import { plantillas as plantillasSeed } from '../data/plantillas';
import { ejemplos as ejemplosSeed } from '../data/ejemplos';
import { actividadReciente as actividadSeed } from '../data/actividad';
import { usuarios } from '../data/usuarios';
import type { Sector, Plantilla, Ejemplo, ActividadReciente, Usuario, Sesion } from '../types';

const KEYS = {
  sectores: 'pf_sectores',
  plantillas: 'pf_plantillas',
  ejemplos: 'pf_ejemplos',
  actividad: 'pf_actividad',
  sesion: 'pf_sesion',
  initialized: 'pf_initialized',
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
  // v7: categorías de instrumento (formato, ioarr, ficha_tecnica, perfil) + tipologías IOARR
  const ver = localStorage.getItem(KEYS.initialized);
  if (!ver || ver < '7') {
    write(KEYS.sectores, sectoresSeed);
    write(KEYS.plantillas, plantillasSeed);
    write(KEYS.ejemplos, ejemplosSeed);
    write(KEYS.actividad, actividadSeed);
    localStorage.setItem(KEYS.initialized, '7');
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
