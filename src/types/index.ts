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
  /** Tipologías IOARR que este documento cubre internamente (no son excluyentes entre sí — un mismo
   * formato como el 07-C trae las 4 como secciones propias; ver [[ioarr-tipologias-transversales]]). */
  tipologiasIoarr?: TipologiaIoarr[];
  cantidadSecciones: number;
  cantidadEjemplos: number;
  fechaActualizacion: string;
  secciones: Seccion[];
  /** Ruta pública (bajo /fichas_oficiales) del archivo Excel oficial que se asigna automáticamente
   * al catálogo de esta plantilla la primera vez que se carga la app — ver AppProvider en context.tsx */
  archivoDefaultUrl?: string;
  /** true = forma parte del catálogo curado de "ejercicios de práctica" del plan Nivel 0
   * (Pedagógico) — debe tener al menos un Ejemplo de referencia (solucionario) cargado por el admin */
  disponibleNivel0?: boolean;
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
  /** Guía de cómo llenar esta subsección, autorada por el admin — se muestra al cliente vía el botón "?" */
  ayuda?: string;
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
  /** El cliente debe llenarlo obligatoriamente — lo usa el validador del lado cliente */
  requerido?: boolean;
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
  /** Solo relevante si la plantilla es IOARR: qué tipología(s) representa ESTE caso puntual
   * (a diferencia de Plantilla.tipologiasIoarr, que describe la cobertura del documento completo). */
  tipologiasIoarr?: TipologiaIoarr[];
  /** usuarioId del cliente titular dueño de esta ficha — solo presente en fichas creadas por un
   * cliente ("Mis fichas"). Los ejemplos que arma el admin como caso de referencia para la IA no
   * llevan este campo. Un colaborador crea/ve fichas bajo el `cuentaClienteId` de su titular. */
  propietarioId?: string;
  /** usuarioId específico (titular o colaborador) que creó esta ficha — a diferencia de
   * `propietarioId` (la cuenta), esto identifica a la persona dentro del equipo. Si falta (fichas
   * creadas antes de que existieran colaboradores), se asume que la creó el titular. */
  creadoPorUsuarioId?: string;
  /** true = visible para todo el equipo de la cuenta, no solo para quien la creó. Solo el titular
   * puede activarlo (ver puedeVerFicha en permisos.ts). */
  compartida?: boolean;
}

export type RolUsuario = 'superusuario' | 'administrador' | 'cliente';

export type TemaPreferencia = 'claro' | 'oscuro' | 'sistema';

export type EstadoUsuario = 'activo' | 'inactivo';

// Catálogo de permisos individuales — el rol es solo una etiqueta visual; el control de acceso
// real se basa (o se basará, ver permisosCatalogo.ts) en esta lista granular por usuario.
// De momento (ver "Usuarios y permisos") es únicamente visual: no reemplaza todavía los chequeos
// de rol/nivel de plan ya implementados en el resto de la app.
export type PermisoId =
  | 'sectores.ver'
  | 'sectores.gestionar'
  | 'plantillas.ver'
  | 'plantillas.gestionar'
  | 'plantillas.importar_json'
  | 'estructura.editar'
  | 'ejemplos.gestionar'
  | 'excel.asignar'
  | 'json.ver'
  | 'usuarios.gestionar_clientes'
  | 'usuarios.gestionar_administradores'
  | 'usuarios.gestionar_superusuarios'
  | 'fichas.crear'
  | 'fichas.compartir'
  | 'fichas.ver_historial'
  | 'colaboradores.gestionar'
  | 'mentorias.acceder'
  | 'mentorias.preguntas_respuestas'
  | 'ia.mejora_texto'
  | 'ia.asesor'
  | 'facturacion.gestionar';

export interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  password: string;
  rol: RolUsuario;
  apodo?: string;
  tema?: TemaPreferencia;
  estado?: EstadoUsuario;
  /** Solo presente en colaboradores creados como "usuario adicional" — apunta al `usuarioId` del cliente titular de la cuenta. */
  cuentaClienteId?: string;
  /** Permisos individuales asignados — si falta, se calculan por defecto según rol (y nivel de
   * plan si es cliente), ver permisosDefaultDe() en permisosCatalogo.ts. */
  permisos?: PermisoId[];
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

