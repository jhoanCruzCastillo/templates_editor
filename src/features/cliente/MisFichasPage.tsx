import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faInbox, faGraduationCap, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { instrumentoIcons, instrumentoLabels } from '../../lib/icons';
import { useAppContext } from '../../lib/context';
import { useAuth } from '../../lib/auth';
import { useSectores, useEstadoEntrenamiento, useHistorialCambios } from '../../lib/hooks';
import { cuentaEfectivaDe, puedeVerFicha } from '../../lib/permisos';
import { puedeVerHistorial } from '../../lib/planAcceso';
import { validarValoresPlantilla, calcularProgresoValores } from '../../lib/valorValidation';
import { tiempoRelativo } from '../../lib/tiempoRelativo';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import NuevaFichaClienteModal from './NuevaFichaClienteModal';
import type { Ejemplo } from '../../types';

const estadoBadge: Record<string, string> = {
  'En progreso': 'bg-amber-50 text-amber-700 border border-amber-200',
  Completo: 'bg-brand-50 text-brand-700 border border-brand-200',
};

export default function MisFichasPage() {
  const [showModal, setShowModal] = useState(false);
  const [eliminarFicha, setEliminarFicha] = useState<Ejemplo | null>(null);
  const { sesion } = useAuth();
  const { ejemplos, plantillas, usuarios, deleteEjemplo, updateEjemplo, pushActividad } = useAppContext();
  const sectores = useSectores();
  const { esNivel0, vencido, diasRestantes, limiteFichas, numeroNivel } = useEstadoEntrenamiento();
  const historialCambios = useHistorialCambios();
  const muestraHistorial = puedeVerHistorial(numeroNivel);
  const { toast } = useToast();
  const navigate = useNavigate();

  const cuentaId = sesion ? cuentaEfectivaDe(usuarios, sesion) : null;
  const esTitular = !!sesion && sesion.usuarioId === cuentaId;
  const hayColaboradoresActivos = usuarios.some((u) => u.cuentaClienteId === cuentaId && u.estado !== 'inactivo');

  const misFichas = useMemo(() => {
    if (!cuentaId || !sesion) return [];
    return ejemplos
      .filter((e) => e.propietarioId === cuentaId)
      .filter((e) => puedeVerFicha(e, sesion.usuarioId, esTitular))
      .map((ejemplo) => {
        const plantilla = plantillas.find((p) => p.id === ejemplo.plantillaId);
        const sector = plantilla ? sectores.find((s) => s.id === plantilla.sectorId) : undefined;
        const completo = plantilla ? Object.keys(validarValoresPlantilla(plantilla, ejemplo.valores)).length === 0 : false;
        const progreso = plantilla ? calcularProgresoValores(plantilla, ejemplo.valores) : null;
        return { ejemplo, plantilla, sector, completo, progreso };
      })
      .filter((f) => !!f.plantilla);
  }, [ejemplos, plantillas, sectores, cuentaId, sesion, esTitular]);

  const handleToggleCompartida = (ejemplo: Ejemplo) => {
    const nuevoValor = !ejemplo.compartida;
    updateEjemplo(ejemplo.id, { compartida: nuevoValor });
    toast(nuevoValor ? `"${ejemplo.nombre}" ahora es visible para tu equipo` : `"${ejemplo.nombre}" dejó de compartirse`);
  };

  const limiteAlcanzado = misFichas.length >= limiteFichas;
  const nuevaFichaBloqueada = vencido || limiteAlcanzado;

  const handleEliminar = () => {
    if (!eliminarFicha) return;
    deleteEjemplo(eliminarFicha.id);
    pushActividad(`Se eliminó la ficha "${eliminarFicha.nombre}"`, 'red');
    toast(`Ficha "${eliminarFicha.nombre}" eliminada`);
    setEliminarFicha(null);
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-surface-card rounded-xl shadow-card p-6 mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-heading leading-tight">Mis fichas</h1>
          <p className="text-sm text-muted">Las fichas técnicas que has creado y llenado</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={nuevaFichaBloqueada}
          title={
            vencido
              ? 'Tu plan de entrenamiento venció'
              : limiteAlcanzado
                ? `Alcanzaste el límite de ${limiteFichas} ${esNivel0 ? 'ejercicios' : 'plantillas simultáneas'} de tu plan`
                : undefined
          }
          className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          Nueva ficha
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.03 }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs mb-6 ${
          vencido ? 'bg-red-50 border-red-200 text-red-700' : limiteAlcanzado ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}
      >
        <FontAwesomeIcon icon={faGraduationCap} className="w-3.5 h-3.5 shrink-0" />
        {esNivel0
          ? vencido
            ? 'Tu plan de entrenamiento venció — tus ejercicios quedaron en modo solo lectura.'
            : `Modo entrenamiento — Plan Pedagógico · ${misFichas.length}/${limiteFichas} ejercicios · ${diasRestantes} día${diasRestantes === 1 ? '' : 's'} restantes`
          : `${misFichas.length}/${limiteFichas} plantillas simultáneas${limiteAlcanzado ? ' — compra "Plantilla adicional" en Facturación para sumar más' : ''}`}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: 0.05 }}
        className="bg-surface-card rounded-xl shadow-card overflow-hidden divide-y divide-gray-50"
      >
        {misFichas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center mb-3">
              <FontAwesomeIcon icon={faInbox} className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-heading">Todavía no tienes fichas</p>
            <p className="text-xs text-muted mt-1">Crea tu primera ficha para empezar a llenarla</p>
          </div>
        ) : (
          misFichas.map(({ ejemplo, plantilla, sector, completo, progreso }) => (
            <div
              key={ejemplo.id}
              onClick={() => navigate(`/mis-fichas/${ejemplo.id}`)}
              className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={instrumentoIcons[plantilla!.instrumento]} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-heading truncate">{ejemplo.nombre}</p>
                  {plantilla!.disponibleNivel0 && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-medium shrink-0">
                      <FontAwesomeIcon icon={faGraduationCap} className="w-2.5 h-2.5" />
                      Práctica
                    </span>
                  )}
                  {ejemplo.compartida && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-medium shrink-0">
                      <FontAwesomeIcon icon={faUserGroup} className="w-2.5 h-2.5" />
                      Compartida
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted">
                  {sector?.nombre ?? '—'} · {instrumentoLabels[plantilla!.instrumento]}
                </p>
                {muestraHistorial && (() => {
                  const ultimoCambio = historialCambios.find((c) => c.ejemploId === ejemplo.id);
                  if (!ultimoCambio) return null;
                  const autor = usuarios.find((u) => u.id === ultimoCambio.usuarioId);
                  return (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Última edición: {autor?.nombre ?? 'Usuario eliminado'} · {tiempoRelativo(ultimoCambio.fecha)}
                    </p>
                  );
                })()}
              </div>
              {progreso && progreso.total > 0 && (
                <div className="w-32 shrink-0">
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${progreso.porcentaje}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted mt-1 text-right">{progreso.llenos}/{progreso.total} campos</p>
                </div>
              )}
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${estadoBadge[completo ? 'Completo' : 'En progreso']}`}>
                {completo ? 'Completo' : 'En progreso'}
              </span>
              {esTitular && hayColaboradoresActivos && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleCompartida(ejemplo); }}
                  title={ejemplo.compartida ? 'Dejar de compartir con tu equipo' : 'Compartir con tu equipo'}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                    ejemplo.compartida
                      ? 'text-violet-600 hover:bg-violet-50'
                      : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'
                  }`}
                >
                  <FontAwesomeIcon icon={faUserGroup} className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setEliminarFicha(ejemplo); }}
                className="w-8 h-8 rounded-md flex items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                title="Eliminar ficha"
              >
                <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </motion.div>

      <NuevaFichaClienteModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <ConfirmModal
        isOpen={!!eliminarFicha}
        title="Eliminar ficha"
        message={`¿Seguro que deseas eliminar "${eliminarFicha?.nombre}"? Se perderá todo lo que hayas llenado. Esta acción no se puede deshacer.`}
        onConfirm={handleEliminar}
        onClose={() => setEliminarFicha(null)}
      />
    </div>
  );
}
