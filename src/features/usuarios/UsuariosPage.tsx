import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/auth';
import { useUsuarios } from '../../lib/hooks';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import { rolUsuarioLabels, faUserGear } from '../../lib/icons';
import { rolesGestionablesPor } from '../../lib/permisos';
import UsuarioModal from './UsuarioModal';
import type { Usuario, RolUsuario } from '../../types';

const rolBadge: Record<RolUsuario, string> = {
  superusuario: 'bg-amber-50 text-amber-700 border border-amber-200',
  administrador: 'bg-brand-50 text-brand-700 border border-brand-200',
  cliente: 'bg-sky-50 text-sky-700 border border-sky-200',
};

export default function UsuariosPage() {
  const { sesion } = useAuth();
  const usuarios = useUsuarios();
  const { deleteUsuario, pushActividad } = useAppContext();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Usuario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null);

  if (!sesion) return null;
  const actorRol = sesion.rol;
  const rolesVisibles = rolesGestionablesPor(actorRol);
  const lista = usuarios.filter((u) => rolesVisibles.includes(u.rol));

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUsuario(deleteTarget.id);
    pushActividad(`Se eliminó el usuario "${deleteTarget.nombre}"`, 'red');
    toast(`Usuario "${deleteTarget.nombre}" eliminado`);
    setDeleteTarget(null);
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-surface-card rounded-xl shadow-card p-6 mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-sidebar flex items-center justify-center text-white">
            <FontAwesomeIcon icon={faUserGear} className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-heading leading-tight">Usuarios y roles</h1>
            <p className="text-sm text-muted">
              {actorRol === 'superusuario'
                ? 'Gestiona superusuarios, administradores y clientes'
                : 'Gestiona los clientes del sistema'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditTarget(null);
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          Nuevo usuario
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.05 }}
        className="bg-surface-card rounded-xl shadow-card overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-4">Nombre</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Usuario</th>
              <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Rol</th>
              <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u, i) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12, delay: i * 0.03 }}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4 font-semibold text-heading text-sm">{u.nombre}</td>
                <td className="px-4 py-4 text-sm text-gray-600 font-mono">{u.usuario}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rolBadge[u.rol]}`}>
                    {rolUsuarioLabels[u.rol]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditTarget(u);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-sidebar hover:bg-sidebar-hover transition-colors"
                    >
                      <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      disabled={u.id === sesion.usuarioId}
                      title={u.id === sesion.usuarioId ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted">
                  No hay usuarios para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <UsuarioModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        actorRol={actorRol}
        usuario={editTarget}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Eliminar usuario"
        message={`¿Seguro que deseas eliminar a "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
