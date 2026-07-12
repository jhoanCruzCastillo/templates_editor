import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFileExcel, faFileImport, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import ExcelViewer from '../../components/ExcelViewer';
import { useCatalogoExcel } from '../../lib/hooks';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import { generateId } from '../../lib/store';
import type { Plantilla } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plantilla: Plantilla;
}

// Catálogo de archivos Excel de referencia asignables a una plantilla: lista a la izquierda
// (con importación) y previsualización del archivo asignado a la derecha (solo lectura).
export default function ExcelCatalogModal({ isOpen, onClose, plantilla }: Props) {
  const catalogo = useCatalogoExcel(plantilla.id);
  const { addArchivoExcel, deleteArchivoExcel, asignarArchivoExcel } = useAppContext();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const asignado = catalogo.archivos.find((a) => a.id === catalogo.asignadoId) ?? null;

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addArchivoExcel(plantilla.id, {
        id: generateId(),
        nombre: file.name,
        dataUrl: reader.result as string,
        fechaSubida: new Date().toLocaleDateString('es-PE'),
      });
      toast(`Archivo "${file.name}" agregado al catálogo`);
    };
    reader.onerror = () => toast('No se pudo leer el archivo');
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-2xl shadow-modal w-[95vw] h-[95vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faFileExcel} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-heading truncate">Excel — {plantilla.codigo} · {plantilla.nombre}</h2>
                  <p className="text-xs text-muted">Gestiona el catálogo de archivos Excel de referencia de esta plantilla</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100 shrink-0"
                title="Cerrar"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>

            {/* Cuerpo: catálogo + preview */}
            <div className="flex-1 min-h-0 flex">
              {/* Izquierda: catálogo */}
              <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                  <input ref={inputRef} type="file" accept=".xlsx,.xls,.xlsm" className="hidden" onChange={handleImport} />
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="w-full py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors duration-75 flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFileImport} className="w-3.5 h-3.5" />
                    Importar Excel
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {catalogo.archivos.length === 0 ? (
                    <p className="text-xs text-muted text-center px-4 py-6">
                      Aún no hay archivos Excel en el catálogo de esta plantilla.
                    </p>
                  ) : (
                    catalogo.archivos.map((archivo) => {
                      const isAsignado = archivo.id === catalogo.asignadoId;
                      return (
                        <div
                          key={archivo.id}
                          onClick={() => asignarArchivoExcel(plantilla.id, archivo.id)}
                          className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors duration-75 ${
                            isAsignado ? 'border-brand-300 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isAsignado ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <FontAwesomeIcon icon={isAsignado ? faCheck : faFileExcel} className="w-3 h-3" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-heading truncate">{archivo.nombre}</div>
                            <div className="text-[10px] text-muted">
                              {isAsignado ? 'Asignado · ' : ''}{archivo.fechaSubida}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteArchivoExcel(plantilla.id, archivo.id); }}
                            className="w-6 h-6 rounded flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity shrink-0"
                            title="Eliminar del catálogo"
                          >
                            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Derecha: preview del archivo asignado */}
              <div className="flex-1 min-w-0">
                <ExcelViewer fileUrl={asignado?.dataUrl ?? null} emptyMessage="Importa o selecciona un archivo del catálogo para previsualizarlo" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
