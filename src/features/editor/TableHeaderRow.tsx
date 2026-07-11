import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import type { ColumnaTabla, CabeceraGrupo } from '../../types';

interface Props {
  cols: ColumnaTabla[];
  periodos: string[];
  columnaDinamicaId?: string;
  /** Grupos de cabecera (título común sobre varias columnas), igual que en MatrizPeriodosEditor */
  cabeceras?: CabeceraGrupo[];
  /** Si se pasa, los nombres de columna dinámica se vuelven editables inline (solo tab Estructura) */
  onRenamePeriodo?: (index: number, value: string) => void;
  /** Si se pasa, aparece un botón "+" al lado derecho de la última columna dinámica */
  onAddPeriodo?: () => void;
  /** Si se pasa, el título de cada cabecera se vuelve editable inline */
  onRenameGrupo?: (grupo: CabeceraGrupo, titulo: string) => void;
}

// Id reservado (esquema oficial) que representa a la columna dinámica completa como una sola
// unidad al momento de agruparla bajo una cabecera — debe coincidir con el usado en MatrizPeriodosEditor.
const DINAMICA_SENTINEL = 'columnas_dinamicas';

function renderCol(
  col: ColumnaTabla,
  periodos: string[],
  columnaDinamicaId: string | undefined,
  onRenamePeriodo: Props['onRenamePeriodo'],
  onAddPeriodo: Props['onAddPeriodo'],
) {
  if (col.id === columnaDinamicaId && periodos.length > 0) {
    return periodos.map((p, pi) => {
      const isLast = pi === periodos.length - 1;
      return (
        <th key={`${col.id}-${pi}`} className="px-1.5 py-1.5 text-left font-medium text-heading border-b border-amber-300 bg-amber-50 whitespace-nowrap text-[11px]">
          <div className="flex items-center gap-1">
            {onRenamePeriodo ? (
              <input
                type="text"
                value={p}
                onChange={(e) => onRenamePeriodo(pi, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Nombre..."
                className="w-14 px-1 py-0.5 rounded border border-amber-300 bg-white text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
              />
            ) : (
              <span className="underline decoration-amber-400">{p}</span>
            )}
            {isLast && onAddPeriodo && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddPeriodo(); }}
                title="Agregar columna dinámica"
                className="w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0"
              >
                <FontAwesomeIcon icon={faPlus} className="w-2 h-2" />
              </button>
            )}
          </div>
        </th>
      );
    });
  }
  return (
    <th key={col.id} className="px-2 py-1.5 text-left font-medium text-heading border-b border-brand-100 whitespace-nowrap text-[11px]">
      {col.nombre}
    </th>
  );
}

// Encabezado compartido entre DynamicEditor y GroupedRowsEditor.
// La columna dinámica se expande en una celda de encabezado por período (subrayada, resaltada en ámbar).
// Si hay cabeceras (agrupación de columnas bajo un título común), se agrega una fila superior con
// colSpan por grupo, igual que en el editor de columnas.
export default function TableHeaderRow({ cols, periodos, columnaDinamicaId, cabeceras, onRenamePeriodo, onAddPeriodo, onRenameGrupo }: Props) {
  const grupos = cabeceras ?? [];

  if (grupos.length === 0) {
    return (
      <tr className="bg-brand-50/40">
        {cols.map((col) => renderCol(col, periodos, columnaDinamicaId, onRenamePeriodo, onAddPeriodo))}
        <th className="w-8 border-b border-brand-100" />
      </tr>
    );
  }

  const keyOf = (col: ColumnaTabla) => (col.id === columnaDinamicaId ? DINAMICA_SENTINEL : col.id);
  const grupoForKey = (key: string) => grupos.find((g) => g.hijoIds.includes(key));

  const runs: { grupo?: CabeceraGrupo; cols: ColumnaTabla[] }[] = [];
  for (const col of cols) {
    const g = grupoForKey(keyOf(col));
    const last = runs[runs.length - 1];
    if (last && g && last.grupo === g) last.cols.push(col);
    else runs.push({ grupo: g, cols: [col] });
  }

  return (
    <>
      <tr className="bg-indigo-50">
        {runs.map((run, ri) => {
          const span = run.cols.reduce((s, c) => s + (c.id === columnaDinamicaId ? Math.max(periodos.length, 1) : 1), 0);
          if (run.grupo) {
            const grupo = run.grupo;
            return (
              <th key={`grp-${ri}`} colSpan={span} className="px-2 py-1.5 text-center font-semibold text-indigo-700 border-2 border-indigo-400 bg-indigo-100 whitespace-nowrap text-[11px]">
                {onRenameGrupo ? (
                  <input
                    type="text"
                    value={grupo.titulo}
                    onChange={(e) => onRenameGrupo(grupo, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Sin título"
                    className="w-full text-center bg-transparent border-b border-transparent hover:border-indigo-300 focus:border-indigo-500 focus:outline-none text-[11px] font-semibold text-indigo-700"
                  />
                ) : (
                  grupo.titulo || 'Sin título'
                )}
              </th>
            );
          }
          return <th key={`spacer-${ri}`} colSpan={span} className="border-2 border-brand-100 bg-brand-50/40" />;
        })}
        <th className="w-8 border-b border-indigo-100" />
      </tr>
      <tr className="bg-brand-50/40">
        {cols.map((col) => renderCol(col, periodos, columnaDinamicaId, onRenamePeriodo, onAddPeriodo))}
        <th className="w-8 border-b border-brand-100" />
      </tr>
    </>
  );
}
