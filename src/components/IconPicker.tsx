import { memo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sectorIcons, sectorIconList } from '../lib/icons';

const IconButton = memo(function IconButton({
  iconKey,
  isSelected,
  onSelect,
}: {
  iconKey: string;
  isSelected: boolean;
  onSelect: (key: string) => void;
}) {
  const icon = sectorIcons[iconKey];
  return (
    <button
      onClick={() => onSelect(iconKey)}
      className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-100 ${
        isSelected
          ? 'bg-brand-600 text-white ring-2 ring-brand-600 ring-offset-2'
          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon && <FontAwesomeIcon icon={icon} className="w-4 h-4" />}
    </button>
  );
});

interface Props {
  value: string;
  onChange: (icon: string) => void;
}

export default function IconPicker({ value, onChange }: Props) {
  const handleSelect = useCallback((key: string) => onChange(key), [onChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-heading mb-2">
        Ícono <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {sectorIconList.map((iconKey) => (
          <IconButton
            key={iconKey}
            iconKey={iconKey}
            isSelected={value === iconKey}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
