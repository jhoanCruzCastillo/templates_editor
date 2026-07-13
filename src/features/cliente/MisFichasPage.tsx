import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileAlt, faScrewdriverWrench, faFileInvoice, faBook } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { instrumentoLabels } from '../../lib/icons';
import NuevaFichaClienteModal from './NuevaFichaClienteModal';
import type { TipoInstrumento } from '../../types';

// Datos de muestra — vista de diseño, no reflejan fichas reales del cliente todavía.
const fichasMock: {
  nombre: string;
  sector: string;
  tipo: TipoInstrumento;
  fecha: string;
  estado: 'En progreso' | 'Completo';
}[] = [
  { nombre: 'Posta de Salud Villa Hermosa', sector: 'Salud', tipo: 'ficha_tecnica', fecha: '10/07/2026', estado: 'En progreso' },
  { nombre: 'I.E. N° 50123 — Wanchaq', sector: 'Educación', tipo: 'perfil', fecha: '02/07/2026', estado: 'Completo' },
  { nombre: 'Carretera Interurbana Sector 4', sector: 'Transporte y Comunicaciones', tipo: 'formato', fecha: '28/06/2026', estado: 'En progreso' },
];

const instrumentoIconChico: Record<TipoInstrumento, typeof faFileAlt> = {
  formato: faFileInvoice,
  ioarr: faScrewdriverWrench,
  ficha_tecnica: faFileAlt,
  perfil: faBook,
};

const estadoBadge: Record<string, string> = {
  'En progreso': 'bg-amber-50 text-amber-700 border border-amber-200',
  Completo: 'bg-brand-50 text-brand-700 border border-brand-200',
};

export default function MisFichasPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-surface-card rounded-xl shadow-card p-6 mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-heading leading-tight">Mis fichas</h1>
          <p className="text-sm text-muted">Las fichas técnicas que has creado y llenado</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          Nueva ficha
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.05 }}
        className="bg-surface-card rounded-xl shadow-card overflow-hidden divide-y divide-gray-50"
      >
        {fichasMock.map((f, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={instrumentoIconChico[f.tipo]} className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-heading truncate">{f.nombre}</p>
              <p className="text-xs text-muted">
                {f.sector} · {instrumentoLabels[f.tipo]}
              </p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">{f.fecha}</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${estadoBadge[f.estado]}`}>
              {f.estado}
            </span>
          </div>
        ))}
      </motion.div>

      <NuevaFichaClienteModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
