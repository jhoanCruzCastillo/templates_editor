import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck, faFileImport, faTriangleExclamation, faFileCode } from '@fortawesome/free-solid-svg-icons';
import InstrumentoSelector, { instrumentoAccent } from './InstrumentoSelector';
import { parseDocumento, type DocumentoParseResult } from '../../lib/schemaImport';
import type { TipoInstrumento, TipologiaIoarr, Seccion } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { codigo: string; nombre: string; instrumento: TipoInstrumento; tipologiasIoarr?: TipologiaIoarr[]; secciones: Seccion[] }) => void;
}

export default function ImportarJsonModal({ isOpen, onClose, onImport }: Props) {
  const [parsed, setParsed] = useState<DocumentoParseResult | null>(null);
  const [error, setError] = useState('');
  const [instrumento, setInstrumento] = useState<TipoInstrumento>('ficha_tecnica');
  const [tipologias, setTipologias] = useState<TipologiaIoarr[]>([]);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setParsed(null);
    setError('');
    setInstrumento('ficha_tecnica');
    setTipologias([]);
    setCodigo('');
    setNombre('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (file: File) => {
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        const result = parseDocumento(raw);
        setParsed(result);
        setCodigo(result.codigo);
        setNombre(result.nombre);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo leer el archivo.');
      }
    };
    reader.onerror = () => setError('No se pudo leer el archivo.');
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!parsed || !codigo.trim() || !nombre.trim()) return;
    onImport({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      instrumento,
      tipologiasIoarr: instrumento === 'ioarr' ? tipologias : undefined,
      secciones: parsed.secciones,
    });
    reset();
    onClose();
  };

  const accent = instrumentoAccent[instrumento];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileImport} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Importar plantilla desde JSON</h2>
                  <p className="text-sm text-muted">Documento con el esquema oficial (tipo_version: "estructura")</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {!parsed ? (
                <div>
                  <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileInput} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-10 rounded-xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-brand-300 hover:text-brand-600 transition-colors flex flex-col items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFileCode} className="w-6 h-6" />
                    Seleccionar archivo .json
                  </button>
                  {error && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-red-600">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-brand-50 rounded-xl p-4 text-sm text-brand-700">
                    Se detectaron <strong>{parsed.secciones.length}</strong> secciones y{' '}
                    <strong>{parsed.secciones.reduce((sum, s) => sum + s.cantidadCampos, 0)}</strong> campos.
                  </div>

                  <InstrumentoSelector
                    instrumento={instrumento}
                    onChange={setInstrumento}
                    tipologias={tipologias}
                    onTipologiasChange={setTipologias}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-heading mb-1.5">Código</label>
                      <input
                        type="text"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-heading mb-1.5">Nombre</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={handleClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                  Cancelar
                </button>
                {parsed && (
                  <button
                    onClick={handleSubmit}
                    disabled={!codigo.trim() || !nombre.trim()}
                    className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2 ${accent.btn}`}
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                    Importar plantilla
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
