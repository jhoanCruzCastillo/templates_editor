import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faChalkboardUser, faCalendarCheck, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../lib/auth';
import { useAppContext } from '../../lib/context';
import { useMentorias, useEstadoEntrenamiento } from '../../lib/hooks';
import { cuentaEfectivaDe } from '../../lib/permisos';
import { puedeAccederMentorias } from '../../lib/planAcceso';
import PlanesModal from '../settings/PlanesModal';
import ProximasSesionesList from './ProximasSesionesList';
import MisMentoriasList from './MisMentoriasList';

type Tab = 'proximas' | 'mias';

export default function MentoriasPage() {
  const { sesion } = useAuth();
  const { usuarios } = useAppContext();
  const mentorias = useMentorias();
  const { numeroNivel } = useEstadoEntrenamiento();
  const [showPlanes, setShowPlanes] = useState(false);
  const [tab, setTab] = useState<Tab>('proximas');

  const cuentaId = sesion ? cuentaEfectivaDe(usuarios, sesion) : '';
  const bloqueado = !puedeAccederMentorias(numeroNivel);

  const countProximas = mentorias.filter((m) => new Date(m.fechaISO).getTime() > Date.now()).length;
  const countMias = mentorias.filter((m) => m.inscritos.includes(cuentaId)).length;

  if (bloqueado) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-surface-card rounded-xl shadow-card p-12 flex flex-col items-center text-center max-w-lg mx-auto mt-12"
        >
          <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
            <FontAwesomeIcon icon={faLock} className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-heading mb-2">Mentorías grupales</h1>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            El respaldo humano que complementa a tu asesor de IA: sesiones grupales en vivo con un
            mentor real, donde puedes hacer preguntas puntuales, ver cómo otros resuelven dudas
            parecidas y sentir que no estás solo llenando tu ficha. Disponible desde el plan Nivel 1.
          </p>
          <button
            onClick={() => setShowPlanes(true)}
            className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Actualizar plan
          </button>
        </motion.div>
        {cuentaId && (
          <PlanesModal isOpen={showPlanes} onClose={() => setShowPlanes(false)} usuarioId={cuentaId} />
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-surface-card rounded-xl shadow-card p-6 mb-6 flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faChalkboardUser} className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-heading leading-tight">Mentorías</h1>
          <p className="text-sm text-muted">
            Sesiones grupales en vivo con un mentor real — más económicas que una consultoría 1 a 1.
          </p>
        </div>
      </motion.div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'proximas' as Tab, label: 'Próximas sesiones', icon: faCalendarCheck, count: countProximas },
          { key: 'mias' as Tab, label: 'Mis mentorías', icon: faVideo, count: countMias },
        ].map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-75 ${
                isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={t.icon} className="w-3.5 h-3.5" />
              {t.label}
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === 'proximas' ? (
        <ProximasSesionesList mentorias={mentorias} cuentaId={cuentaId} />
      ) : (
        <MisMentoriasList
          mentorias={mentorias}
          cuentaId={cuentaId}
          usuarioId={sesion?.usuarioId ?? ''}
          numeroNivel={numeroNivel}
        />
      )}
    </div>
  );
}
