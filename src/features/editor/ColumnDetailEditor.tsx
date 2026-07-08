import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { columnTypeIcons, columnTypeLabels } from '../../lib/icons';
import type { ColumnaTabla, TipoColumna, NivelColumna } from '../../types';

interface Props {
  columna: ColumnaTabla;
  allColumnas: ColumnaTabla[];
  isJerarquica?: boolean;
  isMatrizPeriodos?: boolean;
  esColumnaDinamica?: boolean;
  onSetColumnaDinamica?: (esDinamica: boolean) => void;
  numPeriodos?: number;
  etiquetaPeriodo?: string;
  onPeriodosChange?: (updates: { numPeriodos?: number; etiquetaPeriodo?: string }) => void;
  onChange: (updates: Partial<ColumnaTabla>) => void;
}

const allColumnTypes = Object.entries(columnTypeLabels) as [TipoColumna, string][];

// Contenido del formulario de detalle de columna — se monta dentro de ColumnDetailModal
export default function ColumnDetailEditor({
  columna,
  allColumnas,
  onChange,
  isJerarquica,
  isMatrizPeriodos,
  esColumnaDinamica,
  onSetColumnaDinamica,
  numPeriodos,
  etiquetaPeriodo,
  onPeriodosChange,
}: Props) {
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
          {allColumnTypes.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Nivel (solo para tabla jerárquica) */}
      {isJerarquica && (
        <div>
          <label className="block text-xs font-medium text-heading mb-1">Nivel</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['padre', 'hijo'] as NivelColumna[]).map((nv) => (
              <button
                key={nv}
                onClick={() => onChange({ nivel: nv })}
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors duration-75 ${
                  columna.nivel === nv
                    ? 'bg-brand-50 text-brand-600'
                    : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
              >
                {nv === 'padre' ? 'Padre (fusiona)' : 'Hijo (repite)'}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-1">
            {columna.nivel === 'padre'
              ? 'La celda se fusiona verticalmente por grupo.'
              : 'Se repite por cada fila hija del grupo.'}
          </p>
        </div>
      )}

      {/* Columna dinámica (solo matriz por períodos) */}
      {isMatrizPeriodos && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-heading">Columna dinámica (se repite por período)</label>
            <button
              onClick={() => onSetColumnaDinamica?.(!esColumnaDinamica)}
              className={`relative w-10 h-6 rounded-full transition-colors duration-100 shrink-0 ml-3 ${esColumnaDinamica ? 'bg-amber-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-100 ${esColumnaDinamica ? 'left-4.5' : 'left-0.5'}`} />
            </button>
          </div>
          {esColumnaDinamica && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-muted mb-1">Cantidad de períodos</label>
                <input
                  type="number"
                  value={numPeriodos ?? ''}
                  onChange={(e) => onPeriodosChange?.({ numPeriodos: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Ej. 10"
                  min={1}
                  className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-1">Etiqueta</label>
                <input
                  type="text"
                  value={etiquetaPeriodo ?? ''}
                  onChange={(e) => onPeriodosChange?.({ etiquetaPeriodo: e.target.value })}
                  placeholder="Ej. Año (vacío = 1, 2, 3...)"
                  className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          )}
        </div>
      )}

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
