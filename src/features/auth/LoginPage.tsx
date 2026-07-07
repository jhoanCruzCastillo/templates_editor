import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faRightToBracket, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/Toast';
import { rolUsuarioLabels } from '../../lib/icons';

export default function LoginPage() {
  const { sesion, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (sesion) return <Navigate to="/" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !password) return;
    const nueva = login(usuario, password);
    if (!nueva) {
      setError('Usuario o contraseña incorrectos');
      setPassword('');
      return;
    }
    toast(`Bienvenido, ${nueva.nombre} — ${rolUsuarioLabels[nueva.rol]}`);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Panel de marca */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-sidebar text-white p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center font-bold">
            P
          </div>
          <div>
            <div className="font-bold leading-tight">Proyecta Fácil</div>
            <div className="text-xs text-white/60 leading-tight">Editor de plantillas</div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <h1 className="text-3xl font-bold leading-snug mb-4">
            Plantillas digitales para la inversión pública
          </h1>
          <p className="text-white/70 text-sm leading-relaxed max-w-md">
            Convierte fichas técnicas oficiales de Invierte.pe en plantillas estructuradas y carga
            ejemplos resueltos que alimentan a la IA asistente.
          </p>
        </motion.div>

        <p className="text-[11px] text-white/40">
          Directiva N.º 001-2019-EF/63.01 — Sistema Nacional de Programación Multianual y Gestión de
          Inversiones
        </p>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-sm bg-surface-card rounded-2xl shadow-card p-8"
        >
          <div className="lg:hidden w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white mb-4">
            P
          </div>
          <h2 className="text-xl font-bold text-heading mb-1">Iniciar sesión</h2>
          <p className="text-sm text-muted mb-6">
            Ingresa tus credenciales. Tu rol se detecta automáticamente.
          </p>

          <label className="block text-sm font-medium text-heading mb-1.5">Usuario</label>
          <div className="relative mb-4">
            <FontAwesomeIcon
              icon={faUser}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            />
            <input
              type="text"
              value={usuario}
              onChange={(e) => { setUsuario(e.target.value); setError(''); }}
              placeholder="nombre de usuario"
              autoFocus
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>

          <label className="block text-sm font-medium text-heading mb-1.5">Contraseña</label>
          <div className="relative mb-4">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-75"
              title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-3.5 h-3.5" />
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4"
            >
              <FontAwesomeIcon icon={faCircleExclamation} className="w-3.5 h-3.5" />
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!usuario.trim() || !password}
            className="w-full py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faRightToBracket} className="w-3.5 h-3.5" />
            Iniciar sesión
          </button>

          <p className="text-[11px] text-muted text-center mt-6">
            Acceso para superusuarios, administradores y clientes autorizados.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
