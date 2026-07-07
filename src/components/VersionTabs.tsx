import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import type { VersionTab } from '../types';

interface Props {
  activeTab: VersionTab;
  onChange: (tab: VersionTab) => void;
  disableProyecto?: boolean;
}

const tabs: { key: VersionTab; label: string }[] = [
  { key: 'estructura', label: 'Estructura' },
  { key: 'ejemplos', label: 'Ejemplos' },
  { key: 'proyecto', label: 'Proyecto' },
];

export default function VersionTabs({ activeTab, onChange, disableProyecto }: Props) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const isDisabled = tab.key === 'proyecto' && disableProyecto;
        return (
          <button
            key={tab.key}
            onClick={() => !isDisabled && onChange(tab.key)}
            disabled={isDisabled}
            className={`px-5 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive
                ? 'bg-brand-600 text-white'
                : isDisabled
                  ? 'text-gray-300 cursor-not-allowed bg-white'
                  : 'text-gray-600 hover:bg-gray-50 bg-white'
            }`}
          >
            {tab.label}
            {isDisabled && <FontAwesomeIcon icon={faLock} className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );
}
