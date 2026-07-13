import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import ResizeHandle from '../../components/ResizeHandle';
import SectionIndex from '../editor/SectionIndex';
import SectionContent from '../editor/SectionContent';
import ExcelPreviewModal from '../editor/ExcelPreviewModal';
import ConfirmModal from '../../components/ConfirmModal';
import ClienteFichaTopBar from './ClienteFichaTopBar';
import { useEjemplo, usePlantilla, useCatalogoExcel, useExcelEjemplo } from '../../lib/hooks';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import { saveDocumentoJSON } from '../../lib/store';
import { buildDocumento } from '../../lib/schemaExport';
import { insertarValoresEnExcel } from '../../lib/excelWriter';

const MIN_LEFT = 180;
const DEFAULT_LEFT = 260;

export default function ClienteFichaEditPage() {
  const { ejemploId } = useParams<{ ejemploId: string }>();
  const ejemplo = useEjemplo(ejemploId!);
  const plantilla = usePlantilla(ejemplo?.plantillaId ?? '');
  const catalogoExcel = useCatalogoExcel(plantilla?.id ?? '');
  const archivoAsignado = catalogoExcel.archivos.find((a) => a.id === catalogoExcel.asignadoId) ?? null;
  const archivoEjemplo = useExcelEjemplo(ejemploId!);
  const { updateEjemplo, setExcelEjemplo, pushActividad } = useAppContext();
  const { toast } = useToast();

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [editedValores, setEditedValores] = useState<Record<string, string>>({});
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT);
  const [showPreview, setShowPreview] = useState(false);
  const [showInsertConfirm, setShowInsertConfirm] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [insertProgress, setInsertProgress] = useState(0);

  useEffect(() => {
    if (ejemplo) setEditedValores({ ...ejemplo.valores });
  }, [ejemplo]);

  const handleLeftResize = useCallback((d: number) => setLeftWidth((w) => Math.max(MIN_LEFT, w + d)), []);

  const handleSectionSelect = useCallback((seccionId: string) => {
    if (!plantilla) return;
    const idx = plantilla.secciones.findIndex((s) => s.id === seccionId);
    if (idx !== -1) setActiveSectionIndex(idx);
  }, [plantilla]);

  const goToPrevSection = () => setActiveSectionIndex((i) => Math.max(0, i - 1));
  const goToNextSection = () => {
    if (!plantilla) return;
    setActiveSectionIndex((i) => Math.min(plantilla.secciones.length - 1, i + 1));
  };

  const handleValueChange = useCallback((campoIdentificador: string, value: string) => {
    setEditedValores((prev) => ({ ...prev, [campoIdentificador]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (!plantilla || !ejemplo) return;
    updateEjemplo(ejemplo.id, { valores: editedValores });
    const doc = buildDocumento(plantilla, 'ejemplo', { ...ejemplo, valores: editedValores });
    saveDocumentoJSON(`${plantilla.id}__ejemplo__${ejemplo.id}`, doc);
    pushActividad(`Guardaste avances en "${ejemplo.nombre}"`, 'blue');
    toast(`"${ejemplo.nombre}" guardada`);
  }, [plantilla, ejemplo, editedValores, updateEjemplo, pushActividad, toast]);

  const handleDownload = useCallback(() => {
    if (!archivoEjemplo) { toast('Esta ficha no tiene una copia de Excel asociada', 'error'); return; }
    const a = document.createElement('a');
    a.href = archivoEjemplo.dataUrl;
    a.download = archivoEjemplo.nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [archivoEjemplo, toast]);

  const handleInsert = useCallback(async () => {
    if (!plantilla || !ejemplo || !archivoEjemplo || !archivoAsignado) {
      toast('Esta ficha no tiene una copia de Excel asociada', 'error');
      setShowInsertConfirm(false);
      return;
    }
    setIsInserting(true);
    setInsertProgress(0);
    try {
      const nuevaDataUrl = await insertarValoresEnExcel(archivoAsignado.dataUrl, plantilla, editedValores, (fraction) => {
        setInsertProgress(Math.round(fraction * 100));
      });
      setExcelEjemplo(ejemplo.id, { ...archivoEjemplo, dataUrl: nuevaDataUrl });
      pushActividad(`Se insertaron los valores de "${ejemplo.nombre}" en su Excel`, 'blue');
      toast('Valores insertados en el Excel');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'No se pudo insertar los valores en el Excel', 'error');
    } finally {
      setIsInserting(false);
      setShowInsertConfirm(false);
    }
  }, [plantilla, ejemplo, archivoEjemplo, archivoAsignado, editedValores, setExcelEjemplo, pushActividad, toast]);

  if (!ejemplo || !plantilla) {
    return <div className="p-8 text-muted">Ficha no encontrada</div>;
  }

  const secciones = plantilla.secciones;
  const safeIdx = Math.min(activeSectionIndex, secciones.length - 1);
  const seccionActiva = secciones[safeIdx];
  const isFirst = safeIdx === 0;
  const isLast = safeIdx === secciones.length - 1;

  return (
    <div className="flex flex-col h-screen">
      <ClienteFichaTopBar
        plantilla={plantilla}
        ejemplo={ejemplo}
        onSave={handleSave}
        onDownload={handleDownload}
        onInsert={() => setShowInsertConfirm(true)}
        onPreview={() => setShowPreview(true)}
      />

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
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {seccionActiva && (
                <motion.div
                  key={seccionActiva.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                >
                  <SectionContent
                    seccion={seccionActiva}
                    showExampleValues
                    exampleValores={editedValores}
                    onExampleValueChange={handleValueChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
      </div>

      <ConfirmModal
        isOpen={showInsertConfirm}
        title="Insertar valores en el Excel"
        message={`Se sobreescribirán todos los datos actuales del Excel de "${ejemplo.nombre}" con lo que llenaste. Esta acción no se puede deshacer.`}
        confirmLabel="Insertar"
        progress={isInserting ? insertProgress : null}
        onConfirm={handleInsert}
        onClose={() => setShowInsertConfirm(false)}
      />

      <ExcelPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        fileUrl={archivoEjemplo?.dataUrl ?? archivoAsignado?.dataUrl ?? null}
        fileName={archivoEjemplo?.nombre ?? archivoAsignado?.nombre}
        title={`${plantilla.codigo} — ${ejemplo.nombre}`}
      />
    </div>
  );
}
