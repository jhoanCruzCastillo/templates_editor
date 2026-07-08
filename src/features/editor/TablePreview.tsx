import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTrash,
  faGear,
  faArrowLeft,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { columnTypeIcons, columnTypeLabels } from '../../lib/icons';
import { generateId } from '../../lib/store';
import { getPeriodos } from '../../lib/tableRowHelpers';
import type { ConfigTabla, ColumnaTabla, TipoColumna } from '../../types';

interface Props {
  config: ConfigTabla;
  onChange: (config: ConfigTabla) => void;
  onEditColumn: (colId: string) => void;
}

export default function TablePreview({ config, onChange, onEditColumn }: Props) {
  const periodos = getPeriodos(config);
  const [typeDropdownColId, setTypeDropdownColId] = useState<string | null>(null);
  const [newColName, setNewColName] = useState('');
  const [isAddingCol, setIsAddingCol] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addColumn = (name: string) => {
    if (!name.trim()) return;
    const newCol: ColumnaTabla = {
      id: generateId(),
      nombre: name.trim(),
      tipo: 'texto',
      requerido: false,
      ...(config.subtipo === 'jerarquica' ? { nivel: 'hijo' as const } : {}),
    };
    onChange({ ...config, columnas: [...config.columnas, newCol] });
    setNewColName('');
  };

  const removeColumn = (id: string) => {
    onChange({ ...config, columnas: config.columnas.filter((c) => c.id !== id) });
  };

  const updateColumn = (colId: string, updates: Partial<ColumnaTabla>) => {
    onChange({
      ...config,
      columnas: config.columnas.map((c) => (c.id === colId ? { ...c, ...updates } : c)),
    });
  };

  const moveColumn = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= config.columnas.length) return;
    const cols = [...config.columnas];
    [cols[index], cols[target]] = [cols[target], cols[index]];
    onChange({ ...config, columnas: cols });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newColName.trim()) addColumn(newColName);
    if (e.key === 'Escape') { setIsAddingCol(false); setNewColName(''); }
  };

  const startAdding = () => {
    setIsAddingCol(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
        Columnas ({config.columnas.length})
      </label>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {config.columnas.map((col, i) => {
                const colIcon = columnTypeIcons[col.tipo];
                const isTypeOpen = typeDropdownColId === col.id;
                return (
                  <th
                    key={col.id}
                    className="relative px-2 py-1.5 text-left font-medium text-heading border-b border-gray-200 whitespace-nowrap group"
                  >
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={colIcon} className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                      <span className="truncate text-[11px]">{col.nombre}</span>
                    </div>
                    {/* Botones al hover */}
                    <div className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 z-10">
                      {i > 0 && (
                        <button onClick={() => moveColumn(i, -1)} className="w-4 h-4 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-600 shadow-sm">
                          <FontAwesomeIcon icon={faArrowLeft} className="w-1.5 h-1.5" />
                        </button>
                      )}
                      {i < config.columnas.length - 1 && (
                        <button onClick={() => moveColumn(i, 1)} className="w-4 h-4 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-600 shadow-sm">
                          <FontAwesomeIcon icon={faArrowRight} className="w-1.5 h-1.5" />
                        </button>
                      )}
                      <button onClick={() => onEditColumn(col.id)} className="w-4 h-4 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand-600 shadow-sm">
                        <FontAwesomeIcon icon={faGear} className="w-2 h-2" />
                      </button>
                      <button onClick={() => removeColumn(col.id)} className="w-4 h-4 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm">
                        <FontAwesomeIcon icon={faTrash} className="w-2 h-2" />
                      </button>
                    </div>
                    {/* Tipo inline dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setTypeDropdownColId(isTypeOpen ? null : col.id)}
                        className="text-[9px] font-normal text-muted mt-0.5 hover:text-brand-600 cursor-pointer transition-colors"
                      >
                        {columnTypeLabels[col.tipo]}
                        {config.subtipo === 'jerarquica' && col.nivel && (
                          <span className={col.nivel === 'padre' ? ' text-amber-500' : ' text-blue-500'}>
                            {' '}· {col.nivel === 'padre' ? '↕ Padre' : '↔ Hijo'}
                          </span>
                        )}
                        {col.id === config.columnaDinamicaId && periodos.length > 0 && (
                          <span className="text-brand-500"> · ×{periodos.length} períodos</span>
                        )}
                        {' ▾'}
                      </button>
                      {isTypeOpen && (
                        <>
                          <div className="fixed inset-0 z-20" onClick={() => setTypeDropdownColId(null)} />
                          <div className="absolute left-0 top-full mt-0.5 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-30 min-w-32">
                            {(Object.entries(columnTypeLabels) as [TipoColumna, string][]).map(([key, label]) => (
                              <button
                                key={key}
                                onClick={() => { updateColumn(col.id, { tipo: key }); setTypeDropdownColId(null); }}
                                className={`w-full flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-left transition-colors ${
                                  col.tipo === key ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <FontAwesomeIcon icon={columnTypeIcons[key]} className="w-2.5 h-2.5 text-gray-400" />
                                {label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </th>
                );
              })}
              {/* Botón "+" */}
              <th className="px-1 py-2 border-b border-gray-200 w-10 align-top">
                {isAddingCol ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => { if (newColName.trim()) addColumn(newColName); setIsAddingCol(false); }}
                    placeholder="Nombre..."
                    className="w-20 px-1.5 py-0.5 rounded border border-brand-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    autoFocus
                  />
                ) : (
                  <button onClick={startAdding} className="w-7 h-7 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-brand-300 hover:text-brand-500 transition-colors" title="Agregar columna">
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {config.subtipo === 'jerarquica' ? (
              [1, 2].map((group) =>
                [1, 2].map((child, ci) => (
                  <tr key={`${group}-${child}`} className="border-b border-gray-100">
                    {config.columnas.map((col) => {
                      if (col.nivel === 'padre' && ci > 0) return null;
                      return (
                        <td
                          key={col.id}
                          className={`px-2 py-1 text-muted whitespace-nowrap text-[10px] ${
                            col.nivel === 'padre' ? 'bg-amber-50/50 align-top font-medium text-gray-500 border-r border-gray-200' : ''
                          }`}
                          rowSpan={col.nivel === 'padre' ? 2 : undefined}
                        >
                          {col.nivel === 'padre' ? `Grupo ${group}` : `${group}.${child}`}
                        </td>
                      );
                    })}
                    <td className="px-1 py-1" />
                  </tr>
                ))
              ).flat()
            ) : (
              [1, 2, 3].map((row) => (
                <tr key={row} className="border-b border-gray-100 last:border-0">
                  {config.columnas.map((col) => (
                    <td key={col.id} className="px-2 py-1.5 text-muted whitespace-nowrap">
                      {col.tipo === 'auto_numerico' ? row : '—'}
                    </td>
                  ))}
                  <td className="px-1 py-1.5" />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted mt-1.5">
        Hover en encabezado para configurar. Clic en + para agregar columna.
      </p>
    </div>
  );
}
