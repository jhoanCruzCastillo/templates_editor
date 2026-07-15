import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faDownload, faFileExport, faEye, faCircleCheck, faTriangleExclamation, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import type { Ejemplo, Plantilla } from '../../types';
import type { ProgresoFicha } from '../../lib/valorValidation';

interface Props {
  plantilla: Plantilla;
  ejemplo: Ejemplo;
  /** Cantidad de campos obligatorios sin llenar o con formato inválido */
  erroresCount?: number;
  progreso?: ProgresoFicha;
  /** true = plan de entrenamiento vencido — se ocultan las acciones de edición (Guardar/Insertar) */
  soloLectura?: boolean;
  /** Si se define, muestra el botón "Historial" (solo Nivel 2) */
  onHistorial?: () => void;
  onSave: () => void;
  onDownload: () => void;
  onInsert: () => void;
  onPreview: () => void;
}

export default function ClienteFichaTopBar({ plantilla, ejemplo, erroresCount = 0, progreso, soloLectura, onHistorial, onSave, onDownload, onInsert, onPreview }: Props) {
  const navigate = useNavigate();
  return (
    <div className="shrink-0 border-b border-gray-100 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Volver a Mis fichas"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </button>
          <span className="inline-flex items-center justify-center w-auto min-w-10 px-2 h-8 rounded-md border border-brand-200 text-brand-700 text-sm font-bold bg-brand-50">
            {plantilla.codigo}
          </span>
          <div className="max-w-xs">
            <h1 className="text-lg font-bold text-heading truncate">{ejemplo.nombre}</h1>
            <p className="text-xs text-muted truncate">{plantilla.nombre}</p>
          </div>
          {progreso && progreso.total > 0 && (
            <div className="w-28 shrink-0" title={`${progreso.llenos} de ${progreso.total} campos llenados`}>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progreso.porcentaje}%` }} />
              </div>
              <p className="text-[10px] text-muted mt-0.5">{progreso.porcentaje}% llenado</p>
            </div>
          )}
          {erroresCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <FontAwesomeIcon icon={faTriangleExclamation} className="w-3 h-3" />
              {erroresCount} pendiente{erroresCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 shrink-0">
              <FontAwesomeIcon icon={faCircleCheck} className="w-3 h-3" />
              Todo listo
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onHistorial && (
            <button
              onClick={onHistorial}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faClockRotateLeft} className="w-3.5 h-3.5" />
              Historial
            </button>
          )}
          <button
            onClick={onDownload}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
            Descargar
          </button>
          {!soloLectura && (
            <button
              onClick={onInsert}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faFileExport} className="w-3.5 h-3.5" />
              Insertar
            </button>
          )}
          <button
            onClick={onPreview}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
            Vista previa
          </button>
          {!soloLectura && (
            <button
              onClick={onSave}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSave} className="w-3.5 h-3.5" />
              Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
