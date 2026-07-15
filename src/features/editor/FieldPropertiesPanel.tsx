import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import { fieldTypeIcons, fieldTypeLabels, faTriangleExclamation } from '../../lib/icons';
import { campoFaltaCaptura } from '../../lib/campoValidation';
import TableColumnsEditor from './TableColumnsEditor';
import CampoCoordenadasInput, { parseCoords } from '../../components/CampoCoordenadasInput';
import type { Campo, TipoCampo, ConfigTabla } from '../../types';

interface Props {
  campo: Campo;
  autoFocusEtiqueta?: boolean;
  ejemplosCount: number;
  onFieldUpdate?: (campoId: string, updates: Partial<Campo>) => void;
}

// Tipos finales disponibles para seleccionar en el editor (valores que caen en la celda)
const allowedFieldTypes: TipoCampo[] = [
  'texto_corto',
  'texto_largo',
  'numero',
  'decimal',
  'fecha',
  'booleano',
  'mapa_coordenadas',
  'tabla',
];

const allFieldTypes = allowedFieldTypes.map((k) => [k, fieldTypeLabels[k]] as [TipoCampo, string]);

const defaultTableConfig: ConfigTabla = {
  subtipo: 'filas_dinamicas',
  columnas: [],
  filasIniciales: 3,
};

