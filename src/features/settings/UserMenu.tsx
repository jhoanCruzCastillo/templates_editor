import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faHeadset, faCircleInfo, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../lib/auth';
import { useAppContext } from '../../lib/context';
import { useFacturacion } from '../../lib/hooks';
import { cuentaEfectivaDe } from '../../lib/permisos';
import { rolUsuarioLabels } from '../../lib/icons';
import { planes } from '../../data/planes';
import SimpleInfoModal from '../../components/SimpleInfoModal';
import SettingsModal from './SettingsModal';
import type { RolUsuario } from '../../types';

const rolColor: Record<RolUsuario, string> = {
  superusuario: 'text-amber-300',
  administrador: 'text-brand-400',
  cliente: 'text-sky-300',
};

function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export default function UserMenu() {
  const { sesion, logout } = useAuth();
  const { usuarios } = useAppContext();
  const cuentaId = sesion?.rol === 'cliente' ? cuentaEfectivaDe(usuarios, sesion) : '';
  const facturacion = useFacturacion(cuentaId);
  const plan = planes.find((p) => p.id === facturacion.planId);
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [showAjustes, setShowAjustes] = useState(false);
  const [showContacto, setShowContacto] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!sesion) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div ref={ref} className="relative px-4 py-4 border-t border-white/10">
      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.1 }}
            className="absolute left-3 right-3 bottom-full mb-2 bg-sidebar-hover rounded-xl shadow-modal border border-white/10 overflow-hidden z-50"
          >
            <button
              onClick={() => {
                setMenuAbierto(false);
                setShowAjustes(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white transition-colors duration-75"
            >
              <FontAwesomeIcon icon={faGear} className="w-4 text-center" />
              Ajustes
            </button>
            <button
              onClick={() => {
                setMenuAbierto(false);
                setShowContacto(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white transition-colors duration-75"
            >
              <FontAwesomeIcon icon={faHeadset} className="w-4 text-center" />
              Contacto
            </button>
            <button
              onClick={() => {
                setMenuAbierto(false);
                setShowInfo(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white transition-colors duration-75"
            >
              <FontAwesomeIcon icon={faCircleInfo} className="w-4 text-center" />
              Más información
            </button>
            <div className="border-t border-white/10" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 hover:text-white transition-colors duration-75"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-center" />
              Cerrar sesión
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setMenuAbierto((v) => !v)}
        className="w-full flex items-center gap-3 text-left rounded-lg hover:bg-white/5 transition-colors duration-75 -mx-1 px-1 py-1"
      >
        <div className="w-8 h-8 rounded-full bg-sidebar-active flex items-center justify-center text-xs font-bold shrink-0">
          {iniciales(sesion.nombre)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-white">{sesion.nombre}</div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-[11px] shrink-0 ${rolColor[sesion.rol]}`}>{rolUsuarioLabels[sesion.rol]}</span>
            {sesion.rol === 'cliente' && plan && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 truncate"
                title={`Plan Nivel ${plan.numeroNivel} — ${plan.nombre}`}
              >
                Nivel {plan.numeroNivel}
              </span>
            )}
          </div>
        </div>
      </button>

      {createPortal(
        <>
          <SettingsModal isOpen={showAjustes} onClose={() => setShowAjustes(false)} />

          <SimpleInfoModal
            isOpen={showContacto}
            onClose={() => setShowContacto(false)}
            icon={faHeadset}
            title="Contacto"
          >
            <p>¿Tienes dudas o encontraste un problema en el editor de plantillas?</p>
            <p>Comunícate con el equipo técnico de Proyecta Fácil a través de tu canal interno habitual.</p>
          </SimpleInfoModal>

          <SimpleInfoModal
            isOpen={showInfo}
            onClose={() => setShowInfo(false)}
            icon={faCircleInfo}
            title="Más información"
          >
            <p className="font-medium text-heading">Proyecta Fácil — Editor de plantillas</p>
            <p>
              Panel de administración para convertir fichas técnicas oficiales de inversión pública
              (Invierte.pe) en plantillas digitales, y cargar ejemplos resueltos que alimentan a la IA
              asistente del formulador.
            </p>
          </SimpleInfoModal>
        </>,
        document.body,
      )}
    </div>
  );
}
