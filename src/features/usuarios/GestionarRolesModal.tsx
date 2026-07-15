import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck, faPen, faTrash, faTags } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../lib/context';
import { useTiposUsuario } from '../../lib/hooks';
import { useToast } from '../../components/Toast';
import { generateId } from '../../lib/store';
import ConfirmModal from '../../components/ConfirmModal';
import type { TipoUsuario } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const nivelLabel: Record<TipoUsuario['nivelBase'], string> = {
  administrador: 'Administrador',
  cliente: 'Cliente',
};

const nivelBadge: Record<TipoUsuario['nivelBase'], string> = {
  administrador: 'bg-brand-50 text-brand-700 border border-brand-200',
  cliente: 'bg-sky-50 text-sky-700 border border-sky-200',
};

export default function GestionarRolesModal({ isOpen, onClose }: Props) {
  const { addTipoUsuario, updateTipoUsuario, deleteTipoUsuario } = useAppContext();
  const tiposUsuario = useTiposUsuario();
  const { toast } = useToast();

  const [editId, setEditId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [nivelBase, setNivelBase] = useState<TipoUsuario['nivelBase']>('cliente');
  const [eliminarTarget, setEliminarTarget] = useState<TipoUsuario | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEditId(null);
      setNombre('');
      setNivelBase('cliente');
    }
  }, [isOpen]);

  const iniciarEdicion = (t: TipoUsuario) => {
    setEditId(t.id);
    setNombre(t.nombre);
    setNivelBase(t.nivelBase);
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setNombre('');
    setNivelBase('cliente');
  };

  const handleGuardar = () => {
    if (!nombre.trim()) return;
    if (editId) {
      updateTipoUsuario(editId, { nombre: nombre.trim(), nivelBase });
      toast(`Rol "${nombre.trim()}" actualizado`);
    } else {
      addTipoUsuario({ id: generateId(), nombre: nombre.trim(), nivelBase });
      toast(`Rol "${nombre.trim()}" creado`);
    }
    cancelarEdicion();
  };

  const handleEliminar = () => {
    if (!eliminarTarget) return;
    deleteTipoUsuario(eliminarTarget.id);
    toast(`Rol "${eliminarTarget.nombre}" eliminado`);
    setEliminarTarget(null);
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faTags} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Gestionar roles</h2>
                  <p className="text-sm text-muted">Etiquetas personalizadas — cada una hereda el nivel de permisos de Administrador o Cliente</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="p-4 rounded-lg border border-gray-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Nombre del rol</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Soporte Técnico, Docente..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Nivel de permisos</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {(['administrador', 'cliente'] as const).map((n) => (
                      <button
                        key={n}
                        onClick={() => setNivelBase(n)}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors duration-75 ${
                          nivelBase === n ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {nivelLabel[n]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {editId && (
                    <button
                      onClick={cancelarEdicion}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={handleGuardar}
                    disabled={!nombre.trim()}
                    className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                    {editId ? 'Guardar cambios' : 'Agregar rol'}
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
                {tiposUsuario.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-muted">Todavía no creaste roles personalizados.</p>
                )}
                {tiposUsuario.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-heading truncate">{t.nombre}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${nivelBadge[t.nivelBase]}`}>
                        {nivelLabel[t.nivelBase]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => iniciarEdicion(t)}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEliminarTarget(t)}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <ConfirmModal
            isOpen={!!eliminarTarget}
            title="Eliminar rol"
            message={`¿Seguro que deseas eliminar el rol "${eliminarTarget?.nombre}"? Los usuarios que lo tenían volverán a mostrar el nombre genérico (${eliminarTarget ? nivelLabel[eliminarTarget.nivelBase] : ''}).`}
            onConfirm={handleEliminar}
            onClose={() => setEliminarTarget(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
