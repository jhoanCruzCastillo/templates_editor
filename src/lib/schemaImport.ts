import { generateId } from './store';
import type { FilaDinamica, GrupoFilas, TreeNode } from './tableRowHelpers';
import type { CabeceraGrupo, Campo, CapturaCampo, ColumnaTabla, ConfigTabla, Seccion, Subseccion, SubtipoTabla, TipoCampo, TipoColumna } from '../types';

const ID_COLUMNA_DINAMICA = 'columnas_dinamicas';

// --- Mapeo de tipos documentados en el esquema oficial -> tipos internos ---

const tipoCampoReverseMap: Record<string, TipoCampo> = {
  texto_corto: 'texto_corto',
  texto_largo: 'texto_largo',
  numero: 'numero',
  decimal: 'decimal',
  fecha: 'fecha',
  booleano: 'booleano',
  coordenadas: 'mapa_coordenadas',
  calculado: 'calculado',
  tabla: 'tabla',
};

function mapTipoCampoReverse(tipo: unknown): TipoCampo {
  return tipoCampoReverseMap[String(tipo)] ?? 'texto_corto';
}

const tipoColumnaReverseMap: Record<string, TipoColumna> = {
  texto_corto: 'texto_corto',
  texto_largo: 'texto_largo',
  numero: 'numero',
  decimal: 'decimal',
  fecha: 'fecha',
  booleano: 'booleano',
  coordenadas: 'coordenadas',
  calculado: 'calculado',
};

function mapTipoColumnaReverse(tipo: unknown): TipoColumna {
  return tipoColumnaReverseMap[String(tipo)] ?? 'texto_corto';
}

function valorToString(tipo: TipoCampo, valor: unknown): string {
  if (valor == null || valor === '') return '';
  if (tipo === 'mapa_coordenadas') return typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  if (tipo === 'booleano') return String(Boolean(valor));
  return String(valor);
}

function parseCapturaCampo(raw: unknown): CapturaCampo | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
  if (!r.columna && !r.fila) return undefined;
  return {
    columna: typeof r.columna === 'string' ? r.columna : '',
    fila: typeof r.fila === 'number' ? r.fila : 0,
    abarcaColumnas: typeof r.abarca_columnas === 'number' ? r.abarca_columnas : undefined,
    abarcaFilas: typeof r.abarca_filas === 'number' ? r.abarca_filas : undefined,
  };
}

// --- Columnas de tabla ---

function buildColumnas(rawCols: unknown, rawCapturaCols: unknown, esJerarquica: boolean): { columnas: ColumnaTabla[]; columnaDinamicaId?: string } {
  const cols = Array.isArray(rawCols) ? rawCols : [];
  const capturaCols = Array.isArray(rawCapturaCols) ? rawCapturaCols : [];
  let columnaDinamicaId: string | undefined;

  const columnas: ColumnaTabla[] = cols.map((rc) => {
    const raw = rc as Record<string, unknown>;
    const rawId = String(raw.id ?? '');
    const esDinamica = rawId === ID_COLUMNA_DINAMICA;
    const internalId = esDinamica ? generateId() : rawId || generateId();
    if (esDinamica) columnaDinamicaId = internalId;
    const capturaCol = capturaCols.find((c) => (c as Record<string, unknown>).id === rawId) as Record<string, unknown> | undefined;
    const col: ColumnaTabla = {
      id: internalId,
      nombre: String(raw.nombre ?? ''),
      tipo: mapTipoColumnaReverse(raw.tipo),
      columnaExcel: typeof capturaCol?.columna === 'string' && capturaCol.columna ? capturaCol.columna : undefined,
      abarcaColumnasExcel: typeof capturaCol?.abarca_columnas === 'number' ? capturaCol.abarca_columnas : undefined,
    };
    if (esJerarquica) col.nivel = raw.combina_vertical ? 'padre' : 'hijo';
    return col;
  });

  return { columnas, columnaDinamicaId };
}

