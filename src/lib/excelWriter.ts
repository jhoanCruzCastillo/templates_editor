import * as XLSX from 'xlsx';
import { parseDynamicRows, parseGroupedRows, parseTree, getPeriodos, type FilaDinamica } from './tableRowHelpers';
import type { Plantilla, Campo, ConfigTabla, TipoCampo } from '../types';

// --- Aritmética de columnas Excel (A, B, ..., Z, AA, AB, ...) ---

function colLetterToIndex(letter: string): number {
  let n = 0;
  for (const ch of letter.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function colIndexToLetter(n: number): string {
  let s = '';
  let i = n;
  while (i > 0) {
    const rem = (i - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

function addCols(letter: string, delta: number): string {
  return colIndexToLetter(colLetterToIndex(letter) + delta);
}

function coerceValor(tipo: TipoCampo, raw: string | undefined): string | number | boolean {
  if (raw == null || raw === '') return '';
  if (tipo === 'numero' || tipo === 'decimal') {
    const n = Number(raw);
    return Number.isNaN(n) ? '' : n;
  }
  if (tipo === 'booleano') return raw === 'true';
  return raw;
}

function getOrCreateSheet(wb: XLSX.WorkBook, hoja: string): XLSX.WorkSheet {
  let ws = wb.Sheets[hoja];
  if (!ws) {
    ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, hoja);
  }
  return ws;
}

function writeCell(wb: XLSX.WorkBook, hoja: string | undefined, address: string | undefined, value: string | number | boolean) {
  if (!hoja || !address) return;
  const ws = getOrCreateSheet(wb, hoja);
  XLSX.utils.sheet_add_aoa(ws, [[value]], { origin: address });
}

// Fusiona un rango de celdas (ej. la fila de título de un grupo abarcando varias columnas).
function mergeRange(wb: XLSX.WorkBook, hoja: string | undefined, range: string) {
  if (!hoja) return;
  const ws = getOrCreateSheet(wb, hoja);
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push(XLSX.utils.decode_range(range));
}

// Escribe un valor y, si abarca más de una columna o fila, fusiona la celda combinada
// correspondiente — así los datos quedan alineados con el ancho configurado de la columna
// (o del campo), igual que la cabecera.
function writeCellSpan(
  wb: XLSX.WorkBook,
  hoja: string | undefined,
  columna: string | undefined,
  fila: number | undefined,
  value: string | number | boolean,
  abarcaColumnas = 1,
  abarcaFilas = 1,
) {
  if (!hoja || !columna || !fila) return;
  const address = `${columna}${fila}`;
  writeCell(wb, hoja, address, value);
  if (abarcaColumnas > 1 || abarcaFilas > 1) {
    const endCol = abarcaColumnas > 1 ? addCols(columna, abarcaColumnas - 1) : columna;
    const endRow = fila + Math.max(abarcaFilas, 1) - 1;
    mergeRange(wb, hoja, `${address}:${endCol}${endRow}`);
  }
}

// Cantidad de columnas realmente ocupadas por la tabla (la columna dinámica cuenta como una por período).
function totalColumnasTabla(config: ConfigTabla, periodos: string[]): number {
  return config.columnas.reduce((sum, c) => sum + (c.id === config.columnaDinamicaId && periodos.length > 0 ? periodos.length : 1), 0);
}

function writeFilaColumnas(wb: XLSX.WorkBook, hoja: string | undefined, config: ConfigTabla, fila: FilaDinamica, row: number, periodos: string[]) {
  for (const col of config.columnas) {
    if (!col.columnaExcel) continue;
    if (col.id === config.columnaDinamicaId) {
      const arr = Array.isArray(fila[col.id]) ? (fila[col.id] as string[]) : [];
      periodos.forEach((_, i) => {
        const colLetter = addCols(col.columnaExcel!, i * (col.abarcaColumnasExcel ?? 1));
        writeCellSpan(wb, hoja, colLetter, row, arr[i] ?? '', col.abarcaColumnasExcel ?? 1);
      });
    } else {
      const v = fila[col.id];
      writeCellSpan(wb, hoja, col.columnaExcel, row, typeof v === 'string' ? v : '', col.abarcaColumnasExcel ?? 1);
    }
  }
}

function writeCampoTabla(wb: XLSX.WorkBook, hoja: string | undefined, config: ConfigTabla, raw: string) {
  const filaInicial = config.captura?.filaInicial;
  if (!hoja || !filaInicial) return;

  if (config.subtipo === 'jerarquica') {
    const roots = parseTree(raw, config.columnas.length);
    let row = filaInicial;
    const walk = (node: { value: string; children: unknown[] }, path: string[]) => {
      const values = [...path, node.value];
      if (node.children.length === 0) {
        values.forEach((v, i) => {
          const col = config.columnas[i];
          if (col?.columnaExcel) writeCellSpan(wb, hoja, col.columnaExcel, row, v, col.abarcaColumnasExcel ?? 1);
        });
        row++;
      } else {
        (node.children as typeof node[]).forEach((c) => walk(c, values));
      }
    };
    roots.forEach((r) => walk(r, []));
    return;
  }

  const periodos = getPeriodos(config);

  if (config.agrupador) {
    const grupos = parseGroupedRows(raw, config);
    const columnaInicial = config.captura?.columnaInicial ?? config.columnas[0]?.columnaExcel;
    const totalCols = totalColumnasTabla(config, periodos);
    const abarca = Math.min(config.agrupadorAbarcaColumnas ?? totalCols, totalCols);

    let row = filaInicial;
    for (const grupo of grupos) {
      if (columnaInicial) {
        writeCell(wb, hoja, `${columnaInicial}${row}`, grupo.grupo);
        if (abarca > 1) mergeRange(wb, hoja, `${columnaInicial}${row}:${addCols(columnaInicial, abarca - 1)}${row}`);
      }
      row++;
      for (const fila of grupo.filas) {
        writeFilaColumnas(wb, hoja, config, fila, row, periodos);
        row++;
      }
    }
    return;
  }

  const filas = parseDynamicRows(raw, config);
  let row = filaInicial;
  for (const fila of filas) {
    writeFilaColumnas(wb, hoja, config, fila, row, periodos);
    row++;
  }
}

function writeCampo(wb: XLSX.WorkBook, hoja: string | undefined, campo: Campo, valores: Record<string, string>) {
  const esTabla = campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica';
  if (esTabla) {
    if (campo.configTabla) writeCampoTabla(wb, hoja, campo.configTabla, valores[campo.identificador] ?? '');
    return;
  }
  if (!campo.captura?.columna || !campo.captura.fila) return;
  writeCellSpan(
    wb, hoja, campo.captura.columna, campo.captura.fila,
    coerceValor(campo.tipo, valores[campo.identificador]),
    campo.captura.abarcaColumnas ?? 1, campo.captura.abarcaFilas ?? 1,
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('No se pudo generar el archivo'));
    reader.readAsDataURL(blob);
  });
}

// Inserta los valores de un ejemplo en el Excel asignado, ubicando cada campo según su
// `captura` (columna/fila) — o, para campos tabla, según `configTabla.captura` + `columnaExcel`
// por columna. Devuelve una nueva data URL con el archivo modificado (siempre .xlsx).
// `onProgress` (0 a 1) se reporta a medida que se escribe cada campo, cediendo el hilo
// principal entre lotes para que la barra de carga se repinte con progreso real.
export async function insertarValoresEnExcel(
  dataUrl: string,
  plantilla: Plantilla,
  valores: Record<string, string>,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const res = await fetch(dataUrl);
  const buffer = await res.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const tareas: { hoja: string | undefined; campo: Campo }[] = [];
  for (const seccion of plantilla.secciones) {
    for (const sub of seccion.subsecciones) {
      for (const campo of sub.campos) {
        tareas.push({ hoja: seccion.hoja, campo });
      }
    }
  }

  const total = tareas.length || 1;
  const loteSize = Math.max(1, Math.ceil(total / 30)); // ~30 repintados como máximo
  for (let i = 0; i < tareas.length; i++) {
    const { hoja, campo } = tareas[i];
    writeCampo(wb, hoja, campo, valores);
    if ((i + 1) % loteSize === 0 || i === tareas.length - 1) {
      onProgress?.((i + 1) / total);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return blobToDataUrl(blob);
}
