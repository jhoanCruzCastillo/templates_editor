import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave, faDownload, faFileExport, faEye } from '@fortawesome/free-solid-svg-icons';
import type { Ejemplo, Plantilla } from '../../types';

interface Props {
  plantilla: Plantilla;
  ejemplo: Ejemplo;
  onSave: () => void;
  onDownload: () => void;
  onInsert: () => void;
  onPreview: () => void;
}

export default function ClienteFichaTopBar({ plantilla, ejemplo, onSave, onDownload, onInsert, onPreview }: Props) {
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
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onDownload}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
            Descargar
          </button>
          <button
            onClick={onInsert}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faFileExport} className="w-3.5 h-3.5" />
            Insertar
          </button>
          <button
            onClick={onPreview}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
            Vista previa
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSave} className="w-3.5 h-3.5" />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
