import { motion } from 'framer-motion';
import { useActividadReciente } from '../../lib/hooks';

const dotColors: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-400',
  red: 'bg-red-500',
};

export default function ActivityFeed() {
  const actividad = useActividadReciente();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: 0.1 }}
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
        Actividad reciente
      </h3>
      <div className="space-y-4">
        {actividad.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColors[item.color]}`} />
            <div>
              <div className="text-sm text-heading leading-snug">{item.mensaje}</div>
              <div className="text-xs text-muted mt-0.5">{item.fecha}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
