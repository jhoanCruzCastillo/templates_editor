import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faTable, faImage } from '@fortawesome/free-solid-svg-icons';
import type { Campo } from '../../types';

interface Props {
  campo: Campo;
  onUpdate?: (campoId: string, updates: Partial<Campo>) => void;
}

type TipoBloque = 'texto_largo' | 'tabla' | 'imagen';

const tiposBloque: { value: TipoBloque; label: string; icon: typeof faAlignLeft }[] = [
  { value: 'texto_largo', label: 'Texto largo', icon: faAlignLeft },
  { value: 'tabla', label: 'Tabla', icon: faTable },
  { value: 'imagen', label: 'Imagen', icon: faImage },
];

export default function PerfilPropertiesPanel({ campo, onUpdate }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">Propiedades del bloque</h3>
        <span className="text-xs font-bold px-2 py-1 rounded bg-violet-100 text-violet-700 font-mono">
          {campo.identificador}
        </span>
      </div>

      <div className="pb-4 border-b border-gray-100">
        <div className="font-semibold text-heading text-sm">{campo.etiqueta}</div>
        <div className="text-xs text-muted mt-0.5">Apartado del Perfil</div>
      </div>

      {/* Numeral (identificador) */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">Numeral</label>
        <input
          type="text"
          value={campo.identificador}
          onChange={(e) => onUpdate?.(campo.id, { identificador: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
        />
      </div>

      {/* Título */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">Título del apartado</label>
        <input
          type="text"
          value={campo.etiqueta}
          onChange={(e) => onUpdate?.(campo.id, { etiqueta: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
        />
      </div>

      {/* Tipo de contenido */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">Tipo de contenido</label>
        <div className="flex gap-2">
          {tiposBloque.map((t) => {
            const isActive = campo.tipo === t.value;
            return (
              <button
                key={t.value}
                onClick={() => onUpdate?.(campo.id, { tipo: t.value })}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border-2 text-[11px] font-medium transition-colors duration-75 ${
                  isActive
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-500 hover:border-violet-200'
                }`}
              >
                <FontAwesomeIcon icon={t.icon} className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pauta / guía de contenido */}
      <div>
        <label className="block text-xs font-medium text-heading mb-1.5">
          Pauta / contenido mínimo
          <span className="text-muted font-normal ml-1">(guía del Anexo 07)</span>
        </label>
        <textarea
          value={campo.descripcion || ''}
          onChange={(e) => onUpdate?.(campo.id, { descripcion: e.target.value })}
          rows={5}
          placeholder="Describe qué debe contener este apartado según el Anexo 07..."
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
        />
      </div>
    </div>
  );
}
