import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faEye, faFileAlt, faPencil, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '../../components/Breadcrumbs';
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

  const versionInfo = {
    estructura: { icon: faFileAlt, title: 'Versión Estructura', desc: `El molde vacío: definición de las ${plantilla.cantidadSecciones} secciones y sus campos, sin valores.` },
    ejemplos:   { icon: faPencil, title: 'Versión Ejemplos', desc: 'El mismo molde lleno con casos resueltos de referencia que alimentan el contexto de la IA.' },
    proyecto:   { icon: faFileAlt, title: 'Versión Proyecto', desc: 'Vista del proyecto con datos reales completados.' },
  };
  const info = versionInfo[activeTab];

  const handleSectionSelect = (seccionId: string) => {
    const idx = secciones.findIndex((s) => s.id === seccionId);
    if (idx !== -1) setActiveSectionIndex(idx);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Barra superior */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-8 py-3">
        <Breadcrumbs
          items={[
            { label: 'Sectores', to: '/sectores' },
            { label: sector.nombre, to: `/sectores/${sectorId}` },
            { label: `${plantilla.codigo} · ${plantilla.nombre}` },
          ]}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-8 rounded-md border border-brand-200 text-brand-700 text-sm font-bold bg-brand-50">
              {plantilla.codigo}
            </span>
            <h1 className="text-lg font-bold text-heading">{plantilla.nombre}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-xs text-muted font-medium">
              <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
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
        <motion.div key={activeTab} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mt-3 text-sm">
          <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
            <FontAwesomeIcon icon={info.icon} className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-heading text-sm">{info.title}</div>
            <div className="text-xs text-muted">{info.desc}</div>
          </div>
        </motion.div>
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
