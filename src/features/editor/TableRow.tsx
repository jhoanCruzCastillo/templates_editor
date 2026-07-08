import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { ColumnaTabla } from '../../types';
import type { FilaDinamica } from '../../lib/tableRowHelpers';

interface Props {
  cols: ColumnaTabla[];
  row: FilaDinamica;
  rowIndex: number;
  periodos: string[];
  columnaDinamicaId?: string;
  onCellChange: (colId: string, val: string) => void;
  onPeriodoChange: (colId: string, periodoIdx: number, val: string) => void;
  onDelete: () => void;
}

// Fila compartida entre DynamicEditor (sin agrupador) y GroupedRowsEditor (con agrupador)
export default function TableRow({ cols, row, rowIndex, periodos, columnaDinamicaId, onCellChange, onPeriodoChange, onDelete }: Props) {
  return (
    <tr className="border-b border-brand-50 last:border-0 group">
      {cols.map((col) => {
        if (col.tipo === 'auto_numerico') {
          return <td key={col.id} className="px-1 py-0.5"><span className="text-muted px-1">{rowIndex + 1}</span></td>;
        }
        if (col.id === columnaDinamicaId && periodos.length > 0) {
          const arr = Array.isArray(row[col.id]) ? (row[col.id] as string[]) : [];
          return (
            <td key={col.id} className="px-1 py-0.5">
              <div className="flex gap-1">
                {periodos.map((p, pi) => (
                  <input
                    key={pi}
                    type="text"
                    value={arr[pi] || ''}
                    title={p}
                    placeholder={p}
                    onChange={(e) => onPeriodoChange(col.id, pi, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-14 px-1 py-1 rounded border border-transparent hover:border-gray-200 focus:border-brand-300 text-xs text-heading focus:outline-none focus:ring-1 focus:ring-brand-500/30 bg-transparent"
                  />
                ))}
              </div>
            </td>
          );
        }
        return (
          <td key={col.id} className="px-1 py-0.5">
            <input
              type="text"
              value={(row[col.id] as string) || ''}
              onChange={(e) => onCellChange(col.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="—"
              className="w-full px-1.5 py-1 rounded border border-transparent hover:border-gray-200 focus:border-brand-300 text-xs text-heading focus:outline-none focus:ring-1 focus:ring-brand-500/30 bg-transparent"
            />
          </td>
        );
      })}
      <td className="px-1 py-0.5">
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-5 h-5 rounded flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity">
          <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
        </button>
      </td>
    </tr>
  );
}
