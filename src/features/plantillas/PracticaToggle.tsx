import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import type { Plantilla } from '../../types';

interface Props {
  plantilla: Plantilla;
}

// Toggle para marcar una plantilla como ejercicio de práctica del plan Nivel 0 (Pedagógico) —
// ver [[nivel0-catalogo-curado]]. Sin esto el admin no tenía forma de agregar fichas nuevas al
// catálogo de entrenamiento sin pedirlo por código.
export default function PracticaToggle({ plantilla }: Props) {
  const { ejemplos, updatePlantilla } = useAppContext();
  const { toast } = useToast();
  const activo = !!plantilla.disponibleNivel0;
  const tieneSolucionario = ejemplos.some((e) => e.plantillaId === plantilla.id && !e.propietarioId);

  const toggle = () => {
    const nuevoValor = !activo;
    updatePlantilla(plantilla.id, { disponibleNivel0: nuevoValor });
    if (nuevoValor && !tieneSolucionario) {
      toast('Marcada para Nivel 0 — todavía no tiene un Ejemplo de referencia (solucionario) cargado en la pestaña Ejemplos', 'error');
    } else {
      toast(nuevoValor ? 'Agregada al catálogo de práctica del Nivel 0' : 'Quitada del catálogo de práctica del Nivel 0');
    }
  };

  return (
    <button
      onClick={toggle}
      title={
        activo
          ? 'Quitar de los ejercicios del plan Pedagógico (Nivel 0)'
          : 'Marcar como ejercicio de práctica del plan Pedagógico (Nivel 0)'
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors duration-75 shrink-0 ${
        activo ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
    >
      <FontAwesomeIcon icon={faGraduationCap} className="w-2.5 h-2.5" />
      Nivel 0
    </button>
  );
}
