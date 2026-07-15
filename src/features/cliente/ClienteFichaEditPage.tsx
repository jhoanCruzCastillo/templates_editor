import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faLightbulb, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import ResizeHandle from '../../components/ResizeHandle';
import SectionIndex from '../editor/SectionIndex';
import SectionContent from '../editor/SectionContent';
import ExcelPreviewModal from '../editor/ExcelPreviewModal';
import ConfirmModal from '../../components/ConfirmModal';
import ClienteFichaTopBar from './ClienteFichaTopBar';
import AsesorIAChat from './AsesorIAChat';
import { useEjemplo, useEjemplos, usePlantilla, useExcelEjemplo, useEstadoEntrenamiento } from '../../lib/hooks';
import { useAppContext } from '../../lib/context';
import { useAuth } from '../../lib/auth';
import { cuentaEfectivaDe, puedeVerFicha } from '../../lib/permisos';
import { useToast } from '../../components/Toast';
import { saveDocumentoJSON } from '../../lib/store';
import { buildDocumento } from '../../lib/schemaExport';
import { insertarValoresEnExcel } from '../../lib/excelWriter';
import { validarValoresPlantilla, calcularProgresoValores } from '../../lib/valorValidation';

const MIN_LEFT = 180;
const DEFAULT_LEFT = 260;

