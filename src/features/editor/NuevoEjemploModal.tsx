import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck, faFileAlt, faFileExcel, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { tipologiaIoarrLabels } from '../../lib/icons';
import type { TipologiaIoarr } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (nombre: string, subtitulo: string, detalle: string, tipologiasIoarr?: TipologiaIoarr[]) => void;
  /** Cada ejemplo requiere una copia del Excel asignado a la plantilla — si no hay ninguno asignado, se bloquea la creación.
   * Opcional: los editores que no manejan catálogo de Excel (p. ej. Perfil) omiten esta validación. */
  hasExcelAsignado?: boolean;
  onAssignExcel?: () => void;
  /** Solo true cuando la plantilla es IOARR — permite etiquetar qué tipología(s) representa ESTE caso puntual */
  mostrarTipologiasIoarr?: boolean;
}

export default function NuevoEjemploModal({ isOpen, onClose, onCreate, hasExcelAsignado = true, onAssignExcel, mostrarTipologiasIoarr = false }: Props) {
  const [nombre, setNombre] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [tipologias, setTipologias] = useState<TipologiaIoarr[]>([]);

  const toggleTipologia = (t: TipologiaIoarr) =>
    setTipologias((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleSubmit = () => {
    if (!nombre.trim()) return;
    onCreate(nombre.trim(), subtitulo.trim(), detalle.trim(), mostrarTipologiasIoarr ? tipologias : undefined);
    setNombre('');
    setSubtitulo('');
    setDetalle('');
    setTipologias([]);
    onClose();
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Nuevo ejemplo</h2>
                  <p className="text-sm text-muted">Caso resuelto de referencia para la IA</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {!hasExcelAsignado ? (
              <div className="px-6 pb-6 space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Esta plantilla no tiene un Excel asignado. Cada ejemplo necesita su propia copia del Excel,
                    así que primero debes asignar uno.
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                    Cancelar
                  </button>
                  <button
                    onClick={onAssignExcel}
                    className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="w-3.5 h-3.5" />
                    Asignar Excel ahora
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. I.E. N° 50123 — Wanchaq, Cusco"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Subtítulo</label>
                  <input
                    type="text"
                    value={subtitulo}
                    onChange={(e) => setSubtitulo(e.target.value)}
                    placeholder="Ej. Educación inicial"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Detalle</label>
                  <input
                    type="text"
                    value={detalle}
                    onChange={(e) => setDetalle(e.target.value)}
                    placeholder="Ej. 365 alumnos"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>

                {mostrarTipologiasIoarr && (
                  <div>
                    <label className="block text-sm font-medium text-heading mb-1.5">
                      Tipología(s) que representa este caso <span className="text-muted font-normal">(opcional)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(tipologiaIoarrLabels) as TipologiaIoarr[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTipologia(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75 ${
                            tipologias.includes(t)
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {tipologiaIoarrLabels[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!nombre.trim()}
                    className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                    Crear ejemplo
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
