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

// Primitivos documentados (esquema oficial) + catalogo/catalogo_encadenado/auto_numerico,
// que se mantienen por compatibilidad con datos existentes pero ya no se ofrecen en el selector de tipo.
export type TipoColumna =
  | 'texto_corto'
  | 'texto_largo'
  | 'numero'
  | 'decimal'
  | 'fecha'
  | 'booleano'
  | 'coordenadas'
  | 'calculado'
  | 'catalogo'
  | 'catalogo_encadenado'
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
  /** Letra de columna Excel donde inicia la tabla (referencia — cada columna puede pisarla con la suya) */
  columnaInicial?: string;
  /** Primera fila de Excel donde empieza el primer registro de datos (no la cabecera) */
  filaInicial?: number;
  /** Cantidad de filas que ocupa la tabla en su estado base/ejemplo */
  filasBase?: number;
}

export interface CabeceraGrupo {
  titulo: string;
  /** Ids de ColumnaTabla que quedan agrupados bajo este título (incluye columnaDinamicaId si aplica) */
  hijoIds: string[];
}

export interface ConfigTabla {
  subtipo: SubtipoTabla;
  columnas: ColumnaTabla[];
  filasIniciales?: number;
  maxFilas?: number;
  /** Lista editable de nombres de las columnas dinámicas generadas, cada una insertable/editable individualmente (solo subtipo matriz_por_periodos) */
  periodos?: string[];
  /** Filas planas agrupadas bajo un encabezado de grupo (no aplica a jerárquica) */
  agrupador?: boolean;
  /** Cantidad de columnas que abarca (fusiona) la fila de título de cada grupo, contando desde la primera columna (solo si agrupador=true; por defecto, todas las columnas) */
  agrupadorAbarcaColumnas?: number;
  /** Id de la columna cuyo valor se repite por período (solo subtipo matriz_por_periodos) */
  columnaDinamicaId?: string;
  /** Encabezados que agrupan columnas existentes bajo un título común (equivalente a "cabecera" del esquema oficial) */
  cabeceras?: CabeceraGrupo[];
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
  /** Ruta pública (bajo /fichas_oficiales) del archivo Excel oficial que se asigna automáticamente
   * al catálogo de esta plantilla la primera vez que se carga la app — ver AppProvider en context.tsx */
  archivoDefaultUrl?: string;
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

export type TemaPreferencia = 'claro' | 'oscuro' | 'sistema';

export interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  password: string;
  rol: RolUsuario;
  apodo?: string;
  tema?: TemaPreferencia;
}

// Sesión activa — nunca guarda la contraseña
export interface Sesion {
  usuarioId: string;
  nombre: string;
  usuario: string;
  rol: RolUsuario;
  iniciadaEn?: string;
}

export type EstadoFactura = 'Pagado' | 'Pendiente';

export interface FacturaMock {
  id: string;
  fecha: string;
  total: string;
  estado: EstadoFactura;
}

// Datos de facturación de muestra — no hay pasarela de pago real ni backend;
// esto solo alimenta la UI de Ajustes > Facturación con datos ilustrativos.
export interface FacturacionMock {
  plan: string;
  precio: string;
  periodicidad: string;
  cancelada: boolean;
  fechaRenovacion: string;
  tarjetaMarca: string;
  tarjetaUltimos4: string;
  facturas: FacturaMock[];
}

export interface ActividadReciente {
  id: string;
  mensaje: string;
  fecha: string;
  color: 'blue' | 'green' | 'orange' | 'gray';
}

// Catálogo de archivos Excel de referencia asignables a una plantilla (para previsualización)
export interface ArchivoExcel {
  id: string;
  nombre: string;
  /** Contenido del archivo como data URL (localStorage no soporta blobs) */
  dataUrl: string;
  fechaSubida: string;
}

export interface CatalogoExcelPlantilla {
  archivos: ArchivoExcel[];
  /** Id del archivo actualmente asignado a la plantilla (se previsualiza en el editor) */
  asignadoId?: string;
}
