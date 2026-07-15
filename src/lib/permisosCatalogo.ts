import type { PermisoId, RolUsuario, Usuario } from '../types';

export interface DefinicionPermiso {
  id: PermisoId;
  etiqueta: string;
  descripcion: string;
}

export interface CategoriaPermisos {
  id: string;
  nombre: string;
  permisos: DefinicionPermiso[];
}

// Catálogo completo — un permiso por cada funcionalidad/sección real de la app. El rol de un
// usuario es solo una etiqueta; esta lista es la que en el futuro decidirá qué puede hacer cada
// quien (ver nota en types/index.ts sobre el alcance visual-only de esta primera versión).
export const catalogoPermisos: CategoriaPermisos[] = [
  {
    id: 'catalogo',
    nombre: 'Sectores y plantillas',
    permisos: [
      { id: 'sectores.ver', etiqueta: 'Ver sectores', descripcion: 'Consultar el catálogo de sectores del Estado.' },
      { id: 'sectores.gestionar', etiqueta: 'Gestionar sectores', descripcion: 'Crear, editar y eliminar sectores.' },
      { id: 'plantillas.ver', etiqueta: 'Ver plantillas', descripcion: 'Consultar las plantillas de cada sector.' },
      { id: 'plantillas.gestionar', etiqueta: 'Gestionar plantillas', descripcion: 'Crear, editar, duplicar y eliminar plantillas.' },
      { id: 'plantillas.importar_json', etiqueta: 'Importar plantilla desde JSON', descripcion: 'Cargar una plantilla completa a partir de un archivo JSON.' },
      { id: 'estructura.editar', etiqueta: 'Editar estructura', descripcion: 'Modificar secciones, subsecciones y campos de una plantilla.' },
    ],
  },
  {
    id: 'ejemplos',
    nombre: 'Ejemplos (contexto de la IA)',
    permisos: [
      { id: 'ejemplos.gestionar', etiqueta: 'Gestionar ejemplos', descripcion: 'Crear, editar y eliminar los casos de referencia que alimentan a la IA.' },
      { id: 'excel.asignar', etiqueta: 'Asignar archivos Excel', descripcion: 'Subir y asignar el Excel oficial de cada plantilla.' },
      { id: 'json.ver', etiqueta: 'Ver JSON exportado', descripcion: 'Inspeccionar el JSON de estructura/ejemplo generado por el editor.' },
    ],
  },
  {
    id: 'usuarios',
    nombre: 'Usuarios y permisos',
    permisos: [
      { id: 'usuarios.gestionar_clientes', etiqueta: 'Gestionar clientes', descripcion: 'Crear, editar y eliminar cuentas de clientes.' },
      { id: 'usuarios.gestionar_administradores', etiqueta: 'Gestionar administradores', descripcion: 'Crear, editar y eliminar cuentas de administrador.' },
      { id: 'usuarios.gestionar_superusuarios', etiqueta: 'Gestionar superusuarios', descripcion: 'Crear, editar y eliminar cuentas de superusuario.' },
    ],
  },
  {
    id: 'fichas',
    nombre: 'Mis fichas (cliente)',
    permisos: [
      { id: 'fichas.crear', etiqueta: 'Crear y llenar fichas', descripcion: 'Crear fichas propias a partir del catálogo oficial y llenarlas.' },
      { id: 'fichas.compartir', etiqueta: 'Compartir con el equipo', descripcion: 'Marcar fichas propias como visibles para los colaboradores de la cuenta.' },
      { id: 'fichas.ver_historial', etiqueta: 'Ver histórico de cambios', descripcion: 'Ver quién editó qué y cuándo en una ficha.' },
    ],
  },
  {
    id: 'colaboradores',
    nombre: 'Colaboradores',
    permisos: [
      { id: 'colaboradores.gestionar', etiqueta: 'Gestionar colaboradores', descripcion: 'Agregar, editar y eliminar usuarios adicionales de la cuenta.' },
    ],
  },
  {
    id: 'mentorias',
    nombre: 'Mentorías',
    permisos: [
      { id: 'mentorias.acceder', etiqueta: 'Acceder a mentorías', descripcion: 'Unirse a sesiones grupales en vivo con un mentor.' },
      { id: 'mentorias.preguntas_respuestas', etiqueta: 'Preguntas y respuestas', descripcion: 'Ver y participar en el Q&A de cada sesión de mentoría.' },
    ],
  },
  {
    id: 'ia',
    nombre: 'Asistente de IA',
    permisos: [
      { id: 'ia.mejora_texto', etiqueta: 'Mejorar textos con IA', descripcion: 'Usar la sugerencia de IA para mejorar títulos y textos.' },
      { id: 'ia.asesor', etiqueta: 'Asesor de IA 24/7', descripcion: 'Chatear con el asesor de IA mientras llena una ficha.' },
    ],
  },
  {
    id: 'facturacion',
    nombre: 'Facturación',
    permisos: [
      { id: 'facturacion.gestionar', etiqueta: 'Gestionar plan y pagos', descripcion: 'Cambiar de plan, método de pago y contratar add-ons.' },
    ],
  },
];

export const TODOS_LOS_PERMISOS: PermisoId[] = catalogoPermisos.flatMap((c) => c.permisos.map((p) => p.id));

const PERMISOS_ADMINISTRADOR: PermisoId[] = [
  'sectores.ver',
  'sectores.gestionar',
  'plantillas.ver',
  'plantillas.gestionar',
  'plantillas.importar_json',
  'estructura.editar',
  'ejemplos.gestionar',
  'excel.asignar',
  'usuarios.gestionar_clientes',
];

// Espeja las features de cada plan en data/planes.ts — un cliente Nivel 2 acumula también lo de
// Nivel 0 y 1.
function permisosDefaultCliente(numeroNivel: number): PermisoId[] {
  const permisos: PermisoId[] = ['fichas.crear', 'facturacion.gestionar'];
  if (numeroNivel >= 1) permisos.push('mentorias.acceder', 'ia.mejora_texto', 'ia.asesor');
  if (numeroNivel >= 2) {
    permisos.push('fichas.compartir', 'fichas.ver_historial', 'colaboradores.gestionar', 'mentorias.preguntas_respuestas');
  }
  return permisos;
}

export function permisosDefaultPorRol(rol: RolUsuario, numeroNivel: number): PermisoId[] {
  if (rol === 'superusuario') return TODOS_LOS_PERMISOS;
  if (rol === 'administrador') return PERMISOS_ADMINISTRADOR;
  return permisosDefaultCliente(numeroNivel);
}

// Si el usuario ya tiene permisos guardados explícitamente, se respetan tal cual; si no, se
// calculan por defecto según su rol (y su nivel de plan si es cliente).
export function permisosDe(usuario: Usuario, numeroNivel: number): PermisoId[] {
  return usuario.permisos ?? permisosDefaultPorRol(usuario.rol, numeroNivel);
}
