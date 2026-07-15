import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../lib/context';
import { useFacturacion } from '../../lib/hooks';
import { useToast } from '../../components/Toast';
import { planes } from '../../data/planes';
import type { Plan } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: string;
}

export default function PlanesModal({ isOpen, onClose, usuarioId }: Props) {
  const { updateFacturacion } = useAppContext();
  const facturacion = useFacturacion(usuarioId);
  const { toast } = useToast();

  const handleElegir = (p: Plan) => {
    const renovacion = new Date();
    renovacion.setMonth(renovacion.getMonth() + 1);
    updateFacturacion(usuarioId, {
      planId: p.id,
      plan: `Nivel ${p.numeroNivel} — ${p.nombre}`,
      precio: `$${p.precio}`,
      periodicidad: p.periodicidad,
      cancelada: false,
      fechaRenovacion: renovacion.toLocaleDateString('es-PE'),
      fechaInicioPlan: new Date().toISOString(),
    });
    toast(`Ahora estás en el Nivel ${p.numeroNivel} — ${p.nombre}`);
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-heading">Elige un plan</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {planes.map((p) => {
                const activo = facturacion.planId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`flex flex-col rounded-xl border p-4 ${
                      activo ? 'border-brand-300 bg-brand-50' : 'border-gray-200'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                      Nivel {p.numeroNivel}
                    </p>
                    <p className="text-base font-bold text-heading mb-1">{p.nombre}</p>
                    <p className="text-2xl font-bold text-heading">
                      ${p.precio}
                      <span className="text-xs font-normal text-muted"> · {p.periodicidad}</span>
                    </p>
                    <ul className="flex-1 space-y-1.5 my-4">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600 leading-snug">
                          <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5 text-brand-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {activo ? (
                      <span className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-brand-700 bg-brand-100">
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                        Plan actual
                      </span>
                    ) : (
                      <button
                        onClick={() => handleElegir(p)}
                        className="px-4 py-2 rounded-md bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors duration-75"
                      >
                        Elegir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
