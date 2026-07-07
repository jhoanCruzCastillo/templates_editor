import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { TipoInstrumento, TipologiaIoarr } from '../../types';
import { instrumentoIcons, instrumentoLabels, tipologiaIoarrLabels } from '../../lib/icons';

interface Props {
  instrumento: TipoInstrumento;
  onChange: (tipo: TipoInstrumento) => void;
  tipologia: TipologiaIoarr;
  onTipologiaChange: (t: TipologiaIoarr) => void;
}

export const instrumentoAccent: Record<TipoInstrumento, { border: string; icon: string; text: string; iconBg: string; btn: string }> = {
  formato:       { border: 'border-sky-500 bg-sky-50',       icon: 'text-sky-600',    text: 'text-sky-700',    iconBg: 'bg-sky-100 text-sky-600',       btn: 'bg-sky-600 hover:bg-sky-700' },
  ioarr:         { border: 'border-amber-500 bg-amber-50',   icon: 'text-amber-600',  text: 'text-amber-700',  iconBg: 'bg-amber-100 text-amber-600',   btn: 'bg-amber-600 hover:bg-amber-700' },
  ficha_tecnica: { border: 'border-brand-500 bg-brand-50',   icon: 'text-brand-600',  text: 'text-brand-700',  iconBg: 'bg-brand-100 text-brand-600',   btn: 'bg-brand-600 hover:bg-brand-700' },
  perfil:        { border: 'border-violet-500 bg-violet-50', icon: 'text-violet-600', text: 'text-violet-700', iconBg: 'bg-violet-100 text-violet-600', btn: 'bg-violet-600 hover:bg-violet-700' },
};

const descripciones: Record<TipoInstrumento, string> = {
  formato: 'Formatos de registro del ciclo de inversión (5A, 5B, 7A)',
  ioarr: 'Inversiones de optimización, ampliación marginal, reposición y rehabilitación (7C, 7D, 7E)',
  ficha_tecnica: 'Formulario estructurado con campos, tablas y coordenadas de celda (6A, 6B)',
  perfil: 'Estudio de preinversión con contenidos mínimos desarrollados en texto (Anexo 07)',
};

const tipos: TipoInstrumento[] = ['formato', 'ioarr', 'ficha_tecnica', 'perfil'];

export default function InstrumentoSelector({ instrumento, onChange, tipologia, onTipologiaChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-heading mb-2">
          Tipo de instrumento <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {tipos.map((tipo) => {
            const isSelected = instrumento === tipo;
            const accent = instrumentoAccent[tipo];
            return (
              <button
                key={tipo}
                onClick={() => onChange(tipo)}
                className={`p-3 rounded-xl border-2 text-left transition-colors duration-75 ${
                  isSelected ? accent.border : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon
                    icon={instrumentoIcons[tipo]}
                    className={`w-4 h-4 ${isSelected ? accent.icon : 'text-gray-400'}`}
                  />
                  <span className={`text-sm font-semibold ${isSelected ? accent.text : 'text-heading'}`}>
                    {instrumentoLabels[tipo]}
                  </span>
                </div>
                <p className="text-[11px] text-muted leading-tight">{descripciones[tipo]}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tipología — solo para IOARR */}
      {instrumento === 'ioarr' && (
        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            Tipología IOARR <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(tipologiaIoarrLabels) as TipologiaIoarr[]).map((t) => (
              <button
                key={t}
                onClick={() => onTipologiaChange(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75 ${
                  tipologia === t
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {tipologiaIoarrLabels[t]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
