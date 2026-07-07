import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import SectoresPage from '../features/sectores/SectoresPage';
import SectorDetallePage from '../features/plantillas/SectorDetallePage';
import PlantillaViewPage from '../features/editor/PlantillaViewPage';
import PlantillaEditPage from '../features/editor/PlantillaEditPage';
import PlantillaPerfilPage from '../features/editor/PlantillaPerfilPage';

function RequireAuth({ children }: { children: ReactNode }) {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/login" replace />;
  return children;
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'sectores', element: <SectoresPage /> },
      { path: 'sectores/:sectorId', element: <SectorDetallePage /> },
      { path: 'sectores/:sectorId/plantilla/:plantillaId', element: <PlantillaViewPage /> },
      { path: 'sectores/:sectorId/plantilla/:plantillaId/editar', element: <PlantillaEditPage /> },
      { path: 'sectores/:sectorId/plantilla/:plantillaId/perfil', element: <PlantillaPerfilPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
