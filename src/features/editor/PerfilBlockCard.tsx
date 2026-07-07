import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faTable, faImage, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import ExampleTableEditor from './ExampleTableEditor';
import type { Campo, ConfigTabla } from '../../types';

interface Props {
  campo: Campo;
  isSelected?: boolean;
  onClick?: () => void;
  showExampleValue?: boolean;
  exampleValue?: string;
  onExampleValueChange?: (identificador: string, value: string) => void;
  onDefaultValueChange?: (value: string) => void;
}

const blockIcon = {
  texto_largo: faAlignLeft,
  tabla: faTable,
  imagen: faImage,
};

const blockLabel = {
  texto_largo: 'Desarrollo en texto',
  tabla: 'Tabla',
  imagen: 'Imagen / esquema',
};

export default function PerfilBlockCard({
  campo,
  isSelected,
  onClick,
  showExampleValue,
  exampleValue,
  onExampleValueChange,
  onDefaultValueChange,
}: Props) {
  const icon = blockIcon[campo.tipo as keyof typeof blockIcon] ?? faAlignLeft;
  const label = blockLabel[campo.tipo as keyof typeof blockLabel] ?? campo.tipo;
  const isTable = campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica';
  const displayValue = onExampleValueChange ? (exampleValue ?? '') : (exampleValue ?? campo.valorEjemplo ?? '');

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border-2 transition-all mb-4 ${
        isSelected
          ? 'border-violet-400 shadow-sm cursor-pointer'
          : onClick
            ? 'border-gray-100 hover:border-violet-200 cursor-pointer bg-white'
            : 'border-gray-100 bg-white'
      }`}
    >
      {/* Encabezado del bloque */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-t-xl ${isSelected ? 'bg-violet-50' : 'bg-gray-50'}`}>
        <span className={`text-sm font-bold font-mono ${isSelected ? 'text-violet-700' : 'text-gray-400'}`}>
          {campo.identificador}
        </span>
        <span className={`text-sm font-semibold flex-1 ${isSelected ? 'text-violet-800' : 'text-heading'}`}>
          {campo.etiqueta}
        </span>
        <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${isSelected ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'}`}>
          <FontAwesomeIcon icon={icon} className="w-2.5 h-2.5" />
          {label}
        </span>
      </div>

      {/* Pauta / contenido mínimo */}
      {campo.descripcion && (
        <div className="mx-4 mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <FontAwesomeIcon icon={faLightbulb} className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">{campo.descripcion}</p>
        </div>
      )}

      {/* Área de desarrollo (Estructura: vacía; Ejemplos: editable) */}
      <div className="p-4">
        {(showExampleValue || onDefaultValueChange) && (
          <div className={`rounded-lg border ${showExampleValue ? 'border-violet-200 bg-violet-50/30' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`px-3 pt-2 text-[10px] font-bold uppercase tracking-wider ${showExampleValue ? 'text-violet-600' : 'text-gray-400'}`}>
              {showExampleValue ? 'Desarrollo de ejemplo' : 'Contenido por defecto'}
            </div>
            {isTable && campo.configTabla ? (
              <div className="px-3 pb-3">
                <ExampleTableEditor
                  config={campo.configTabla}
                  value={displayValue}
                  onChange={(v) => {
                    if (onExampleValueChange) onExampleValueChange(campo.identificador, v);
                    else if (onDefaultValueChange) onDefaultValueChange(v);
                  }}
                />
              </div>
            ) : (
              <textarea
                value={displayValue}
                onChange={(e) => {
                  if (onExampleValueChange) onExampleValueChange(campo.identificador, e.target.value);
                  else if (onDefaultValueChange) onDefaultValueChange(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                rows={4}
                placeholder={`Desarrollar "${campo.etiqueta}"...`}
                className="w-full px-3 pb-3 text-sm text-heading bg-transparent resize-none focus:outline-none leading-relaxed"
              />
            )}
          </div>
        )}
        {!showExampleValue && !onDefaultValueChange && (
          <div className="h-12 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
            <span className="text-xs text-muted italic">Área de desarrollo — se llena en Ejemplos</span>
          </div>
        )}
      </div>
    </div>
  );
}
