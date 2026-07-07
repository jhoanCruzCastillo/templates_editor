import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faSave, faInfoCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import VersionTabs from '../../components/VersionTabs';
import ExampleSelector from './ExampleSelector';
import type { VersionTab, Plantilla, Ejemplo } from '../../types';

interface Props {
  plantilla: Plantilla;
  sectorId: string;
  plantillaId: string;
  activeTab: VersionTab;
  onTabChange: (tab: VersionTab) => void;
  onSave: () => void;
  ejemplos: Ejemplo[];
  activeEjemplo: Ejemplo | null;
  onSelectEjemplo: (ej: Ejemplo) => void;
  onNewExample: () => void;
}

export default function EditorTopBar({
  plantilla,
  sectorId,
  plantillaId,
  activeTab,
  onTabChange,
  onSave,
  ejemplos,
  activeEjemplo,
  onSelectEjemplo,
  onNewExample,
}: Props) {
  const showExamples = activeTab === 'ejemplos';

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

      {showExamples && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 flex items-center justify-between"
        >
          <ExampleSelector
            ejemplos={ejemplos}
            activeEjemplo={activeEjemplo}
            onSelect={onSelectEjemplo}
            onNewExample={onNewExample}
          />
          <div className="flex items-center gap-2 text-xs text-muted">
            <FontAwesomeIcon icon={faInfoCircle} className="w-3.5 h-3.5 text-brand-500" />
            <span>
              Estos ejemplos alimentan el contexto de la IA.{' '}
              <strong className="text-heading">No reentrenan el modelo.</strong>
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
