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
