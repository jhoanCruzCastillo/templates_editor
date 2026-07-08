export type TipoCampo =
  | 'texto_corto'
  | 'texto_largo'
  | 'numero'
  | 'fecha'
  | 'decimal'
  | 'booleano'
  | 'catalogo_simple'
  | 'catalogo_encadenado'
  | 'seleccion'
  | 'tabla'
  | 'tabla_jerarquica'
  | 'calculado'
  | 'imagen'
  | 'firma'
  | 'mapa_coordenadas';

export type TipoSector = 'Sectorial' | 'General';

export type VersionTab = 'estructura' | 'ejemplos' | 'proyecto';

export type SubtipoTabla = 'filas_dinamicas' | 'matriz_por_periodos' | 'jerarquica';

export type TipoColumna =
  | 'texto'
  | 'numero'
  | 'catalogo'
  | 'catalogo_encadenado'
  | 'fecha'
  | 'calculado'
  | 'auto_numerico';

export type NivelColumna = 'padre' | 'hijo';

export interface ColumnaTabla {
  id: string;
  nombre: string;
  tipo: TipoColumna;
  nivel?: NivelColumna;
  ancho?: number;
  requerido?: boolean;
  fuenteCatalogo?: string;
  encadenaA?: string;
  formula?: string;
  /** Letra de columna Excel donde inicia esta columna (captura) */
  columnaExcel?: string;
  /** Cantidad de columnas Excel que abarca esta columna (captura) */
  abarcaColumnasExcel?: number;
}

export interface CapturaTabla {
  /** Primera fila de Excel donde empieza el primer registro de datos (no la cabecera) */
  filaInicial?: number;
  /** Cantidad de filas que ocupa la tabla en su estado base/ejemplo */
  filasBase?: number;
}

export interface ConfigTabla {
  subtipo: SubtipoTabla;
  columnas: ColumnaTabla[];
  filasIniciales?: number;
  maxFilas?: number;
  /** Cantidad de columnas de período a generar (solo subtipo matriz_por_periodos) */
  numPeriodos?: number;
  /** Prefijo de la etiqueta de período, ej. "Año" → "Año 1", "Año 2"... (vacío = "1", "2"...) */
  etiquetaPeriodo?: string;
  /** Filas planas agrupadas bajo un encabezado de grupo (no aplica a jerárquica) */
  agrupador?: boolean;
  /** Id de la columna cuyo valor se repite por período (solo subtipo matriz_por_periodos) */
  columnaDinamicaId?: string;
  /** Posición de arranque de la tabla en el Excel */
  captura?: CapturaTabla;
}

export interface Sector {
  id: string;
  nombre: string;
  codigo: string;
  icono: string;
  colorAccent: string;
  descripcion?: string;
  tipoSector: TipoSector;
  activo: boolean;
  cantidadPlantillas: number;
  cantidadEjemplos: number;
}

export type TipoInstrumento = 'formato' | 'ioarr' | 'ficha_tecnica' | 'perfil';

export type TipologiaIoarr = 'optimizacion' | 'ampliacion_marginal' | 'reposicion' | 'rehabilitacion';

export interface Plantilla {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  sectorId: string;
  instrumento: TipoInstrumento;
  tipologiaIoarr?: TipologiaIoarr;
  cantidadSecciones: number;
  cantidadEjemplos: number;
  fechaActualizacion: string;
  secciones: Seccion[];
}

// Bloque de contenido de un apartado de Perfil
export interface BloqueContenido {
  id: string;
  numeral: string;
  titulo: string;
  pauta: string;   // Texto guía del Anexo 07 — qué debe contener
  tipoBloqueContenido: 'texto_largo' | 'tabla' | 'imagen';
  valorEjemplo?: string;
}

export interface Seccion {
  id: string;
  numero: string;
  nombre: string;
  cantidadCampos: number;
  subsecciones: Subseccion[];
  /** Pestaña de Excel donde se ubican todos los campos de esta sección (captura) */
  hoja?: string;
}

export interface Subseccion {
  id: string;
  codigo: string;
  nombre: string;
  campos: Campo[];
}

export interface CapturaCampo {
  columna: string;
  fila: number;
  abarcaColumnas?: number;
  abarcaFilas?: number;
}

export interface Campo {
  id: string;
  identificador: string;
  etiqueta: string;
  tipo: TipoCampo;
  editable: boolean;
  descripcion?: string;
  fuenteCatalogo?: string;
  cadena?: string[];
  valorEjemplo?: string;
  configTabla?: ConfigTabla;
  config?: Record<string, unknown>;
  /** Ubicación de este campo en el Excel (captura) — no aplica a campos tipo tabla */
  captura?: CapturaCampo;
}

export interface Ejemplo {
  id: string;
  nombre: string;
  subtitulo: string;
  detalle: string;
  plantillaId: string;
  activo?: boolean;
  valores: Record<string, string>;
}

export type RolUsuario = 'superusuario' | 'administrador' | 'cliente';

export interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  password: string;
  rol: RolUsuario;
}

// Sesión activa — nunca guarda la contraseña
export interface Sesion {
  usuarioId: string;
  nombre: string;
  usuario: string;
  rol: RolUsuario;
}

export interface ActividadReciente {
  id: string;
  mensaje: string;
  fecha: string;
  color: 'blue' | 'green' | 'orange' | 'gray';
}
