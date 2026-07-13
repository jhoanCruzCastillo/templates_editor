import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faGear, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { columnTypeIcons, columnTypeLabels, columnTypePrimitivos } from '../../lib/icons';
import { columnaFaltaCaptura } from '../../lib/campoValidation';
import { generateId } from '../../lib/store';
import ColumnaCapturaModal from './ColumnaCapturaModal';
import type { ConfigTabla, ColumnaTabla, TipoColumna, CabeceraGrupo } from '../../types';

interface Props {
  config: ConfigTabla;
  onChange: (config: ConfigTabla) => void;
}

// Editor de columnas para subtipo "filas_dinamicas" — misma interfaz que MatrizPeriodosEditor
// (arrastrar para reordenar, nombre editable inline, engranaje para posición en Excel +
// agrupación bajo cabecera, eliminar), pero sin columna dinámica: aquí lo dinámico son las filas
// (se agregan/quitan desde ExampleTableEditor), no las columnas.
export default function FilasDinamicasColumnsEditor({ config, onChange }: Props) {
  const cols = config.columnas;
  const cabeceras = config.cabeceras ?? [];
  const hasCabeceras = cabeceras.length > 0;
  const [newColName, setNewColName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [configuringColId, setConfiguringColId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const configuringCol = configuringColId ? cols.find((c) => c.id === configuringColId) ?? null : null;

  const updateColumn = (colId: string, updates: Partial<ColumnaTabla>) =>
    onChange({ ...config, columnas: cols.map((c) => (c.id === colId ? { ...c, ...updates } : c)) });

  const removeColumn = (colId: string) => {
    const nextCabeceras = cabeceras
      .map((g) => ({ ...g, hijoIds: g.hijoIds.filter((h) => h !== colId) }))
      .filter((g) => g.hijoIds.length > 1);
    onChange({
      ...config,
      columnas: cols.filter((c) => c.id !== colId),
      cabeceras: nextCabeceras.length ? nextCabeceras : undefined,
    });
  };

  const addColumn = (name: string) => {
    if (!name.trim()) return;
    const newCol: ColumnaTabla = { id: generateId(), nombre: name.trim(), tipo: 'texto_corto', requerido: false };
    onChange({ ...config, columnas: [...cols, newCol] });
    setNewColName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newColName.trim()) addColumn(newColName);
    if (e.key === 'Escape') { setIsAdding(false); setNewColName(''); }
  };

  const dropColumnAt = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) { setDragIndex(null); return; }
    const next = [...cols];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange({ ...config, columnas: next });
    setDragIndex(null);
  };

  const grupoForKey = (key: string): CabeceraGrupo | null => cabeceras.find((g) => g.hijoIds.includes(key)) ?? null;

  const reorderForGrupo = (hijoIds: string[]): ColumnaTabla[] => {
    const isMember = (col: ColumnaTabla) => hijoIds.includes(col.id);
    const members = cols.filter(isMember);
    if (members.length < 2) return cols;
    const firstMemberIndex = cols.findIndex(isMember);
    const insertAt = cols.slice(0, firstMemberIndex).filter((c) => !isMember(c)).length;
    const rest = cols.filter((c) => !isMember(c));
    const next = [...rest];
    next.splice(insertAt, 0, ...members);
    return next;
  };

  const setGrupoFor = (key: string, grupo: { titulo: string; hijoIds: string[] } | null) => {
    const others = cabeceras.filter((g) => !g.hijoIds.includes(key));
    const next = grupo ? [...others, grupo] : others;
    const nextColumnas = grupo ? reorderForGrupo(grupo.hijoIds) : cols;
    onChange({ ...config, columnas: nextColumnas, cabeceras: next.length ? next : undefined });
  };

  const inputCls = 'w-20 shrink-0 px-1.5 py-0.5 rounded border border-gray-200 bg-white text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500/30 focus:border-brand-400';

  const runs: { grupo: CabeceraGrupo | null; cols: ColumnaTabla[] }[] = [];
  for (const col of cols) {
    const g = grupoForKey(col.id);
    const last = runs[runs.length - 1];
    if (last && g && last.grupo === g) last.cols.push(col);
    else runs.push({ grupo: g, cols: [col] });
  }

  const renderColumn = (col: ColumnaTabla, rowSpan: number) => (
    <th
      key={col.id}
      rowSpan={rowSpan}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => dropColumnAt(cols.indexOf(col))}
      className="align-top px-2 py-1.5 text-left font-medium text-heading border border-gray-200 bg-white whitespace-nowrap"
    >
      <div className="flex items-center gap-1">
        <span
          draggable
          onDragStart={() => setDragIndex(cols.indexOf(col))}
          title="Arrastrar para reordenar"
          className="cursor-grab active:cursor-grabbing shrink-0"
        >
          <FontAwesomeIcon icon={faGripVertical} className="w-2.5 h-2.5 text-gray-300 hover:text-gray-500" />
        </span>
        <FontAwesomeIcon icon={columnTypeIcons[col.tipo]} className="w-2.5 h-2.5 text-gray-400 shrink-0" />
        <input type="text" value={col.nombre} onChange={(e) => updateColumn(col.id, { nombre: e.target.value })} className={inputCls} />
        <button
          onClick={() => setConfiguringColId(col.id)}
          title={columnaFaltaCaptura(col) ? 'Falta posición en Excel — configúrala aquí' : 'Configurar columna'}
          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${columnaFaltaCaptura(col) ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-brand-500'}`}
        >
          <FontAwesomeIcon icon={faGear} className="w-2.5 h-2.5" />
        </button>
        <button onClick={() => removeColumn(col.id)} title="Eliminar columna" className="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-red-500 shrink-0">
          <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
        </button>
      </div>
      <select
        value={col.tipo}
        onChange={(e) => updateColumn(col.id, { tipo: e.target.value as TipoColumna })}
        className="mt-1 text-[9px] text-muted bg-transparent focus:outline-none"
      >
        {columnTypePrimitivos.map((t) => (
          <option key={t} value={t}>{columnTypeLabels[t]}</option>
        ))}
      </select>
    </th>
  );

  const addColumnBtn = (
    <th key="add" rowSpan={hasCabeceras ? 2 : 1} className="px-1 py-2 border border-gray-200 w-10 align-top">
      {isAdding ? (
        <input
          ref={inputRef}
          type="text"
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (newColName.trim()) addColumn(newColName); setIsAdding(false); }}
          placeholder="Nombre..."
          className="w-20 px-1.5 py-0.5 rounded border border-brand-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          autoFocus
        />
      ) : (
        <button
          onClick={() => { setIsAdding(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="w-7 h-7 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-brand-300 hover:text-brand-500 transition-colors"
          title="Agregar columna"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
        </button>
      )}
    </th>
  );

  const rowCabecera = hasCabeceras
    ? runs.flatMap((run) => {
        if (run.grupo) {
          const grupo = run.grupo;
          return [
            <th
              key={`grp-${grupo.titulo}-${run.cols[0].id}`}
              colSpan={run.cols.length}
              className="px-2 py-1.5 text-center font-semibold text-indigo-700 border-2 border-indigo-400 bg-indigo-100 whitespace-nowrap text-[11px]"
            >
              {grupo.titulo || 'Sin título'}
            </th>,
          ];
        }
        return run.cols.map((c) => renderColumn(c, 2));
      })
    : [];

  const rowNombres = hasCabeceras
    ? runs.flatMap((run) => (run.grupo ? run.cols.map((c) => renderColumn(c, 1)) : []))
    : cols.map((c) => renderColumn(c, 1));

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
        Columnas ({cols.length})
      </label>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            {hasCabeceras && <tr className="bg-indigo-50">{rowCabecera}{addColumnBtn}</tr>}
            <tr className="bg-gray-50">
              {rowNombres}
              {!hasCabeceras && addColumnBtn}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row} className="border-b border-gray-100 last:border-0">
                {cols.map((col) => (
                  <td key={col.id} className="px-2 py-1.5 text-muted whitespace-nowrap">
                    {col.tipo === 'auto_numerico' ? row : '—'}
                  </td>
                ))}
                <td className="px-1 py-1.5" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted mt-1.5">
        Arrastra el ícono de mano para reordenar columnas. Clic en el engranaje para posición en Excel o agrupar bajo un título.
      </p>

      {configuringCol && (() => {
        const configuringGrupo = grupoForKey(configuringCol.id);
        const siblingOptions = cols
          .filter((c) => c.id !== configuringCol.id)
          .filter((c) => {
            const ug = grupoForKey(c.id);
            return !ug || ug === configuringGrupo;
          })
          .map((c) => ({ id: c.id, nombre: c.nombre }));
        return (
          <ColumnaCapturaModal
            isOpen
            onClose={() => setConfiguringColId(null)}
            columna={configuringCol}
            onChange={(updates) => updateColumn(configuringCol.id, updates)}
            columnaId={configuringCol.id}
            grupo={configuringGrupo ?? undefined}
            siblingOptions={siblingOptions}
            onGrupoChange={(grupo) => setGrupoFor(configuringCol.id, grupo)}
          />
        );
      })()}
    </div>
  );
}
