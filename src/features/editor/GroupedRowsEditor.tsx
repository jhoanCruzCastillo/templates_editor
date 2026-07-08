import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import TableRow from './TableRow';
import { parseGroupedRows, newEmptyRow, getPeriodos, type GrupoFilas } from '../../lib/tableRowHelpers';
import type { ConfigTabla } from '../../types';

interface Props {
  config: ConfigTabla;
  value: string;
  onChange: (value: string) => void;
}

// Filas planas agrupadas bajo un encabezado de grupo (config.agrupador === true)
export default function GroupedRowsEditor({ config, value, onChange }: Props) {
  const cols = config.columnas;
  const periodos = getPeriodos(config);
  const [grupos, setGrupos] = useState<GrupoFilas[]>(() => parseGroupedRows(value, config));
  const persist = useCallback((next: GrupoFilas[]) => { setGrupos(next); onChange(JSON.stringify(next)); }, [onChange]);

  const updateGrupoNombre = (gi: number, nombre: string) =>
    persist(grupos.map((g, i) => (i === gi ? { ...g, grupo: nombre } : g)));

  const updateCell = (gi: number, ri: number, colId: string, val: string) =>
    persist(grupos.map((g, i) => (i !== gi ? g : { ...g, filas: g.filas.map((r, j) => (j === ri ? { ...r, [colId]: val } : r)) })));

  const updatePeriodo = (gi: number, ri: number, colId: string, pi: number, val: string) =>
    persist(grupos.map((g, i) => {
      if (i !== gi) return g;
      return {
        ...g,
        filas: g.filas.map((r, j) => {
          if (j !== ri) return r;
          const arr = Array.isArray(r[colId]) ? [...(r[colId] as string[])] : [];
          arr[pi] = val;
          return { ...r, [colId]: arr };
        }),
      };
    }));

  const addRow = (gi: number) => persist(grupos.map((g, i) => (i === gi ? { ...g, filas: [...g.filas, newEmptyRow(config)] } : g)));
  const removeRow = (gi: number, ri: number) =>
    persist(grupos.map((g, i) => (i !== gi ? g : { ...g, filas: g.filas.length > 1 ? g.filas.filter((_, j) => j !== ri) : g.filas })));
  const addGrupo = () => persist([...grupos, { grupo: `Grupo ${grupos.length + 1}`, filas: [newEmptyRow(config)] }]);
  const removeGrupo = (gi: number) => { if (grupos.length > 1) persist(grupos.filter((_, i) => i !== gi)); };

  return (
    <div className="mt-2 space-y-3">
      {grupos.map((grupo, gi) => (
        <div key={gi} className="rounded-lg border border-brand-200 overflow-hidden">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-brand-50/60 border-b border-brand-100">
            <input
              type="text"
              value={grupo.grupo}
              onChange={(e) => updateGrupoNombre(gi, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Nombre del grupo…"
              className="flex-1 px-1.5 py-0.5 rounded border border-transparent hover:border-gray-200 focus:border-brand-300 text-xs font-semibold uppercase tracking-wide text-heading focus:outline-none bg-transparent"
            />
            {grupos.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); removeGrupo(gi); }} className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-brand-50/20">
                {cols.map((col) => (
                  <th key={col.id} className="px-2 py-1 text-left font-medium text-heading border-b border-brand-100 whitespace-nowrap text-[11px]">
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
              {grupo.filas.map((row, ri) => (
                <TableRow
                  key={ri}
                  cols={cols}
                  row={row}
                  rowIndex={ri}
                  periodos={periodos}
                  columnaDinamicaId={config.columnaDinamicaId}
                  onCellChange={(colId, val) => updateCell(gi, ri, colId, val)}
                  onPeriodoChange={(colId, pi, val) => updatePeriodo(gi, ri, colId, pi, val)}
                  onDelete={() => removeRow(gi, ri)}
                />
              ))}
            </tbody>
          </table>
          <button onClick={(e) => { e.stopPropagation(); addRow(gi); }}
            className="w-full py-1 text-[10px] font-medium text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1">
            <FontAwesomeIcon icon={faPlus} className="w-2 h-2" /> Agregar fila
          </button>
        </div>
      ))}
      <button onClick={(e) => { e.stopPropagation(); addGrupo(); }}
        className="w-full py-1.5 rounded-lg border border-dashed border-brand-200 text-[11px] font-medium text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1">
        <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" /> Agregar grupo
      </button>
    </div>
  );
}
