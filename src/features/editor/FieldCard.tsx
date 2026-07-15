import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faTrash, faLightbulb, faWandMagicSparkles, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fieldTypeIcons, fieldTypeLabels, subtipoTablaLabels, columnTypeLabels, faTriangleExclamation } from '../../lib/icons';
import { campoFaltaCaptura } from '../../lib/campoValidation';
import { evaluarFormula, type ResolucionToken } from '../../lib/formula';
import { mejorarTexto } from '../../lib/mejoraTexto';
import ExampleTableEditor from './ExampleTableEditor';
import CampoCoordenadasInput from '../../components/CampoCoordenadasInput';
import type { Campo, ConfigTabla } from '../../types';

interface Props {
  campo: Campo;
  isSelected?: boolean;
  onClick?: () => void;
  showExampleValue?: boolean;
  exampleValue?: string;
  onExampleValueChange?: (campoId: string, value: string) => void;
  /** Mensaje de validación del valor de ejemplo/cliente (solo se usa junto con showExampleValue) */
  error?: string;
  /** Valor de un ejemplo de referencia autorado por el admin para este campo (solo modo cliente) */
  referenciaValor?: string;
  /** true = el plan del cliente incluye la ayuda de IA para mejorar títulos/textos (Nivel 1+) */
  permiteMejoraIA?: boolean;
  showMenuButton?: boolean;
  onDelete?: () => void;
  onDefaultValueChange?: (value: string) => void;
  onConfigTablaChange?: (config: ConfigTabla) => void;
  /** Flash de aviso tras un intento de guardado — solo tiene efecto si el campo falta captura */
  highlightWarning?: boolean;
  /** Id del campo calculado que está "escuchando" clics en otros campos para insertar su referencia */
  formulaTargetCampoId?: string | null;
  onFormulaFocus?: (campoId: string) => void;
  onFormulaBlur?: (campoId: string) => void;
  onInsertReferencia?: (targetCampoId: string, identificadorReferenciado: string) => void;
  resolverFormula?: (token: string) => ResolucionToken;
}

