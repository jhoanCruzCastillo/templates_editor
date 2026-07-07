import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faCheck, faCircle, faInfoCircle, faEye, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import type { Ejemplo } from '../../types';

interface Props {
  ejemplos: Ejemplo[];
  activeEjemplo: Ejemplo | null;
  onSelect: (ejemplo: Ejemplo) => void;
  onNewExample: () => void;
  onPreview: (ejemplo: Ejemplo) => void;
  onDownload: (ejemplo: Ejemplo) => void;
  onDelete: (ejemplo: Ejemplo) => void;
}

export default function ExamplesPanel({ ejemplos, activeEjemplo, onSelect, onNewExample, onPreview, onDownload, onDelete }: Props) {
  const [search, setSearch] = useState('');

  const filtered = ejemplos.filter(
    (ej) =>
      ej.nombre.toLowerCase().includes(search.toLowerCase()) ||
      ej.subtitulo.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      {/* Cabecera */}
      <div className="shrink-0 px-4 pt-4 pb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
          Ejemplos · {ejemplos.length}
        </span>
        <button
          onClick={onNewExample}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors duration-75"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
          Nuevo
        </button>
      </div>

      {/* Buscador */}
      <div className="shrink-0 px-4 pb-3">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejemplo..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.map((ej) => {
          const isActive = activeEjemplo?.id === ej.id;
          return (
            <div
              key={ej.id}
              onClick={() => onSelect(ej)}
              className={`w-full flex items-start gap-2.5 px-3 py-2.5 mb-1 rounded-lg text-left cursor-pointer transition-colors duration-75 ${
                isActive ? 'bg-brand-50 border border-brand-200' : 'border border-transparent hover:bg-gray-50'
              }`}
            >
              <FontAwesomeIcon
                icon={faCircle}
                className={`w-2 h-2 mt-1.5 shrink-0 ${isActive ? 'text-green-500' : 'text-gray-300'}`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-heading truncate">{ej.nombre}</div>
                <div className="text-xs text-muted truncate">
                  {ej.subtitulo} · {ej.detalle}
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {isActive && (
                  <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-brand-600 mr-1" />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onPreview(ej); }}
                  className="flex w-7 h-7 rounded-md items-center justify-center text-gray-400 hover:bg-brand-100 hover:text-brand-600 transition-colors duration-75"
                  title="Previsualizar"
                >
                  <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload(ej); }}
                  className="flex w-7 h-7 rounded-md items-center justify-center text-gray-400 hover:bg-brand-100 hover:text-brand-600 transition-colors duration-75"
                  title="Descargar Excel"
                >
                  <FontAwesomeIcon icon={faDownload} className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(ej); }}
                  className="flex w-7 h-7 rounded-md items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors duration-75"
                  title="Eliminar"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted">No hay ejemplos que coincidan.</p>
        )}
      </div>

      {/* Nota IA */}
      <div className="shrink-0 border-t border-gray-100 px-4 py-3 flex items-start gap-2 text-[11px] text-muted">
        <FontAwesomeIcon icon={faInfoCircle} className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
        <span>
          Estos ejemplos alimentan el contexto de la IA.{' '}
          <strong className="text-heading">No reentrenan el modelo.</strong>
        </span>
      </div>
    </div>
  );
}
