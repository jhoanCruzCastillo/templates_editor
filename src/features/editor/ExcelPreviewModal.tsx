import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFileExcel, faDownload } from '@fortawesome/free-solid-svg-icons';
import ExcelViewer from '../../components/ExcelViewer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName?: string;
  title: string;
}

export default function ExcelPreviewModal({ isOpen, onClose, fileUrl, fileName, title }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-2xl shadow-modal w-[95vw] h-[95vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faFileExcel} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-heading truncate">{title}</h2>
                  <p className="text-xs text-muted">{fileUrl ? 'Previsualización — solo lectura' : 'Sin Excel asignado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {fileUrl && (
                  <a
                    href={fileUrl}
                    download={fileName ?? ''}
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                    Descargar
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
                  title="Cerrar"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visor */}
            <div className="flex-1 min-h-0">
              <ExcelViewer fileUrl={fileUrl} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
