import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { subtipoTablaLabels } from '../../lib/icons';
import FilasDinamicasColumnsEditor from './FilasDinamicasColumnsEditor';
import MatrizPeriodosEditor from './MatrizPeriodosEditor';
import JerarquicaColumnsEditor from './JerarquicaColumnsEditor';
import AgrupadorConfigModal from './AgrupadorConfigModal';
import type { ConfigTabla, SubtipoTabla } from '../../types';

interface Props {
  config: ConfigTabla;
  onChange: (config: ConfigTabla) => void;
}

const subtipos = Object.entries(subtipoTablaLabels) as [SubtipoTabla, string][];

export default function TableColumnsEditor({ config, onChange }: Props) {
  const [showAgrupadorConfig, setShowAgrupadorConfig] = useState(false);
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
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-heading mb-1">Columna inicial</label>
          <input
            type="text"
            value={config.captura?.columnaInicial ?? ''}
            onChange={(e) => onChange({ ...config, captura: { ...config.captura, columnaInicial: e.target.value } })}
            placeholder="Ej. B"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
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
          <div className="flex items-center gap-2">
            {config.agrupador && (
              <button
                onClick={() => setShowAgrupadorConfig(true)}
                title="Configurar fila de título de grupo"
                className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon icon={faGear} className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => onChange({ ...config, agrupador: !config.agrupador })}
              className={`relative w-10 h-6 rounded-full transition-colors duration-100 ${config.agrupador ? 'bg-brand-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-100 ${config.agrupador ? 'left-4.5' : 'left-0.5'}`} />
            </button>
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
      {config.subtipo === 'matriz_por_periodos' ? (
        <MatrizPeriodosEditor config={config} onChange={onChange} />
      ) : config.subtipo === 'jerarquica' ? (
        <JerarquicaColumnsEditor config={config} onChange={onChange} />
      ) : (
        <FilasDinamicasColumnsEditor config={config} onChange={onChange} />
      )}

      <AgrupadorConfigModal
        isOpen={showAgrupadorConfig}
        onClose={() => setShowAgrupadorConfig(false)}
        abarcaColumnas={config.agrupadorAbarcaColumnas ?? config.columnas.length}
        totalColumnas={config.columnas.length}
        onChange={(v) => onChange({ ...config, agrupadorAbarcaColumnas: v })}
      />
    </div>
  );
}
