import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faMinus, faPlus, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../lib/context';
import { useFacturacion } from '../../lib/hooks';
import { useToast } from '../../components/Toast';
import { generateId } from '../../lib/store';
import type { AddOn } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: string;
  addon: AddOn | null;
}

// Compra de un add-on — genera una factura de muestra y suma la cantidad al total contratado.
// No hay pasarela de pago real detrás (igual que ActualizarPagoModal).
export default function ComprarAddOnModal({ isOpen, onClose, usuarioId, addon }: Props) {
  const { updateFacturacion } = useAppContext();
  const facturacion = useFacturacion(usuarioId);
  const { toast } = useToast();
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (isOpen) setCantidad(1);
  }, [isOpen, addon]);

  if (!addon) return null;
  const cantidadActual = facturacion.addons?.[addon.id] ?? 0;
  const total = addon.precio * cantidad;

  const handleConfirmar = () => {
    const addons = { ...(facturacion.addons ?? {}) };
    addons[addon.id] = (addons[addon.id] ?? 0) + cantidad;
    const factura = {
      id: generateId(),
      fecha: new Date().toLocaleDateString('es-PE'),
      total: `$${total.toFixed(2)}`,
      estado: 'Pagado' as const,
    };
    updateFacturacion(usuarioId, { addons, facturas: [factura, ...facturacion.facturas] });
    toast(`Compraste ${cantidad} × ${addon.nombre}`);
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
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
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
              <h2 className="text-lg font-bold text-heading">Comprar add-on</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 mb-4">
              <p className="text-sm font-semibold text-heading">{addon.nombre}</p>
              <p className="text-xs text-muted mt-0.5">{addon.descripcion}</p>
              <p className="text-xs text-gray-500 mt-1">${addon.precio} c/u</p>
              {cantidadActual > 0 && (
                <p className="text-xs text-brand-600 mt-1">Ya tienes {cantidadActual} contratado{cantidadActual > 1 ? 's' : ''}.</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-heading mb-1.5">Cantidad a comprar</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  disabled={cantidad <= 1}
                  className="w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-75"
                >
                  <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-heading">{cantidad}</span>
                <button
                  onClick={() => setCantidad((c) => c + 1)}
                  className="w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-colors duration-75"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 mb-6">
              <span className="text-sm text-muted">Total a pagar</span>
              <span className="text-lg font-bold text-heading">${total.toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faCartShopping} className="w-3.5 h-3.5" />
                Confirmar compra
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
