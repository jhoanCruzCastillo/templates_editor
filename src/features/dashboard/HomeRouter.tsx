import { useAuth } from '../../lib/auth';
import DashboardPage from './DashboardPage';
import MisFichasPage from '../cliente/MisFichasPage';

export default function HomeRouter() {
  const { sesion } = useAuth();
  if (sesion?.rol === 'cliente') return <MisFichasPage />;
  return <DashboardPage />;
}
