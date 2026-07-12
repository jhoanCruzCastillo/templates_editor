import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faGear } from '@fortawesome/free-solid-svg-icons';
import type { Seccion } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  seccion: Seccion | null;
  onChange: (hoja: string) => void;
}

// Modal mínimo para asignar la hoja de Excel de una sección, accesible desde el ícono de
// engranaje en el índice de secciones (además del input inline dentro del contenido de la sección).
export default function SeccionHojaModal({ isOpen, onClose, seccion, onChange }: Props) {
  return (
    <AnimatePresence>
      {isOpen && seccion && (
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5 text-brand-600" />
                <h2 className="text-sm font-bold text-heading">Hoja de Excel</h2>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-muted">
                Pestaña de Excel donde se ubican los campos de la sección "{seccion.nombre}".
              </p>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-1">Nombre de la hoja</label>
                <input
                  type="text"
                  value={seccion.hoja || ''}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Ej. DATOS GENERALES"
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
