import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faFilter, faPlus, faGraduationCap, faBriefcase, faList } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { usePlantillas, useSectores, useEstadoEntrenamiento } from '../../lib/hooks';
import { useAppContext } from '../../lib/context';
import { useAuth } from '../../lib/auth';
import { cuentaEfectivaDe } from '../../lib/permisos';
import { instrumentoIcons, instrumentoLabels } from '../../lib/icons';
import { addOns } from '../../data/planes';
import NuevaFichaClienteModal from './NuevaFichaClienteModal';
import ComprarAddOnModal from '../settings/ComprarAddOnModal';
import type { Plantilla } from '../../types';

type Tab = 'todas' | 'practica' | 'proyecto';

export default function FichasOficialesPage() {
  const plantillas = usePlantillas();
  const sectores = useSectores();
  const { usuarios, ejemplos } = useAppContext();
  const { sesion } = useAuth();
  const { esNivel0, vencido, diasRestantes, limiteFichas } = useEstadoEntrenamiento();
  const [tab, setTab] = useState<Tab>(esNivel0 ? 'practica' : 'proyecto');
  const [busqueda, setBusqueda] = useState('');
  const [presetPlantillaId, setPresetPlantillaId] = useState<string | null>(null);
  const [showComprarAddon, setShowComprarAddon] = useState(false);

  const cuentaId = sesion ? cuentaEfectivaDe(usuarios, sesion) : '';
  const misFichasCount = useMemo(
    () => ejemplos.filter((e) => e.propietarioId === cuentaId).length,
    [ejemplos, cuentaId],
  );
  const limiteAlcanzado = misFichasCount >= limiteFichas;

  const coincide = (p: Plantilla) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q);
  };

  const filtradas = useMemo(
    () =>
      plantillas.filter(
        (p) =>
          (tab === 'todas' || (tab === 'practica' ? !!p.disponibleNivel0 : !p.disponibleNivel0)) && coincide(p),
      ),
    [plantillas, busqueda, tab],
  );

  const grupos = useMemo(
    () =>
      sectores
        .map((s) => ({ sector: s, fichas: filtradas.filter((p) => p.sectorId === s.id) }))
        .filter((g) => g.fichas.length > 0),
    [sectores, filtradas],
  );

  // En el tab de proyecto, un cliente Nivel 0 puede mirar el catálogo (para saber qué se
  // desbloquea) pero no crear fichas ahí todavía — solo tiene acceso a sus ejercicios de práctica.
  const puedeCrear = (p: Plantilla) => !vencido && !limiteAlcanzado && (!esNivel0 || !!p.disponibleNivel0);
  const motivoBloqueo = (p: Plantilla) => {
    if (vencido) return 'Tu plan de entrenamiento venció';
    if (esNivel0 && !p.disponibleNivel0) return 'Disponible desde Nivel 1 — actualiza tu plan';
    if (limiteAlcanzado) return `Alcanzaste el límite de ${limiteFichas} ${esNivel0 ? 'ejercicios' : 'plantillas simultáneas'} de tu plan`;
    return undefined;
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-surface-card rounded-xl shadow-card p-6 mb-6"
      >
        <h1 className="text-2xl font-bold text-heading leading-tight">Fichas oficiales</h1>
        <p className="text-sm text-muted">Elige una ficha oficial para crear y empezar a llenar tu propio caso</p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setTab('todas')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75 ${
              tab === 'todas' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <FontAwesomeIcon icon={faList} className="w-3 h-3" />
            Todas
          </button>
          <button
            onClick={() => setTab('proyecto')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75 ${
              tab === 'proyecto' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <FontAwesomeIcon icon={faBriefcase} className="w-3 h-3" />
            Fichas para tu proyecto
          </button>
          <button
            onClick={() => setTab('practica')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-75 ${
              tab === 'practica' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <FontAwesomeIcon icon={faGraduationCap} className="w-3 h-3" />
            Ejercicios de práctica
          </button>
        </div>

        <div className={`mt-4 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
          vencido ? 'bg-red-50 border-red-200 text-red-700' : limiteAlcanzado ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <FontAwesomeIcon icon={faGraduationCap} className="w-3.5 h-3.5 shrink-0" />
          {esNivel0 ? (
            vencido
              ? 'Tu plan de entrenamiento venció — ya no puedes crear nuevos ejercicios.'
              : `Plan Pedagógico · ${diasRestantes} día${diasRestantes === 1 ? '' : 's'} restantes — las fichas de "Fichas para tu proyecto" se desbloquean desde Nivel 1.`
          ) : (
            <span>
              {misFichasCount}/{limiteFichas} plantillas simultáneas
              {limiteAlcanzado && (
                <>
                  {' — '}
                  <button
                    onClick={() => setShowComprarAddon(true)}
                    className="font-semibold underline hover:text-amber-900"
                  >
                    compra "Plantilla adicional" para sumar más
                  </button>
                </>
              )}
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-4 max-w-md">
          <div className="relative flex-1">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código o descripción..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
          <button
            type="button"
            title="Filtros (próximamente)"
            className="w-10 h-10 shrink-0 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors duration-75"
          >
            <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      <div className="space-y-6">
        {grupos.map(({ sector, fichas }, i) => (
          <motion.div
            key={sector.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: i * 0.03 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-2 pb-1 border-b border-gray-100">
              {sector.nombre} <span className="text-gray-300 normal-case font-normal">· {fichas.length}</span>
            </p>
            <div className="bg-surface-card rounded-lg border border-gray-100 divide-y divide-gray-50">
              {fichas.map((p) => {
                const bloqueado = !puedeCrear(p);
                return (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={instrumentoIcons[p.instrumento]} className="w-3.5 h-3.5" />
                    </div>
                    <span className="inline-flex items-center justify-center w-auto min-w-9 px-2 h-7 rounded-md border border-brand-200 text-brand-700 text-xs font-bold bg-brand-50 shrink-0">
                      {p.codigo}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-heading truncate">{p.nombre}</p>
                      <p className="text-xs text-muted truncate">{instrumentoLabels[p.instrumento]} · {p.descripcion}</p>
                    </div>
                    <button
                      onClick={() => setPresetPlantillaId(p.id)}
                      disabled={bloqueado}
                      title={motivoBloqueo(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                      Crear ficha
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
        {grupos.length === 0 && (
          <p className="text-center text-sm text-muted py-12">
            {tab === 'practica' ? 'Todavía no hay ejercicios de práctica disponibles.' : 'No se encontraron fichas oficiales.'}
          </p>
        )}
      </div>

      <NuevaFichaClienteModal
        isOpen={!!presetPlantillaId}
        onClose={() => setPresetPlantillaId(null)}
        presetPlantillaId={presetPlantillaId ?? undefined}
      />

      <ComprarAddOnModal
        isOpen={showComprarAddon}
        onClose={() => setShowComprarAddon(false)}
        usuarioId={cuentaId}
        addon={addOns.find((a) => a.id === 'plantilla-adicional') ?? null}
      />
    </div>
  );
}
