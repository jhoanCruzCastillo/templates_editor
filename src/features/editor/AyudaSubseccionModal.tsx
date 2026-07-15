import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck, faCircleQuestion, faPen, faEye } from '@fortawesome/free-solid-svg-icons';
import { renderMarkdown } from '../../lib/markdown';
import type { Subseccion } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subseccion: Subseccion;
  /** Presente = modo edición (admin, Estructura); ausente = solo lectura (Ejemplos, cliente, vista) */
  onSave?: (texto: string) => void;
}

type Tab = 'editar' | 'preview';

export default function AyudaSubseccionModal({ isOpen, onClose, subseccion, onSave }: Props) {
  const editable = !!onSave;
  const [texto, setTexto] = useState('');
  const [tab, setTab] = useState<Tab>('editar');

  useEffect(() => {
    if (isOpen) {
      setTexto(subseccion.ayuda ?? '');
      setTab('editar');
    }
  }, [isOpen, subseccion]);

  const handleGuardar = () => {
    onSave?.(texto.trim());
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.12 }}
            className={`bg-white rounded-2xl shadow-modal w-full flex flex-col ${editable ? 'max-w-2xl h-[85vh]' : 'max-w-md max-h-[85vh]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faCircleQuestion} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-heading">Ayuda para llenar</h2>
                  <p className="text-xs text-muted">{subseccion.codigo} — {subseccion.nombre}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100 shrink-0"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {editable ? (
              <>
                <div className="flex gap-1 px-6 shrink-0">
                  <button
                    onClick={() => setTab('editar')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors duration-75 ${
                      tab === 'editar' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                    Editar (Markdown)
                  </button>
                  <button
                    onClick={() => setTab('preview')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors duration-75 ${
                      tab === 'preview' ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                    Vista previa
                  </button>
                </div>

                <div className="flex-1 min-h-0 px-6 py-4">
                  {tab === 'editar' ? (
                    <textarea
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder={'Explica cómo debe llenarse esta subsección. Soporta Markdown:\n\n# Título\n**negrita**, *cursiva*, `código`\n- lista\n1. lista numerada\n[texto](url)'}
                      className="w-full h-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  ) : (
                    <div className="w-full h-full overflow-y-auto rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                      {texto.trim() ? renderMarkdown(texto) : (
                        <p className="text-sm text-muted italic">Nada que previsualizar todavía.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                    Guardar ayuda
                  </button>
                </div>
              </>
            ) : (
              <div className="px-6 pb-6 overflow-y-auto">
                {subseccion.ayuda?.trim() ? renderMarkdown(subseccion.ayuda) : (
                  <p className="text-sm text-muted italic">Todavía no hay ayuda para esta subsección.</p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
