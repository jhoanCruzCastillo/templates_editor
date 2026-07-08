import { useState, useCallback } from 'react';
import { subtipoTablaLabels } from '../../lib/icons';
import ColumnDetailEditor from './ColumnDetailEditor';
import TablePreview from './TablePreview';
import type { ConfigTabla, ColumnaTabla, SubtipoTabla } from '../../types';

interface Props {
  config: ConfigTabla;
  onChange: (config: ConfigTabla) => void;
}

const subtipos = Object.entries(subtipoTablaLabels) as [SubtipoTabla, string][];

export default function TableColumnsEditor({ config, onChange }: Props) {
  const [editingColId, setEditingColId] = useState<string | null>(null);

  const updateColumn = useCallback((colId: string, updates: Partial<ColumnaTabla>) => {
    onChange({
      ...config,
      columnas: config.columnas.map((c) => (c.id === colId ? { ...c, ...updates } : c)),
    });
  }, [config, onChange]);

  const editingCol = editingColId ? config.columnas.find((c) => c.id === editingColId) : null;

  if (editingCol) {
    return (
      <ColumnDetailEditor
        columna={editingCol}
        allColumnas={config.columnas}
        isJerarquica={config.subtipo === 'jerarquica'}
        isMatrizPeriodos={config.subtipo === 'matriz_por_periodos'}
        esColumnaDinamica={config.columnaDinamicaId === editingCol.id}
        onSetColumnaDinamica={(esDinamica) => onChange({ ...config, columnaDinamicaId: esDinamica ? editingCol.id : undefined })}
        onChange={(updates) => updateColumn(editingCol.id, updates)}
        onBack={() => setEditingColId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Subtipo */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">Subtipo de tabla</label>
        <select
          value={config.subtipo}
          onChange={(e) => onChange({ ...config, subtipo: e.target.value as SubtipoTabla })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 bg-white"
        >
          {subtipos.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Ubicación en Excel (captura de la tabla) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-heading mb-1">Fila inicial (Excel)</label>
          <input
            type="number"
            value={config.captura?.filaInicial ?? ''}
            onChange={(e) => onChange({ ...config, captura: { ...config.captura, filaInicial: e.target.value ? Number(e.target.value) : undefined } })}
            placeholder="Ej. 18"
            min={1}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-heading mb-1">Filas base</label>
          <input
            type="number"
            value={config.captura?.filasBase ?? ''}
            onChange={(e) => onChange({ ...config, captura: { ...config.captura, filasBase: e.target.value ? Number(e.target.value) : undefined } })}
            placeholder="Ej. 3"
            min={0}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>

      {/* Agrupador (solo filas planas) */}
      {config.subtipo !== 'jerarquica' && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-heading">Agrupar filas bajo encabezados</label>
          <button
            onClick={() => onChange({ ...config, agrupador: !config.agrupador })}
            className={`relative w-10 h-6 rounded-full transition-colors duration-100 ${config.agrupador ? 'bg-brand-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-100 ${config.agrupador ? 'left-4.5' : 'left-0.5'}`} />
          </button>
        </div>
      )}

      {/* Config de período (matriz) */}
      {config.subtipo === 'matriz_por_periodos' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-heading mb-1">Año inicio</label>
            <input type="number" value={config.periodoInicio ?? ''} onChange={(e) => onChange({ ...config, periodoInicio: Number(e.target.value) })} placeholder="2024" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-heading mb-1">Año fin</label>
            <input type="number" value={config.periodoFin ?? ''} onChange={(e) => onChange({ ...config, periodoFin: Number(e.target.value) })} placeholder="2034" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
        </div>
      )}

      {/* Config filas (dinámicas) */}
      {config.subtipo === 'filas_dinamicas' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-heading mb-1">Filas iniciales</label>
            <input type="number" value={config.filasIniciales ?? 3} onChange={(e) => onChange({ ...config, filasIniciales: Number(e.target.value) })} min={1} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-heading mb-1">Máx. filas</label>
            <input type="number" value={config.maxFilas ?? ''} onChange={(e) => onChange({ ...config, maxFilas: e.target.value ? Number(e.target.value) : undefined })} placeholder="Sin límite" min={1} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
        </div>
      )}

      {/* Tabla interactiva */}
      <TablePreview
        config={config}
        onChange={onChange}
        onEditColumn={setEditingColId}
      />
    </div>
  );
}
