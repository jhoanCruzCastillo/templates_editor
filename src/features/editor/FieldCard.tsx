import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faTrash } from '@fortawesome/free-solid-svg-icons';
import { fieldTypeIcons, fieldTypeLabels, subtipoTablaLabels, columnTypeLabels } from '../../lib/icons';
import ExampleTableEditor from './ExampleTableEditor';
import CampoCoordenadasInput from '../../components/CampoCoordenadasInput';
import type { Campo } from '../../types';

interface Props {
  campo: Campo;
  isSelected?: boolean;
  onClick?: () => void;
  showExampleValue?: boolean;
  exampleValue?: string;
  onExampleValueChange?: (campoId: string, value: string) => void;
  showMenuButton?: boolean;
  onDelete?: () => void;
  onDefaultValueChange?: (value: string) => void;
}

export default function FieldCard({
  campo,
  isSelected,
  onClick,
  showExampleValue,
  exampleValue,
  onExampleValueChange,
  showMenuButton,
  onDelete,
  onDefaultValueChange,
}: Props) {
  const icon = fieldTypeIcons[campo.tipo];
  const typeLabel = fieldTypeLabels[campo.tipo];
  // Si se pasa onExampleValueChange, estamos en modo edición de ejemplo:
  // usar solo el valor del ejemplo activo (no el mock del campo)
  const displayValue = onExampleValueChange ? (exampleValue ?? '') : (exampleValue ?? campo.valorEjemplo);
  const isTableField = campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica';
  const isCoordField = campo.tipo === 'mapa_coordenadas';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? 'border-brand-500 bg-brand-50/30 shadow-sm cursor-pointer'
          : onClick
            ? 'border-gray-100 bg-white hover:border-brand-200 cursor-pointer'
            : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isSelected ? 'bg-brand-100 text-brand-600' : 'bg-gray-50 text-gray-400'
          }`}
        >
          <FontAwesomeIcon icon={icon} className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                isSelected
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {campo.identificador}
            </span>
            <span className="font-semibold text-heading text-sm">{campo.etiqueta}</span>
            {!campo.editable && (
              <FontAwesomeIcon
                icon={fieldTypeIcons.calculado}
                className="w-3 h-3 text-gray-400"
                title="Campo calculado (solo lectura)"
              />
            )}
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-2">
            <span>{typeLabel}</span>
            {campo.fuenteCatalogo && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[11px]">
                📋 {campo.fuenteCatalogo}
              </span>
            )}
          </div>
          {campo.tipo === 'catalogo_encadenado' && campo.cadena && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {campo.cadena.map((step, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {step}
                  </span>
                  {i < campo.cadena!.length - 1 && (
                    <span className="text-gray-300 text-xs">→</span>
                  )}
                </span>
              ))}
            </div>
          )}
          {(campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica') && campo.configTabla && campo.configTabla.columnas.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {subtipoTablaLabels[campo.configTabla.subtipo]}
                </span>
                <span className="text-[10px] text-muted">
                  · {campo.configTabla.columnas.length} columnas
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {campo.configTabla.columnas.map((col) => (
                  <span
                    key={col.id}
                    className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600"
                    title={columnTypeLabels[col.tipo]}
                  >
                    {col.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!showExampleValue && onDefaultValueChange && (
            <div className="mt-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Valor por defecto
              </span>
              {isCoordField ? (
                <div className="mt-1.5">
                  <CampoCoordenadasInput value={campo.valorEjemplo || ''} onChange={onDefaultValueChange} />
                </div>
              ) : isTableField && campo.configTabla ? (
                <ExampleTableEditor
                  config={campo.configTabla}
                  value={campo.valorEjemplo || ''}
                  onChange={onDefaultValueChange}
                />
              ) : (
                <input
                  type={campo.tipo === 'numero' ? 'number' : 'text'}
                  value={campo.valorEjemplo || ''}
                  onChange={(e) => onDefaultValueChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Valor inicial por defecto..."
                  className="w-full mt-1 px-2 py-1.5 rounded border border-gray-200 bg-white text-sm text-heading focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                />
              )}
            </div>
          )}
          {showExampleValue && (
            <div className="mt-2 p-2.5 rounded-lg bg-brand-100/70 border border-brand-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Valor de ejemplo
              </span>
              {isCoordField ? (
                <div className="mt-1.5">
                  <CampoCoordenadasInput
                    value={displayValue || ''}
                    onChange={onExampleValueChange ? (v) => onExampleValueChange(campo.identificador, v) : undefined}
                  />
                </div>
              ) : isTableField && campo.configTabla && onExampleValueChange ? (
                <ExampleTableEditor
                  config={campo.configTabla}
                  value={displayValue || ''}
                  onChange={(v) => onExampleValueChange(campo.identificador, v)}
                />
              ) : onExampleValueChange ? (
                <input
                  type="text"
                  value={displayValue || ''}
                  onChange={(e) => onExampleValueChange(campo.identificador, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Escribe el valor de ejemplo..."
                  className="w-full mt-1 px-2 py-1.5 rounded border border-brand-200 bg-white text-sm text-heading focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              ) : (
                <div className="text-sm text-heading mt-0.5">
                  {displayValue || <span className="text-muted italic">Sin valor</span>}
                </div>
              )}
            </div>
          )}
        </div>
        {(showMenuButton || onDelete) && (
          <div className="flex flex-col gap-1 shrink-0">
            {showMenuButton && (
              <button className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                <FontAwesomeIcon icon={faEllipsisVertical} className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                title="Eliminar campo"
              >
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
