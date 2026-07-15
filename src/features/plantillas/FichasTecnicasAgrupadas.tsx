import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faFileExcel, faMagnifyingGlass, faStar } from '@fortawesome/free-solid-svg-icons';
import PracticaToggle from './PracticaToggle';
import type { Plantilla, Sector } from '../../types';

interface Props {
  plantillas: Plantilla[];
  sectores: Sector[];
  onGestionarExcel: (plantillaId: string) => void;
}

// Vista especial de la pestaña "Fichas Técnicas" del sector "Formatos Generales": la ficha del
// MEF (6A, la ficha origen de la que derivan todas las demás) va primero, destacada; el resto de
// fichas técnicas de TODOS los sectores se agrupan por sector debajo, con separación sutil.
export default function FichasTecnicasAgrupadas({ plantillas, sectores, onGestionarExcel }: Props) {
  const [busqueda, setBusqueda] = useState('');

  const fichas = useMemo(() => plantillas.filter((p) => p.instrumento === 'ficha_tecnica'), [plantillas]);
  const mef = useMemo(() => fichas.find((p) => p.codigo === '6A') ?? null, [fichas]);
  const resto = useMemo(() => fichas.filter((p) => p.id !== mef?.id), [fichas, mef]);

  const coincide = (p: Plantilla) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q);
  };

  const mefVisible = mef && coincide(mef) ? mef : null;
  const restoFiltrado = resto.filter(coincide);

  const grupos = sectores
    .map((s) => ({ sector: s, fichas: restoFiltrado.filter((p) => p.sectorId === s.id) }))
    .filter((g) => g.fichas.length > 0);

  const getEditLink = (p: Plantilla) => `/sectores/${p.sectorId}/plantilla/${p.id}/editar`;

  const renderFila = (p: Plantilla) => (
    <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center justify-center w-auto min-w-9 px-2 h-7 rounded-md border border-brand-200 text-brand-700 text-xs font-bold bg-brand-50 shrink-0">
          {p.codigo}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-heading truncate">{p.nombre}</p>
          <p className="text-xs text-muted truncate">{p.descripcion}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <PracticaToggle plantilla={p} />
        <Link
          to={`/sectores/${p.sectorId}/plantilla/${p.id}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
          Ver
        </Link>
        <Link
          to={getEditLink(p)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-white bg-sidebar hover:bg-sidebar-hover transition-colors"
        >
          <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
          Editar
        </Link>
        <button
          onClick={() => onGestionarExcel(p.id)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          title="Gestionar Excel"
        >
          <FontAwesomeIcon icon={faFileExcel} className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {mefVisible && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-600 mb-2 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5" />
            Ficha técnica del MEF
          </p>
          <div className="rounded-lg border-2 border-brand-200 bg-brand-50/40 overflow-hidden">
            {renderFila(mefVisible)}
          </div>
        </div>
      )}

      <div className="space-y-5">
        {grupos.map(({ sector, fichas: fichasSector }) => (
          <div key={sector.id}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-2 pb-1 border-b border-gray-100">
              {sector.nombre} <span className="text-gray-300 normal-case font-normal">· {fichasSector.length}</span>
            </p>
            <div className="rounded-lg border border-gray-100">
              {fichasSector.map((p) => renderFila(p))}
            </div>
          </div>
        ))}
        {grupos.length === 0 && !mefVisible && (
          <p className="text-center text-sm text-muted py-8">No se encontraron fichas técnicas.</p>
        )}
      </div>

      <div className="relative pt-2">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-[calc(50%+4px)] -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar ficha técnica por nombre, código o descripción..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        />
      </div>
    </div>
  );
}
