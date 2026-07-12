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

function writeCampoTabla(wb: XLSX.WorkBook, hoja: string | undefined, config: ConfigTabla, raw: string) {
  const filaInicial = config.captura?.filaInicial;
  if (!hoja || !filaInicial) return;

  if (config.subtipo === 'jerarquica') {
    const roots = parseTree(raw, config.columnas.length);
    let row = filaInicial;
    const walk = (node: { value: string; children: unknown[] }, path: string[]) => {
      const values = [...path, node.value];
      if (node.children.length === 0) {
        values.forEach((v, i) => writeCell(wb, hoja, config.columnas[i]?.columnaExcel && `${config.columnas[i].columnaExcel}${row}`, v));
        row++;
      } else {
        (node.children as typeof node[]).forEach((c) => walk(c, values));
      }
    };
    roots.forEach((r) => walk(r, []));
    return;
  }

  const filas: FilaDinamica[] = config.agrupador
    ? parseGroupedRows(raw, config).flatMap((g) => g.filas)
    : parseDynamicRows(raw, config);
  const periodos = getPeriodos(config);

  let row = filaInicial;
  for (const fila of filas) {
    for (const col of config.columnas) {
      if (!col.columnaExcel) continue;
      if (col.id === config.columnaDinamicaId) {
        const arr = Array.isArray(fila[col.id]) ? (fila[col.id] as string[]) : [];
        periodos.forEach((_, i) => {
          const address = `${addCols(col.columnaExcel!, i * (col.abarcaColumnasExcel ?? 1))}${row}`;
          writeCell(wb, hoja, address, arr[i] ?? '');
        });
      } else {
        const v = fila[col.id];
        writeCell(wb, hoja, `${col.columnaExcel}${row}`, typeof v === 'string' ? v : '');
      }
    }
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
  const address = `${campo.captura.columna}${campo.captura.fila}`;
  writeCell(wb, hoja, address, coerceValor(campo.tipo, valores[campo.identificador]));
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
export async function insertarValoresEnExcel(dataUrl: string, plantilla: Plantilla, valores: Record<string, string>): Promise<string> {
  const res = await fetch(dataUrl);
  const buffer = await res.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  for (const seccion of plantilla.secciones) {
    for (const sub of seccion.subsecciones) {
      for (const campo of sub.campos) {
        writeCampo(wb, seccion.hoja, campo, valores);
      }
    }
  }

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return blobToDataUrl(blob);
}
