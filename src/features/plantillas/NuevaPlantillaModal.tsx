import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import InstrumentoSelector, { instrumentoAccent } from './InstrumentoSelector';
import { instrumentoIcons } from '../../lib/icons';
import type { TipoInstrumento, TipologiaIoarr } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (codigo: string, nombre: string, descripcion: string, instrumento: TipoInstrumento, tipologiaIoarr?: TipologiaIoarr) => void;
}

const subtitulos: Record<TipoInstrumento, string> = {
  formato: 'Define la estructura de un formato de registro',
  ioarr: 'Define la estructura de un formato IOARR',
  ficha_tecnica: 'Define la estructura de una ficha técnica',
  perfil: 'Define la estructura de un estudio de preinversión a nivel de Perfil',
};

const placeholders: Record<TipoInstrumento, { codigo: string; nombre: string }> = {
  formato: { codigo: '5A', nombre: 'Registro de idea de proyecto...' },
  ioarr: { codigo: '7C', nombre: 'Registro de IOARR...' },
  ficha_tecnica: { codigo: '6A-test', nombre: 'Ficha Técnica General...' },
  perfil: { codigo: 'PERFIL-1', nombre: 'Perfil de Proyecto...' },
};

export default function NuevaPlantillaModal({ isOpen, onClose, onCreate }: Props) {
  const [instrumento, setInstrumento] = useState<TipoInstrumento>('formato');
  const [tipologia, setTipologia] = useState<TipologiaIoarr>('optimizacion');
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const accent = instrumentoAccent[instrumento];

  const handleSubmit = () => {
    if (!codigo.trim() || !nombre.trim()) return;
    onCreate(codigo.trim(), nombre.trim(), descripcion.trim(), instrumento, instrumento === 'ioarr' ? tipologia : undefined);
    setCodigo('');
    setNombre('');
    setDescripcion('');
    setInstrumento('formato');
    setTipologia('optimizacion');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent.iconBg}`}>
                  <FontAwesomeIcon icon={instrumentoIcons[instrumento]} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Nueva plantilla</h2>
                  <p className="text-sm text-muted">{subtitulos[instrumento]}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <InstrumentoSelector
                instrumento={instrumento}
                onChange={setInstrumento}
                tipologia={tipologia}
                onTipologiaChange={setTipologia}
              />

              {/* Código + Nombre */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder={placeholders[instrumento].codigo}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    autoFocus
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder={placeholders[instrumento].nombre}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">
                  Descripción <span className="text-muted font-normal">(opcional)</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  placeholder="Breve descripción del formato..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75">
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!codigo.trim() || !nombre.trim()}
                  className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2 ${accent.btn}`}
                >
                  <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                  Crear plantilla
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
