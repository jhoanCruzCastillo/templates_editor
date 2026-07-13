import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  /** 0-100: si se define, reemplaza los botones por una barra de progreso y bloquea el cierre */
  progress?: number | null;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onClose,
  progress,
}: Props) {
  const isProgressing = progress != null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={isProgressing ? undefined : onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-heading mb-1">{title}</h2>
                <p className="text-sm text-muted leading-relaxed">{message}</p>
              </div>
            </div>
            {isProgressing ? (
              <div className="mt-6">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
                <p className="text-xs text-muted mt-2 text-right">{progress}%</p>
              </div>
            ) : (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors duration-75"
                >
                  {confirmLabel}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
