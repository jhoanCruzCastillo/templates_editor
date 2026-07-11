import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faGear } from '@fortawesome/free-solid-svg-icons';
import ColumnDetailEditor from './ColumnDetailEditor';
import type { ColumnaTabla } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columna: ColumnaTabla | null;
  allColumnas: ColumnaTabla[];
  onChange: (updates: Partial<ColumnaTabla>) => void;
}

export default function ColumnDetailModal({ isOpen, onClose, columna, ...fieldProps }: Props) {
  return (
    <AnimatePresence>
      {isOpen && columna && (
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-sm max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5 text-brand-600" />
                <h2 className="text-sm font-bold text-heading">Configurar columna</h2>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5">
              <ColumnDetailEditor columna={columna} {...fieldProps} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
