import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../lib/auth';
import { useAppContext } from '../../lib/context';
import { useFacturacion } from '../../lib/hooks';
import { useToast } from '../../components/Toast';
import PlanesModal from './PlanesModal';
import ActualizarPagoModal from './ActualizarPagoModal';

export default function FacturacionTab() {
  const { sesion } = useAuth();
  const { updateFacturacion } = useAppContext();
  const { toast } = useToast();
  const [showPlanes, setShowPlanes] = useState(false);
  const [showPago, setShowPago] = useState(false);

  const facturacion = useFacturacion(sesion?.usuarioId ?? '');
  if (!sesion) return null;
  const esGratuito = facturacion.plan === 'Plan Gratuito';

  const handleCancelar = () => {
    updateFacturacion(sesion.usuarioId, { cancelada: true });
    toast('Tu plan se cancelará al finalizar el periodo actual');
  };

  const handleReactivar = () => {
    updateFacturacion(sesion.usuarioId, { cancelada: false });
    toast('Tu suscripción se reactivó');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
        <div>
          <p className="text-sm font-medium text-heading">{facturacion.plan}</p>
          <p className="text-xs text-muted">
            {esGratuito ? 'Sin costo' : `${facturacion.precio} · ${facturacion.periodicidad}`}
          </p>
        </div>
        <button
          onClick={() => setShowPlanes(true)}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
        >
          Ajustar plan
        </button>
      </div>

      {!esGratuito && facturacion.cancelada && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-800 text-sm">
            <FontAwesomeIcon icon={faTriangleExclamation} className="w-3.5 h-3.5" />
            Tu plan se cancelará el {facturacion.fechaRenovacion}.
          </div>
          <button
            onClick={handleReactivar}
            className="px-3 py-1.5 rounded-md bg-white border border-amber-300 text-amber-800 text-xs font-medium hover:bg-amber-100 transition-colors duration-75 shrink-0"
          >
            Volver a suscribirse
          </button>
        </div>
      )}

      {!esGratuito && (
        <div>
          <h3 className="text-sm font-semibold text-heading mb-3">Pago</h3>
          <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCreditCard} className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-heading">
                {facturacion.tarjetaMarca} •••• {facturacion.tarjetaUltimos4}
              </span>
            </div>
            <button
              onClick={() => setShowPago(true)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
            >
              Actualizar
            </button>
          </div>
          {!facturacion.cancelada && (
            <button
              onClick={handleCancelar}
              className="mt-2 text-xs text-red-500 hover:text-red-600 transition-colors duration-75"
            >
              Cancelar plan
            </button>
          )}
        </div>
      )}

      {facturacion.facturas.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-heading mb-3">Facturas</h3>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left font-medium text-muted px-4 py-2">Fecha</th>
                  <th className="text-left font-medium text-muted px-4 py-2">Total</th>
                  <th className="text-left font-medium text-muted px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {facturacion.facturas.map((f) => (
                  <tr key={f.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2.5 text-gray-600">{f.fecha}</td>
                    <td className="px-4 py-2.5 text-gray-600">{f.total}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                        {f.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PlanesModal isOpen={showPlanes} onClose={() => setShowPlanes(false)} usuarioId={sesion.usuarioId} />
      <ActualizarPagoModal isOpen={showPago} onClose={() => setShowPago(false)} usuarioId={sesion.usuarioId} />
    </div>
  );
}
