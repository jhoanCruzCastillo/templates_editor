import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Breadcrumbs from '../../components/Breadcrumbs';
import PlantillaTable from './PlantillaTable';
import NuevaPlantillaModal from './NuevaPlantillaModal';
import ImportarJsonModal from './ImportarJsonModal';
import { useSector, usePlantillasBySector } from '../../lib/hooks';
import { useAppContext } from '../../lib/context';
import { useToast } from '../../components/Toast';
import { generateId } from '../../lib/store';
import { sectorIcons } from '../../lib/icons';
import type { Seccion, TipoInstrumento, TipologiaIoarr } from '../../types';

export default function SectorDetallePage() {
  const { sectorId } = useParams<{ sectorId: string }>();
  const sector = useSector(sectorId!);
  const plantillas = usePlantillasBySector(sectorId!);
  const { addPlantilla, pushActividad } = useAppContext();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  if (!sector) return <div className="p-8 text-muted">Sector no encontrado</div>;

  const icon = sectorIcons[sector.icono];

  const handleCreate = (
    codigo: string,
    nombre: string,
    descripcion: string,
    instrumento: import('../../types').TipoInstrumento,
    tipologiaIoarr?: import('../../types').TipologiaIoarr,
  ) => {
    addPlantilla({
      id: generateId(),
      codigo,
      nombre,
      descripcion,
      sectorId: sectorId!,
      instrumento,
      tipologiaIoarr,
      cantidadSecciones: 0,
      cantidadEjemplos: 0,
      fechaActualizacion: new Date().toLocaleDateString('es-PE'),
      secciones: [],
    });
    pushActividad(`Se creó la plantilla ${codigo} — ${nombre}`, 'green');
    toast(`Plantilla "${codigo}" creada`);
  };

  const handleImport = (data: {
    codigo: string;
    nombre: string;
    instrumento: TipoInstrumento;
    tipologiaIoarr?: TipologiaIoarr;
    secciones: Seccion[];
  }) => {
    addPlantilla({
      id: generateId(),
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: '',
      sectorId: sectorId!,
      instrumento: data.instrumento,
      tipologiaIoarr: data.tipologiaIoarr,
      cantidadSecciones: data.secciones.length,
      cantidadEjemplos: 0,
      fechaActualizacion: new Date().toLocaleDateString('es-PE'),
      secciones: data.secciones,
    });
    pushActividad(`Se importó la plantilla ${data.codigo} — ${data.nombre} desde JSON`, 'green');
    toast(`Plantilla "${data.codigo}" importada`);
  };

  return (
    <div className="p-8">
      {/* Breadcrumb en contenedor con sombra */}
      <div className="bg-surface-card rounded-xl shadow-card px-6 py-4 mb-4">
        <Breadcrumbs
          className=""
          items={[
            { label: 'Sectores', to: '/sectores' },
            { label: sector.nombre },
          ]}
        />
      </div>

      {/* Header del sector en contenedor con sombra */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-surface-card rounded-xl shadow-card p-6 mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: sector.colorAccent }}
          >
            {icon && <FontAwesomeIcon icon={icon} className="w-7 h-7" />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Sector</p>
            <h1 className="text-2xl font-bold text-heading leading-tight">{sector.nombre}</h1>
            <p className="text-sm text-brand-600/80">
              {sector.descripcion || `Gestiona las plantillas del sector ${sector.nombre}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faFileImport} className="w-3.5 h-3.5" />
            Importar JSON
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            Nueva plantilla
          </button>
        </div>
      </motion.div>

      <PlantillaTable plantillas={plantillas} sectorId={sectorId!} />

      <NuevaPlantillaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />

      <ImportarJsonModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
}
