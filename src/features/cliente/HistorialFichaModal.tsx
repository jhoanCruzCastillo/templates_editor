import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useHistorialFicha, useUsuarios } from '../../lib/hooks';
import { tiempoRelativo } from '../../lib/tiempoRelativo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ejemploId: string;
}

function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export default function HistorialFichaModal({ isOpen, onClose, ejemploId }: Props) {
  const cambios = useHistorialFicha(ejemploId);
  const usuarios = useUsuarios();
  const ordenados = [...cambios].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

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
            className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Historial de cambios</h2>
                  <p className="text-sm text-muted">Quién editó esta ficha y qué cambió</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="px-6 pb-6 overflow-y-auto">
              {ordenados.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">Todavía no hay cambios guardados.</p>
              ) : (
                <div className="space-y-4">
                  {ordenados.map((cambio) => {
                    const usuario = usuarios.find((u) => u.id === cambio.usuarioId);
                    const nombre = usuario?.nombre ?? 'Usuario eliminado';
                    return (
                      <div key={cambio.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {iniciales(nombre)}
                          </div>
                          <span className="text-sm font-medium text-heading">{nombre}</span>
                          <span className="text-xs text-muted">· {tiempoRelativo(cambio.fecha)}</span>
                        </div>
                        <ul className="space-y-1 pl-9">
                          {cambio.campos.map((c, i) => (
                            <li key={i} className="text-xs text-gray-600 leading-relaxed">
                              <span className="font-medium text-heading">{c.etiqueta}</span>:{' '}
                              <span className="line-through text-gray-400">{c.valorAnterior || '(vacío)'}</span>
                              {' → '}
                              <span className="text-brand-700 font-medium">{c.valorNuevo || '(vacío)'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
