import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFileExcel, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

interface SheetData {
  name: string;
  html: string;
}

export default function ExcelPreviewModal({ isOpen, onClose, fileUrl, title }: Props) {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parsear el workbook la primera vez que se abre (solo lectura)
  useEffect(() => {
    if (!isOpen || sheets.length > 0 || loading) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [XLSX, res] = await Promise.all([import('xlsx'), fetch(fileUrl)]);
        if (!res.ok) throw new Error(`No se pudo cargar el archivo (${res.status})`);
        const buffer = await res.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const parsed = workbook.SheetNames.map((name) => ({
          name,
          html: XLSX.utils.sheet_to_html(workbook.Sheets[name]),
        }));
        if (!cancelled) setSheets(parsed);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al leer el archivo');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, fileUrl, sheets.length, loading]);

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
                  <h2 className="text-base font-bold text-heading truncate">{title}</h2>
                  <p className="text-xs text-muted">Previsualización — solo lectura</p>
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

            {/* Tabs de hojas */}
            {sheets.length > 0 && (
              <div className="shrink-0 flex items-center gap-1 px-4 pt-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
                {sheets.map((sheet, i) => (
                  <button
                    key={sheet.name}
                    onClick={() => setActiveSheet(i)}
                    className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-t-lg border border-b-0 transition-colors duration-75 ${
                      activeSheet === i
                        ? 'bg-white border-gray-200 text-brand-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {sheet.name}
                  </button>
                ))}
              </div>
            )}

            {/* Contenido */}
            <div className="flex-1 overflow-auto bg-gray-50/50">
              {loading && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-muted">
                  <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin text-brand-600" />
                  <span className="text-sm">Cargando formato...</span>
                </div>
              )}
              {error && (
                <div className="h-full flex items-center justify-center text-sm text-red-600">{error}</div>
              )}
              {!loading && !error && sheets[activeSheet] && (
                <div
                  className="p-4 min-w-max [&_table]:border-collapse [&_table]:bg-white [&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs [&_td]:text-gray-700 [&_td]:whitespace-nowrap [&_td]:align-top"
                  dangerouslySetInnerHTML={{ __html: sheets[activeSheet].html }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
