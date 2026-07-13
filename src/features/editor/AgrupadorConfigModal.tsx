import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faGear } from '@fortawesome/free-solid-svg-icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  abarcaColumnas: number;
  totalColumnas: number;
  onChange: (value: number) => void;
}

// Configura cuántas columnas fusiona (abarca) la fila de título de cada grupo, cuando
// config.agrupador === true — equivalente a `agrupador.abarca_columnas` del esquema oficial.
export default function AgrupadorConfigModal({ isOpen, onClose, abarcaColumnas, totalColumnas, onChange }: Props) {
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5 text-brand-600" />
                <h2 className="text-sm font-bold text-heading">Fila de título de grupo</h2>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-muted">
                Cantidad de <strong>cabeceras/columnas</strong> (no de columnas físicas de Excel) que fusiona el título de cada grupo, contando desde la primera cabecera de la tabla. Las cabeceras restantes quedan vacías en esa fila.
              </p>
              <p className="text-xs text-muted">
                Si alguna de esas cabeceras ya abarca varias columnas de Excel (configurado en la columna misma), el ancho real fusionado es la suma de todas ellas — ej. si la 1ª cabecera abarca 2 columnas y eliges "2", el título fusiona esa cabecera + la siguiente completa (3 columnas físicas en total).
              </p>
              <div>
                <label className="block text-[10px] font-medium text-muted mb-1">Abarca cabeceras/columnas</label>
                <input
                  type="number"
                  value={abarcaColumnas}
                  onChange={(e) => onChange(Math.min(Math.max(1, Number(e.target.value) || 1), totalColumnas))}
                  min={1}
                  max={totalColumnas}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
                <p className="text-[10px] text-muted mt-1">De un total de {totalColumnas} cabecera{totalColumnas === 1 ? '' : 's'}.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
