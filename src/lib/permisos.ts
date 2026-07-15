import type { RolUsuario, Usuario, Sesion, Ejemplo } from '../types';

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

// La "cuenta" bajo la que se guardan/ven las fichas de un cliente: si el usuario en sesión es un
// colaborador (tiene cuentaClienteId), sus fichas viven bajo el titular; si no, bajo sí mismo.
export function cuentaEfectivaDe(usuarios: Usuario[], sesion: Sesion): string {
  const usuario = usuarios.find((u) => u.id === sesion.usuarioId);
  return usuario?.cuentaClienteId ?? sesion.usuarioId;
}

// Visibilidad de una ficha dentro de una cuenta compartida (titular + colaboradores, Nivel 2):
// el titular ve todo bajo su cuenta; un colaborador solo ve las fichas que él mismo creó, más las
// que el titular decidió marcar como `compartida`. No confundir con "pertenece a la cuenta"
// (ejemplo.propietarioId === cuentaId), que se valida aparte.
export function puedeVerFicha(ejemplo: Ejemplo, usuarioId: string, esTitular: boolean): boolean {
  if (esTitular) return true;
  const creadorId = ejemplo.creadoPorUsuarioId ?? ejemplo.propietarioId;
  return creadorId === usuarioId || !!ejemplo.compartida;
}
