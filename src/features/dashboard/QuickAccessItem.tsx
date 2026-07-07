import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

interface Props {
  icon: IconDefinition;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  to: string;
  delay?: number;
}

export default function QuickAccessItem({ icon, iconColor, iconBg, title, description, to, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: delay * 0.5 }}
    >
      <Link
        to={to}
        className="flex items-center gap-4 p-4 bg-surface-card rounded-xl hover:shadow-md transition-shadow group"
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <FontAwesomeIcon icon={icon} className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-heading text-sm">{title}</div>
          <div className="text-xs text-muted truncate">{description}</div>
        </div>
        <FontAwesomeIcon
          icon={faArrowRight}
          className="w-4 text-gray-300 group-hover:text-brand-600 transition-colors"
        />
      </Link>
    </motion.div>
  );
}
