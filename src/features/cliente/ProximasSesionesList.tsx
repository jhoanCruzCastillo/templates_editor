import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faUserTie, faUsers, faCheck } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import type { SesionMentoria } from '../../types';

interface Props {
  mentorias: SesionMentoria[];
  cuentaId: string;
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ProximasSesionesList({ mentorias, cuentaId }: Props) {
  const { inscribirseAMentoria, pushActividad } = useAppContext();
  const { toast } = useToast();

  const proximas = [...mentorias]
    .filter((m) => new Date(m.fechaISO).getTime() > Date.now())
    .sort((a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime());

  const handleUnirme = (m: SesionMentoria) => {
    inscribirseAMentoria(m.id, cuentaId);
    pushActividad(`Te uniste a la mentoría "${m.tema}"`, 'blue');
    toast(`Te uniste a "${m.tema}"`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {proximas.map((m, i) => {
        const inscrito = m.inscritos.includes(cuentaId);
        const cuposDisponibles = m.cuposTotales - m.inscritos.length;
        const lleno = cuposDisponibles <= 0;
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: i * 0.03 }}
            className="bg-surface-card rounded-xl shadow-card p-5 flex flex-col"
          >
            <p className="text-sm font-semibold text-heading mb-3 flex-1">{m.tema}</p>
            <div className="space-y-1.5 text-xs text-muted mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUserTie} className="w-3 h-3 shrink-0" />
                {m.mentor}
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarDays} className="w-3 h-3 shrink-0" />
                {formatearFecha(m.fechaISO)}
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="w-3 h-3 shrink-0" />
                {lleno ? 'Sin cupos disponibles' : `${cuposDisponibles} cupos disponibles`}
              </div>
            </div>
            <button
              onClick={() => handleUnirme(m)}
              disabled={inscrito || lleno}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-75 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                inscrito
                  ? 'bg-brand-50 text-brand-700 disabled:opacity-100'
                  : 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40'
              }`}
            >
              {inscrito && <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />}
              {inscrito ? 'Inscrito' : lleno ? 'Sin cupos' : 'Unirme'}
            </button>
          </motion.div>
        );
      })}
      {proximas.length === 0 && (
        <p className="text-sm text-muted col-span-full text-center py-8">
          No hay próximas sesiones programadas.
        </p>
      )}
    </div>
  );
}
