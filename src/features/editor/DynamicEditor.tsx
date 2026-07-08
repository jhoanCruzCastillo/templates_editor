import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import TableRow from './TableRow';
import { parseDynamicRows, newEmptyRow, getPeriodos, type FilaDinamica } from '../../lib/tableRowHelpers';
import type { ConfigTabla } from '../../types';

interface Props {
  config: ConfigTabla;
  value: string;
  onChange: (value: string) => void;
}

export default function DynamicEditor({ config, value, onChange }: Props) {
  const cols = config.columnas;
  const periodos = getPeriodos(config);
  const [rows, setRows] = useState<FilaDinamica[]>(() => parseDynamicRows(value, config));
  const persist = useCallback((next: FilaDinamica[]) => { setRows(next); onChange(JSON.stringify(next)); }, [onChange]);

  const updateCell = (ri: number, colId: string, val: string) =>
    persist(rows.map((r, i) => (i === ri ? { ...r, [colId]: val } : r)));

  const updatePeriodo = (ri: number, colId: string, pi: number, val: string) =>
    persist(rows.map((r, i) => {
      if (i !== ri) return r;
      const arr = Array.isArray(r[colId]) ? [...(r[colId] as string[])] : [];
      arr[pi] = val;
      return { ...r, [colId]: arr };
    }));

  const addRow = () => persist([...rows, newEmptyRow(config)]);
  const removeRow = (ri: number) => { if (rows.length > 1) persist(rows.filter((_, i) => i !== ri)); };

  return (
    <div className="mt-2">
      <div className="overflow-x-auto rounded-lg border border-brand-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-brand-50/40">
              {cols.map((col) => (
                <th key={col.id} className="px-2 py-1.5 text-left font-medium text-heading border-b border-brand-100 whitespace-nowrap text-[11px]">
                  {col.nombre}
                  {col.id === config.columnaDinamicaId && periodos.length > 0 && (
                    <span className="text-muted font-normal"> · ×{periodos.length} períodos</span>
                  )}
                </th>
              ))}
              <th className="w-8 border-b border-brand-100" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <TableRow
                key={ri}
                cols={cols}
                row={row}
                rowIndex={ri}
                periodos={periodos}
                columnaDinamicaId={config.columnaDinamicaId}
                onCellChange={(colId, val) => updateCell(ri, colId, val)}
                onPeriodoChange={(colId, pi, val) => updatePeriodo(ri, colId, pi, val)}
                onDelete={() => removeRow(ri)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={(e) => { e.stopPropagation(); addRow(); }}
        className="mt-1.5 w-full py-1.5 rounded-lg border border-dashed border-brand-200 text-[11px] font-medium text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1">
        <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" /> Agregar fila
      </button>
    </div>
  );
}
