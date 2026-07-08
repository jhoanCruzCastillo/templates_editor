import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import ResizeHandle from '../../components/ResizeHandle';
import SectionIndex from './SectionIndex';
import SectionContent from './SectionContent';
import FieldPropertiesPanel from './FieldPropertiesPanel';
import EditorTopBar from './EditorTopBar';
import ExamplesPanel from './ExamplesPanel';
import ExcelPreviewModal from './ExcelPreviewModal';
import JsonPreviewModal from './JsonPreviewModal';
import ConfirmModal from '../../components/ConfirmModal';
import NuevoEjemploModal from './NuevoEjemploModal';
import { usePlantilla, useEjemplos } from '../../lib/hooks';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import { generateId, saveDocumentoJSON } from '../../lib/store';
import { buildDocumento } from '../../lib/schemaExport';
import type { VersionTab, Campo, Plantilla, Ejemplo } from '../../types';

// Archivo de referencia del prototipo — con backend, cada ejemplo tendrá su propio archivo
const FORMATO_6A_URL = '/docs/formato6a_directiva001_2019EF6301.xlsm';

function slugify(text: string): string {
  const sinDiacriticos = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return sinDiacriticos.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function downloadJson(doc: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const MIN_LEFT = 180;
const MIN_RIGHT = 300;
const MIN_EXAMPLES = 220;
const DEFAULT_LEFT = 260;
const DEFAULT_RIGHT = 420;
const DEFAULT_EXAMPLES = 300;

export default function PlantillaEditPage() {
  const { sectorId, plantillaId } = useParams<{ sectorId: string; plantillaId: string }>();
  const plantillaOriginal = usePlantilla(plantillaId!);
  const ejemplos = useEjemplos(plantillaId!);
  const { updatePlantilla, addEjemplo, updateEjemplo, deleteEjemplo, pushActividad } = useAppContext();
  const { toast } = useToast();

  const [editData, setEditData] = useState<Plantilla | null>(null);
  useEffect(() => {
    if (plantillaOriginal) setEditData(structuredClone(plantillaOriginal));
  }, [plantillaOriginal]);

  const [activeTab, setActiveTab] = useState<VersionTab>('estructura');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [selectedCampo, setSelectedCampo] = useState<Campo | null>(null);
  const [activeEjemplo, setActiveEjemplo] = useState<Ejemplo | null>(ejemplos[0] ?? null);
  const [editedValores, setEditedValores] = useState<Record<string, string>>({});
  const [showNuevoEjemplo, setShowNuevoEjemplo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [jsonPreview, setJsonPreview] = useState<{ title: string; json: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ejemplo | null>(null);
  const [isNewCampo, setIsNewCampo] = useState(false);
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT);
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT);
  const [examplesWidth, setExamplesWidth] = useState(DEFAULT_EXAMPLES);

  const handleLeftResize = useCallback((d: number) => setLeftWidth((w) => Math.max(MIN_LEFT, w + d)), []);
  const handleRightResize = useCallback((d: number) => setRightWidth((w) => Math.max(MIN_RIGHT, w - d)), []);
  const handleExamplesResize = useCallback((d: number) => setExamplesWidth((w) => Math.max(MIN_EXAMPLES, w + d)), []);

  // Al cambiar de tab, limpiar la selección de campo (el panel de propiedades solo existe en Estructura)
  const handleTabChange = useCallback((tab: VersionTab) => {
    setActiveTab(tab);
    setSelectedCampo(null);
    setIsNewCampo(false);
  }, []);

  const plantilla = editData;

  const getDefaultValores = useCallback((): Record<string, string> => {
    if (!editData) return {};
    const defaults: Record<string, string> = {};
    for (const sec of editData.secciones) {
      for (const sub of sec.subsecciones) {
        for (const campo of sub.campos) {
          if (campo.valorEjemplo) defaults[campo.identificador] = campo.valorEjemplo;
        }
      }
    }
    return defaults;
  }, [editData]);

  useEffect(() => {
    if (activeEjemplo?.valores && Object.keys(activeEjemplo.valores).length > 0) {
      setEditedValores({ ...activeEjemplo.valores });
    } else {
      setEditedValores(getDefaultValores());
    }
  }, [activeEjemplo, getDefaultValores]);

  useEffect(() => {
    if (!activeEjemplo && ejemplos.length > 0) setActiveEjemplo(ejemplos[0]);
  }, [ejemplos, activeEjemplo]);

  // Al cambiar de sección, limpiar campo seleccionado
  const handleSectionSelect = useCallback((seccionId: string) => {
    if (!plantilla) return;
    const idx = plantilla.secciones.findIndex((s) => s.id === seccionId);
    if (idx !== -1) {
      setActiveSectionIndex(idx);
      setSelectedCampo(null);
      setIsNewCampo(false);
    }
  }, [plantilla]);

  const goToPrevSection = () => setActiveSectionIndex((i) => Math.max(0, i - 1));
  const goToNextSection = () => {
    if (!plantilla) return;
    setActiveSectionIndex((i) => Math.min(plantilla.secciones.length - 1, i + 1));
  };

  const handleFieldUpdate = useCallback((campoId: string, updates: Partial<Campo>) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      for (const sec of next.secciones) {
        for (const sub of sec.subsecciones) {
          const campo = sub.campos.find((c) => c.id === campoId);
          if (campo) { Object.assign(campo, updates); break; }
        }
      }
      return next;
    });
    setSelectedCampo((prev) => (prev && prev.id === campoId ? { ...prev, ...updates } : prev));
  }, []);

  const handleDefaultValueChange = useCallback((campoId: string, value: string) => {
    handleFieldUpdate(campoId, { valorEjemplo: value });
  }, [handleFieldUpdate]);

  const handleAddCampo = useCallback((subseccionId: string, subseccionCodigo: string, camposCount: number) => {
    const nuevoCampo: Campo = {
      id: generateId(),
      identificador: `${subseccionCodigo}.${camposCount + 1}`,
      etiqueta: 'Nuevo campo',
      tipo: 'texto_corto',
      editable: true,
      descripcion: '',
    };
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      for (const sec of next.secciones) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        if (sub) { sub.campos.push(nuevoCampo); sec.cantidadCampos += 1; break; }
      }
      return next;
    });
    setSelectedCampo(nuevoCampo);
    setIsNewCampo(true);
    toast('Campo agregado');
  }, [toast]);

  const handleSectionNameChange = useCallback((seccionId: string, nombre: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const sec = next.secciones.find((s) => s.id === seccionId);
      if (sec) sec.nombre = nombre;
      return next;
    });
  }, []);

  const handleSectionHojaChange = useCallback((seccionId: string, hoja: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const sec = next.secciones.find((s) => s.id === seccionId);
      if (sec) sec.hoja = hoja;
      return next;
    });
  }, []);

  const handleSubsectionNameChange = useCallback((subseccionId: string, nombre: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      for (const sec of next.secciones) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        if (sub) { sub.nombre = nombre; break; }
      }
      return next;
    });
  }, []);

  const handleAddSubsection = useCallback((seccionId: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const sec = next.secciones.find((s) => s.id === seccionId);
      if (sec) {
        const num = String(sec.subsecciones.length + 1).padStart(2, '0');
        sec.subsecciones.push({
          id: generateId(),
          codigo: `${sec.numero}.${num}`,
          nombre: 'NUEVA SUBSECCIÓN',
          campos: [],
        });
      }
      return next;
    });
    toast('Subsección agregada');
  }, [toast]);

  const handleDeleteSubsection = useCallback((subseccionId: string, seccionId: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const sec = next.secciones.find((s) => s.id === seccionId);
      if (sec && sec.subsecciones.length > 1) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        sec.subsecciones = sec.subsecciones.filter((s) => s.id !== subseccionId);
        if (sub) sec.cantidadCampos -= sub.campos.length;
      }
      return next;
    });
  }, []);

  const handleDeleteCampo = useCallback((campoId: string, subseccionId: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      for (const sec of next.secciones) {
        const sub = sec.subsecciones.find((s) => s.id === subseccionId);
        if (sub) {
          sub.campos = sub.campos.filter((c) => c.id !== campoId);
          sec.cantidadCampos = sec.subsecciones.reduce((sum, s) => sum + s.campos.length, 0);
          break;
        }
      }
      return next;
    });
    setSelectedCampo((prev) => (prev?.id === campoId ? null : prev));
  }, []);

  const handleAddSection = useCallback(() => {
    setEditData((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const num = String(next.secciones.length + 1).padStart(2, '0');
      next.secciones.push({
        id: generateId(),
        numero: num,
        nombre: 'Nueva sección',
        cantidadCampos: 0,
        subsecciones: [{ id: generateId(), codigo: `${num}.01`, nombre: 'SUBSECCIÓN', campos: [] }],
      });
      next.cantidadSecciones = next.secciones.length;
      return next;
    });
    // Navegar a la nueva sección
    setActiveSectionIndex((prev) => (plantilla ? plantilla.secciones.length : prev));
    toast('Sección agregada');
  }, [toast, plantilla]);

  const handleExampleValueChange = useCallback((campoIdentificador: string, value: string) => {
    setEditedValores((prev) => ({ ...prev, [campoIdentificador]: value }));
  }, []);

  const handleCreateExample = useCallback((nombre: string, subtitulo: string, detalle: string) => {
    const nuevo: Ejemplo = {
      id: generateId(), nombre, subtitulo, detalle,
      plantillaId: plantillaId!, activo: false, valores: {},
    };
    addEjemplo(nuevo);
    setActiveEjemplo(nuevo);
    setEditedValores({});
    pushActividad(`Nuevo ejemplo "${nombre}" creado`, 'green');
    toast(`Ejemplo "${nombre}" creado — completa los valores`);
  }, [plantillaId, addEjemplo, pushActividad, toast]);

  const handleDownloadExcel = useCallback(() => {
    const a = document.createElement('a');
    a.href = FORMATO_6A_URL;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const handleDeleteEjemplo = useCallback(() => {
    if (!deleteTarget) return;
    deleteEjemplo(deleteTarget.id);
    if (activeEjemplo?.id === deleteTarget.id) {
      const restantes = ejemplos.filter((e) => e.id !== deleteTarget.id);
      setActiveEjemplo(restantes[0] ?? null);
    }
    pushActividad(`Se eliminó el ejemplo "${deleteTarget.nombre}"`, 'orange');
    toast(`Ejemplo "${deleteTarget.nombre}" eliminado`);
    setDeleteTarget(null);
  }, [deleteTarget, deleteEjemplo, activeEjemplo, ejemplos, pushActividad, toast]);

  const handleSave = useCallback(() => {
    if (!editData) return;
    updatePlantilla(editData.id, { ...editData, fechaActualizacion: new Date().toLocaleDateString('es-PE') });

    const estructuraDoc = buildDocumento(editData, 'estructura');
    saveDocumentoJSON(`${editData.id}__estructura`, estructuraDoc);

    if (activeTab === 'ejemplos' && activeEjemplo) {
      const valores = { ...editedValores };
      updateEjemplo(activeEjemplo.id, { valores });
      setActiveEjemplo((prev) => prev ? { ...prev, valores } : prev);
      const ejemploDoc = buildDocumento(editData, 'ejemplo', { ...activeEjemplo, valores });
      saveDocumentoJSON(`${editData.id}__ejemplo__${activeEjemplo.id}`, ejemploDoc);
      downloadJson(ejemploDoc, `${editData.codigo}_ejemplo_${slugify(activeEjemplo.nombre)}.json`);
    } else {
      downloadJson(estructuraDoc, `${editData.codigo}_estructura.json`);
    }

    pushActividad(`Se guardó la plantilla ${editData.codigo} — ${editData.nombre}`, 'blue');
    toast(`Plantilla "${editData.codigo}" guardada`);
  }, [editData, activeTab, activeEjemplo, editedValores, updatePlantilla, updateEjemplo, pushActividad, toast]);

  const handleViewJson = useCallback(() => {
    if (!editData) return;
    if (activeTab === 'ejemplos' && activeEjemplo) {
      const doc = buildDocumento(editData, 'ejemplo', { ...activeEjemplo, valores: editedValores });
      setJsonPreview({ title: `${editData.codigo} — Ejemplo: ${activeEjemplo.nombre}`, json: JSON.stringify(doc, null, 2) });
    } else {
      const doc = buildDocumento(editData, 'estructura');
      setJsonPreview({ title: `${editData.codigo} — Estructura`, json: JSON.stringify(doc, null, 2) });
    }
  }, [editData, activeTab, activeEjemplo, editedValores]);

  if (!plantilla) return <div className="p-8 text-muted">Plantilla no encontrada</div>;

  const showExamples = activeTab === 'ejemplos';
  const secciones = plantilla.secciones;
  const safeIdx = Math.min(activeSectionIndex, secciones.length - 1);
  const seccionActiva = secciones[safeIdx];
  const isFirst = safeIdx === 0;
  const isLast = safeIdx === secciones.length - 1;

  return (
    <div className="flex flex-col h-screen">
      <EditorTopBar
        plantilla={plantilla}
        sectorId={sectorId!}
        plantillaId={plantillaId!}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSave={handleSave}
        onPreviewExcel={() => setShowPreview(true)}
        onViewJson={handleViewJson}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Panel de ejemplos (extremo izquierdo) — solo en el tab Ejemplos */}
        {showExamples && (
          <>
            <div className="shrink-0 bg-white overflow-hidden border-r border-gray-100" style={{ width: examplesWidth }}>
              <ExamplesPanel
                ejemplos={ejemplos}
                activeEjemplo={activeEjemplo}
                onSelect={setActiveEjemplo}
                onNewExample={() => setShowNuevoEjemplo(true)}
                onPreview={() => setShowPreview(true)}
                onDownload={handleDownloadExcel}
                onDelete={setDeleteTarget}
              />
            </div>
            <ResizeHandle onResize={handleExamplesResize} />
          </>
        )}

        {/* Índice de navegación de secciones */}
        <div className="shrink-0 bg-white p-4 overflow-y-auto" style={{ width: leftWidth }}>
          <SectionIndex
            secciones={secciones}
            activeSeccionId={seccionActiva?.id ?? null}
            onSeccionClick={handleSectionSelect}
            showAddButton
            onAddSection={handleAddSection}
          />
        </div>

        <ResizeHandle onResize={handleLeftResize} />

        {/* Panel central: solo la sección activa */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
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
                    exampleValores={showExamples ? editedValores : undefined}
                    onExampleValueChange={showExamples ? handleExampleValueChange : undefined}
                    selectedCampoId={selectedCampo?.id}
                    onCampoClick={(c) => { setSelectedCampo(c); setIsNewCampo(false); }}
                    onAddCampo={handleAddCampo}
                    onDeleteCampo={handleDeleteCampo}
                    onSectionNameChange={handleSectionNameChange}
                    onSectionHojaChange={handleSectionHojaChange}
                    onSubsectionNameChange={handleSubsectionNameChange}
                    onAddSubsection={handleAddSubsection}
                    onDeleteSubsection={handleDeleteSubsection}
                    onDefaultValueChange={!showExamples ? handleDefaultValueChange : undefined}
                    showMenuButton
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navegación inferior: Anterior / Sección X de Y / Siguiente */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-between">
            <button
              onClick={goToPrevSection}
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
              onClick={goToNextSection}
              disabled={isLast}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Panel derecho: propiedades del campo — solo en el tab Estructura */}
        {!showExamples && (
          <>
            <ResizeHandle onResize={handleRightResize} />
            <div className="shrink-0 bg-white p-5 overflow-y-auto" style={{ width: rightWidth }}>
              {selectedCampo ? (
                <motion.div key={selectedCampo.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.1 }}>
                  <FieldPropertiesPanel
                    campo={selectedCampo}
                    autoFocusEtiqueta={isNewCampo}
                    ejemplosCount={ejemplos.length}
                    onFieldUpdate={handleFieldUpdate}
                  />
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted text-sm text-center px-4">
                  Selecciona un campo para ver sus propiedades
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <NuevoEjemploModal
        isOpen={showNuevoEjemplo}
        onClose={() => setShowNuevoEjemplo(false)}
        onCreate={handleCreateExample}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Eliminar ejemplo"
        message={`¿Seguro que deseas eliminar el ejemplo "${deleteTarget?.nombre}"? Sus valores se perderán y esta acción no se puede deshacer.`}
        onConfirm={handleDeleteEjemplo}
        onClose={() => setDeleteTarget(null)}
      />

      <ExcelPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        fileUrl={FORMATO_6A_URL}
        title="Formato 6A — Directiva 001-2019-EF/63.01"
      />

      <JsonPreviewModal
        isOpen={!!jsonPreview}
        onClose={() => setJsonPreview(null)}
        title={jsonPreview?.title ?? ''}
        json={jsonPreview?.json ?? ''}
      />
    </div>
  );
}
