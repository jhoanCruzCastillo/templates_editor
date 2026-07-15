import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../lib/context';
import { useTiposUsuario } from '../../lib/hooks';
import { useToast } from '../../components/Toast';
import { generateId } from '../../lib/store';
import { rolUsuarioLabels, faUserGear } from '../../lib/icons';
import { rolesGestionablesPor } from '../../lib/permisos';
import type { RolUsuario, Usuario } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  actorRol: RolUsuario;
  usuario?: Usuario | null;
}

export default function UsuarioModal({ isOpen, onClose, actorRol, usuario }: Props) {
  const { usuarios, addUsuario, updateUsuario, pushActividad } = useAppContext();
  const tiposUsuario = useTiposUsuario();
  const { toast } = useToast();
  const rolesDisponibles = rolesGestionablesPor(actorRol);
  // Superusuario no es un tipo de usuario asignable desde este selector — es el rol raíz del
  // sistema, no una simple etiqueta como Administrador/Cliente. Se protege aquí para que nadie
  // pueda promoverse a sí mismo ni a otros, ni degradar por accidente al único superusuario.
  const rolesSeleccionables = rolesDisponibles.filter((r) => r !== 'superusuario');
  const esEdicion = !!usuario;
  const esSuperusuarioProtegido = usuario?.rol === 'superusuario';

  const [nombre, setNombre] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<RolUsuario>(rolesSeleccionables[rolesSeleccionables.length - 1] ?? 'cliente');
  const [tipoUsuarioId, setTipoUsuarioId] = useState('');
  const [error, setError] = useState('');

  const tiposParaRol = tiposUsuario.filter((t) => t.nivelBase === rol);

  useEffect(() => {
    if (isOpen) {
      setNombre(usuario?.nombre ?? '');
      setLogin(usuario?.usuario ?? '');
      setPassword('');
      setRol(usuario?.rol ?? rolesSeleccionables[rolesSeleccionables.length - 1] ?? 'cliente');
      setTipoUsuarioId(usuario?.tipoUsuarioId ?? '');
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, usuario]);

  const handleCambiarRol = (r: RolUsuario) => {
    setRol(r);
    // La etiqueta personalizada solo tiene sentido si pertenece al nivel de rol elegido.
    if (!tiposUsuario.some((t) => t.id === tipoUsuarioId && t.nivelBase === r)) setTipoUsuarioId('');
  };

  const handleSubmit = () => {
    if (!nombre.trim() || !login.trim()) return;
    if (!esEdicion && !password.trim()) {
      setError('La contraseña es obligatoria para un usuario nuevo.');
      return;
    }
    const loginNormalizado = login.trim().toLowerCase();
    const duplicado = usuarios.some(
      (u) => u.usuario.toLowerCase() === loginNormalizado && u.id !== usuario?.id,
    );
    if (duplicado) {
      setError('Ya existe un usuario con ese nombre de acceso.');
      return;
    }

    const etiqueta = esSuperusuarioProtegido ? usuario?.tipoUsuarioId : (tipoUsuarioId || undefined);

    if (esEdicion) {
      updateUsuario(usuario!.id, {
        nombre: nombre.trim(),
        usuario: login.trim(),
        rol,
        tipoUsuarioId: etiqueta,
        ...(password.trim() ? { password: password.trim() } : {}),
      });
      pushActividad(`Se actualizó el usuario "${nombre.trim()}"`, 'blue');
      toast(`Usuario "${nombre.trim()}" actualizado`);
    } else {
      addUsuario({
        id: generateId(),
        nombre: nombre.trim(),
        usuario: login.trim(),
        password: password.trim(),
        rol,
        tipoUsuarioId: etiqueta,
      });
      pushActividad(`Se creó el usuario "${nombre.trim()}" (${tiposUsuario.find((t) => t.id === etiqueta)?.nombre ?? rolUsuarioLabels[rol]})`, 'green');
      toast(`Usuario "${nombre.trim()}" creado`);
    }
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserGear} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">
                    {esEdicion ? 'Editar usuario' : 'Nuevo usuario'}
                  </h2>
                  <p className="text-sm text-muted">
                    {esEdicion ? 'Actualiza los datos de acceso y rol' : 'Crea un nuevo acceso al panel'}
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

            <div className="px-6 pb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. María Quispe"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">
                  Usuario de acceso <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Ej. mquispe"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">
                  Contraseña{' '}
                  {esEdicion ? (
                    <span className="text-muted font-normal">(dejar en blanco para no cambiarla)</span>
                  ) : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={esEdicion ? '••••••••' : 'Contraseña nueva'}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              {esSuperusuarioProtegido ? (
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Rol</label>
                  <div className="px-3 py-2.5 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
                    Superusuario — este rol no se puede reasignar desde aquí.
                  </div>
                </div>
              ) : rolesSeleccionables.length > 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-heading mb-1.5">Rol</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                      {rolesSeleccionables.map((r) => (
                        <button
                          key={r}
                          onClick={() => handleCambiarRol(r)}
                          className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors duration-75 ${
                            rol === r
                              ? 'bg-brand-50 text-brand-700'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {rolUsuarioLabels[r]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-heading mb-1.5">
                      Etiqueta <span className="text-muted font-normal">(opcional)</span>
                    </label>
                    <select
                      value={tipoUsuarioId}
                      onChange={(e) => setTipoUsuarioId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white"
                    >
                      <option value="">{rolUsuarioLabels[rol]} (genérico)</option>
                      {tiposParaRol.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-muted">
                  <span className="text-red-500">*</span> Campos obligatorios
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!nombre.trim() || !login.trim()}
                    className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                    {esEdicion ? 'Guardar cambios' : 'Crear usuario'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
