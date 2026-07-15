import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck, faFileCirclePlus, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useSectores, useEstadoEntrenamiento } from '../../lib/hooks';
import { useAppContext } from '../../lib/context';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/Toast';
import { generateId } from '../../lib/store';
import { instrumentoLabels } from '../../lib/icons';
import { cuentaEfectivaDe } from '../../lib/permisos';
import FichaOficialSelector from './FichaOficialSelector';
import type { TipoInstrumento } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Si se abre desde el catálogo "Fichas oficiales" con una plantilla ya elegida, se salta la selección de sector/tipo/ficha */
  presetPlantillaId?: string;
}

const tipos: TipoInstrumento[] = ['formato', 'perfil', 'ficha_tecnica', 'ioarr'];

export default function NuevaFichaClienteModal({ isOpen, onClose, presetPlantillaId }: Props) {
  const sectores = useSectores();
  const { plantillas, usuarios, ejemplos, excelCatalogos, addEjemplo, setExcelEjemplo, pushActividad } = useAppContext();
  const { sesion } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { esNivel0, vencido, limiteFichas } = useEstadoEntrenamiento();

  const cuentaId = sesion ? cuentaEfectivaDe(usuarios, sesion) : '';
  const misFichasCount = useMemo(
    () => ejemplos.filter((e) => e.propietarioId === cuentaId).length,
    [ejemplos, cuentaId],
  );
  const limiteAlcanzado = misFichasCount >= limiteFichas;
  const bloqueado = vencido || limiteAlcanzado;

  const [sectorId, setSectorId] = useState('');
  const [tipo, setTipo] = useState<TipoInstrumento>('ficha_tecnica');
  const [selectedPlantillaId, setSelectedPlantillaId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSectorId('');
      setTipo('ficha_tecnica');
      setSelectedPlantillaId('');
      setCodigo('');
      setNombre('');
      setDescripcion('');
      return;
    }
    if (presetPlantillaId) {
      const preset = plantillas.find((p) => p.id === presetPlantillaId);
      if (preset) {
        setSectorId(preset.sectorId);
        setTipo(preset.instrumento);
        setSelectedPlantillaId(preset.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, presetPlantillaId]);

  // Al cambiar sector o tipo, la selección de ficha oficial ya no aplica — salvo que la selección
  // actual siga siendo válida para el nuevo sector/tipo (caso del preset aplicado más arriba).
  useEffect(() => {
    setSelectedPlantillaId((prev) => {
      const prevPlantilla = plantillas.find((p) => p.id === prev);
      return prevPlantilla && prevPlantilla.sectorId === sectorId && prevPlantilla.instrumento === tipo ? prev : '';
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectorId, tipo]);

  const plantillasCoincidentes = useMemo(
    () => plantillas.filter((p) => p.sectorId === sectorId && p.instrumento === tipo && (!esNivel0 || p.disponibleNivel0)),
    [plantillas, sectorId, tipo, esNivel0],
  );

  const handleSubmit = () => {
    if (!selectedPlantillaId || !nombre.trim() || !sesion || bloqueado) return;
    const plantilla = plantillas.find((p) => p.id === selectedPlantillaId);
    if (!plantilla) return;

    const catalogo = excelCatalogos[plantilla.id];
    const archivoAsignado = catalogo?.archivos.find((a) => a.id === catalogo.asignadoId);
    if (!archivoAsignado) {
      toast('Esta ficha aún no tiene un Excel asignado por el administrador', 'error');
      return;
    }

    const nuevoId = generateId();
    addEjemplo({
      id: nuevoId,
      nombre: nombre.trim(),
      subtitulo: codigo.trim(),
      detalle: descripcion.trim(),
      plantillaId: plantilla.id,
      activo: false,
      valores: {},
      propietarioId: cuentaEfectivaDe(usuarios, sesion),
      creadoPorUsuarioId: sesion.usuarioId,
    });
    setExcelEjemplo(nuevoId, {
      id: generateId(),
      nombre: archivoAsignado.nombre,
      dataUrl: archivoAsignado.dataUrl,
      fechaSubida: new Date().toLocaleDateString('es-PE'),
    });
    pushActividad(`Se creó la ficha "${nombre.trim()}"`, 'green');
    toast(`Ficha "${nombre.trim()}" creada`);
    onClose();
    navigate(`/mis-fichas/${nuevoId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileCirclePlus} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Nueva ficha</h2>
                  <p className="text-sm text-muted">Crea y llena tu propia ficha técnica</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {bloqueado && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {vencido
                    ? 'Tu plan de entrenamiento venció — ya no puedes crear nuevos ejercicios.'
                    : esNivel0
                      ? `Alcanzaste el límite de ${limiteFichas} ejercicios simultáneos de tu plan Pedagógico. Elimina uno desde "Mis fichas" para crear otro.`
                      : `Alcanzaste el límite de ${limiteFichas} plantillas simultáneas de tu plan. Elimina una desde "Mis fichas" o compra "Plantilla adicional" en Facturación.`}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">
                  Sector <span className="text-red-500">*</span>
                </label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white"
                >
                  <option value="">Selecciona un sector...</option>
                  {sectores.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">Tipo de ficha</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {tipos.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTipo(t)}
                      className={`flex-1 px-2 py-2.5 text-xs font-medium transition-colors duration-75 ${
                        tipo === t ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {instrumentoLabels[t]}
                    </button>
                  ))}
                </div>
              </div>

              {sectorId && (
                <FichaOficialSelector
                  plantillasCoincidentes={plantillasCoincidentes}
                  selectedPlantillaId={selectedPlantillaId}
                  onSelect={setSelectedPlantillaId}
                />
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Código</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. FT-001"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Posta de Salud Villa Hermosa"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">
                  Descripción <span className="text-muted font-normal">(opcional)</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  placeholder="Breve descripción de tu proyecto..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-muted">
                  <span className="text-red-500">*</span> Campos obligatorios
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedPlantillaId || !nombre.trim() || bloqueado}
                    className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                    Crear y empezar a llenar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
