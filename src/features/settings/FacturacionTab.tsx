import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faDisplay, faUsers, faFileLines, faCartShopping, faPen, faTrash, faUserPlus, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../lib/auth';
import { useAppContext } from '../../lib/context';
import { useFacturacion, useUsuarios } from '../../lib/hooks';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import PlanesModal from './PlanesModal';
import ActualizarPagoModal from './ActualizarPagoModal';
import ComprarAddOnModal from './ComprarAddOnModal';
import ColaboradorModal from './ColaboradorModal';
import { addOns, planes, calcularTotalMensual } from '../../data/planes';
import { metodoPagoIcons, metodoPagoLabels } from '../../lib/icons';
import type { AddOn, Usuario } from '../../types';

const addonIcons: Record<string, IconDefinition> = {
  'consultoria-1a1': faDisplay,
  'usuario-adicional': faUsers,
  'plantilla-adicional': faFileLines,
};

export default function FacturacionTab() {
  const { sesion } = useAuth();
  const { updateFacturacion, updateUsuario, deleteUsuario, pushActividad } = useAppContext();
  const usuarios = useUsuarios();
  const { toast } = useToast();
  const [showPlanes, setShowPlanes] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [comprandoAddon, setComprandoAddon] = useState<AddOn | null>(null);
  const [colaboradorModal, setColaboradorModal] = useState<{ mode: 'nuevo' | 'editar'; usuario: Usuario | null } | null>(null);
  const [eliminarColaborador, setEliminarColaborador] = useState<Usuario | null>(null);

  const facturacion = useFacturacion(sesion?.usuarioId ?? '');
  if (!sesion) return null;

  const plan = planes.find((p) => p.id === facturacion.planId) ?? planes[1];
  const totalMensual = calcularTotalMensual(plan, facturacion.addons ?? {});
  const colaboradores = usuarios.filter((u) => u.cuentaClienteId === sesion.usuarioId);
  const asientosComprados = facturacion.addons?.['usuario-adicional'] ?? 0;
  const asientosTotales = plan.limiteUsuariosBase + asientosComprados;
  const asientosLibres = asientosTotales - colaboradores.length;

  const handleCancelar = () => {
    updateFacturacion(sesion.usuarioId, { cancelada: true });
    toast('Tu plan se cancelará al finalizar el periodo actual');
  };

  const handleReactivar = () => {
    updateFacturacion(sesion.usuarioId, { cancelada: false });
    toast('Tu suscripción se reactivó');
  };

  const handleQuitarAddon = (addon: AddOn) => {
    const actual = facturacion.addons ?? {};
    const cantidad = Math.max(0, (actual[addon.id] ?? 0) - 1);
    updateFacturacion(sesion.usuarioId, { addons: { ...actual, [addon.id]: cantidad } });
    toast(`Quitaste 1 × ${addon.nombre}`);
  };

  const toggleEstadoColaborador = (c: Usuario) => {
    const nuevoEstado = c.estado === 'inactivo' ? 'activo' : 'inactivo';
    updateUsuario(c.id, { estado: nuevoEstado });
    toast(`"${c.nombre}" ahora está ${nuevoEstado}`);
  };

  const handleEliminarColaborador = () => {
    if (!eliminarColaborador) return;
    deleteUsuario(eliminarColaborador.id);
    pushActividad(`Se eliminó al colaborador "${eliminarColaborador.nombre}"`, 'red');
    toast(`Colaborador "${eliminarColaborador.nombre}" eliminado`);
    setEliminarColaborador(null);
  };

  return (
    <div className="space-y-6">
      <div className="py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-heading">{facturacion.plan}</p>
            <p className="text-xs text-muted">${plan.precio} · {facturacion.periodicidad}</p>
          </div>
          <button
            onClick={() => setShowPlanes(true)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
          >
            Ajustar plan
          </button>
        </div>
        {totalMensual !== plan.precio && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-gray-50 text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>{plan.nombre} (base)</span>
              <span>${plan.precio}</span>
            </div>
            {addOns.filter((a) => a.recurrente && (facturacion.addons?.[a.id] ?? 0) > 0).map((a) => (
              <div key={a.id} className="flex justify-between">
                <span>{facturacion.addons![a.id]} × {a.nombre}</span>
                <span>${facturacion.addons![a.id] * a.precio}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-heading pt-1 border-t border-gray-200">
              <span>Total por periodo</span>
              <span>${totalMensual}</span>
            </div>
          </div>
        )}
      </div>

      {facturacion.cancelada && (
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

      <div>
        <h3 className="text-sm font-semibold text-heading mb-3">Pago</h3>
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={metodoPagoIcons[facturacion.metodoPago ?? 'tarjeta']} className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-heading">
              {facturacion.metodoPago === 'yape' || facturacion.metodoPago === 'plin'
                ? `${metodoPagoLabels[facturacion.metodoPago]} · ${facturacion.telefonoPago ?? '—'}`
                : facturacion.metodoPago === 'mercado_pago' || facturacion.metodoPago === '360pay'
                  ? metodoPagoLabels[facturacion.metodoPago]
                  : `${facturacion.tarjetaMarca} •••• ${facturacion.tarjetaUltimos4}`}
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

      <div>
        <h3 className="text-sm font-semibold text-heading mb-1">Add-ons</h3>
        <p className="text-xs text-muted mb-3">
          Servicios extra que se pagan por separado del plan — según tu nivel, puedes sumar usuarios
          colaboradores o plantillas simultáneas adicionales a los que ya incluye.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {addOns.map((a) => {
            const cantidad = facturacion.addons?.[a.id] ?? 0;
            const disponible = !a.nivelesDisponibles || a.nivelesDisponibles.includes(plan.numeroNivel);
            return (
              <div key={a.id} className={`flex flex-col rounded-lg border border-gray-200 p-4 ${!disponible ? 'opacity-60' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                  <FontAwesomeIcon icon={addonIcons[a.id]} className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-heading">{a.nombre}</p>
                <p className="text-xs text-muted mt-1 flex-1">{a.descripcion}</p>
                <p className="text-lg font-bold text-heading mt-3">
                  ${a.precio} <span className="text-xs font-normal text-muted">{a.recurrente ? '/mes c/u' : 'c/u'}</span>
                </p>
                {cantidad > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-brand-600 font-medium">{cantidad} contratado{cantidad > 1 ? 's' : ''}</span>
                    <button
                      onClick={() => handleQuitarAddon(a)}
                      className="text-xs text-red-500 hover:text-red-600 transition-colors duration-75"
                    >
                      Quitar 1
                    </button>
                  </div>
                )}
                {disponible ? (
                  <button
                    onClick={() => setComprandoAddon(a)}
                    className="mt-3 px-4 py-2 rounded-md bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center justify-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faCartShopping} className="w-3 h-3" />
                    Comprar
                  </button>
                ) : (
                  <p className="mt-3 text-[11px] text-center text-muted">
                    Disponible desde Nivel {Math.min(...(a.nivelesDisponibles ?? [0]))}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {asientosTotales > 1 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-heading">Colaboradores</h3>
            <span className="text-xs text-muted">{colaboradores.length} de {asientosTotales} asientos usados</span>
          </div>
          <p className="text-xs text-muted mb-3">
            Personas que acceden con tu cuenta. Tu plan {plan.nombre} incluye {plan.limiteUsuariosBase}
            {asientosComprados > 0 && <> + {asientosComprados} de "Usuario adicional" comprados</>}.
          </p>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left font-medium text-muted px-4 py-2">Nombre</th>
                  <th className="text-left font-medium text-muted px-4 py-2">Usuario</th>
                  <th className="text-left font-medium text-muted px-4 py-2">Estado</th>
                  <th className="text-center font-medium text-muted px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-heading">{c.nombre}</td>
                    <td className="px-4 py-2.5 text-gray-600 font-mono">{c.usuario}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => toggleEstadoColaborador(c)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full transition-colors duration-75 ${
                          c.estado === 'inactivo'
                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={c.estado === 'inactivo' ? faLock : faLockOpen} className="w-2.5 h-2.5" />
                        {c.estado === 'inactivo' ? 'Inactivo' : 'Activo'}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setColaboradorModal({ mode: 'editar', usuario: c })}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                          <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEliminarColaborador(c)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {colaboradores.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted">
                      Todavía no agregaste colaboradores.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setColaboradorModal({ mode: 'nuevo', usuario: null })}
            disabled={asientosLibres <= 0}
            title={asientosLibres <= 0 ? 'Compra más asientos de "Usuario adicional" para agregar otro colaborador' : undefined}
            className="mt-3 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faUserPlus} className="w-3.5 h-3.5" />
            Agregar colaborador
          </button>
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
      <ComprarAddOnModal
        isOpen={!!comprandoAddon}
        onClose={() => setComprandoAddon(null)}
        usuarioId={sesion.usuarioId}
        addon={comprandoAddon}
      />
      <ColaboradorModal
        isOpen={!!colaboradorModal}
        onClose={() => setColaboradorModal(null)}
        cuentaClienteId={sesion.usuarioId}
        colaborador={colaboradorModal?.usuario ?? null}
      />
      <ConfirmModal
        isOpen={!!eliminarColaborador}
        title="Eliminar colaborador"
        message={`¿Seguro que deseas eliminar a "${eliminarColaborador?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleEliminarColaborador}
        onClose={() => setEliminarColaborador(null)}
      />
    </div>
  );
}
