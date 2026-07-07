import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faLayerGroup, faCheck } from '@fortawesome/free-solid-svg-icons';
import { sectorIconList } from '../../lib/icons';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import { generateId } from '../../lib/store';
import IconPicker from '../../components/IconPicker';
import ColorPicker, { ACCENT_COLORS } from '../../components/ColorPicker';
import type { TipoSector } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NuevoSectorModal({ isOpen, onClose }: Props) {
  const { addSector, pushActividad } = useAppContext();
  const { toast } = useToast();

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [codigoManual, setCodigoManual] = useState(false);
  const [icono, setIcono] = useState<string>(sectorIconList[0]);
  const [color, setColor] = useState(ACCENT_COLORS[0]);
  const [descripcion, setDescripcion] = useState('');
  const [tipoSector, setTipoSector] = useState<TipoSector>('Sectorial');
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setNombre('');
      setCodigo('');
      setCodigoManual(false);
      setIcono(sectorIconList[0]);
      setColor(ACCENT_COLORS[0]);
      setDescripcion('');
      setTipoSector('Sectorial');
      setActivo(true);
    }
  }, [isOpen]);

  // Auto-generar código corto a partir del nombre
  useEffect(() => {
    if (!codigoManual && nombre) {
      const words = nombre.trim().split(/\s+/);
      setCodigo(words.map((w) => w[0]?.toUpperCase() ?? '').join('').slice(0, 3));
    }
  }, [nombre, codigoManual]);

  const handleCodigoChange = (val: string) => {
    setCodigoManual(true);
    setCodigo(val.toUpperCase().slice(0, 5));
  };

  const handleSubmit = () => {
    if (!nombre.trim()) return;
    addSector({
      id: generateId(),
      nombre: nombre.trim(),
      codigo: codigo || nombre.trim().slice(0, 3).toUpperCase(),
      icono,
      colorAccent: color,
      descripcion: descripcion.trim() || undefined,
      tipoSector,
      activo,
      cantidadPlantillas: 0,
      cantidadEjemplos: 0,
    });
    pushActividad(`Se creó el sector "${nombre.trim()}"`, 'green');
    toast(`Sector "${nombre.trim()}" creado`);
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
            {/* Encabezado */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Nuevo sector</h2>
                  <p className="text-sm text-muted">
                    Define un nuevo ámbito del Estado para agrupar plantillas
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* Nombre + Código */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Energía y Minas"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Código corto</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => handleCodigoChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>
              <p className="text-xs text-muted -mt-3 flex items-center gap-1">
                ✏️ El código se autogenera a partir del nombre; puedes editarlo.
              </p>

              <IconPicker value={icono} onChange={setIcono} />
              <ColorPicker value={color} onChange={setColor} />

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">
                  Descripción <span className="text-muted font-normal">(opcional)</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={3}
                  placeholder="Breve descripción del ámbito y los servicios que cubre..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>

              {/* Tipo de sector + Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    Tipo de sector <span className="text-muted font-normal">(opcional)</span>
                  </label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {(['Sectorial', 'General'] as TipoSector[]).map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setTipoSector(tipo)}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors duration-75 ${
                          tipoSector === tipo
                            ? 'bg-brand-50 text-brand-700 border-brand-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Estado</label>
                  <div className="flex items-center gap-3 py-2">
                    <span className={`text-sm font-medium ${activo ? 'text-brand-600' : 'text-gray-400'}`}>
                      Activo
                    </span>
                    <button
                      onClick={() => setActivo(!activo)}
                      className={`relative w-12 h-7 rounded-full transition-colors duration-100 ${
                        activo ? 'bg-brand-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-100 ${
                          activo ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-muted">
                  <span className="text-red-500">*</span> Campos obligatorios
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-75"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!nombre.trim()}
                    className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                    Crear sector
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
