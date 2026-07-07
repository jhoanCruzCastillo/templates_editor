import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface Props {
  icon: IconDefinition;
  value: number;
  label: string;
  color: string;
  bgColor: string;
  delay?: number;
}

export default function MetricCard({ icon, value, label, color, bgColor, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: delay * 0.5 }}
      className="bg-surface-card rounded-xl p-6 shadow-card relative overflow-hidden"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
        style={{ backgroundColor: bgColor, color }}
      >
        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
      </div>
      <div className="text-3xl font-bold text-heading">{value}</div>
      <div className="text-sm text-muted mt-1">{label}</div>
      {/* Decoración circular de fondo */}
      <div
        className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}
