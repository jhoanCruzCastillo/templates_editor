import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface Props {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = 'mb-6' }: Props) {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && (
            <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 text-gray-400" />
          )}
          {item.to ? (
            <Link to={item.to} className="text-brand-600 hover:text-brand-700 font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-500">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
