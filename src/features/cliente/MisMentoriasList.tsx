import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faUserTie, faVideo, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import type { SesionMentoria } from '../../types';

interface Props {
  mentorias: SesionMentoria[];
  cuentaId: string;
}

// Prototipo sin integración real de video — el botón "Entrar a la sesión" solo se habilita
// dentro de esta ventana alrededor del inicio programado (el enlace en sí siempre se muestra,
// como en una invitación real).
const VENTANA_ANTES_MIN = 15;
const VENTANA_DESPUES_MIN = 120;

function puedeEntrar(fechaISO: string): boolean {
  const inicio = new Date(fechaISO).getTime();
  const ahora = Date.now();
  return ahora >= inicio - VENTANA_ANTES_MIN * 60_000 && ahora <= inicio + VENTANA_DESPUES_MIN * 60_000;
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
}

function nombrePlataforma(link: string): string {
  if (link.includes('zoom.us')) return 'Zoom';
  if (link.includes('meet.google.com')) return 'Google Meet';
  return 'Videollamada';
}

export default function MisMentoriasList({ mentorias, cuentaId }: Props) {
  const mias = [...mentorias]
    .filter((m) => m.inscritos.includes(cuentaId))
    .sort((a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime());

  return (
    <div className="bg-surface-card rounded-xl shadow-card overflow-hidden divide-y divide-gray-50">
      {mias.map((m) => {
        const habilitado = puedeEntrar(m.fechaISO);
        return (
          <div key={m.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-heading truncate">{m.tema}</p>
              <p className="text-xs text-muted flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faUserTie} className="w-2.5 h-2.5" />
                  {m.mentor}
                </span>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendarDays} className="w-2.5 h-2.5" />
                  {formatearFecha(m.fechaISO)}
                </span>
              </p>
              <p className="text-xs mt-1.5 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faVideo} className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="text-gray-500">{nombrePlataforma(m.linkReunion)}:</span>
                <a
                  href={m.linkReunion}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline truncate font-mono"
                >
                  {m.linkReunion}
                </a>
              </p>
            </div>
            <a
              href={habilitado ? m.linkReunion : undefined}
              target="_blank"
              rel="noopener noreferrer"
              title={!habilitado ? 'Disponible desde 15 minutos antes de que empiece' : undefined}
              aria-disabled={!habilitado}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-75 flex items-center gap-2 shrink-0 ${
                habilitado
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
              }`}
            >
              <FontAwesomeIcon icon={faDoorOpen} className="w-3.5 h-3.5" />
              Entrar a la sesión
            </a>
          </div>
        );
      })}
      {mias.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted">
          Todavía no te has unido a ninguna mentoría.
        </p>
      )}
    </div>
  );
}
