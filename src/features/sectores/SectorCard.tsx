import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { sectorIcons } from '../../lib/icons';
import type { Sector } from '../../types';

interface Props {
  sector: Sector;
  index: number;
}

export default function SectorCard({ sector, index }: Props) {
  const icon = sectorIcons[sector.icono];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.04 }}
      className="bg-surface-card rounded-xl p-6 shadow-card flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: sector.colorAccent + '18', color: sector.colorAccent }}
        >
          {icon && <FontAwesomeIcon icon={icon} className="w-5 h-5" />}
        </div>
        <span className="text-xs text-muted border border-gray-200 rounded-full px-3 py-1">
          {sector.cantidadPlantillas} plantillas
        </span>
      </div>
      <h3 className="font-bold text-heading text-base mb-1">{sector.nombre}</h3>
      <p className="text-xs text-muted mb-5">{sector.cantidadEjemplos} ejemplos cargados</p>
      <Link
        to={`/sectores/${sector.id}`}
        className="mt-auto block text-center py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
      >
        Ver plantillas →
      </Link>
    </motion.div>
  );
}
