import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faGear, faCheck } from '@fortawesome/free-solid-svg-icons';
import type { ColumnaTabla, CabeceraGrupo } from '../../types';

interface SiblingOption {
  id: string;
  nombre: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columna: ColumnaTabla | null;
  /** true cuando `columna` es la celda padre de una columna dinámica (matriz_por_periodos) */
  esDinamica?: boolean;
  onChange: (updates: Partial<ColumnaTabla>) => void;
  /** Id que identifica a esta columna para efectos de agrupación bajo cabecera (sentinel reservado si es la dinámica) */
  columnaId: string;
  /** Grupo de cabecera al que ya pertenece esta columna, si existe */
  grupo?: CabeceraGrupo;
  /** Otras columnas/unidades disponibles para agrupar junto a esta */
  siblingOptions: SiblingOption[];
  onGrupoChange: (grupo: { titulo: string; hijoIds: string[] } | null) => void;
  /** true cuando el modal se abrió desde el ícono de engranaje de una cabecera ya agrupada — oculta la posición en Excel (no aplica a un grupo) */
  soloGrupo?: boolean;
}

// Modal de configuración de una columna: posición en Excel + agrupación bajo una cabecera común
// (equivalente a `cabecera: [{titulo, hijos}]` del esquema oficial). La cabecera se define sobre
// columnas ya existentes: activar el toggle crea el grupo con esta columna como único miembro;
// luego se seleccionan otras columnas (o la columna dinámica completa) como hijas.
export default function ColumnaCapturaModal({ isOpen, onClose, columna, esDinamica, onChange, columnaId, grupo, siblingOptions, onGrupoChange, soloGrupo }: Props) {
  const agrupado = !!grupo;
  const hijoIds = grupo?.hijoIds ?? [columnaId];

  const toggleAgrupado = () => {
    onGrupoChange(agrupado ? null : { titulo: '', hijoIds: [columnaId] });
  };

  const toggleSibling = (id: string) => {
    const next = hijoIds.includes(id) ? hijoIds.filter((h) => h !== id) : [...hijoIds, id];
    onGrupoChange({ titulo: grupo?.titulo ?? '', hijoIds: next });
  };

  return (
    <AnimatePresence>
      {isOpen && columna && (
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5 text-brand-600" />
                <h2 className="text-sm font-bold text-heading">{soloGrupo ? 'Editar grupo de cabecera' : 'Configurar columna'}</h2>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
                <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {!soloGrupo && (
                <div className="space-y-3">
                  <p className="text-xs text-muted">
                    {esDinamica
                      ? `Posición de cada columna dinámica generada por "${columna.nombre}".`
                      : `Posición de "${columna.nombre}" en la hoja de Excel.`}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-medium text-muted mb-1">{esDinamica ? 'Columna inicial' : 'Columna'}</label>
                      <input
                        type="text"
                        value={columna.columnaExcel || ''}
                        onChange={(e) => onChange({ columnaExcel: e.target.value })}
                        placeholder="Ej. B"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-muted mb-1">{esDinamica ? 'Abarca (por columna)' : 'Abarca columnas'}</label>
                      <input
                        type="number"
                        value={columna.abarcaColumnasExcel ?? ''}
                        onChange={(e) => onChange({ abarcaColumnasExcel: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="1"
                        min={1}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className={soloGrupo ? 'space-y-2.5' : 'pt-3 border-t border-gray-100 space-y-2.5'}>
                <button
                  onClick={toggleAgrupado}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-[10px] font-medium text-muted">
                    {esDinamica ? 'Agrupar columnas dinámicas bajo un título' : 'Agrupar bajo un título común'}
                  </span>
                  <span className={`relative w-8 h-4.5 rounded-full transition-colors duration-100 ${agrupado ? 'bg-brand-600' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-100 ${agrupado ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                  </span>
                </button>

                {agrupado && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-medium text-muted mb-1">Título de la cabecera</label>
                      <input
                        type="text"
                        value={grupo?.titulo ?? ''}
                        onChange={(e) => onGrupoChange({ titulo: e.target.value, hijoIds })}
                        placeholder="Ej. Costos de inversión"
                        autoFocus
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                      />
                    </div>
                    {siblingOptions.length > 0 ? (
                      <div>
                        <label className="block text-[10px] font-medium text-muted mb-1">Columnas hijas</label>
                        <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                          {siblingOptions.map((opt) => {
                            const checked = hijoIds.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                onClick={() => toggleSibling(opt.id)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-gray-50 transition-colors duration-75"
                              >
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${checked ? 'bg-brand-600 border-brand-600' : 'border-gray-300'}`}>
                                  {checked && <FontAwesomeIcon icon={faCheck} className="w-2 h-2 text-white" />}
                                </span>
                                <span className="text-xs text-heading truncate">{opt.nombre}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted">No hay otras columnas disponibles para agregar como hijas.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