export default function FieldPropertiesPanel({ campo, autoFocusEtiqueta, ejemplosCount, onFieldUpdate }: Props) {
  const icon = fieldTypeIcons[campo.tipo];
  const typeLabel = fieldTypeLabels[campo.tipo];
  const isTable = campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica';
  const etiquetaRef = useRef<HTMLInputElement>(null);
  const faltaCaptura = campoFaltaCaptura(campo);

  useEffect(() => {
    if (autoFocusEtiqueta) {
      etiquetaRef.current?.focus();
      etiquetaRef.current?.select();
    }
  }, [campo.id, autoFocusEtiqueta]);

  const update = (updates: Partial<Campo>) => {
    onFieldUpdate?.(campo.id, updates);
  };

  const handleTypeChange = (newType: TipoCampo) => {
    const updates: Partial<Campo> = { tipo: newType };
    // Al cambiar a tabla, inicializar configTabla si no existe
    if ((newType === 'tabla' || newType === 'tabla_jerarquica') && !campo.configTabla) {
      updates.configTabla = {
        ...defaultTableConfig,
        subtipo: newType === 'tabla_jerarquica' ? 'jerarquica' : 'filas_dinamicas',
      };
    }
    update(updates);
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Propiedades del campo
        </h3>
        <span className="text-xs font-bold px-2 py-1 rounded bg-brand-100 text-brand-700">
          {campo.identificador}
        </span>
      </div>

      {/* Nombre + tipo */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center">
          <FontAwesomeIcon icon={icon} className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold text-heading text-sm">{campo.etiqueta}</div>
          <div className="text-xs text-muted">{typeLabel}</div>
        </div>
      </div>

      {/* Identificador */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">Identificador</label>
        <input
          type="text"
          value={campo.identificador}
          onChange={(e) => update({ identificador: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>

      {/* Etiqueta */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">Etiqueta</label>
        <input
          ref={etiquetaRef}
          type="text"
          value={campo.etiqueta}
          onChange={(e) => update({ etiqueta: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>

      {/* Tipo de campo */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">Tipo de campo</label>
        <div className="relative">
          <select
            value={campo.tipo}
            onChange={(e) => handleTypeChange(e.target.value as TipoCampo)}
            className="w-full px-3 py-2 pl-9 rounded-lg border border-gray-200 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white"
          >
            {allFieldTypes.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <FontAwesomeIcon
            icon={icon}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Comportamiento */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">Comportamiento</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => update({ editable: true })}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-75 ${
              campo.editable
                ? 'bg-brand-50 text-brand-600'
                : 'bg-white text-gray-400'
            }`}
          >
            Editable
          </button>
          <button
            onClick={() => update({
              editable: false,
              valorEjemplo: !isTable && !campo.valorEjemplo ? '=' : campo.valorEjemplo,
            })}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-75 ${
              !campo.editable
                ? 'bg-brand-50 text-brand-600'
                : 'bg-white text-gray-400'
            }`}
          >
            Calculado
          </button>
        </div>
      </div>

      {/* Obligatoriedad — solo tiene sentido si el cliente lo va a llenar */}
      {campo.editable && !isTable && (
        <div>
          <label className="block text-xs font-medium text-heading mb-1.5">
            Obligatorio para el cliente
          </label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => update({ requerido: false })}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-75 ${
                !campo.requerido ? 'bg-brand-50 text-brand-600' : 'bg-white text-gray-400'
              }`}
            >
              No
            </button>
            <button
              onClick={() => update({ requerido: true })}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-75 ${
                campo.requerido ? 'bg-brand-50 text-brand-600' : 'bg-white text-gray-400'
              }`}
            >
              Sí
            </button>
          </div>
        </div>
      )}

      {/* Descripción */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">Descripción / ayuda</label>
        <textarea
          value={campo.descripcion || ''}
          onChange={(e) => update({ descripcion: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>

      {/* Fuente de catálogo (campos sueltos) */}
      {(campo.tipo === 'catalogo_simple' || campo.tipo === 'catalogo_encadenado') && (
        <div>
          <label className="block text-xs font-medium text-heading mb-1.5">Fuente de catálogo</label>
          <input
            type="text"
            value={campo.fuenteCatalogo || ''}
            onChange={(e) => update({ fuenteCatalogo: e.target.value })}
            placeholder="Ej. UBIGEO, Niveles de gobierno..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
      )}

      {/* === UBICACIÓN EN EXCEL (captura) — solo campos no-tabla === */}
      {!isTable && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted">
              Ubicación en Excel
            </label>
            {faltaCaptura && (
              <span
                title="Sin columna/fila no se puede insertar el valor de este campo en el Excel"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-semibold"
              >
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-2.5 h-2.5" />
                Obligatorio
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-muted mb-1">Columna</label>
              <input
                type="text"
                value={campo.captura?.columna || ''}
                onChange={(e) => update({ captura: { columna: e.target.value, fila: campo.captura?.fila ?? 0, abarcaColumnas: campo.captura?.abarcaColumnas, abarcaFilas: campo.captura?.abarcaFilas } })}
                placeholder="Ej. R"
                className={`w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${campo.captura?.columna ? 'border-gray-200' : 'border-amber-300'}`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted mb-1">Fila</label>
              <input
                type="number"
                value={campo.captura?.fila ?? ''}
                onChange={(e) => update({ captura: { columna: campo.captura?.columna ?? '', fila: e.target.value ? Number(e.target.value) : 0, abarcaColumnas: campo.captura?.abarcaColumnas, abarcaFilas: campo.captura?.abarcaFilas } })}
                placeholder="Ej. 9"
                min={1}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 ${campo.captura?.fila ? 'border-gray-200' : 'border-amber-300'}`}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted mb-1">Abarca columnas</label>
              <input
                type="number"
                value={campo.captura?.abarcaColumnas ?? ''}
                onChange={(e) => update({ captura: { columna: campo.captura?.columna ?? '', fila: campo.captura?.fila ?? 0, abarcaColumnas: e.target.value ? Number(e.target.value) : undefined, abarcaFilas: campo.captura?.abarcaFilas } })}
                placeholder="1"
                min={1}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted mb-1">Abarca filas</label>
              <input
                type="number"
                value={campo.captura?.abarcaFilas ?? ''}
                onChange={(e) => update({ captura: { columna: campo.captura?.columna ?? '', fila: campo.captura?.fila ?? 0, abarcaColumnas: campo.captura?.abarcaColumnas, abarcaFilas: e.target.value ? Number(e.target.value) : undefined } })}
                placeholder="1"
                min={1}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* === EDITOR DE TABLA === */}
      {isTable && (
        <div className="pt-3 border-t border-gray-100">
          <TableColumnsEditor
            config={campo.configTabla || defaultTableConfig}
            onChange={(configTabla) => update({ configTabla })}
          />
        </div>
      )}

      {/* === COORDENADAS === */}
      {campo.tipo === 'mapa_coordenadas' && (
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <label className="block text-xs font-medium text-heading">Ubicación por defecto</label>
          <CampoCoordenadasInput
            value={campo.valorEjemplo || ''}
            onChange={onFieldUpdate ? (v) => update({ valorEjemplo: v }) : undefined}
          />
          {parseCoords(campo.valorEjemplo) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-muted mb-1">Latitud</label>
                <input
                  type="number"
                  step="0.000001"
                  value={parseCoords(campo.valorEjemplo)?.lat ?? ''}
                  onChange={(e) => {
                    const c = parseCoords(campo.valorEjemplo);
                    if (c) update({ valorEjemplo: JSON.stringify({ lat: +e.target.value, lng: c.lng }) });
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-1">Longitud</label>
                <input
                  type="number"
                  step="0.000001"
                  value={parseCoords(campo.valorEjemplo)?.lng ?? ''}
                  onChange={(e) => {
                    const c = parseCoords(campo.valorEjemplo);
                    if (c) update({ valorEjemplo: JSON.stringify({ lat: c.lat, lng: +e.target.value }) });
                  }}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ejemplos asociados */}
      <div className="bg-brand-50 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faLeaf} className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-heading text-sm">{ejemplosCount} ejemplos asociados</div>
          <div className="text-xs text-muted">Valores de referencia para la IA</div>
        </div>
      </div>
    </div>
  );
}