export default function FieldCard({
  campo,
  isSelected,
  onClick,
  showExampleValue,
  exampleValue,
  onExampleValueChange,
  error,
  referenciaValor,
  permiteMejoraIA,
  showMenuButton,
  onDelete,
  onDefaultValueChange,
  onConfigTablaChange,
  highlightWarning,
  formulaTargetCampoId,
  onFormulaFocus,
  onFormulaBlur,
  onInsertReferencia,
  resolverFormula,
}: Props) {
  const [sugerenciaIA, setSugerenciaIA] = useState<string | null>(null);
  const [cargandoIA, setCargandoIA] = useState(false);

  const icon = fieldTypeIcons[campo.tipo];
  const typeLabel = fieldTypeLabels[campo.tipo];
  // Si se pasa onExampleValueChange, estamos en modo edición de ejemplo:
  // usar solo el valor del ejemplo activo (no el mock del campo)
  const displayValue = onExampleValueChange ? (exampleValue ?? '') : (exampleValue ?? campo.valorEjemplo);
  const esCampoTexto = campo.tipo === 'texto_corto' || campo.tipo === 'texto_largo';

  const pedirMejoraIA = () => {
    setCargandoIA(true);
    setSugerenciaIA(null);
    setTimeout(() => {
      setSugerenciaIA(mejorarTexto(displayValue || ''));
      setCargandoIA(false);
    }, 500);
  };
  const isTableField = campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica';
  const isCoordField = campo.tipo === 'mapa_coordenadas';
  const faltaCaptura = campoFaltaCaptura(campo);
  // Campo calculado (no editable) de tipo simple: su "valor" es una fórmula tipo Excel
  // ("=1.01.1+1.02.3") que referencia otros campos numero/decimal.
  const esCampoFormula = !campo.editable && !isTableField && !isCoordField;
  const esOtroCampoEnModoReferencia = !!formulaTargetCampoId && formulaTargetCampoId !== campo.id;
  const interceptarClicParaReferencia = (e: React.MouseEvent) => {
    if (esOtroCampoEnModoReferencia && onInsertReferencia) {
      e.preventDefault();
      e.stopPropagation();
      onInsertReferencia(formulaTargetCampoId!, campo.identificador);
    }
  };
  const resultadoFormula = esCampoFormula && resolverFormula
    ? evaluarFormula(displayValue ?? campo.valorEjemplo ?? '', resolverFormula)
    : null;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border-2 p-4 transition-all ${
        faltaCaptura && highlightWarning
          ? 'border-red-400 bg-red-50/40 shadow-sm animate-pulse'
          : isSelected
            ? 'border-brand-500 bg-brand-50/30 shadow-sm cursor-pointer'
            : onClick
              ? 'border-gray-100 bg-white hover:border-brand-200 cursor-pointer'
              : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isSelected ? 'bg-brand-100 text-brand-600' : 'bg-gray-50 text-gray-400'
          }`}
        >
          <FontAwesomeIcon icon={icon} className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                isSelected
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {campo.identificador}
            </span>
            <span className="font-semibold text-heading text-sm">{campo.etiqueta}</span>
            {campo.requerido && <span className="text-red-500 text-sm" title="Obligatorio">*</span>}
            {!campo.editable && (
              <FontAwesomeIcon
                icon={fieldTypeIcons.calculado}
                className="w-3 h-3 text-gray-400"
                title="Campo calculado (solo lectura)"
              />
            )}
            {faltaCaptura && (
              <span
                title="Falta registrar su posición en el Excel (columna/fila) — no se insertará al Excel hasta configurarla"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-semibold shrink-0"
              >
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-2.5 h-2.5" />
                Sin posición Excel
              </span>
            )}
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-2">
            <span>{typeLabel}</span>
            {campo.fuenteCatalogo && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[11px]">
                📋 {campo.fuenteCatalogo}
              </span>
            )}
          </div>
          {campo.tipo === 'catalogo_encadenado' && campo.cadena && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {campo.cadena.map((step, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {step}
                  </span>
                  {i < campo.cadena!.length - 1 && (
                    <span className="text-gray-300 text-xs">→</span>
                  )}
                </span>
              ))}
            </div>
          )}
          {(campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica') && campo.configTabla && campo.configTabla.columnas.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {subtipoTablaLabels[campo.configTabla.subtipo]}
                </span>
                <span className="text-[10px] text-muted">
                  · {campo.configTabla.columnas.length} columnas
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {campo.configTabla.columnas.map((col) => (
                  <span
                    key={col.id}
                    className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600"
                    title={columnTypeLabels[col.tipo]}
                  >
                    {col.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!showExampleValue && onDefaultValueChange && (
            <div className="mt-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Valor por defecto
              </span>
              {isCoordField ? (
                <div className="mt-1.5">
                  <CampoCoordenadasInput value={campo.valorEjemplo || ''} onChange={onDefaultValueChange} />
                </div>
              ) : isTableField && campo.configTabla ? (
                <ExampleTableEditor
                  config={campo.configTabla}
                  value={campo.valorEjemplo || ''}
                  onChange={onDefaultValueChange}
                  onConfigChange={onConfigTablaChange}
                />
              ) : (
                <>
                  <input
                    type={esCampoFormula ? 'text' : campo.tipo === 'numero' ? 'number' : 'text'}
                    value={campo.valorEjemplo || ''}
                    onChange={(e) => onDefaultValueChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={interceptarClicParaReferencia}
                    onFocus={() => {
                      if (esCampoFormula) {
                        onFormulaFocus?.(campo.id);
                        if (!campo.valorEjemplo) onDefaultValueChange('=');
                      }
                    }}
                    onBlur={() => { if (esCampoFormula) onFormulaBlur?.(campo.id); }}
                    placeholder={esCampoFormula ? '=1.01.1+1.02.3' : 'Valor inicial por defecto...'}
                    className={`w-full mt-1 px-2 py-1.5 rounded border bg-white text-sm text-heading focus:outline-none focus:ring-2 ${
                      resultadoFormula?.error
                        ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                        : 'border-gray-200 focus:ring-gray-300 focus:border-gray-400'
                    }`}
                  />
                  {resultadoFormula?.error && (
                    <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="w-2.5 h-2.5 shrink-0" />
                      {resultadoFormula.error}
                    </p>
                  )}
                  {!resultadoFormula?.error && resultadoFormula?.valor != null && (
                    <p className="mt-1 text-[11px] text-muted">= {resultadoFormula.valor}</p>
                  )}
                </>
              )}
            </div>
          )}
          {showExampleValue && (
            <div className="mt-2 p-2.5 rounded-lg bg-brand-100/70 border border-brand-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Valor de ejemplo
                </span>
                {esCampoTexto && onExampleValueChange && permiteMejoraIA !== undefined && (
                  <button
                    onClick={(e) => { e.stopPropagation(); pedirMejoraIA(); }}
                    disabled={!permiteMejoraIA || cargandoIA || !(displayValue || '').trim()}
                    title={!permiteMejoraIA ? 'Disponible desde Nivel 1 — actualiza tu plan' : undefined}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 hover:text-violet-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <FontAwesomeIcon icon={cargandoIA ? faSpinner : faWandMagicSparkles} className={`w-2.5 h-2.5 ${cargandoIA ? 'animate-spin' : ''}`} />
                    Mejorar con IA
                  </button>
                )}
              </div>
              {isCoordField ? (
                <div className="mt-1.5">
                  <CampoCoordenadasInput
                    value={displayValue || ''}
                    onChange={onExampleValueChange ? (v) => onExampleValueChange(campo.identificador, v) : undefined}
                  />
                </div>
              ) : isTableField && campo.configTabla && onExampleValueChange ? (
                <ExampleTableEditor
                  config={campo.configTabla}
                  value={displayValue || ''}
                  onChange={(v) => onExampleValueChange(campo.identificador, v)}
                />
              ) : onExampleValueChange ? (
                <>
                  <input
                    type="text"
                    value={displayValue || ''}
                    onChange={(e) => onExampleValueChange(campo.identificador, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={interceptarClicParaReferencia}
                    onFocus={() => {
                      if (esCampoFormula) {
                        onFormulaFocus?.(campo.id);
                        if (!displayValue) onExampleValueChange(campo.identificador, '=');
                      }
                    }}
                    onBlur={() => { if (esCampoFormula) onFormulaBlur?.(campo.id); }}
                    placeholder={esCampoFormula ? '=1.01.1+1.02.3' : 'Escribe el valor de ejemplo...'}
                    className={`w-full mt-1 px-2 py-1.5 rounded border bg-white text-sm text-heading focus:outline-none focus:ring-2 ${
                      resultadoFormula?.error || error
                        ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                        : 'border-brand-200 focus:ring-brand-500/30 focus:border-brand-500'
                    }`}
                  />
                  {resultadoFormula?.error && (
                    <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="w-2.5 h-2.5 shrink-0" />
                      {resultadoFormula.error}
                    </p>
                  )}
                  {!resultadoFormula?.error && error && (
                    <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="w-2.5 h-2.5 shrink-0" />
                      {error}
                    </p>
                  )}
                  {!resultadoFormula?.error && !error && resultadoFormula?.valor != null && (
                    <p className="mt-1 text-[11px] text-muted">= {resultadoFormula.valor}</p>
                  )}
                </>
              ) : (
                <div className="text-sm text-heading mt-0.5">
                  {displayValue || <span className="text-muted italic">Sin valor</span>}
                </div>
              )}
              {referenciaValor && referenciaValor.trim() && !isTableField && !isCoordField && (
                <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
                  <FontAwesomeIcon icon={faLightbulb} className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Ejemplo de referencia</p>
                    <p className="text-xs text-blue-900 mt-0.5 break-words whitespace-pre-wrap">{referenciaValor}</p>
                  </div>
                  {onExampleValueChange && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onExampleValueChange(campo.identificador, referenciaValor); }}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-800 shrink-0"
                    >
                      Usar
                    </button>
                  )}
                </div>
              )}
              {sugerenciaIA !== null && esCampoTexto && onExampleValueChange && (
                <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-violet-50 border border-violet-100">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="w-3 h-3 text-violet-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Sugerencia de IA</p>
                    {sugerenciaIA === (displayValue || '').trim() ? (
                      <p className="text-xs text-violet-700 mt-0.5 italic">Tu redacción ya está clara — no encontramos mejoras.</p>
                    ) : (
                      <p className="text-xs text-violet-900 mt-0.5 break-words whitespace-pre-wrap">{sugerenciaIA}</p>
                    )}
                  </div>
                  {sugerenciaIA !== (displayValue || '').trim() && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onExampleValueChange(campo.identificador, sugerenciaIA); setSugerenciaIA(null); }}
                      className="text-[11px] font-medium text-violet-600 hover:text-violet-800 shrink-0"
                    >
                      Usar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {(showMenuButton || onDelete) && (
          <div className="flex flex-col gap-1 shrink-0">
            {showMenuButton && (
              <button className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                <FontAwesomeIcon icon={faEllipsisVertical} className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                title="Eliminar campo"
              >
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
