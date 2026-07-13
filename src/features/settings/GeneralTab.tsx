import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../lib/auth';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import type { TemaPreferencia } from '../../types';

const temaOpciones: { id: TemaPreferencia; label: string }[] = [
  { id: 'claro', label: 'Claro' },
  { id: 'oscuro', label: 'Oscuro' },
  { id: 'sistema', label: 'Sistema' },
];

function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export default function GeneralTab() {
  const { sesion, actualizarNombreSesion } = useAuth();
  const { usuarios, updateUsuario } = useAppContext();
  const { toast } = useToast();
  const usuario = usuarios.find((u) => u.id === sesion?.usuarioId);

  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [apodo, setApodo] = useState(usuario?.apodo ?? '');
  const [tema, setTema] = useState<TemaPreferencia>(usuario?.tema ?? 'sistema');

  useEffect(() => {
    setNombre(usuario?.nombre ?? '');
    setApodo(usuario?.apodo ?? '');
    setTema(usuario?.tema ?? 'sistema');
  }, [usuario]);

  if (!sesion || !usuario) return null;

  const handleGuardar = () => {
    if (!nombre.trim()) return;
    updateUsuario(usuario.id, { nombre: nombre.trim(), apodo: apodo.trim() || undefined, tema });
    actualizarNombreSesion(nombre.trim());
    toast('Preferencias guardadas');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-heading mb-2">Avatar</label>
        <div className="w-16 h-16 rounded-full bg-sidebar text-white flex items-center justify-center text-lg font-bold">
          {iniciales(nombre || usuario.nombre)}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-heading mb-1.5">Nombre completo</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-heading mb-1.5">¿Cómo quieres que te llame?</label>
        <input
          type="text"
          value={apodo}
          onChange={(e) => setApodo(e.target.value)}
          placeholder={nombre.split(' ')[0] || 'Ej. Carlos'}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-heading mb-1.5">Preferencia de tema</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
          {temaOpciones.map((op) => (
            <button
              key={op.id}
              onClick={() => setTema(op.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-75 ${
                tema === op.id ? 'bg-brand-50 text-brand-700' : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={!nombre.trim()}
          className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
