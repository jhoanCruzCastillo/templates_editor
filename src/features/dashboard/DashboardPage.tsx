import { motion } from 'framer-motion';
import { faLayerGroup, faFileAlt, faPencil } from '@fortawesome/free-solid-svg-icons';
import Breadcrumbs from '../../components/Breadcrumbs';
import MetricCard from './MetricCard';
import QuickAccessItem from './QuickAccessItem';
import ActivityFeed from './ActivityFeed';
import { useMetricas } from '../../lib/hooks';
import { useAuth } from '../../lib/auth';

export default function DashboardPage() {
  const metricas = useMetricas();
  const { sesion } = useAuth();
  const primerNombre = sesion?.nombre.split(' ')[0] ?? '';

  return (
    <div className="p-8">
      <Breadcrumbs items={[{ label: 'Inicio' }]} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <h1 className="text-3xl font-bold text-heading mb-2">Bienvenido/a, {primerNombre}</h1>
        <p className="text-muted mb-8">
          Administra los sectores, plantillas y ejemplos que alimentan el asistente de formulación.
        </p>
      </motion.div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <MetricCard
          icon={faLayerGroup}
          value={metricas.totalSectores}
          label="Sectores activos"
          color="#0d9488"
          bgColor="#ccfbf1"
          delay={0.1}
        />
        <MetricCard
          icon={faFileAlt}
          value={metricas.totalPlantillas}
          label="Plantillas creadas"
          color="#2563eb"
          bgColor="#dbeafe"
          delay={0.2}
        />
        <MetricCard
          icon={faPencil}
          value={metricas.totalEjemplos}
          label="Ejemplos cargados"
          color="#d97706"
          bgColor="#fef3c7"
          delay={0.3}
        />
      </div>

      {/* Accesos directos + Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
            Accesos directos
          </h3>
          <div className="space-y-3">
            <QuickAccessItem
              icon={faLayerGroup}
              iconColor="#0d9488"
              iconBg="#ccfbf1"
              title="Sectores"
              description="6 sectores · agrupan las plantillas por ámbito del Estado"
              to="/sectores"
              delay={0.2}
            />
            <QuickAccessItem
              icon={faFileAlt}
              iconColor="#2563eb"
              iconBg="#dbeafe"
              title="Plantillas"
              description="Fichas técnicas 6A, 6B y formatos sectoriales"
              to="/sectores"
              delay={0.3}
            />
            <QuickAccessItem
              icon={faPencil}
              iconColor="#d97706"
              iconBg="#fef3c7"
              title="Ejemplos cargados"
              description="Casos resueltos que alimentan el contexto de la IA"
              to="/sectores"
              delay={0.4}
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
