import {
  faHospital,
  faGraduationCap,
  faRoad,
  faFaucetDrip,
  faHandHoldingHeart,
  faSeedling,
  faFont,
  faAlignLeft,
  faHashtag,
  faCalendarDays,
  faListCheck,
  faLink,
  faCircleDot,
  faTable,
  faSitemap,
  faLock,
  faImage,
  faSignature,
  faLayerGroup,
  faFileAlt,
  faPencil,
  faHouse,
  faMountain,
  faBolt,
  faPeopleGroup,
  faTractor,
  faCity,
  faArrowDown19,
  faLocationDot,
  faBook,
  faFileInvoice,
  faScrewdriverWrench,
  faTriangleExclamation,
  faShieldHalved,
  faLandmark,
  faUmbrellaBeach,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import type { TipoCampo, TipoColumna, SubtipoTabla, TipoInstrumento, TipologiaIoarr, RolUsuario } from '../types';

export const sectorIcons: Record<string, IconDefinition> = {
  faHospital,
  faGraduationCap,
  faRoad,
  faFaucetDrip,
  faHandHoldingHeart,
  faSeedling,
  faMountain,
  faBolt,
  faPeopleGroup,
  faTractor,
  faCity,
  faHouse,
  faShieldHalved,
  faLandmark,
  faUmbrellaBeach,
  faFileInvoice,
};

export const sectorIconList = [
  'faHospital',
  'faGraduationCap',
  'faMountain',
  'faFaucetDrip',
  'faHandHoldingHeart',
  'faSeedling',
  'faBolt',
  'faRoad',
  'faTractor',
  'faCity',
  'faHouse',
  'faPeopleGroup',
  'faShieldHalved',
  'faLandmark',
  'faUmbrellaBeach',
  'faFileInvoice',
] as const;

export const fieldTypeIcons: Record<TipoCampo, IconDefinition> = {
  texto_corto: faFont,
  texto_largo: faAlignLeft,
  numero: faHashtag,
  decimal: faFileInvoice,
  fecha: faCalendarDays,
  catalogo_simple: faListCheck,
  booleano: faListCheck,
  catalogo_encadenado: faLink,
  seleccion: faCircleDot,
  tabla: faTable,
  tabla_jerarquica: faSitemap,
  calculado: faLock,
  imagen: faImage,
  firma: faSignature,
  mapa_coordenadas: faLocationDot,
};

export const fieldTypeLabels: Record<TipoCampo, string> = {
  texto_corto: 'Texto corto',
  texto_largo: 'Texto largo',
  numero: 'Número',
  decimal: 'Decimal',
  fecha: 'Fecha',
  booleano: 'Booleano',
  catalogo_simple: 'Catálogo simple',
  catalogo_encadenado: 'Catálogo encadenado',
  seleccion: 'Selección',
  tabla: 'Tabla',
  tabla_jerarquica: 'Tabla jerárquica',
  calculado: 'Calculado',
  imagen: 'Imagen / croquis',
  firma: 'Firma',
  mapa_coordenadas: 'Coordenadas',
};

export const columnTypeIcons: Record<TipoColumna, IconDefinition> = {
  texto_corto: faFont,
  texto_largo: faAlignLeft,
  numero: faHashtag,
  decimal: faFileInvoice,
  fecha: faCalendarDays,
  booleano: faListCheck,
  coordenadas: faLocationDot,
  calculado: faLock,
  catalogo: faListCheck,
  catalogo_encadenado: faLink,
  auto_numerico: faArrowDown19,
};

export const columnTypeLabels: Record<TipoColumna, string> = {
  texto_corto: 'Texto corto',
  texto_largo: 'Texto largo',
  numero: 'Número',
  decimal: 'Decimal',
  fecha: 'Fecha',
  booleano: 'Booleano',
  coordenadas: 'Coordenadas',
  calculado: 'Calculado',
  catalogo: 'Catálogo',
  catalogo_encadenado: 'Cat. encadenado',
  auto_numerico: 'Auto-numérico',
};

// Únicamente estos se ofrecen en el selector de tipo — catalogo/catalogo_encadenado/auto_numerico
// se mantienen en columnTypeIcons/Labels para columnas existentes, pero no son seleccionables aquí.
export const columnTypePrimitivos: TipoColumna[] = [
  'texto_corto',
  'texto_largo',
  'numero',
  'decimal',
  'fecha',
  'booleano',
  'coordenadas',
  'calculado',
];

export const instrumentoIcons: Record<TipoInstrumento, IconDefinition> = {
  formato: faFileInvoice,
  ioarr: faScrewdriverWrench,
  ficha_tecnica: faFileAlt,
  perfil: faBook,
};

export const instrumentoLabels: Record<TipoInstrumento, string> = {
  formato: 'Formato',
  ioarr: 'IOARR',
  ficha_tecnica: 'Ficha Técnica',
  perfil: 'Perfil',
};

export const tipologiaIoarrLabels: Record<TipologiaIoarr, string> = {
  optimizacion: 'Optimización',
  ampliacion_marginal: 'Ampliación marginal',
  reposicion: 'Reposición',
  rehabilitacion: 'Rehabilitación',
};

export const rolUsuarioLabels: Record<RolUsuario, string> = {
  superusuario: 'Superusuario',
  administrador: 'Administrador',
  cliente: 'Cliente',
};

export const subtipoTablaLabels: Record<SubtipoTabla, string> = {
  filas_dinamicas: 'Filas dinámicas',
  matriz_por_periodos: 'Columnas dinámicas',
  jerarquica: 'Jerárquica',
};

export {
  faLayerGroup,
  faFileAlt,
  faPencil,
  faHouse,
  faMountain,
  faBolt,
  faPeopleGroup,
  faTractor,
  faCity,
  faTriangleExclamation,
  faShieldHalved,
  faLandmark,
  faUmbrellaBeach,
};
