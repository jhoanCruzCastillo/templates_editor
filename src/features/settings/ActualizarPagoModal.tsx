import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../lib/context';
import { useFacturacion } from '../../lib/hooks';
import { useToast } from '../../components/Toast';
import { metodoPagoIcons, metodoPagoLabels } from '../../lib/icons';
import type { MetodoPago } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: string;
}

const marcas = ['Visa', 'Mastercard', 'American Express'];
const metodos: MetodoPago[] = ['tarjeta', 'yape', 'plin', 'mercado_pago', '360pay'];
const esBilletera = (m: MetodoPago) => m === 'yape' || m === 'plin';
const esPasarelaExterna = (m: MetodoPago) => m === 'mercado_pago' || m === '360pay';

export default function ActualizarPagoModal({ isOpen, onClose, usuarioId }: Props) {
  const { updateFacturacion } = useAppContext();
  const facturacion = useFacturacion(usuarioId);
  const { toast } = useToast();

  const [metodo, setMetodo] = useState<MetodoPago>(facturacion.metodoPago || 'tarjeta');
  const [marca, setMarca] = useState(facturacion.tarjetaMarca || marcas[0]);
  const [ultimos4, setUltimos4] = useState('');
  const [telefono, setTelefono] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMetodo(facturacion.metodoPago || 'tarjeta');
      setMarca(facturacion.tarjetaMarca || marcas[0]);
      setUltimos4('');
      setTelefono('');
    }
  }, [isOpen, facturacion.metodoPago, facturacion.tarjetaMarca]);

  const puedeGuardar =
    metodo === 'tarjeta' ? ultimos4.length === 4 : esBilletera(metodo) ? telefono.length === 9 : true;

  const handleGuardar = () => {
    if (!puedeGuardar) return;
    updateFacturacion(usuarioId, {
      metodoPago: metodo,
      ...(metodo === 'tarjeta' && { tarjetaMarca: marca, tarjetaUltimos4: ultimos4 }),
      ...(esBilletera(metodo) && { telefonoPago: telefono }),
    });
    toast('Método de pago actualizado');
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-heading">Actualizar método de pago</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <p className="text-xs text-muted mb-4">
              Datos de muestra — este panel no procesa pagos reales.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">Método de pago</label>
                <div className="grid grid-cols-2 gap-2">
                  {metodos.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMetodo(m)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors duration-75 ${
                        metodo === m ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <FontAwesomeIcon icon={metodoPagoIcons[m]} className="w-3.5 h-3.5" />
                      {metodoPagoLabels[m]}
                    </button>
                  ))}
                </div>
              </div>

              {metodo === 'tarjeta' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-heading mb-1.5">Marca de tarjeta</label>
                    <div className="flex flex-wrap gap-2">
                      {marcas.map((m) => (
                        <button
                          key={m}
                          onClick={() => setMarca(m)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors duration-75 ${
                            marca === m ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-heading mb-1.5">Últimos 4 dígitos</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={ultimos4}
                      onChange={(e) => setUltimos4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0000"
                      className="w-28 px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    />
                  </div>
                </>
              )}

              {esBilletera(metodo) && (
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    Número {metodoPagoLabels[metodo]}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="9XXXXXXXX"
                    className="w-40 px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              )}

              {esPasarelaExterna(metodo) && (
                <p className="text-xs text-muted px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
                  Al guardar, se simula la conexión con tu cuenta de {metodoPagoLabels[metodo]}. La conexión real se hace vía redirección a la pasarela.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={!puedeGuardar}
                className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                Guardar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
