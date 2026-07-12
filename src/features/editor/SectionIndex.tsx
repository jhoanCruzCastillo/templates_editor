import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import type { Seccion } from '../../types';

interface Props {
  secciones: Seccion[];
  activeSeccionId: string | null;
  onSeccionClick: (seccionId: string) => void;
  showAddButton?: boolean;
  onAddSection?: () => void;
  /** Si se pasa, aparece un ícono de engranaje para asignar la hoja de Excel de cada sección */
  onEditHoja?: (seccionId: string) => void;
}

export default function SectionIndex({ secciones, activeSeccionId, onSeccionClick, showAddButton, onAddSection, onEditHoja }: Props) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3 px-2">
        Secciones · {secciones.length}
      </h3>
      <nav className="flex-1 overflow-y-auto space-y-0.5">
        {secciones.map((seccion) => {
          const isActive = activeSeccionId === seccion.id;
          return (
            <div
              key={seccion.id}
              onClick={() => onSeccionClick(seccion.id)}
              className={`w-full flex items-center gap-3 pl-3 pr-1.5 py-2.5 rounded-lg text-left transition-all text-sm cursor-pointer ${
                isActive
                  ? 'bg-brand-50 text-brand-700 font-semibold border-l-3 border-brand-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {seccion.numero}
              </span>
              <span className="truncate leading-tight flex-1">{seccion.nombre}</span>
              {onEditHoja && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditHoja(seccion.id); }}
                  title="Asignar hoja de Excel"
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-brand-500 hover:bg-white transition-colors shrink-0"
                >
                  <FontAwesomeIcon icon={faGear} className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </nav>
      {showAddButton && (
        <button
          onClick={onAddSection}
          className="mt-3 w-full py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
        >
          + Agregar sección
        </button>
      )}
    </div>
  );
}
