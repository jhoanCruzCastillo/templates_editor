import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faComments, faPaperPlane, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../lib/context';
import { useUsuarios } from '../../lib/hooks';
import { useToast } from '../../components/Toast';
import { tiempoRelativo } from '../../lib/tiempoRelativo';
import type { SesionMentoria } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sesion: SesionMentoria;
  usuarioId: string;
}

export default function PreguntasMentoriaModal({ isOpen, onClose, sesion, usuarioId }: Props) {
  const { enviarPreguntaMentoria } = useAppContext();
  const usuarios = useUsuarios();
  const { toast } = useToast();
  const [pregunta, setPregunta] = useState('');

  const ordenadas = [...sesion.preguntas].sort(
    (a, b) => new Date(b.fechaPregunta).getTime() - new Date(a.fechaPregunta).getTime(),
  );

  const handleEnviar = () => {
    if (!pregunta.trim()) return;
    enviarPreguntaMentoria(sesion.id, usuarioId, pregunta.trim());
    toast('Tu pregunta quedó registrada — el mentor la responderá aquí mismo');
    setPregunta('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.12 }}
            className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faComments} className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-heading">Preguntas y respuestas</h2>
                  <p className="text-sm text-muted truncate max-w-xs">{sesion.tema}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-100"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="px-6 pb-4 overflow-y-auto flex-1">
              {ordenadas.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">Todavía no hay preguntas en esta sesión.</p>
              ) : (
                <div className="space-y-4">
                  {ordenadas.map((p) => {
                    const autor = usuarios.find((u) => u.id === p.usuarioId);
                    return (
                      <div key={p.id} className="rounded-lg border border-gray-100 p-3">
                        <div className="flex items-start gap-2">
                          <FontAwesomeIcon icon={faCircleQuestion} className="w-3.5 h-3.5 text-violet-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-heading">{p.pregunta}</p>
                            <p className="text-[11px] text-muted mt-0.5">
                              {autor?.nombre ?? 'Usuario eliminado'} · {tiempoRelativo(p.fechaPregunta)}
                            </p>
                          </div>
                        </div>
                        {p.respuesta ? (
                          <div className="mt-2 ml-5.5 pl-3 border-l-2 border-brand-200">
                            <p className="text-sm text-gray-700">{p.respuesta}</p>
                            <p className="text-[11px] text-muted mt-0.5">
                              {sesion.mentor} · {p.fechaRespuesta ? tiempoRelativo(p.fechaRespuesta) : ''}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 ml-5.5 pl-3 border-l-2 border-gray-200 text-xs text-muted italic">
                            Pendiente de respuesta del mentor
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 pt-4 border-t border-gray-100 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
                  placeholder="Escribe tu pregunta para el mentor..."
                  className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
                <button
                  onClick={handleEnviar}
                  disabled={!pregunta.trim()}
                  className="px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-75 flex items-center gap-2 shrink-0"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
