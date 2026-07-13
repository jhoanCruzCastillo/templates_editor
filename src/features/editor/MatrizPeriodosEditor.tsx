import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faBolt, faXmark, faGripVertical, faGear } from '@fortawesome/free-solid-svg-icons';
import { columnTypeIcons, columnTypeLabels, columnTypePrimitivos } from '../../lib/icons';
import { columnaFaltaCaptura } from '../../lib/campoValidation';
import { generateId } from '../../lib/store';
import ColumnaCapturaModal from './ColumnaCapturaModal';
import ConfirmModal from '../../components/ConfirmModal';
import type { ConfigTabla, ColumnaTabla, TipoColumna, CabeceraGrupo } from '../../types';

interface Props {
  config: ConfigTabla;
  onChange: (config: ConfigTabla) => void;
}

// Id reservado (esquema oficial) que representa a la columna dinámica completa como una sola
// unidad al momento de agruparla bajo una cabecera.
const DINAMICA_SENTINEL = 'columnas_dinamicas';

interface Unit {
  key: string;
  col: ColumnaTabla;
  index: number;
  isDinamica: boolean;
  span: number;
}

// Editor de columnas para subtipo "matriz_por_periodos" (columnas dinámicas).
// Interacción reducida a propósito: solo eliminar + marcar dinámica por columna, nombres
// editables inline (sin modal), y la columna marcada como dinámica se expande en un encabezado
// de 2 filas (padre + una columna dinámica generada por celda), igual que una celda combinada
// en Excel. No se llaman "períodos": pueden representar años, tareas, alternativas, etc. Las
// columnas completas (incluida la dinámica como unidad) se reordenan arrastrando el ícono de
// mano del encabezado padre. Opcionalmente, columnas existentes (o la dinámica completa) pueden
// agruparse bajo un título común (cabecera), agregando una fila adicional arriba.
export default function MatrizPeriodosEditor({ config, onChange }: Props) {
  const cols = config.columnas;
  const columnasDinamicas = config.periodos ?? [];
  const dinamicaId = config.columnaDinamicaId;
  const cabeceras = config.cabeceras ?? [];
  const hasCabeceras = cabeceras.length > 0;
  const totalRows = (hasCabeceras ? 1 : 0) + 1 + (dinamicaId ? 1 : 0);
  const [newColName, setNewColName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [configuringColId, setConfiguringColId] = useState<string | null>(null);
  const [soloGrupoMode, setSoloGrupoMode] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<CabeceraGrupo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const configuringCol = configuringColId ? cols.find((c) => c.id === configuringColId) ?? null : null;

  const updateColumn = (colId: string, updates: Partial<ColumnaTabla>) =>
    onChange({ ...config, columnas: cols.map((c) => (c.id === colId ? { ...c, ...updates } : c)) });

  const removeColumn = (colId: string) => {
    const key = colId === dinamicaId ? DINAMICA_SENTINEL : colId;
    const nextCabeceras = cabeceras
      .map((g) => ({ ...g, hijoIds: g.hijoIds.filter((h) => h !== key) }))
      .filter((g) => g.hijoIds.length > 1);
    onChange({
      ...config,
      columnas: cols.filter((c) => c.id !== colId),
      columnaDinamicaId: colId === dinamicaId ? undefined : dinamicaId,
      cabeceras: nextCabeceras.length ? nextCabeceras : undefined,
    });
  };

  const toggleDinamica = (colId: string) => {
    const yaEsDinamica = dinamicaId === colId;
    onChange({
      ...config,
      columnaDinamicaId: yaEsDinamica ? undefined : colId,
      periodos: yaEsDinamica ? config.periodos : (config.periodos?.length ? config.periodos : ['', '']),
    });
  };

  const renameColumnaDinamica = (i: number, value: string) => {
    const next = [...columnasDinamicas];
    next[i] = value;
    onChange({ ...config, periodos: next });
  };

  const insertColumnaDinamicaAfter = (i: number) => {
    const next = [...columnasDinamicas];
    next.splice(i + 1, 0, '');
    onChange({ ...config, periodos: next });
  };

  const removeColumnaDinamica = (i: number) => {
    if (columnasDinamicas.length <= 1) return;
    onChange({ ...config, periodos: columnasDinamicas.filter((_, idx) => idx !== i) });
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

  const keyOfCol = (col: ColumnaTabla) => (col.id === dinamicaId ? DINAMICA_SENTINEL : col.id);

  // Las columnas de un grupo deben quedar contiguas para poder renderizarse como una sola celda
  // combinada (igual que en Excel) — al agregar/quitar hijas se reordena el arreglo de columnas.
  const reorderForGrupo = (hijoIds: string[]): ColumnaTabla[] => {
    const isMember = (col: ColumnaTabla) => hijoIds.includes(keyOfCol(col));
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

  const colForKey = (key: string): ColumnaTabla | undefined =>
    key === DINAMICA_SENTINEL ? cols.find((c) => c.id === dinamicaId) : cols.find((c) => c.id === key);

  const openGrupoEditor = (grupo: CabeceraGrupo) => {
    const col = colForKey(grupo.hijoIds[0]);
    if (!col) return;
    setConfiguringColId(col.id);
    setSoloGrupoMode(true);
  };

  const closeConfigurador = () => {
    setConfiguringColId(null);
    setSoloGrupoMode(false);
  };

  const deleteGrupo = (grupo: CabeceraGrupo) => {
    const next = cabeceras.filter((g) => g !== grupo);
    onChange({ ...config, cabeceras: next.length ? next : undefined });
    setGroupToDelete(null);
  };

  const inputCls = 'w-20 shrink-0 px-1.5 py-0.5 rounded border border-gray-200 bg-white text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500/30 focus:border-brand-400';

  const units: Unit[] = cols.map((col, index) => {
    const isDinamica = col.id === dinamicaId;
    return {
      key: isDinamica ? DINAMICA_SENTINEL : col.id,
      col,
      index,
      isDinamica,
      span: isDinamica ? Math.max(columnasDinamicas.length, 1) : 1,
    };
  });

  const runs: { grupo: CabeceraGrupo | null; units: Unit[] }[] = [];
  for (const u of units) {
    const g = grupoForKey(u.key);
    const last = runs[runs.length - 1];
    if (last && g && last.grupo === g) last.units.push(u);
    else runs.push({ grupo: g, units: [u] });
  }

  const renderDinamicaCell = (col: ColumnaTabla, i: number, rowSpan: number) => (
    <th
      key={col.id}
      colSpan={Math.max(columnasDinamicas.length, 1)}
      rowSpan={rowSpan}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => dropColumnAt(i)}
      className="p-0 border border-amber-300 bg-amber-100 align-top"
    >
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-amber-300">
        <span
          draggable
          onDragStart={() => setDragIndex(i)}
          title="Arrastrar para reordenar"
          className="cursor-grab active:cursor-grabbing shrink-0"
        >
          <FontAwesomeIcon icon={faGripVertical} className="w-2.5 h-2.5 text-amber-400 hover:text-amber-600" />
        </span>
        <FontAwesomeIcon icon={columnTypeIcons[col.tipo]} className="w-2.5 h-2.5 text-amber-500 shrink-0" />
        <input
          type="text"
          value={col.nombre}
          onChange={(e) => updateColumn(col.id, { nombre: e.target.value })}
          className="flex-1 min-w-0 px-1.5 py-0.5 rounded border border-amber-200 bg-white text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
        />
        <button onClick={() => toggleDinamica(col.id)} title="Quitar dinámica" className="w-4 h-4 rounded flex items-center justify-center text-amber-500 hover:text-amber-700 shrink-0">
          <FontAwesomeIcon icon={faBolt} className="w-2.5 h-2.5" />
        </button>
        <select
          value={col.tipo}
          onChange={(e) => updateColumn(col.id, { tipo: e.target.value as TipoColumna })}
          className="w-28 shrink-0 text-[9px] text-amber-700 bg-white border border-amber-200 rounded pl-1.5 pr-4 py-0.5 focus:outline-none"
        >
          {columnTypePrimitivos.map((t) => (
            <option key={t} value={t}>{columnTypeLabels[t]}</option>
          ))}
        </select>
        <button
          onClick={() => { setConfiguringColId(col.id); setSoloGrupoMode(false); }}
          title={columnaFaltaCaptura(col) ? 'Falta posición en Excel — configúrala aquí' : 'Configurar columna'}
          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${columnaFaltaCaptura(col) ? 'text-red-500 hover:text-red-700' : 'text-amber-500 hover:text-amber-700'}`}
        >
          <FontAwesomeIcon icon={faGear} className="w-2.5 h-2.5" />
        </button>
        <button onClick={() => removeColumn(col.id)} title="Eliminar columna" className="w-4 h-4 rounded flex items-center justify-center text-gray-400 hover:text-red-500 shrink-0">
          <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
        </button>
      </div>
    </th>
  );

  const renderNormalCell = (col: ColumnaTabla, i: number, rowSpan: number) => (
    <th
      key={col.id}
      rowSpan={rowSpan}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => dropColumnAt(i)}
      className="align-top px-2 py-1.5 text-left font-medium text-heading border border-gray-200 bg-white whitespace-nowrap"
    >
      <div className="flex items-center gap-1">
        <span
          draggable
          onDragStart={() => setDragIndex(i)}
          title="Arrastrar para reordenar"
          className="cursor-grab active:cursor-grabbing shrink-0"
        >
          <FontAwesomeIcon icon={faGripVertical} className="w-2.5 h-2.5 text-gray-300 hover:text-gray-500" />
        </span>
        <FontAwesomeIcon icon={columnTypeIcons[col.tipo]} className="w-2.5 h-2.5 text-gray-400 shrink-0" />
        <input
          type="text"
          value={col.nombre}
          onChange={(e) => updateColumn(col.id, { nombre: e.target.value })}
          className={inputCls}
        />
        <button onClick={() => toggleDinamica(col.id)} title="Marcar como dinámica" className="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-amber-500 shrink-0">
          <FontAwesomeIcon icon={faBolt} className="w-2.5 h-2.5" />
        </button>
        <button
          onClick={() => { setConfiguringColId(col.id); setSoloGrupoMode(false); }}
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

  const renderUnit = (u: Unit, rowSpan: number) =>
    u.isDinamica ? renderDinamicaCell(u.col, u.index, rowSpan) : renderNormalCell(u.col, u.index, rowSpan);

  const addColumnBtn = (
    <th key="add" rowSpan={totalRows} className="px-1 py-2 border border-gray-200 w-10 align-top">
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

  // Fila de cabeceras (solo si hay grupos definidos): agrupa runs con título, o coloca la celda
  // completa de columnas sin grupo (spaneando hasta la última fila del encabezado).
  const rowCabecera = hasCabeceras
    ? runs.flatMap((run) => {
        if (run.grupo) {
          const grupo = run.grupo;
          const span = run.units.reduce((s, u) => s + u.span, 0);
          return [
            <th
              key={`grp-${grupo.titulo}-${run.units[0].key}`}
              colSpan={span}
              className="p-0 border-2 border-indigo-400 bg-indigo-100"
            >
              <div className="flex items-center justify-center gap-1 px-2 py-1.5">
                <span className="flex-1 text-center font-semibold text-indigo-700 text-[11px] truncate">
                  {grupo.titulo || 'Sin título'}
                </span>
                <button onClick={() => openGrupoEditor(grupo)} title="Editar grupo" className="w-4 h-4 rounded flex items-center justify-center text-indigo-500 hover:text-indigo-700 shrink-0">
                  <FontAwesomeIcon icon={faGear} className="w-2.5 h-2.5" />
                </button>
                <button onClick={() => setGroupToDelete(grupo)} title="Eliminar grupo" className="w-4 h-4 rounded flex items-center justify-center text-indigo-400 hover:text-red-500 shrink-0">
                  <FontAwesomeIcon icon={faTrash} className="w-2.5 h-2.5" />
                </button>
              </div>
            </th>,
          ];
        }
        return run.units.map((u) => renderUnit(u, u.isDinamica ? 2 : totalRows));
      })
    : [];

  // Fila de nombres: cuando hay cabeceras, solo emite celdas para las columnas agrupadas
  // (las sin grupo ya se renderizaron completas en rowCabecera, spaneando esta fila).
  const rowNombres = hasCabeceras
    ? runs.flatMap((run) => (run.grupo ? run.units.map((u) => renderUnit(u, u.isDinamica ? 1 : (dinamicaId ? 2 : 1))) : []))
    : units.map((u) => renderUnit(u, u.isDinamica ? 1 : (dinamicaId ? 2 : 1)));

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
        Columnas ({cols.length})
      </label>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            {hasCabeceras && (
              <tr className="bg-indigo-50">
                {rowCabecera}
                {addColumnBtn}
              </tr>
            )}
            <tr className="bg-gray-50">
              {rowNombres}
              {!hasCabeceras && addColumnBtn}
            </tr>
            {dinamicaId && (
              <tr className="bg-amber-50">
                {columnasDinamicas.map((nombre, i) => (
                  <th key={i} className="px-2 py-1.5 text-left font-normal text-heading border border-amber-200 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => renameColumnaDinamica(i, e.target.value)}
                        placeholder="Nombre..."
                        className="w-14 px-1 py-0.5 rounded border border-amber-300 bg-white text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-400/40 focus:border-amber-400"
                      />
                      {columnasDinamicas.length > 1 && (
                        <button
                          onClick={() => removeColumnaDinamica(i)}
                          title="Eliminar columna dinámica"
                          className="w-4 h-4 rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-2 h-2" />
                        </button>
                      )}
                      <button
                        onClick={() => insertColumnaDinamicaAfter(i)}
                        title="Insertar columna dinámica a la derecha"
                        className="w-4 h-4 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shrink-0"
                      >
                        <FontAwesomeIcon icon={faPlus} className="w-2 h-2" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row} className="border-b border-gray-100 last:border-0">
                {cols.map((col) => {
                  if (col.id === dinamicaId) {
                    return columnasDinamicas.map((_, i) => (
                      <td key={i} className="px-2 py-1.5 text-muted whitespace-nowrap bg-amber-50/20">—</td>
                    ));
                  }
                  return <td key={col.id} className="px-2 py-1.5 text-muted whitespace-nowrap">{col.tipo === 'auto_numerico' ? row : '—'}</td>;
                })}
                <td className="px-1 py-1.5" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted mt-1.5">
        Arrastra el ícono de mano para reordenar columnas. Usa los botones junto a cada columna dinámica para insertarla a la derecha o eliminarla.
      </p>

      {configuringCol && (() => {
        const configuringKey = configuringCol.id === dinamicaId ? DINAMICA_SENTINEL : configuringCol.id;
        const configuringGrupo = grupoForKey(configuringKey);
        const siblingOptions = units
          .filter((u) => u.key !== configuringKey)
          .filter((u) => {
            const ug = grupoForKey(u.key);
            return !ug || ug === configuringGrupo;
          })
          .map((u) => ({ id: u.key, nombre: u.isDinamica ? `${u.col.nombre} (columnas dinámicas)` : u.col.nombre }));
        return (
          <ColumnaCapturaModal
            isOpen
            onClose={closeConfigurador}
            columna={configuringCol}
            esDinamica={configuringCol.id === dinamicaId}
            onChange={(updates) => updateColumn(configuringCol.id, updates)}
            columnaId={configuringKey}
            grupo={configuringGrupo ?? undefined}
            siblingOptions={siblingOptions}
            onGrupoChange={(grupo) => setGrupoFor(configuringKey, grupo)}
            soloGrupo={soloGrupoMode}
          />
        );
      })()}

      <ConfirmModal
        isOpen={!!groupToDelete}
        title="Eliminar grupo de cabecera"
        message="Se eliminará el título que agrupa estas columnas, pero las columnas seguirán existiendo en la tabla."
        confirmLabel="Eliminar grupo"
        onConfirm={() => groupToDelete && deleteGrupo(groupToDelete)}
        onClose={() => setGroupToDelete(null)}
      />
    </div>
  );
}
