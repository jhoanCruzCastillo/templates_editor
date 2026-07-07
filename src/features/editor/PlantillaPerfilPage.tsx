import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faSave, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import ResizeHandle from '../../components/ResizeHandle';
import VersionTabs from '../../components/VersionTabs';
import NuevoEjemploModal from './NuevoEjemploModal';
import ExampleSelector from './ExampleSelector';
import PerfilBlockCard from './PerfilBlockCard';
import PerfilPropertiesPanel from './PerfilPropertiesPanel';
import PerfilSectionIndex from './PerfilSectionIndex';
import { useScrollSpy } from './useScrollSpy';
import { usePlantilla, useSector, useEjemplos } from '../../lib/hooks';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import { generateId } from '../../lib/store';
import type { VersionTab, Campo, Plantilla, Ejemplo } from '../../types';

const MIN_LEFT = 200;
const MIN_RIGHT = 280;
const DEFAULT_LEFT = 272;
const DEFAULT_RIGHT = 380;

export default function PlantillaPerfilPage() {
  const { sectorId, plantillaId } = useParams<{ sectorId: string; plantillaId: string }>();
  const plantillaOriginal = usePlantilla(plantillaId!);
  const sector = useSector(sectorId!);
  const ejemplos = useEjemplos(plantillaId!);
  const { updatePlantilla, addEjemplo, updateEjemplo, pushActividad } = useAppContext();
  const { toast } = useToast();

  const [editData, setEditData] = useState<Plantilla | null>(null);
  useEffect(() => {
    if (plantillaOriginal) setEditData(structuredClone(plantillaOriginal));
  }, [plantillaOriginal]);

  const [activeTab, setActiveTab] = useState<VersionTab>('estructura');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [selectedCampoId, setSelectedCampoId] = useState<string | null>(null);
  const [activeEjemplo, setActiveEjemplo] = useState<Ejemplo | null>(null);
  const [editedValores, setEditedValores] = useState<Record<string, string>>({});
  const [showNuevoEjemplo, setShowNuevoEjemplo] = useState(false);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT);
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT);

  const handleLeftResize = useCallback((d: number) => setLeftWidth((w) => Math.max(MIN_LEFT, w + d)), []);
  const handleRightResize = useCallback((d: number) => setRightWidth((w) => Math.max(MIN_RIGHT, w - d)), []);

  const plantilla = editData;

  // Sync example values when active example changes
  useEffect(() => {
    if (activeEjemplo?.valores && Object.keys(activeEjemplo.valores).length > 0) {
      setEditedValores({ ...activeEjemplo.valores });
    } else {
      setEditedValores({});
    }
  }, [activeEjemplo]);

  // Auto-select first example
  useEffect(() => {
    if (!activeEjemplo && ejemplos.length > 0) setActiveEjemplo(ejemplos[0]);
  }, [ejemplos, activeEjemplo]);

  // Scroll-spy: watch campo IDs in the active section
  const secciones = plantilla?.secciones ?? [];
  const safeIdx = Math.min(activeSectionIndex, Math.max(0, secciones.length - 1));
  const seccionActiva = secciones[safeIdx];

  const sectionItemIds = useMemo(
    () => seccionActiva?.subsecciones.flatMap((s) => s.campos.map((c) => c.id)) ?? [],
    [seccionActiva],
  );
  const { activeId: activeItemId, containerRef, scrollToSection } = useScrollSpy(sectionItemIds);

  // Scroll to top of center panel when section changes
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setSelectedCampoId(null);
  }, [safeIdx, containerRef]);

  // Scroll to pending campo after section switch
  useEffect(() => {
    if (!pendingScrollId) return;
    const id = requestAnimationFrame(() => {
      scrollToSection(pendingScrollId);
      setPendingScrollId(null);
    });
    return () => cancelAnimationFrame(id);
  }, [pendingScrollId, scrollToSection]);

  const handleItemClick = useCallback(
    (sectionIdx: number, campoId: string) => {
      setSelectedCampoId(campoId);
      if (sectionIdx !== safeIdx) {
        setActiveSectionIndex(sectionIdx);
        setPendingScrollId(campoId);
      } else {
        scrollToSection(campoId);
      }
    },
    [safeIdx, scrollToSection],
  );

  // --- Mutations ---

  const updateBloque = useCallback((campoId: string, updates: Partial<Campo>) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      for (const sec of next.secciones) {
        for (const sub of sec.subsecciones) {
          const c = sub.campos.find((f) => f.id === campoId);
          if (c) { Object.assign(c, updates); break; }
        }
      }
      return next;
    });
  }, []);

  const addBloque = useCallback((subseccionId: string, prefijo: string, count: number) => {
    const nuevo: Campo = {
      id: generateId(),
      identificador: `${prefijo}.${count + 1}`,
      etiqueta: 'Nuevo apartado',
      tipo: 'texto_largo',
      editable: true,
      descripcion: '',
    };
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      for (const sec of next.secciones) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        if (sub) { sub.campos.push(nuevo); break; }
      }
      return next;
    });
    setSelectedCampoId(nuevo.id);
    toast('Apartado agregado');
  }, [toast]);

  const deleteBloque = useCallback((campoId: string, subseccionId: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      for (const sec of next.secciones) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        if (sub) { sub.campos = sub.campos.filter((c) => c.id !== campoId); break; }
      }
      return next;
    });
    if (selectedCampoId === campoId) setSelectedCampoId(null);
    toast('Apartado eliminado');
  }, [selectedCampoId, toast]);

  const handleExampleValueChange = useCallback((identificador: string, value: string) => {
    setEditedValores((prev) => ({ ...prev, [identificador]: value }));
  }, []);

  const handleCreateExample = useCallback((nombre: string, subtitulo: string, detalle: string) => {
    const nuevo: Ejemplo = {
      id: generateId(), nombre, subtitulo, detalle,
      plantillaId: plantillaId!, activo: false, valores: {},
    };
    addEjemplo(nuevo);
    setActiveEjemplo(nuevo);
    setEditedValores({});
    toast(`Ejemplo "${nombre}" creado`);
  }, [plantillaId, addEjemplo, toast]);

  const handleSave = useCallback(() => {
    if (!editData) return;
    updatePlantilla(editData.id, { ...editData, fechaActualizacion: new Date().toLocaleDateString('es-PE') });
    if (activeTab === 'ejemplos' && activeEjemplo) {
      updateEjemplo(activeEjemplo.id, { valores: { ...editedValores } });
      setActiveEjemplo((prev) => prev ? { ...prev, valores: { ...editedValores } } : prev);
    }
    pushActividad(`Se guardó el perfil ${editData.codigo} — ${editData.nombre}`, 'blue');
    toast(`Perfil "${editData.codigo}" guardado`);
  }, [editData, activeTab, activeEjemplo, editedValores, updatePlantilla, updateEjemplo, pushActividad, toast]);

  if (!plantilla || !sector) return <div className="p-8 text-muted">Plantilla no encontrada</div>;

  const isFirst = safeIdx === 0;
  const isLast = safeIdx === secciones.length - 1;
  const showExamples = activeTab === 'ejemplos';

  const selectedCampo = seccionActiva?.subsecciones
    .flatMap((s) => s.campos)
    .find((c) => c.id === selectedCampoId) ?? null;

  return (
    <div className="flex flex-col h-screen">
      {/* ── Top bar ── */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/sectores/${sectorId}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
            </Link>
            <span className="inline-flex items-center justify-center px-2 h-8 rounded-md border border-violet-200 text-violet-700 text-sm font-bold bg-violet-50">
              {plantilla.codigo}
            </span>
            <h1 className="text-base font-bold text-heading truncate max-w-xs">{plantilla.nombre}</h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              Perfil
            </span>
          </div>
          <div className="flex items-center gap-3">
            <VersionTabs activeTab={activeTab} onChange={setActiveTab} disableProyecto />
            {showExamples && (
              <ExampleSelector
                ejemplos={ejemplos}
                activeEjemplo={activeEjemplo}
                onSelect={setActiveEjemplo}
                onNewExample={() => setShowNuevoEjemplo(true)}
              />
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSave} className="w-3.5 h-3.5" />
              Guardar
            </button>
          </div>
        </div>
        {showExamples && (
          <div className="mt-2 text-xs text-muted flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
            Estos ejemplos alimentan el contexto de la IA.{' '}
            <strong className="text-heading">No reentrenan el modelo.</strong>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel: hierarchical index ── */}
        <div className="shrink-0 bg-white px-3 py-4 overflow-hidden flex flex-col" style={{ width: leftWidth }}>
          <PerfilSectionIndex
            secciones={secciones}
            activeSectionIndex={safeIdx}
            activeItemId={activeItemId}
            onSectionClick={(idx) => setActiveSectionIndex(idx)}
            onItemClick={handleItemClick}
          />
        </div>

        <ResizeHandle onResize={handleLeftResize} />

        {/* ── Center panel: scrollable block content ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div ref={containerRef} className="flex-1 overflow-y-auto p-6">
            {seccionActiva && (
              <motion.div
                key={seccionActiva.id + activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                {/* Section title */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-violet-500 mb-0.5 uppercase tracking-widest">
                    {seccionActiva.numero === '0' ? 'Resumen Ejecutivo' : `Sección ${seccionActiva.numero}`}
                  </p>
                  <h2 className="text-xl font-bold text-heading">{seccionActiva.nombre}</h2>
                </div>

                {/* Subsections and blocks */}
                {seccionActiva.subsecciones.map((sub) => {
                  const showSubHeader = sub.codigo !== seccionActiva.numero;
                  return (
                    <div key={sub.id} className="mb-6">
                      {showSubHeader && (
                        <div className="flex items-center gap-2 mb-4 pt-1">
                          <span className="text-xs font-bold text-violet-400 font-mono">{sub.codigo}</span>
                          <span className="text-xs font-semibold uppercase tracking-wide text-heading">
                            {sub.nombre}
                          </span>
                          <div className="flex-1 h-px bg-violet-100 ml-1" />
                        </div>
                      )}

                      {sub.campos.map((campo) => (
                        <div key={campo.id} data-section-id={campo.id} className="mb-3">
                          <PerfilBlockCard
                            campo={campo}
                            isSelected={selectedCampoId === campo.id}
                            onClick={() =>
                              setSelectedCampoId(campo.id === selectedCampoId ? null : campo.id)
                            }
                            showExampleValue={showExamples}
                            exampleValue={showExamples ? editedValores[campo.identificador] : undefined}
                            onExampleValueChange={showExamples ? handleExampleValueChange : undefined}
                            onDefaultValueChange={
                              activeTab === 'estructura'
                                ? (v) => updateBloque(campo.id, { valorEjemplo: v })
                                : undefined
                            }
                          />
                        </div>
                      ))}

                      {activeTab === 'estructura' && (
                        <button
                          onClick={() => addBloque(sub.id, sub.codigo, sub.campos.length)}
                          className="w-full py-2 mt-1 rounded-lg border-2 border-dashed border-gray-200 text-xs font-medium text-gray-400 hover:border-violet-300 hover:text-violet-600 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                          Agregar apartado
                        </button>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* ── Bottom navigation ── */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => setActiveSectionIndex((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
              Anterior
            </button>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
                {seccionActiva?.numero === '0' ? 'Resumen ejecutivo' : `Sección ${seccionActiva?.numero}`}
              </p>
              <p className="text-xs font-semibold text-heading leading-tight">
                {seccionActiva?.nombre}
              </p>
              <p className="text-[10px] text-muted mt-0.5">{safeIdx + 1} / {secciones.length}</p>
            </div>
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

        <ResizeHandle onResize={handleRightResize} />

        {/* ── Right panel: block properties ── */}
        <div className="shrink-0 bg-white p-5 overflow-y-auto" style={{ width: rightWidth }}>
          {selectedCampo ? (
            <motion.div
              key={selectedCampo.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
            >
              <PerfilPropertiesPanel
                campo={selectedCampo}
                onUpdate={activeTab === 'estructura' ? updateBloque : undefined}
              />
              {activeTab === 'estructura' && (
                <button
                  onClick={() => {
                    const sub = seccionActiva?.subsecciones.find((s) =>
                      s.campos.some((c) => c.id === selectedCampo.id),
                    );
                    if (sub) deleteBloque(selectedCampo.id, sub.id);
                  }}
                  className="mt-5 w-full py-2 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                  Eliminar apartado
                </button>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                <span className="text-violet-300 text-lg font-bold">§</span>
              </div>
              <p className="text-sm text-muted leading-snug">
                Haz clic en un apartado para ver sus propiedades
              </p>
            </div>
          )}
        </div>
      </div>

      <NuevoEjemploModal
        isOpen={showNuevoEjemplo}
        onClose={() => setShowNuevoEjemplo(false)}
        onCreate={handleCreateExample}
      />
    </div>
  );
}
