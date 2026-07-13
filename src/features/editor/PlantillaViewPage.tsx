import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faEye, faArrowLeft, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { AnimatePresence, motion } from 'framer-motion';
import VersionTabs from '../../components/VersionTabs';
import ResizeHandle from '../../components/ResizeHandle';
import SectionIndex from './SectionIndex';
import SectionContent from './SectionContent';
import { usePlantilla, useSector } from '../../lib/hooks';
import type { VersionTab } from '../../types';

export default function PlantillaViewPage() {
  const { sectorId, plantillaId } = useParams<{ sectorId: string; plantillaId: string }>();
  const plantilla = usePlantilla(plantillaId!);
  const sector = useSector(sectorId!);
  const [activeTab, setActiveTab] = useState<VersionTab>('estructura');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [leftWidth, setLeftWidth] = useState(280);

  const handleLeftResize = useCallback((d: number) => setLeftWidth((w) => Math.max(180, w + d)), []);

  if (!plantilla || !sector) {
    return <div className="p-8 text-muted">Plantilla no encontrada</div>;
  }

  const secciones = plantilla.secciones;
  const safeIdx = Math.min(activeSectionIndex, secciones.length - 1);
  const seccionActiva = secciones[safeIdx];
  const isFirst = safeIdx === 0;
  const isLast = safeIdx === secciones.length - 1;
  const showExamples = activeTab === 'ejemplos';

  const handleSectionSelect = (seccionId: string) => {
    const idx = secciones.findIndex((s) => s.id === seccionId);
    if (idx !== -1) setActiveSectionIndex(idx);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Barra superior */}
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
            <h1 className="text-lg font-bold text-heading truncate max-w-xs">{plantilla.nombre}</h1>
            <span className="text-xs text-muted">{plantilla.cantidadSecciones} secciones</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              <FontAwesomeIcon icon={faEye} className="w-2.5 h-2.5" />
              Solo lectura
            </span>
          </div>
          <div className="flex items-center gap-3">
            <VersionTabs activeTab={activeTab} onChange={setActiveTab} disableProyecto />
            <Link
              to={`/sectores/${sectorId}/plantilla/${plantillaId}/editar`}
              className="px-4 py-2 rounded-lg bg-sidebar text-white text-sm font-medium hover:bg-sidebar-hover transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 overflow-hidden">
        <div className="shrink-0 bg-white p-4 overflow-y-auto" style={{ width: leftWidth }}>
          <SectionIndex
            secciones={secciones}
            activeSeccionId={seccionActiva?.id ?? null}
            onSeccionClick={handleSectionSelect}
          />
        </div>

        <ResizeHandle onResize={handleLeftResize} />

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8">
            <AnimatePresence mode="wait">
              {seccionActiva && (
                <motion.div
                  key={seccionActiva.id + activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  <SectionContent
                    seccion={seccionActiva}
                    showExampleValues={showExamples}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navegación inferior */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => setActiveSectionIndex((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
              Anterior
            </button>
            <span className="text-sm text-muted">
              Sección <span className="font-semibold text-heading">{safeIdx + 1}</span> de {secciones.length}
            </span>
            <button
              onClick={() => setActiveSectionIndex((i) => Math.min(secciones.length - 1, i + 1))}
              disabled={isLast}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
