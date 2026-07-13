import type { RolUsuario } from '../types';

// Reglas de gestión de usuarios: un superusuario gestiona cualquier rol; un administrador
// solo gestiona clientes; un cliente no gestiona a nadie y no accede a esta sección.
const ROLES_GESTIONABLES: Record<RolUsuario, RolUsuario[]> = {
  superusuario: ['superusuario', 'administrador', 'cliente'],
  administrador: ['cliente'],
  cliente: [],
};

export function rolesGestionablesPor(actorRol: RolUsuario): RolUsuario[] {
  return ROLES_GESTIONABLES[actorRol];
}

export function puedeGestionarRol(actorRol: RolUsuario, targetRol: RolUsuario): boolean {
  return ROLES_GESTIONABLES[actorRol].includes(targetRol);
}

export function puedeAccederGestionUsuarios(rol: RolUsuario): boolean {
  return rol !== 'cliente';
}