function cabecerasFromDoc(rawCabecera: unknown, columnaDinamicaId?: string): CabeceraGrupo[] | undefined {
  if (!Array.isArray(rawCabecera) || rawCabecera.length === 0) return undefined;
  const grupos = rawCabecera
    .map((g) => {
      const raw = g as Record<string, unknown>;
      const hijosRaw = Array.isArray(raw.hijos) ? raw.hijos : [];
      const hijoIds = hijosRaw
        .map((h) => (h === ID_COLUMNA_DINAMICA ? columnaDinamicaId : String(h)))
        .filter((h): h is string => Boolean(h));
      return { titulo: typeof raw.titulo === 'string' ? raw.titulo : '', hijoIds };
    })
    .filter((g) => g.hijoIds.length > 0);
  return grupos.length > 0 ? grupos : undefined;
}

function periodosDesdeColumnasBase(rawCapturaCols: unknown): string[] | undefined {
  const capturaCols = Array.isArray(rawCapturaCols) ? rawCapturaCols : [];
  const dinCol = capturaCols.find((c) => (c as Record<string, unknown>).id === ID_COLUMNA_DINAMICA) as Record<string, unknown> | undefined;
  const base = dinCol?.columnas_base;
  if (!Array.isArray(base) || base.length === 0) return undefined;
  return base.map((p) => String(p));
}

// --- Valor de tabla ---

function rowFromDoc(rawRow: Record<string, unknown>, columnaDinamicaId?: string): FilaDinamica {
  const fila: FilaDinamica = {};
  for (const [key, val] of Object.entries(rawRow)) {
    if (key === ID_COLUMNA_DINAMICA && columnaDinamicaId) {
      fila[columnaDinamicaId] = Array.isArray(val) ? val.map((v) => String(v)) : [];
    } else {
      fila[key] = val == null ? '' : String(val);
    }
  }
  return fila;
}

function gruposFromDoc(rawGrupos: unknown[], columnaDinamicaId?: string): GrupoFilas[] {
  return rawGrupos.map((g) => {
    const raw = g as Record<string, unknown>;
    const agrupador = raw.agrupador as Record<string, unknown> | undefined;
    const valores = Array.isArray(raw.valores) ? raw.valores : [];
    return {
      grupo: typeof agrupador?.nombre === 'string' ? agrupador.nombre : '',
      filas: valores.map((r) => rowFromDoc(r as Record<string, unknown>, columnaDinamicaId)),
    };
  });
}

function nodeFromDoc(rawNode: unknown, depth: number, niveles: ColumnaTabla[]): TreeNode {
  const raw = rawNode as Record<string, unknown>;
  const key = niveles[depth]?.id;
  const value = key ? raw[key] : undefined;
  const hijos = Array.isArray(raw.hijos) ? raw.hijos.map((h) => nodeFromDoc(h, depth + 1, niveles)) : [];
  return { value: value == null ? '' : String(value), children: hijos };
}

function valorEjemploTabla(config: ConfigTabla, rawValor: unknown): string {
  const items = Array.isArray(rawValor) ? rawValor : [];
  if (config.subtipo === 'jerarquica') {
    return JSON.stringify(items.map((r) => nodeFromDoc(r, 0, config.columnas)));
  }
  if (config.agrupador) {
    return JSON.stringify(gruposFromDoc(items, config.columnaDinamicaId));
  }
  return JSON.stringify(items.map((r) => rowFromDoc(r as Record<string, unknown>, config.columnaDinamicaId)));
}

// --- Campo ---

