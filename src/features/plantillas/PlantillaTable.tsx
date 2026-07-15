import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { instrumentoLabels, tipologiaIoarrLabels } from '../../lib/icons';
import InstrumentoTabs from './InstrumentoTabs';
import ExcelCatalogModal from './ExcelCatalogModal';
import FichasTecnicasAgrupadas from './FichasTecnicasAgrupadas';
import PracticaToggle from './PracticaToggle';
import type { Plantilla, Sector, TipoInstrumento, TipologiaIoarr } from '../../types';

interface Props {
  plantillas: Plantilla[];
  sectorId: string;
  /** Solo en el sector "Formatos Generales": lista completa de plantillas/sectores del sistema,
   * para mostrar TODAS las fichas técnicas (agrupadas por sector) en vez de solo las de este sector. */
  todasFichasTecnicas?: { plantillas: Plantilla[]; sectores: Sector[] };
}

const badgeClasses: Record<TipoInstrumento, string> = {
  formato:       'bg-sky-50 text-sky-700 border border-sky-200',
  ioarr:         'bg-amber-50 text-amber-700 border border-amber-200',
  ficha_tecnica: 'bg-blue-50 text-blue-700 border border-blue-200',
  perfil:        'bg-violet-50 text-violet-700 border border-violet-200',
};

const tabOrder: TipoInstrumento[] = ['formato', 'ioarr', 'ficha_tecnica', 'perfil'];
type FiltroTipologia = 'todas' | TipologiaIoarr;

export default function PlantillaTable({ plantillas, sectorId, todasFichasTecnicas }: Props) {
  const [excelPlantillaId, setExcelPlantillaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TipoInstrumento>(
    () => tabOrder.find((t) => plantillas.some((p) => p.instrumento === t)) ?? 'formato',
  );
  const [tipologia, setTipologia] = useState<FiltroTipologia>('todas');

  const counts = Object.fromEntries(
    tabOrder.map((t) => [t, plantillas.filter((p) => p.instrumento === t).length]),
  ) as Record<TipoInstrumento, number>;

  const handleTabChange = (tab: TipoInstrumento) => {
    setActiveTab(tab);
    setTipologia('todas');
  };

  const filtered = plantillas.filter(
    (p) =>
      p.instrumento === activeTab &&
      (activeTab !== 'ioarr' || tipologia === 'todas' || (p.tipologiasIoarr ?? []).includes(tipologia)),
  );

  const getEditLink = (p: Plantilla) =>
    p.instrumento === 'perfil'
      ? `/sectores/${sectorId}/plantilla/${p.id}/perfil`
      : `/sectores/${sectorId}/plantilla/${p.id}/editar`;

  const vistaAgrupada = activeTab === 'ficha_tecnica' && todasFichasTecnicas;
  const excelPlantilla = (vistaAgrupada ? todasFichasTecnicas.plantillas : plantillas).find((p) => p.id === excelPlantillaId) ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: 0.05 }}
      className="bg-surface-card rounded-xl shadow-card overflow-hidden"
    >
      <InstrumentoTabs activeTab={activeTab} onChange={handleTabChange} counts={counts} />

      {/* Filtro por tipología — solo en el tab IOARR */}
      {activeTab === 'ioarr' && (
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
          {(['todas', ...Object.keys(tipologiaIoarrLabels)] as FiltroTipologia[]).map((t) => (
            <button
              key={t}
              onClick={() => setTipologia(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75 ${
                tipologia === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t === 'todas' ? 'Todas' : tipologiaIoarrLabels[t]}
            </button>
          ))}
        </div>
      )}

      {vistaAgrupada ? (
        <FichasTecnicasAgrupadas
          plantillas={todasFichasTecnicas.plantillas}
          sectores={todasFichasTecnicas.sectores}
          onGestionarExcel={setExcelPlantillaId}
        />
      ) : (
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-4">Código</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Nombre</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Secciones</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Ejemplos</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Práctica</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted px-4 py-4">Actualizado</th>
            <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted px-6 py-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => {
            const tipo = p.instrumento ?? 'ficha_tecnica';
            return (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12, delay: i * 0.03 }}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="inline-flex items-center justify-center w-auto min-w-10 px-2 h-8 rounded-md border border-brand-200 text-brand-700 text-sm font-bold bg-brand-50">
                      {p.codigo}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeClasses[tipo]}`}>
                      {instrumentoLabels[tipo]}
                    </span>
                    {(p.tipologiasIoarr ?? []).map((t) => (
                      <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {tipologiaIoarrLabels[t]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-heading text-sm">{p.nombre}</div>
                  <div className="text-xs text-muted">{p.descripcion}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{p.cantidadSecciones} secciones</td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                    {p.cantidadEjemplos} ejemplos
                  </span>
                </td>
                <td className="px-4 py-4">
                  <PracticaToggle plantilla={p} />
                </td>
                <td className="px-4 py-4 text-sm text-gray-500">{p.fechaActualizacion}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/sectores/${sectorId}/plantilla/${p.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                      Ver
                    </Link>
                    <Link
                      to={getEditLink(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-sidebar hover:bg-sidebar-hover transition-colors"
                    >
                      <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                      Editar
                    </Link>
                    <button
                      onClick={() => setExcelPlantillaId(p.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      title="Gestionar Excel"
                    >
                      <FontAwesomeIcon icon={faFileExcel} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted">
                No hay plantillas en esta categoría.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      )}

      {excelPlantilla && (
        <ExcelCatalogModal
          isOpen
          onClose={() => setExcelPlantillaId(null)}
          plantilla={excelPlantilla}
        />
      )}
    </motion.div>
  );
}
