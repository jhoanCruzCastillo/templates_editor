import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { Seccion } from '../../types';

interface Props {
  secciones: Seccion[];
  activeSectionIndex: number;
  activeItemId: string | null;
  onSectionClick: (idx: number) => void;
  onItemClick: (sectionIdx: number, campoId: string) => void;
}

export default function PerfilSectionIndex({
  secciones,
  activeSectionIndex,
  activeItemId,
  onSectionClick,
  onItemClick,
}: Props) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ [activeSectionIndex]: true });

  useEffect(() => {
    setExpanded((prev) => ({ ...prev, [activeSectionIndex]: true }));
  }, [activeSectionIndex]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3 px-2 shrink-0">
        Estructura · {secciones.length} secciones
      </h3>
      <nav className="flex-1 overflow-y-auto space-y-0.5 pr-1">
        {secciones.map((sec, idx) => {
          const isActive = activeSectionIndex === idx;
          const isExpanded = !!expanded[idx];

          return (
            <div key={sec.id}>
              {/* Section header row */}
              <div
                className={`flex items-center rounded-lg group ${
                  isActive ? 'bg-violet-50' : 'hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => {
                    onSectionClick(idx);
                    setExpanded((prev) => ({ ...prev, [idx]: true }));
                  }}
                  className={`flex-1 flex items-center gap-2 px-2.5 py-2 text-left transition-colors duration-75 ${
                    isActive ? 'text-violet-700' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 font-mono ${
                      isActive ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {sec.numero === '0' ? 'RE' : sec.numero}
                  </span>
                  <span
                    className={`text-xs font-semibold leading-tight truncate ${
                      isActive ? 'text-violet-700' : 'text-gray-700'
                    }`}
                  >
                    {sec.nombre}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-300 hover:text-gray-500 transition-colors mr-1 shrink-0"
                >
                  <FontAwesomeIcon
                    icon={isExpanded ? faChevronDown : faChevronRight}
                    className="w-2.5 h-2.5"
                  />
                </button>
              </div>

              {/* Expanded: subsection labels + campo leaves */}
              {isExpanded && (
                <div className="ml-3.5 mt-0.5 mb-1.5 pl-2.5 border-l-2 border-gray-100 space-y-0.5">
                  {sec.subsecciones.map((sub) => {
                    const showSubLabel = sub.codigo !== sec.numero;
                    return (
                      <div key={sub.id}>
                        {showSubLabel && (
                          <div className="px-1.5 pt-2 pb-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                              {sub.codigo} · {sub.nombre}
                            </span>
                          </div>
                        )}
                        {sub.campos.map((campo) => {
                          const isItem = activeItemId === campo.id;
                          return (
                            <button
                              key={campo.id}
                              onClick={() => onItemClick(idx, campo.id)}
                              className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left transition-colors duration-75 ${
                                isItem
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                              }`}
                            >
                              <span
                                className={`text-[9px] font-mono font-bold shrink-0 mt-0.5 min-w-[2rem] ${
                                  isItem ? 'text-violet-500' : 'text-gray-400'
                                }`}
                              >
                                {campo.identificador}
                              </span>
                              <span className="text-[11px] leading-tight line-clamp-2 flex-1">
                                {campo.etiqueta}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
