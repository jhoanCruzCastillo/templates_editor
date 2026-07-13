import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../lib/context';
import { useFacturacion } from '../../lib/hooks';
import { useToast } from '../../components/Toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: string;
}

// Catálogo de planes de muestra — no hay pasarela de pago real detrás de esto.
const planes = [
  { plan: 'Plan Gratuito', precio: 'S/ 0', periodicidad: '', descripcion: 'Funciones básicas del editor' },
  { plan: 'Plan Pro', precio: 'S/ 89', periodicidad: 'Mensual', descripcion: 'Acceso completo y soporte prioritario' },
  { plan: 'Plan Equipos', precio: 'S/ 199', periodicidad: 'Mensual', descripcion: 'Para múltiples formuladores' },
];

export default function PlanesModal({ isOpen, onClose, usuarioId }: Props) {
  const { updateFacturacion } = useAppContext();
  const facturacion = useFacturacion(usuarioId);
  const { toast } = useToast();

  const handleElegir = (p: (typeof planes)[number]) => {
    const renovacion = new Date();
    renovacion.setMonth(renovacion.getMonth() + 1);
    updateFacturacion(usuarioId, {
      plan: p.plan,
      precio: p.precio,
      periodicidad: p.periodicidad,
      cancelada: false,
      fechaRenovacion: renovacion.toLocaleDateString('es-PE'),
    });
    toast(`Ahora estás en el ${p.plan}`);
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-lg p-6"
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

            <div className="space-y-3">
              {planes.map((p) => {
                const activo = facturacion.plan === p.plan;
                return (
                  <div
                    key={p.plan}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                      activo ? 'border-brand-300 bg-brand-50' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-heading">{p.plan}</p>
                      <p className="text-xs text-muted">{p.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.precio} {p.periodicidad && `· ${p.periodicidad}`}
                      </p>
                    </div>
                    {activo ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-brand-700">
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                        Actual
                      </span>
                    ) : (
                      <button
                        onClick={() => handleElegir(p)}
                        className="px-4 py-1.5 rounded-md bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors duration-75 shrink-0"
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
