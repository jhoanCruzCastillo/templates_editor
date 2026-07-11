import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { columnTypeIcons, columnTypeLabels, columnTypePrimitivos } from '../../lib/icons';
import type { ColumnaTabla, TipoColumna } from '../../types';

interface Props {
  columna: ColumnaTabla;
  allColumnas: ColumnaTabla[];
  onChange: (updates: Partial<ColumnaTabla>) => void;
}

// Contenido del formulario de detalle de columna — se monta dentro de ColumnDetailModal.
// Solo se usa para subtipo filas_dinamicas; jerarquica usa JerarquicaColumnsEditor y
// matriz_por_periodos usa MatrizPeriodosEditor.
export default function ColumnDetailEditor({ columna, allColumnas, onChange }: Props) {
  const icon = columnTypeIcons[columna.tipo];
  const otherCols = allColumnas.filter((c) => c.id !== columna.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
          <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
        </div>
        <div>
          <div className="font-semibold text-heading text-sm">{columna.nombre}</div>
          <div className="text-xs text-muted">{columnTypeLabels[columna.tipo]}</div>
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1">Nombre</label>
        <input
          type="text"
          value={columna.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>

      {/* Tipo */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1">Tipo</label>
        <select
          value={columna.tipo}
          onChange={(e) => onChange({ tipo: e.target.value as TipoColumna })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 bg-white"
        >
          {columnTypePrimitivos.map((key) => (
            <option key={key} value={key}>{columnTypeLabels[key]}</option>
          ))}
        </select>
      </div>

      {/* Requerido */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-heading">Requerido</label>
        <button
          onClick={() => onChange({ requerido: !columna.requerido })}
          className={`relative w-10 h-6 rounded-full transition-colors duration-100 ${
            columna.requerido ? 'bg-brand-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-100 ${
              columna.requerido ? 'left-4.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Fuente de catálogo (solo para catálogo y cat. encadenado) */}
      {(columna.tipo === 'catalogo' || columna.tipo === 'catalogo_encadenado') && (
        <div>
          <label className="block text-xs font-medium text-heading mb-1">Fuente de catálogo</label>
          <input
            type="text"
            value={columna.fuenteCatalogo || ''}
            onChange={(e) => onChange({ fuenteCatalogo: e.target.value })}
            placeholder="Ej. UBIGEO, Niveles de gobierno..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
      )}

      {/* Encadena a (solo para catálogo encadenado) */}
      {columna.tipo === 'catalogo_encadenado' && (
        <div>
          <label className="block text-xs font-medium text-heading mb-1">Encadena a (columna dependiente)</label>
          <select
            value={columna.encadenaA || ''}
            onChange={(e) => onChange({ encadenaA: e.target.value || undefined })}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none bg-white"
          >
            <option value="">Ninguna</option>
            {otherCols.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <p className="text-[11px] text-muted mt-1">
            Seleccionar un valor en esta columna filtrará las opciones de la columna dependiente.
          </p>
        </div>
      )}

      {/* Fórmula (solo para calculado) */}
      {columna.tipo === 'calculado' && (
        <div>
          <label className="block text-xs font-medium text-heading mb-1">Fórmula / regla</label>
          <input
            type="text"
            value={columna.formula || ''}
            onChange={(e) => onChange({ formula: e.target.value })}
            placeholder="Ej. UBIGEO del distrito seleccionado"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
      )}

      {/* Ancho */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1">Ancho (%)</label>
        <input
          type="number"
          value={columna.ancho ?? ''}
          onChange={(e) => onChange({ ancho: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Auto"
          min={5}
          max={100}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>

      {/* Ubicación en Excel (captura) */}
      <div className="pt-3 border-t border-gray-100">
        <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
          Ubicación en Excel
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-muted mb-1">Columna</label>
            <input
              type="text"
              value={columna.columnaExcel || ''}
              onChange={(e) => onChange({ columnaExcel: e.target.value })}
              placeholder="Ej. B"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted mb-1">Abarca columnas</label>
            <input
              type="number"
              value={columna.abarcaColumnasExcel ?? ''}
              onChange={(e) => onChange({ abarcaColumnasExcel: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="1"
              min={1}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
