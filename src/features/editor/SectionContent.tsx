import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { Seccion, Campo, ConfigTabla } from '../../types';
import FieldCard from './FieldCard';

interface Props {
  seccion: Seccion;
  showExampleValues?: boolean;
  exampleValores?: Record<string, string>;
  onExampleValueChange?: (campoId: string, value: string) => void;
  selectedCampoId?: string | null;
  onCampoClick?: (campo: Campo) => void;
  onAddCampo?: (subseccionId: string, subseccionCodigo: string, camposCount: number) => void;
  onDeleteCampo?: (campoId: string, subseccionId: string) => void;
  onSectionNameChange?: (seccionId: string, nombre: string) => void;
  onSectionHojaChange?: (seccionId: string, hoja: string) => void;
  onSubsectionNameChange?: (subseccionId: string, nombre: string) => void;
  onAddSubsection?: (seccionId: string) => void;
  onDeleteSubsection?: (subseccionId: string, seccionId: string) => void;
  onDefaultValueChange?: (campoId: string, value: string) => void;
  onConfigTablaChange?: (campoId: string, config: ConfigTabla) => void;
  showMenuButton?: boolean;
}

export default function SectionContent({
  seccion,
  showExampleValues,
  exampleValores,
  onExampleValueChange,
  selectedCampoId,
  onCampoClick,
  onAddCampo,
  onDeleteCampo,
  onSectionNameChange,
  onSectionHojaChange,
  onSubsectionNameChange,
  onAddSubsection,
  onDeleteSubsection,
  onDefaultValueChange,
  onConfigTablaChange,
  showMenuButton,
}: Props) {
  return (
    <div data-section-id={seccion.id} className="mb-10">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-brand-600">Sección {seccion.numero}</p>
        <span className="text-xs text-muted">{seccion.cantidadCampos} campos</span>
      </div>
      {onSectionNameChange ? (
        <input
          type="text"
          value={seccion.nombre}
          onChange={(e) => onSectionNameChange(seccion.id, e.target.value)}
          className="text-xl font-bold text-heading w-full bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-brand-500 focus:outline-none px-1 py-0.5 -ml-1 rounded"
          placeholder="Nombre de la sección..."
        />
      ) : (
        <h2 className="text-xl font-bold text-heading mb-6">{seccion.nombre}</h2>
      )}

      {onSectionHojaChange && (
        <div className="flex items-center gap-1.5 mb-6 mt-1 -ml-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">Hoja de Excel</span>
          <input
            type="text"
            value={seccion.hoja || ''}
            onChange={(e) => onSectionHojaChange(seccion.id, e.target.value)}
            placeholder="Ej. DATOS GENERALES"
            className="text-xs font-mono text-heading bg-transparent border-b border-transparent hover:border-gray-200 focus:border-brand-500 focus:outline-none px-1 py-0.5 rounded"
          />
        </div>
      )}

      {seccion.subsecciones.map((sub) => (
        <div key={sub.id} className="mb-8">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-2 group">
            <span className="text-sm font-bold text-gray-400">{sub.codigo}</span>
            {onSubsectionNameChange ? (
              <input
                type="text"
                value={sub.nombre}
                onChange={(e) => onSubsectionNameChange(sub.id, e.target.value)}
                className="text-sm font-semibold uppercase tracking-wide text-heading bg-transparent border-b border-transparent hover:border-gray-200 focus:border-brand-500 focus:outline-none px-1 py-0.5 flex-1"
                placeholder="Nombre de la subsección..."
              />
            ) : (
              <span className="text-sm font-semibold uppercase tracking-wide text-heading flex-1">
                {sub.nombre}
              </span>
            )}
            {onDeleteSubsection && seccion.subsecciones.length > 1 && (
              <button
                onClick={() => onDeleteSubsection(sub.id, seccion.id)}
                className="w-6 h-6 rounded flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                title="Eliminar subsección"
              >
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="space-y-3">
            {sub.campos.map((campo) => (
              <FieldCard
                key={campo.id}
                campo={campo}
                isSelected={selectedCampoId === campo.id}
                onClick={onCampoClick ? () => onCampoClick(campo) : undefined}
                showExampleValue={showExampleValues}
                exampleValue={exampleValores?.[campo.identificador]}
                onExampleValueChange={onExampleValueChange}
                showMenuButton={showMenuButton}
                onDelete={onDeleteCampo ? () => onDeleteCampo(campo.id, sub.id) : undefined}
                onDefaultValueChange={onDefaultValueChange ? (v) => onDefaultValueChange(campo.id, v) : undefined}
                onConfigTablaChange={onConfigTablaChange ? (c) => onConfigTablaChange(campo.id, c) : undefined}
              />
            ))}
            {onAddCampo && (
              <button
                onClick={() => onAddCampo(sub.id, sub.codigo, sub.campos.length)}
                className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                Agregar campo
              </button>
            )}
          </div>
        </div>
      ))}
      {onAddSubsection && (
        <button
          onClick={() => onAddSubsection(seccion.id)}
          className="w-full py-2 rounded-lg border border-dashed border-gray-200 text-xs font-medium text-gray-400 hover:border-brand-300 hover:text-brand-600 transition-colors flex items-center justify-center gap-1.5"
        >
          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
          Agregar subsección
        </button>
      )}
    </div>
  );
}
