import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faLayerGroup, faRightFromBracket, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../lib/auth';
import { rolUsuarioLabels } from '../lib/icons';
import type { RolUsuario } from '../types';

const navItems = [
  { to: '/', label: 'Inicio', icon: faHouse },
  { to: '/sectores', label: 'Sectores', icon: faLayerGroup },
];

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

interface Props {
  hidden?: boolean;
  onHide?: () => void;
}

export default function Sidebar({ hidden = false, onHide }: Props) {
  const { sesion, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-56 bg-sidebar text-white flex flex-col z-40 transition-transform duration-150 ease-out ${
        hidden ? '-translate-x-full' : 'translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
          P
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm leading-tight">Proyecta Fácil</div>
          <div className="text-[11px] text-white/60 leading-tight">Editor de plantillas</div>
        </div>
        {onHide && (
          <button
            onClick={onHide}
            className="w-7 h-7 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-sidebar-hover transition-colors duration-75 shrink-0"
            title="Ocultar menú"
          >
            <FontAwesomeIcon icon={faAngleLeft} className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 pt-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 px-3 mb-3">
          Navegación
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-active text-white'
                      : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                  }`
                }
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 text-center" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bloque usuario */}
      {sesion && (
        <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-active flex items-center justify-center text-xs font-bold">
            {iniciales(sesion.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{sesion.nombre}</div>
            <div className={`text-[11px] ${rolColor[sesion.rol]}`}>{rolUsuarioLabels[sesion.rol]}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/50 hover:text-white transition-colors"
            title="Cerrar sesión"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