export default function ClienteFichaEditPage() {
  const { ejemploId } = useParams<{ ejemploId: string }>();
  const ejemplo = useEjemplo(ejemploId!);
  const plantilla = usePlantilla(ejemplo?.plantillaId ?? '');
  const archivoEjemplo = useExcelEjemplo(ejemploId!);
  const ejemplosPlantilla = useEjemplos(plantilla?.id ?? '');
  const { usuarios, updateEjemplo, setExcelEjemplo, pushActividad } = useAppContext();
  const { sesion } = useAuth();
  const { toast } = useToast();
  const { esNivel0, vencido, diasRestantes, numeroNivel } = useEstadoEntrenamiento();
  const soloLectura = esNivel0 && vencido;
  const permiteMejoraIA = numeroNivel >= 1;

  const cuentaId = sesion ? cuentaEfectivaDe(usuarios, sesion) : null;
  const esTitular = !!sesion && sesion.usuarioId === cuentaId;
  const esPropietario =
    !!ejemplo && !!sesion && ejemplo.propietarioId === cuentaId && puedeVerFicha(ejemplo, sesion.usuarioId, esTitular);
  // Ejemplos autorados por el admin para esta plantilla (sin propietarioId) — sirven de guía al cliente.
  const ejemplosReferencia = useMemo(
    () => ejemplosPlantilla.filter((e) => !e.propietarioId),
    [ejemplosPlantilla],
  );

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [editedValores, setEditedValores] = useState<Record<string, string>>({});
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LEFT);
  const [showPreview, setShowPreview] = useState(false);
  const [showInsertConfirm, setShowInsertConfirm] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [insertProgress, setInsertProgress] = useState(0);
  const [referenciaId, setReferenciaId] = useState('');
  const referenciaEjemplo = ejemplosReferencia.find((e) => e.id === referenciaId);

  useEffect(() => {
    if (ejemplo) setEditedValores({ ...ejemplo.valores });
  }, [ejemplo]);

  // En modo entrenamiento el solucionario es el punto central del ejercicio — se preselecciona
  // en vez de dejar que el cliente tenga que descubrir el selector de "Ejemplo de referencia".
  useEffect(() => {
    if (esNivel0 && !referenciaId && ejemplosReferencia.length > 0) {
      setReferenciaId(ejemplosReferencia[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esNivel0, ejemplosReferencia]);

  const errores = useMemo(
    () => (plantilla ? validarValoresPlantilla(plantilla, editedValores) : {}),
    [plantilla, editedValores],
  );
  const erroresCount = Object.keys(errores).length;
  const progreso = useMemo(
    () => (plantilla ? calcularProgresoValores(plantilla, editedValores) : undefined),
    [plantilla, editedValores],
  );
  const erroresPorSeccion = useMemo(() => {
    if (!plantilla) return {};
    const map: Record<string, number> = {};
    for (const seccion of plantilla.secciones) {
      map[seccion.id] = seccion.subsecciones.reduce(
        (acc, sub) => acc + sub.campos.filter((c) => errores[c.identificador]).length,
        0,
      );
    }
    return map;
  }, [plantilla, errores]);

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
    if (!plantilla || !ejemplo || !archivoEjemplo) {
      toast('Esta ficha no tiene una copia de Excel asociada', 'error');
      setShowInsertConfirm(false);
      return;
    }
    setIsInserting(true);
    setInsertProgress(0);
    try {
      // Se inserta siempre sobre la copia propia de la ficha (tomada al crearla), no sobre el
      // archivo que esté asignado hoy en el catálogo — así el resultado no se rompe si el admin
      // reasigna un Excel distinto a la plantilla después de que el cliente ya empezó a llenarla.
      const nuevaDataUrl = await insertarValoresEnExcel(archivoEjemplo.dataUrl, plantilla, editedValores, (fraction) => {
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
  }, [plantilla, ejemplo, archivoEjemplo, editedValores, setExcelEjemplo, pushActividad, toast]);

  // Sin distinguir "no existe" de "no es tuya" — evita revelarle a un cliente que una ficha ajena
  // existe. Si la plantilla fue eliminada por el admin sí se distingue: es un dato propio y roto.
  if (!ejemplo || !esPropietario) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center h-full">
        <p className="text-sm font-medium text-heading">Ficha no encontrada</p>
        <p className="text-xs text-muted mt-1">Puede que haya sido eliminada o que el enlace no sea válido</p>
      </div>
    );
  }
  if (!plantilla) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center h-full">
        <p className="text-sm font-medium text-heading">La plantilla de esta ficha ya no está disponible</p>
        <p className="text-xs text-muted mt-1">Contacta al administrador para más información</p>
      </div>
    );
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
        erroresCount={erroresCount}
        progreso={progreso}
        soloLectura={soloLectura}
        onSave={handleSave}
        onDownload={handleDownload}
        onInsert={() => setShowInsertConfirm(true)}
        onPreview={() => setShowPreview(true)}
      />

      {esNivel0 && (
        <div className={`shrink-0 border-b px-6 py-2 flex items-center gap-2 text-xs ${
          soloLectura ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50/60 border-gray-100 text-blue-700'
        }`}>
          <FontAwesomeIcon icon={faGraduationCap} className="w-3.5 h-3.5 shrink-0" />
          {soloLectura
            ? 'Tu plan de entrenamiento venció — este ejercicio quedó en modo solo lectura.'
            : `Ejercicio de práctica — Plan Pedagógico · ${diasRestantes} día${diasRestantes === 1 ? '' : 's'} restantes`}
        </div>
      )}

      {ejemplosReferencia.length > 0 && (
        <div className="shrink-0 border-b border-gray-100 bg-blue-50/60 px-6 py-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faLightbulb} className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-medium text-blue-700">Ejemplo de referencia</span>
          <select
            value={referenciaId}
            onChange={(e) => setReferenciaId(e.target.value)}
            className="text-xs border border-blue-200 rounded-md px-2 py-1 bg-white text-heading focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Ninguno</option>
            {ejemplosReferencia.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="shrink-0 bg-white p-4 overflow-y-auto" style={{ width: leftWidth }}>
          <SectionIndex
            secciones={secciones}
            activeSeccionId={seccionActiva?.id ?? null}
            onSeccionClick={handleSectionSelect}
            erroresPorSeccion={erroresPorSeccion}
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
                    onExampleValueChange={soloLectura ? undefined : handleValueChange}
                    erroresValidacion={errores}
                    referenciaValores={referenciaEjemplo?.valores}
                    permiteMejoraIA={permiteMejoraIA}
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

      <AsesorIAChat plantilla={plantilla} seccionActivaId={seccionActiva?.id ?? null} permitido={permiteMejoraIA} />

      <ConfirmModal
        isOpen={showInsertConfirm}
        title="Insertar valores en el Excel"
        message={
          erroresCount > 0
            ? `Todavía tienes ${erroresCount} campo${erroresCount > 1 ? 's' : ''} pendiente${erroresCount > 1 ? 's' : ''} o con errores. Se sobreescribirán todos los datos actuales del Excel de "${ejemplo.nombre}" con lo que llenaste hasta ahora. Esta acción no se puede deshacer.`
            : `Se sobreescribirán todos los datos actuales del Excel de "${ejemplo.nombre}" con lo que llenaste. Esta acción no se puede deshacer.`
        }
        confirmLabel="Insertar"
        progress={isInserting ? insertProgress : null}
        onConfirm={handleInsert}
        onClose={() => setShowInsertConfirm(false)}
      />

      <ExcelPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        fileUrl={archivoEjemplo?.dataUrl ?? null}
        fileName={archivoEjemplo?.nombre}
        title={`${plantilla.codigo} — ${ejemplo.nombre}`}
      />
    </div>
  );
}
