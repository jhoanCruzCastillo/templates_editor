import type { ConfigTabla } from '../types';

export interface FilaDinamica { [colId: string]: string | string[] }
export interface GrupoFilas { grupo: string; filas: FilaDinamica[] }

export interface TreeNode {
  value: string;
  children: TreeNode[];
}

/** Lista editable de nombres de las columnas dinámicas generadas (ej. años, tareas, alternativas...) */
export function getPeriodos(config: ConfigTabla): string[] {
  return config.periodos ?? [];
}

function emptyRow(config: ConfigTabla): FilaDinamica {
  const row: FilaDinamica = {};
  if (config.columnaDinamicaId) row[config.columnaDinamicaId] = getPeriodos(config).map(() => '');
  return row;
}

export function newEmptyRow(config: ConfigTabla): FilaDinamica {
  return emptyRow(config);
}

export function parseDynamicRows(value: string, config: ConfigTabla): FilaDinamica[] {
  try {
    const p = JSON.parse(value);
    if (Array.isArray(p) && (p.length === 0 || (!('value' in p[0]) && !('filas' in p[0])))) return p;
  } catch { /* valor previo no es JSON (placeholder viejo) */ }
  return Array.from({ length: config.filasIniciales ?? 3 }, () => emptyRow(config));
}

export function parseGroupedRows(value: string, config: ConfigTabla): GrupoFilas[] {
  try {
    const p = JSON.parse(value);
    if (Array.isArray(p) && p.length > 0 && 'filas' in p[0]) return p;
  } catch { /* valor previo no es JSON (placeholder viejo) */ }
  return [{ grupo: 'Grupo 1', filas: Array.from({ length: config.filasIniciales ?? 3 }, () => emptyRow(config)) }];
}

export function createNodeChain(remainingLevels: number): TreeNode {
  if (remainingLevels <= 1) return { value: '', children: [] };
  return { value: '', children: [createNodeChain(remainingLevels - 1)] };
}

export function parseTree(value: string, numCols: number): TreeNode[] {
  try {
    const p = JSON.parse(value);
    if (Array.isArray(p) && p.length > 0 && 'value' in p[0]) return p;
  } catch { /* valor previo no es JSON (placeholder viejo) */ }
  return [createNodeChain(numCols)];
}
