import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Breadcrumbs from '../../components/Breadcrumbs';
import SectorCard from './SectorCard';
import NuevoSectorModal from './NuevoSectorModal';
import { useSectores } from '../../lib/hooks';

export default function SectoresPage() {
  const sectores = useSectores();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-8">
      <Breadcrumbs items={[{ label: 'Sectores' }]} />

      <div className="flex items-start justify-between mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-heading mb-2">Sectores</h1>
          <p className="text-muted">
            Cada sector agrupa las plantillas del ámbito del Estado correspondiente.
          </p>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, delay: 0.05 }}
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 shrink-0"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          Nuevo sector
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sectores.map((sector, i) => (
          <SectorCard key={sector.id} sector={sector} index={i} />
        ))}
      </div>

      <NuevoSectorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
