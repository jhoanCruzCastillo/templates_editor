import { Fragment, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import TableRow from './TableRow';
import TableHeaderRow from './TableHeaderRow';
import { parseGroupedRows, newEmptyRow, getPeriodos, type GrupoFilas } from '../../lib/tableRowHelpers';
import type { ConfigTabla, CabeceraGrupo } from '../../types';

interface Props {
  config: ConfigTabla;
  value: string;
  onChange: (value: string) => void;
  /** Cuando se puede editar la estructura de la tabla desde este preview (solo tab Estructura) — permite agregar columnas dinámicas */
  onConfigChange?: (config: ConfigTabla) => void;
}

// Filas planas agrupadas bajo un encabezado de grupo (config.agrupador === true). Renderiza UNA
// sola tabla: el encabezado de columnas una vez arriba, y cada grupo como una fila de título
// fusionada (abarca `config.agrupadorAbarcaColumnas` columnas, contando desde la primera) seguida
// de sus filas de datos — igual que en el Excel real, en vez de repetir el encabezado por grupo.
export default function GroupedRowsEditor({ config, value, onChange, onConfigChange }: Props) {
  const cols = config.columnas;
  const periodos = getPeriodos(config);
  const [grupos, setGrupos] = useState<GrupoFilas[]>(() => parseGroupedRows(value, config));
  const persist = useCallback((next: GrupoFilas[]) => { setGrupos(next); onChange(JSON.stringify(next)); }, [onChange]);
  const addPeriodo = () => onConfigChange?.({ ...config, periodos: [...periodos, ''] });
  const renamePeriodo = (i: number, val: string) => {
    const next = [...periodos];
    next[i] = val;
    onConfigChange?.({ ...config, periodos: next });
  };
  const renameGrupoCabecera = (grupo: CabeceraGrupo, titulo: string) =>
    onConfigChange?.({ ...config, cabeceras: (config.cabeceras ?? []).map((g) => (g === grupo ? { ...g, titulo } : g)) });

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

  // Total de columnas realmente renderizadas en el encabezado (la columna dinámica se expande en
  // una por período), para calcular cuántas quedan sueltas a la derecha de la fila de grupo.
  const totalCols = cols.reduce((sum, c) => sum + (c.id === config.columnaDinamicaId && periodos.length > 0 ? periodos.length : 1), 0);
  const abarca = Math.min(config.agrupadorAbarcaColumnas ?? totalCols, totalCols);
  const restCols = totalCols - abarca;

  return (
    <div className="mt-2">
      <div className="overflow-x-auto rounded-lg border border-brand-200">
        <table className="w-full text-xs">
          <thead>
            <TableHeaderRow
              cols={cols}
              periodos={periodos}
              columnaDinamicaId={config.columnaDinamicaId}
              cabeceras={config.cabeceras}
              onRenamePeriodo={onConfigChange ? renamePeriodo : undefined}
              onAddPeriodo={onConfigChange && config.columnaDinamicaId ? addPeriodo : undefined}
              onRenameGrupo={onConfigChange ? renameGrupoCabecera : undefined}
            />
          </thead>
          <tbody>
            {grupos.map((grupo, gi) => (
              <Fragment key={gi}>
                <tr className="bg-brand-50/60 border-t-2 border-brand-200">
                  <td colSpan={abarca} className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={grupo.grupo}
                        onChange={(e) => updateGrupoNombre(gi, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Nombre del grupo…"
                        className="flex-1 min-w-0 px-1.5 py-0.5 rounded border border-transparent hover:border-gray-200 focus:border-brand-300 text-xs font-semibold uppercase tracking-wide text-heading focus:outline-none bg-transparent"
                      />
                      {grupos.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); removeGrupo(gi); }} className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors shrink-0">
                          <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  {restCols > 0 && <td colSpan={restCols} className="bg-brand-50/60" />}
                  <td className="bg-brand-50/60" />
                </tr>
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
                <tr>
                  <td colSpan={totalCols + 1} className="px-1 py-1">
                    <button onClick={(e) => { e.stopPropagation(); addRow(gi); }}
                      className="w-full py-1 text-[10px] font-medium text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1">
                      <FontAwesomeIcon icon={faPlus} className="w-2 h-2" /> Agregar fila
                    </button>
                  </td>
                </tr>
              </Fragment>
            ))}
            <tr>
              <td colSpan={totalCols + 1} className="px-1 py-1.5 border-t border-brand-100">
                <button onClick={(e) => { e.stopPropagation(); addGrupo(); }}
                  className="w-full py-1.5 rounded-lg border border-dashed border-brand-200 text-[11px] font-medium text-brand-600 hover:bg-brand-50 transition-colors flex items-center justify-center gap-1">
                  <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" /> Agregar grupo
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
