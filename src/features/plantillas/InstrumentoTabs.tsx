import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { TipoInstrumento } from '../../types';
import { instrumentoIcons } from '../../lib/icons';

interface Props {
  activeTab: TipoInstrumento;
  onChange: (tab: TipoInstrumento) => void;
  counts: Record<TipoInstrumento, number>;
}

const tabs: { key: TipoInstrumento; label: string }[] = [
  { key: 'formato', label: 'Formatos' },
  { key: 'ioarr', label: 'IOARR' },
  { key: 'ficha_tecnica', label: 'Fichas Técnicas' },
  { key: 'perfil', label: 'Perfiles' },
];

export default function InstrumentoTabs({ activeTab, onChange, counts }: Props) {
  return (
    <div className="flex items-end gap-1 px-3 pt-2.5 bg-gray-100 border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative -mb-px flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-lg border border-b-0 transition-colors duration-75 ${
              isActive
                ? 'bg-surface-card border-gray-200 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/70'
            }`}
          >
            <FontAwesomeIcon
              icon={instrumentoIcons[tab.key]}
              className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`}
            />
            {tab.label}
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                isActive ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {counts[tab.key]}
            </span>
            {isActive && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}
