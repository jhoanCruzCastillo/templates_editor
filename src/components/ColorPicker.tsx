import { memo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const ACCENT_COLORS = [
  '#0d9488',
  '#2563eb',
  '#059669',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#0891b2',
  '#7c3aed',
];

const ColorButton = memo(function ColorButton({
  color,
  isSelected,
  onSelect,
}: {
  color: string;
  isSelected: boolean;
  onSelect: (color: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(color)}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-none ${
        isSelected ? 'scale-110' : 'hover:brightness-110'
      }`}
      style={{ backgroundColor: color }}
    >
      {isSelected && <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-white" />}
    </button>
  );
});

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  const handleSelect = useCallback((c: string) => onChange(c), [onChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-heading mb-2">
        Color de acento <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {ACCENT_COLORS.map((color) => (
          <ColorButton
            key={color}
            color={color}
            isSelected={value === color}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}

export { ACCENT_COLORS };
