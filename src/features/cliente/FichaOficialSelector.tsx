import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import type { Plantilla } from '../../types';

interface Props {
  plantillasCoincidentes: Plantilla[];
  selectedPlantillaId: string;
  onSelect: (plantillaId: string) => void;
}

export default function FichaOficialSelector({ plantillasCoincidentes, selectedPlantillaId, onSelect }: Props) {
  const [search, setSearch] = useState('');

  const filtradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plantillasCoincidentes;
    return plantillasCoincidentes.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q),
    );
  }, [plantillasCoincidentes, search]);

  return (
    <div>
      <label className="block text-sm font-medium text-heading mb-1.5">
        Ficha oficial <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ficha por nombre o código..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <button
          type="button"
          title="Filtros (próximamente)"
          className="w-9 h-9 shrink-0 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors duration-75"
        >
          <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
        {filtradas.map((p) => {
          const isSelected = selectedPlantillaId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors duration-75 ${
                isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="inline-flex items-center justify-center px-2 h-6 rounded-md border border-brand-200 text-brand-700 text-xs font-bold bg-brand-50 shrink-0">
                {p.codigo}
              </span>
              <span className="text-sm text-heading truncate flex-1">{p.nombre}</span>
              {isSelected && (
                <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-brand-600 shrink-0" />
              )}
            </div>
          );
        })}
        {filtradas.length === 0 && (
          <p className="px-3 py-4 text-center text-sm text-muted">
            No hay fichas de este tipo registradas en este sector.
          </p>
        )}
      </div>
    </div>
  );
}
