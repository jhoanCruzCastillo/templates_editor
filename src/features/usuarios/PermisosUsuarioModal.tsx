import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck, faShieldHalved, faArrowRotateLeft, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import { catalogoPermisos, permisosDe, permisosDefaultPorRol } from '../../lib/permisosCatalogo';
import { rolUsuarioLabels } from '../../lib/icons';
import type { Usuario, PermisoId } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  numeroNivel: number;
}

export default function PermisosUsuarioModal({ isOpen, onClose, usuario, numeroNivel }: Props) {
  const { updateUsuario } = useAppContext();
  const { toast } = useToast();
  const [seleccionados, setSeleccionados] = useState<Set<PermisoId>>(new Set());

  useEffect(() => {
    if (isOpen && usuario) {
      setSeleccionados(new Set(permisosDe(usuario, numeroNivel)));
    }
  }, [isOpen, usuario, numeroNivel]);

  if (!usuario) return null;
  const esSuperusuario = usuario.rol === 'superusuario';

  const toggle = (id: PermisoId) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRestablecer = () => {
    setSeleccionados(new Set(permisosDefaultPorRol(usuario.rol, numeroNivel)));
  };

  const handleGuardar = () => {
    updateUsuario(usuario.id, { permisos: Array.from(seleccionados) });
    toast(`Permisos de "${usuario.nombre}" actualizados`);
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Permisos de {usuario.nombre}</h2>
                  <p className="text-sm text-muted">
                    Rol: {rolUsuarioLabels[usuario.rol]} — el rol es solo una etiqueta, esto es lo que realmente controla el acceso
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {esSuperusuario ? (
              <div className="px-6 pb-6">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    Los superusuarios siempre tienen acceso a todos los permisos del sistema — no se pueden restringir.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 overflow-y-auto flex-1 space-y-5 pb-4">
                  {catalogoPermisos.map((categoria) => (
                    <div key={categoria.id}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">{categoria.nombre}</p>
                      <div className="space-y-1">
                        {categoria.permisos.map((permiso) => (
                          <label
                            key={permiso.id}
                            className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-75"
                          >
                            <input
                              type="checkbox"
                              checked={seleccionados.has(permiso.id)}
                              onChange={() => toggle(permiso.id)}
                              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500/30 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-heading">{permiso.etiqueta}</p>
                              <p className="text-xs text-muted">{permiso.descripcion}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
                  <button
                    onClick={handleRestablecer}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-75 flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faArrowRotateLeft} className="w-3 h-3" />
                    Restablecer a los de su rol
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleGuardar}
                      className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                      Guardar permisos
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
