import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCirclePlay } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../components/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tema: string;
}

// Prototipo sin integración real de video — en vez de depender de un video externo (frágil, se
// puede caer o quedar bloqueado), se muestra un reproductor de muestra que deja claro que es mock.
export default function GrabacionMentoriaModal({ isOpen, onClose, tema }: Props) {
  const { toast } = useToast();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-2xl shadow-modal w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <FontAwesomeIcon icon={faCirclePlay} className="w-4 h-4 text-brand-600 shrink-0" />
                <h2 className="text-sm font-bold text-heading truncate">{tema}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100 shrink-0"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <button
              onClick={() => toast('Esto es un prototipo — aquí se reproduciría la grabación real de la sesión')}
              className="w-full aspect-video bg-gray-900 flex items-center justify-center group"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-100">
                <FontAwesomeIcon icon={faCirclePlay} className="w-8 h-8 text-white" />
              </div>
            </button>
            <p className="px-4 py-2 text-[11px] text-muted">Video de muestra — no es la grabación real de esta sesión.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