function campoFromDoc(rawCampo: unknown): Campo {
  const raw = rawCampo as Record<string, unknown>;
  const tipo = mapTipoCampoReverse(raw.tipo);
  const esTabla = tipo === 'tabla';

  const campo: Campo = {
    id: generateId(),
    identificador: String(raw.id ?? ''),
    etiqueta: String(raw.nombre ?? ''),
    tipo,
    editable: Boolean(raw.editable),
  };

  if (esTabla) {
    const rawConfig = (raw.config as Record<string, unknown>) ?? {};
    const subtipo: SubtipoTabla =
      rawConfig.filas === 'jerarquicas' ? 'jerarquica' : rawConfig.columnas === 'dinamicas' ? 'matriz_por_periodos' : 'filas_dinamicas';
    const esJerarquica = subtipo === 'jerarquica';
    const rawCaptura = (raw.captura as Record<string, unknown>) ?? {};
    const rawCols = raw[esJerarquica ? 'niveles' : 'columnas'];
    const { columnas, columnaDinamicaId } = buildColumnas(rawCols, rawCaptura.columnas, esJerarquica);
    const periodos = periodosDesdeColumnasBase(rawCaptura.columnas);

    const config: ConfigTabla = {
      subtipo,
      columnas,
      agrupador: Boolean(rawConfig.agrupador),
      columnaDinamicaId,
      periodos,
      cabeceras: cabecerasFromDoc(raw.cabecera, columnaDinamicaId),
      filasIniciales: 3,
      captura: {
        columnaInicial: typeof rawCaptura.columna_inicial === 'string' && rawCaptura.columna_inicial ? rawCaptura.columna_inicial : undefined,
        filaInicial: typeof rawCaptura.fila_inicial === 'number' ? rawCaptura.fila_inicial : undefined,
        filasBase: typeof rawCaptura.filas_base === 'number' ? rawCaptura.filas_base : undefined,
      },
    };

    campo.configTabla = config;
    campo.valorEjemplo = valorEjemploTabla(config, raw.valor);
    return campo;
  }

  campo.captura = parseCapturaCampo(raw.captura);
  campo.valorEjemplo = valorToString(tipo, raw.valor);
  return campo;
}

// --- Sección / grupo ---

function seccionFromDoc(rawSeccion: unknown, index: number): Seccion {
  const raw = rawSeccion as Record<string, unknown>;
  const items = Array.isArray(raw.campos) ? raw.campos : [];
  const subsecciones: Subseccion[] = [];
  const camposSueltos: Campo[] = [];

  for (const item of items) {
    const it = item as Record<string, unknown>;
    if (it.tipo_nodo === 'grupo') {
      const campos = Array.isArray(it.campos) ? it.campos.map(campoFromDoc) : [];
      subsecciones.push({ id: generateId(), codigo: String(it.id ?? ''), nombre: String(it.nombre ?? ''), campos });
    } else if (it.tipo_nodo === 'campo') {
      camposSueltos.push(campoFromDoc(it));
    }
  }

  if (camposSueltos.length > 0) {
    subsecciones.push({ id: generateId(), codigo: `${raw.id ?? index + 1}.00`, nombre: 'GENERAL', campos: camposSueltos });
  }
  if (subsecciones.length === 0) {
    subsecciones.push({ id: generateId(), codigo: `${raw.id ?? index + 1}.01`, nombre: 'GENERAL', campos: [] });
  }

  return {
    id: generateId(),
    numero: String(raw.id ?? String(index + 1).padStart(2, '0')),
    nombre: String(raw.nombre ?? ''),
    hoja: typeof raw.hoja === 'string' && raw.hoja ? raw.hoja : undefined,
    cantidadCampos: subsecciones.reduce((sum, s) => sum + s.campos.length, 0),
    subsecciones,
  };
}

// --- Documento completo ---

export interface DocumentoParseResult {
  codigo: string;
  nombre: string;
  secciones: Seccion[];
}

export function parseDocumento(raw: unknown): DocumentoParseResult {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('El archivo no contiene un JSON válido.');
  }
  const doc = raw as Record<string, unknown>;
  const formato = doc.formato as Record<string, unknown> | undefined;
  if (!formato || typeof formato.codigo !== 'string' || typeof formato.nombre !== 'string') {
    throw new Error('El JSON no tiene la forma esperada — falta "formato.codigo" o "formato.nombre".');
  }
  if (formato.tipo_version !== 'estructura') {
    throw new Error('Por ahora solo se pueden importar documentos con tipo_version "estructura".');
  }
  if (!Array.isArray(doc.secciones)) {
    throw new Error('El JSON no tiene la forma esperada — falta el array "secciones".');
  }

  return {
    codigo: formato.codigo,
    nombre: formato.nombre,
    secciones: doc.secciones.map((s, i) => seccionFromDoc(s, i)),
  };
}
