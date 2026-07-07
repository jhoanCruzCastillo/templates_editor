import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import VersionTabs from '../../components/VersionTabs';
import type { VersionTab, Plantilla } from '../../types';

interface Props {
  plantilla: Plantilla;
  sectorId: string;
  plantillaId: string;
  activeTab: VersionTab;
  onTabChange: (tab: VersionTab) => void;
  onSave: () => void;
}

export default function EditorTopBar({
  plantilla,
  sectorId,
  plantillaId,
  activeTab,
  onTabChange,
  onSave,
}: Props) {
  return (
    <div className="shrink-0 border-b border-gray-100 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/sectores/${sectorId}`}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Volver"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </Link>
          <span className="inline-flex items-center justify-center w-auto min-w-10 px-2 h-8 rounded-md border border-brand-200 text-brand-700 text-sm font-bold bg-brand-50">
            {plantilla.codigo}
          </span>
          <h1 className="text-lg font-bold text-heading">{plantilla.nombre}</h1>
          <span className="text-xs text-muted">{plantilla.cantidadSecciones} secciones</span>
        </div>
        <div className="flex items-center gap-3">
          <VersionTabs activeTab={activeTab} onChange={onTabChange} disableProyecto />
          <Link
            to={`/sectores/${sectorId}/plantilla/${plantillaId}`}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
            Vista previa
          </Link>
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
