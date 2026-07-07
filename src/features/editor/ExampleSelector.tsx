import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faSearch, faPlus, faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ejemplo } from '../../types';

interface Props {
  ejemplos: Ejemplo[];
  activeEjemplo: Ejemplo | null;
  onSelect: (ejemplo: Ejemplo) => void;
  onNewExample: () => void;
}

export default function ExampleSelector({ ejemplos, activeEjemplo, onSelect, onNewExample }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = ejemplos.filter(
    (ej) =>
      ej.nombre.toLowerCase().includes(search.toLowerCase()) ||
      ej.subtitulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
        Ejemplo activo
      </span>
      <div ref={ref} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm hover:border-brand-300 transition-colors min-w-70"
        >
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="flex-1 text-left truncate text-heading font-medium">
            {activeEjemplo?.nombre || 'Seleccionar ejemplo'}
          </span>
          <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 text-gray-400" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full left-0 mt-1 w-90 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
            >
              {/* Buscador */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar ejemplo por nombre o ubicación..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    autoFocus
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="max-h-60 overflow-y-auto">
                {filtered.map((ej) => {
                  const isActive = activeEjemplo?.id === ej.id;
                  return (
                    <button
                      key={ej.id}
                      onClick={() => {
                        onSelect(ej);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        isActive ? 'bg-brand-50/50' : ''
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faCircle}
                        className={`w-2.5 h-2.5 mt-1.5 shrink-0 ${
                          isActive ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-heading truncate">{ej.nombre}</div>
                        <div className="text-xs text-muted">
                          {ej.subtitulo} · {ej.detalle}
                        </div>
                      </div>
                      {isActive && (
                        <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-brand-600 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={onNewExample}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
      >
        <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
        Nuevo ejemplo
      </button>
    </div>
  );
}
