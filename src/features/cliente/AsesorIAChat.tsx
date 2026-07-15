import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faXmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { renderMarkdown } from '../../lib/markdown';
import { buscarEnGlosario, buscarEnAyudas } from '../../lib/glosarioIA';
import type { Plantilla } from '../../types';

interface Mensaje {
  id: string;
  autor: 'asesor' | 'usuario';
  texto: string;
  fuente?: string;
}

interface Props {
  plantilla: Plantilla;
  seccionActivaId: string | null;
  permitido: boolean;
}

let contadorMsg = 0;
const idMensaje = () => `msg-${++contadorMsg}`;

export default function AsesorIAChat({ plantilla, seccionActivaId, permitido }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const seccionActiva = plantilla.secciones.find((s) => s.id === seccionActivaId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes, escribiendo]);

  const agregarMensaje = (autor: Mensaje['autor'], texto: string, fuente?: string) => {
    setMensajes((prev) => [...prev, { id: idMensaje(), autor, texto, fuente }]);
  };

  const responderConRetraso = (texto: string, fuente?: string) => {
    setEscribiendo(true);
    setTimeout(() => {
      setEscribiendo(false);
      agregarMensaje('asesor', texto, fuente);
    }, 600);
  };

  const handleAbrir = () => {
    setAbierto(true);
    if (mensajes.length === 0) {
      const nombreSeccion = seccionActiva ? `${seccionActiva.numero} — ${seccionActiva.nombre}` : 'tu ficha';
      agregarMensaje('asesor', `Hola, soy tu asesor de llenado. Veo que estás en la sección **${nombreSeccion}**. Elige una subsección de abajo o escríbeme tu duda.`);
    }
  };

  const preguntarPorSubseccion = (subId: string) => {
    const sub = seccionActiva?.subsecciones.find((s) => s.id === subId);
    if (!sub) return;
    agregarMensaje('usuario', `¿Cómo lleno "${sub.codigo} — ${sub.nombre}"?`);
    responderConRetraso(
      sub.ayuda?.trim() || 'Todavía no hay ayuda cargada para esta subsección. Revisa el ejemplo de referencia arriba, o consúltalo con tu asesor humano en las mentorías grupales.',
      sub.ayuda?.trim() ? `Ayuda de ${sub.codigo} — ${sub.nombre}` : undefined,
    );
  };

  const enviarPregunta = () => {
    const pregunta = input.trim();
    if (!pregunta) return;
    agregarMensaje('usuario', pregunta);
    setInput('');
    const respuesta = buscarEnGlosario(pregunta) ?? buscarEnAyudas(pregunta, plantilla.secciones);
    responderConRetraso(
      respuesta?.texto ?? 'No tengo una respuesta puntual para eso todavía. Revisa la ayuda de la subsección con el botón "?", o consúltalo con tu asesor humano.',
      respuesta?.fuente,
    );
  };

  if (!permitido) {
    return (
      <button
        title="Asesor de IA 24/7 — disponible desde Nivel 1, actualiza tu plan"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gray-300 text-white flex items-center justify-center shadow-lg cursor-not-allowed z-40"
      >
        <FontAwesomeIcon icon={faRobot} className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {!abierto && (
        <button
          onClick={handleAbrir}
          title="Asesor de IA 24/7"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors z-40"
        >
          <FontAwesomeIcon icon={faRobot} className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
        </button>
      )}

      {abierto && (
        <div className="fixed bottom-6 right-6 w-96 h-[520px] bg-white rounded-2xl shadow-modal border border-gray-200 flex flex-col z-40 overflow-hidden">
          <div className="shrink-0 px-4 py-3 bg-violet-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faRobot} className="w-4 h-4" />
              <div>
                <p className="text-sm font-bold leading-tight">Asesor de IA</p>
                <p className="text-[10px] text-violet-100 leading-tight">Disponible 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors duration-75"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
            {mensajes.map((m) => (
              <div key={m.id} className={`flex ${m.autor === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                  m.autor === 'usuario' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
                }`}>
                  {m.autor === 'asesor' ? renderMarkdown(m.texto) : m.texto}
                  {m.fuente && <p className="mt-1 text-[10px] text-violet-500 font-medium">📎 {m.fuente}</p>}
                </div>
              </div>
            ))}
            {escribiendo && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-400 italic">
                  Escribiendo…
                </div>
              </div>
            )}
            {!escribiendo && seccionActiva && mensajes.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {seccionActiva.subsecciones.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => preguntarPorSubseccion(sub.id)}
                    className="px-2.5 py-1 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-[11px] font-medium hover:bg-violet-100 transition-colors duration-75"
                  >
                    {sub.codigo} {sub.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-gray-100 p-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') enviarPregunta(); }}
              placeholder="Escribe tu duda..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <button
              onClick={enviarPregunta}
              className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors duration-75 shrink-0"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
