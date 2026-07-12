import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFileExcel } from '@fortawesome/free-solid-svg-icons';

interface Props {
  fileUrl: string | null;
  /** Mensaje mostrado cuando no hay archivo asignado */
  emptyMessage?: string;
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

// Visor de Excel de solo lectura (Luckysheet). Reutilizado por ExcelPreviewModal y por el
// catálogo de archivos Excel de una plantilla — cambia de archivo cuando cambia `fileUrl`.
export default function ExcelViewer({ fileUrl, emptyMessage = 'Ningún archivo asignado' }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const sheetsRef = useRef<unknown[] | null>(null);

  useEffect(() => {
    if (!fileUrl) return;
    let disposed = false;
    sheetsRef.current = null;
    (async () => {
      try {
        setStatus('loading');
        await Promise.all(CSS_FILES.map((u) => loadAsset(u, 'css')));
        for (const js of JS_FILES) await loadAsset(js, 'js'); // plugin.js debe ir antes del umd
        const [{ default: LuckyExcel }, res] = await Promise.all([import('luckyexcel'), fetch(fileUrl)]);
        if (!res.ok) throw new Error(`No se pudo cargar el archivo (${res.status})`);
        const buffer = await res.arrayBuffer();
        // Algunos libros completamente vacíos hacen que transformExcelToLucky nunca invoque
        // ni resolve ni reject (cuelga la conversión) — con un plazo, si no responde a tiempo
        // se asume que el libro está vacío y se muestra una hoja en blanco igualmente.
        const conversion = new Promise<{ sheets?: unknown[] } | null>((resolve, reject) =>
          LuckyExcel.transformExcelToLucky(buffer, resolve, reject),
        );
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
        const json = await Promise.race([conversion, timeout]);
        const todasLasHojas = json?.sheets ?? [];
        // Omitir hojas sin celdas (p. ej. la portada "MENÚ" del 6A) — salvo que el libro esté
        // completamente vacío (o la conversión no haya respondido), en cuyo caso se muestra
        // una hoja en blanco en vez de un error.
        const conCeldas = todasLasHojas.filter(
          (s) => ((s as { celldata?: unknown[] }).celldata?.length ?? 0) > 0,
        );
        const sheets = conCeldas.length > 0
          ? conCeldas
          : todasLasHojas.length > 0
            ? todasLasHojas
            : [{ name: 'Hoja1', celldata: [], row: 36, column: 18, status: 1, order: 0, config: {} }];
        sheets.forEach((s, i) => { (s as { status: number }).status = i === 0 ? 1 : 0; });
        if (!disposed) { sheetsRef.current = sheets; setStatus('ready'); }
      } catch (e) {
        if (!disposed) {
          setErrorMsg(e instanceof Error ? e.message : 'Error al leer el archivo');
          setStatus('error');
        }
      }
    })();
    return () => { disposed = true; };
  }, [fileUrl, reloadKey]);

  // Montar Luckysheet cuando los datos están listos; destruir al desmontar/cambiar
  useEffect(() => {
    if (!fileUrl || status !== 'ready' || !sheetsRef.current) return;
    window.luckysheet?.create({
      container: 'excel-viewer-container',
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
  }, [fileUrl, status]);

  const handleRetry = () => {
    sheetsRef.current = null;
    setErrorMsg('');
    setReloadKey((k) => k + 1);
  };

  if (!fileUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-muted">
        <FontAwesomeIcon icon={faFileExcel} className="w-8 h-8 text-gray-300" />
        <span className="text-sm">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0">
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
          <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 animate-spin text-brand-600" />
          <span className="text-sm">Cargando archivo...</span>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="text-sm text-red-600 px-6 text-center">{errorMsg}</span>
          <button
            onClick={handleRetry}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
          >
            Reintentar
          </button>
        </div>
      )}
      <div id="excel-viewer-container" className="absolute inset-0" />
    </div>
  );
}
