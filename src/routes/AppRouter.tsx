import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { puedeAccederGestionUsuarios } from '../lib/permisos';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../features/auth/LoginPage';
import HomeRouter from '../features/dashboard/HomeRouter';
import SectoresPage from '../features/sectores/SectoresPage';
import SectorDetallePage from '../features/plantillas/SectorDetallePage';
import PlantillaViewPage from '../features/editor/PlantillaViewPage';
import PlantillaEditPage from '../features/editor/PlantillaEditPage';
import PlantillaPerfilPage from '../features/editor/PlantillaPerfilPage';
import UsuariosPage from '../features/usuarios/UsuariosPage';
import ClienteFichaEditPage from '../features/cliente/ClienteFichaEditPage';

function RequireAuth({ children }: { children: ReactNode }) {
  const { sesion } = useAuth();
  if (!sesion) return <Navigate to="/login" replace />;
  return children;
}

function RequireGestionUsuarios({ children }: { children: ReactNode }) {
  const { sesion } = useAuth();
  if (!sesion || !puedeAccederGestionUsuarios(sesion.rol)) return <Navigate to="/" replace />;
  return children;
}

// El catálogo de sectores/plantillas (modo admin: estructura, ejemplos, editor completo) no es
// la experiencia del cliente — ver CLAUDE.md. El cliente solo crea y llena sus propias fichas
// desde "Mis fichas" (/) y su editor reducido (/mis-fichas/:id).
function RequireNoCliente({ children }: { children: ReactNode }) {
  const { sesion } = useAuth();
  if (sesion?.rol === 'cliente') return <Navigate to="/" replace />;
  return children;
}

function RequireCliente({ children }: { children: ReactNode }) {
  const { sesion } = useAuth();
  if (sesion?.rol !== 'cliente') return <Navigate to="/" replace />;
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
      { index: true, element: <HomeRouter /> },
      {
        path: 'sectores',
        element: <RequireNoCliente><SectoresPage /></RequireNoCliente>,
      },
      {
        path: 'sectores/:sectorId',
        element: <RequireNoCliente><SectorDetallePage /></RequireNoCliente>,
      },
      {
        path: 'sectores/:sectorId/plantilla/:plantillaId',
        element: <RequireNoCliente><PlantillaViewPage /></RequireNoCliente>,
      },
      {
        path: 'sectores/:sectorId/plantilla/:plantillaId/editar',
        element: <RequireNoCliente><PlantillaEditPage /></RequireNoCliente>,
      },
      {
        path: 'sectores/:sectorId/plantilla/:plantillaId/perfil',
        element: <RequireNoCliente><PlantillaPerfilPage /></RequireNoCliente>,
      },
      {
        path: 'usuarios',
        element: (
          <RequireGestionUsuarios>
            <UsuariosPage />
          </RequireGestionUsuarios>
        ),
      },
      {
        path: 'mis-fichas/:ejemploId',
        element: <RequireCliente><ClienteFichaEditPage /></RequireCliente>,
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