// Catálogo de planes por nivel (Nivel 0 Pedagógico, Nivel 1 Profesional, Nivel 2 Premium).
export interface Plan {
  id: string;
  numeroNivel: number;
  nombre: string;
  precio: number;
  periodicidad: string;
  features: string[];
  /** Cantidad base de fichas simultáneas permitidas (ejercicios en Nivel 0, proyectos reales en Nivel 1+),
   * antes de sumar el add-on "Plantilla adicional". */
  limiteFichasBase: number;
  /** Cantidad de usuarios (titular + colaboradores) incluidos en el plan, antes de sumar el add-on
   * "Usuario adicional". Nivel 0 y 1 solo incluyen al titular (1); Nivel 2 incluye hasta 3. */
  limiteUsuariosBase: number;
}

// Servicio extra que se contrata por separado del plan (se paga aparte, cantidad variable).
export interface AddOn {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  /** true si se cobra cada periodo de facturación (suma al total mensual del plan); false si es un cargo único (ej. una consultoría puntual). */
  recurrente: boolean;
  /** Números de nivel de plan que pueden contratar este add-on — si no está, aplica a cualquier nivel. */
  nivelesDisponibles?: number[];
}

// Métodos de pago ofrecidos — tarjeta vía Stripe, billeteras locales (Yape/Plin) y pasarelas
// peruanas (Mercado Pago/360Pay). Ver memoria de proyecto sobre por qué se eligió esta combinación.
export type MetodoPago = 'tarjeta' | 'yape' | 'plin' | 'mercado_pago' | '360pay';

// Datos de facturación de muestra — no hay pasarela de pago real ni backend;
// esto solo alimenta la UI de Ajustes > Facturación con datos ilustrativos.
export interface FacturacionMock {
  planId: string;
  plan: string;
  precio: string;
  periodicidad: string;
  cancelada: boolean;
  fechaRenovacion: string;
  /** ISO date — cuándo se activó el plan actual. Solo se usa para calcular vencimiento del Nivel 0 (4 semanas). */
  fechaInicioPlan?: string;
  metodoPago: MetodoPago;
  tarjetaMarca: string;
  tarjetaUltimos4: string;
  /** Número asociado a la billetera — solo si metodoPago es 'yape' o 'plin' */
  telefonoPago?: string;
  facturas: FacturaMock[];
  /** Add-ons contratados: id del add-on → cantidad */
  addons: Record<string, number>;
}

export interface ActividadReciente {
  id: string;
  mensaje: string;
  fecha: string;
  color: 'blue' | 'green' | 'orange' | 'gray' | 'red';
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

// Sesión de mentoría grupal en vivo (ventaja del plan Nivel 1+) — prototipo sin integración real
// de video ni calendario, ver src/data/mentorias.ts.
export interface SesionMentoria {
  id: string;
  tema: string;
  mentor: string;
  /** ISO datetime de inicio */
  fechaISO: string;
  cuposTotales: number;
  /** cuentaId (usuarioId del titular, ver cuentaEfectivaDe) de quienes se inscribieron */
  inscritos: string[];
  /** Enlace de la videollamada (Zoom, Google Meet, etc.) — de muestra, no lleva a una reunión real */
  linkReunion: string;
  /** Enlace a la grabación — solo presente en sesiones que ya ocurrieron */
  grabacionUrl?: string;
  /** Preguntas y respuestas de esta sesión (ventaja exclusiva del plan Nivel 2) */
  preguntas: PreguntaMentoria[];
}

export interface PreguntaMentoria {
  id: string;
  usuarioId: string;
  pregunta: string;
  /** ISO datetime */
  fechaPregunta: string;
  respuesta?: string;
  /** ISO datetime */
  fechaRespuesta?: string;
}

// Histórico de cambios en una ficha llenada (ventaja del plan Nivel 2) — ayuda a un equipo con
// colaboradores a ver quién editó qué. Se registra una entrada por cada vez que se presiona
// "Guardar" y hubo campos con valores distintos, no por cada tecla.
export interface CampoCambio {
  identificador: string;
  etiqueta: string;
  valorAnterior: string;
  valorNuevo: string;
}

export interface CambioFicha {
  id: string;
  ejemploId: string;
  /** usuarioId de quien guardó el cambio — puede ser el titular o un colaborador */
  usuarioId: string;
  /** ISO datetime */
  fecha: string;
  campos: CampoCambio[];
}
