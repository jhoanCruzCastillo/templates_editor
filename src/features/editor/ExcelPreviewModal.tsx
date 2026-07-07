import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFileExcel, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

const VENDOR = '/vendor/luckysheet';
const CSS_FILES = [
  `${VENDOR}/plugins/css/pluginsCss.css`,
  `${VENDOR}/plugins/plugins.css`,
  `${VENDOR}/css/luckysheet.css`,
  `${VENDOR}/assets/iconfont/iconfont.css`,
];
const JS_FILES = [`${VENDOR}/plugins/js/plugin.js`, `${VENDOR}/luckysheet.umd.js`];

// Inyecta un <link> o <script> una sola vez y espera a que cargue
function loadAsset(url: string, kind: 'css' | 'js'): Promise<void> {
  return new Promise((resolve, reject) => {
    const selector = kind === 'css' ? `link[href="${url}"]` : `script[src="${url}"]`;
    if (document.querySelector(selector)) return resolve();
    const el = kind === 'css' ? document.createElement('link') : document.createElement('script');
    if (el instanceof HTMLLinkElement) {
      el.rel = 'stylesheet';
      el.href = url;
    } else {
      el.src = url;
    }
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
    document.head.appendChild(el);
  });
}

export default function ExcelPreviewModal({ isOpen, onClose, fileUrl, title }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const sheetsRef = useRef<unknown[] | null>(null);

  // Cargar assets del visor + convertir el xlsm (se cachea entre aperturas)
  useEffect(() => {
    if (!isOpen) return;
    let disposed = false;
    (async () => {
      try {
        setStatus('loading');
        await Promise.all(CSS_FILES.map((u) => loadAsset(u, 'css')));
        for (const js of JS_FILES) await loadAsset(js, 'js'); // plugin.js debe ir antes del umd
        if (!sheetsRef.current) {
          const [{ default: LuckyExcel }, res] = await Promise.all([import('luckyexcel'), fetch(fileUrl)]);
          if (!res.ok) throw new Error(`No se pudo cargar el archivo (${res.status})`);
          const buffer = await res.arrayBuffer();
          const json = await new Promise<{ sheets?: unknown[] }>((resolve, reject) =>
            LuckyExcel.transformExcelToLucky(buffer, resolve, reject),
          );
          // Omitir hojas sin celdas (p. ej. la portada "MENÚ" del 6A)
          const sheets = (json.sheets ?? []).filter(
            (s) => ((s as { celldata?: unknown[] }).celldata?.length ?? 0) > 0,
          );
          if (sheets.length === 0) throw new Error('El archivo no contiene hojas legibles');
          sheets.forEach((s, i) => { (s as { status: number }).status = i === 0 ? 1 : 0; });
          sheetsRef.current = sheets;
        }
        if (!disposed) setStatus('ready');
      } catch (e) {
        if (!disposed) {
          setErrorMsg(e instanceof Error ? e.message : 'Error al leer el archivo');
          setStatus('error');
        }
      }
    })();
    return () => { disposed = true; };
  }, [isOpen, fileUrl, reloadKey]);

  // Montar Luckysheet cuando los datos están listos; destruir al cerrar
  useEffect(() => {
    if (!isOpen || status !== 'ready' || !sheetsRef.current) return;
    window.luckysheet?.create({
      container: 'excel-preview-container',
      data: structuredClone(sheetsRef.current), // luckysheet muta los datos
      lang: 'es',
      allowEdit: false,
      showtoolbar: false,
      showinfobar: false,
      showstatisticBar: false,
      sheetFormulaBar: false,
      enableAddRow: false,
      enableAddBackTop: false,
      showsheetbarConfig: { add: false, menu: false },
      cellRightClickConfig: {
        copy: true, copyAs: false, paste: false, insertRow: false, insertColumn: false,
        deleteRow: false, deleteColumn: false, deleteCell: false, hideRow: false,
        hideColumn: false, rowHeight: false, columnWidth: false, clear: false,
        matrix: false, sort: false, filter: false, chart: false, image: false,
        link: false, data: false, cellFormat: false,
      },
    });
    return () => {
      try { window.luckysheet?.destroy(); } catch { /* ya destruido */ }
    };
  }, [isOpen, status]);

  const handleRetry = () => {
    sheetsRef.current = null;
    setErrorMsg('');
    setReloadKey((k) => k + 1);
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

            {/* Visor */}
            <div className="flex-1 relative min-h-0">
              {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
                  <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin text-brand-600" />
                  <span className="text-sm">Cargando formato...</span>
                </div>
              )}
              {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <span className="text-sm text-red-600">{errorMsg}</span>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              <div id="excel-preview-container" className="absolute inset-0" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
