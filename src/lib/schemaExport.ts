import { parseDynamicRows, parseGroupedRows, parseTree, getPeriodos, type FilaDinamica, type TreeNode } from './tableRowHelpers';
import type { Campo, ColumnaTabla, ConfigTabla, Ejemplo, Plantilla, Seccion, TipoCampo, TipoColumna } from '../types';

export type TipoVersionDocumento = 'estructura' | 'ejemplo';

// Id reservado que usa el esquema oficial para la columna que se repite por período
const ID_COLUMNA_DINAMICA = 'columnas_dinamicas';

// --- Mapeo de tipos internos -> tipos documentados en el esquema oficial ---

const tipoCampoMap: Partial<Record<TipoCampo, string>> = {
  texto_corto: 'texto_corto',
  texto_largo: 'texto_largo',
  numero: 'numero',
  decimal: 'decimal',
  fecha: 'fecha',
  booleano: 'booleano',
  mapa_coordenadas: 'coordenadas',
  calculado: 'calculado',
};

function mapTipoCampo(tipo: TipoCampo): string {
  return tipoCampoMap[tipo] ?? 'texto_corto';
}

const tipoColumnaMap: Partial<Record<TipoColumna, string>> = {
  texto_corto: 'texto_corto',
  texto_largo: 'texto_largo',
  numero: 'numero',
  decimal: 'decimal',
  fecha: 'fecha',
  booleano: 'booleano',
  coordenadas: 'coordenadas',
  calculado: 'calculado',
  auto_numerico: 'numero',
  // catalogo/catalogo_encadenado: sin equivalente documentado todavía — caen a texto_corto
};

function mapTipoColumna(tipo: TipoColumna): string {
  return tipoColumnaMap[tipo] ?? 'texto_corto';
}

function coerceValor(tipo: TipoCampo, raw: string | undefined): unknown {
  if (raw == null || raw === '') return tipo === 'booleano' ? false : tipo === 'numero' || tipo === 'decimal' ? null : '';
  switch (tipo) {
    case 'numero':
    case 'decimal': {
      const n = Number(raw);
      return Number.isNaN(n) ? null : n;
    }
    case 'booleano':
      return raw === 'true';
    case 'mapa_coordenadas':
      try { return JSON.parse(raw); } catch { return null; }
    default:
      return raw;
  }
}

// --- Captura ---

function capturaCampo(seccion: Seccion, campo: Campo) {
  return {
    hoja: seccion.hoja ?? '',
    columna: campo.captura?.columna ?? '',
    fila: campo.captura?.fila ?? 0,
    abarca_columnas: campo.captura?.abarcaColumnas ?? 1,
    abarca_filas: campo.captura?.abarcaFilas ?? 1,
  };
}

function idColumna(col: ColumnaTabla, config: ConfigTabla): string {
  return col.id === config.columnaDinamicaId ? ID_COLUMNA_DINAMICA : col.id;
}

function capturaTabla(seccion: Seccion, config: ConfigTabla) {
  const periodos = getPeriodos(config);
  return {
    hoja: seccion.hoja ?? '',
    columna_inicial: config.captura?.columnaInicial ?? '',
    fila_inicial: config.captura?.filaInicial ?? 0,
    filas_base: config.captura?.filasBase ?? 0,
    columnas: config.columnas.map((col) => ({
      id: idColumna(col, config),
      columna: col.columnaExcel ?? '',
      abarca_columnas: col.abarcaColumnasExcel ?? 1,
      ...(col.id === config.columnaDinamicaId ? { columnas_base: periodos } : {}),
    })),
  };
}

// --- Columnas / niveles lógicos ---

function columnasLogicas(config: ConfigTabla) {
  return config.columnas.map((col) => ({
    id: idColumna(col, config),
    nombre: col.nombre,
    tipo: mapTipoColumna(col.tipo),
    ...(config.subtipo === 'jerarquica' && col.nivel === 'padre' ? { combina_vertical: true } : {}),
  }));
}

// --- Valor de tabla ---

function coerceCelda(config: ConfigTabla, colId: string, raw: string | string[] | undefined): unknown {
  if (colId === config.columnaDinamicaId) {
    return Array.isArray(raw) ? raw : [];
  }
  return typeof raw === 'string' ? raw : '';
}

function mapFila(config: ConfigTabla, fila: FilaDinamica): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const col of config.columnas) {
    out[idColumna(col, config)] = coerceCelda(config, col.id, fila[col.id]);
  }
  return out;
}

function mapTreeNode(node: TreeNode, depth: number, niveles: ColumnaTabla[]): Record<string, unknown> {
  const key = niveles[depth]?.id ?? `nivel_${depth}`;
  const out: Record<string, unknown> = { [key]: node.value };
  if (node.children.length > 0) {
    out.hijos = node.children.map((child) => mapTreeNode(child, depth + 1, niveles));
  }
  return out;
}

function valorTabla(config: ConfigTabla, raw: string | undefined): unknown {
  const value = raw ?? '';
  if (config.subtipo === 'jerarquica') {
    const roots = parseTree(value, config.columnas.length);
    return roots.map((r) => mapTreeNode(r, 0, config.columnas));
  }
  if (config.agrupador) {
    const grupos = parseGroupedRows(value, config);
    return grupos.map((g) => ({
      agrupador: {
        inicia: config.columnas[0] ? idColumna(config.columnas[0], config) : '',
        abarca_columnas: config.columnas[0]?.abarcaColumnasExcel ?? 1,
        nombre: g.grupo,
        valores: {},
      },
      valores: g.filas.map((f) => mapFila(config, f)),
    }));
  }
  const filas = parseDynamicRows(value, config);
  return filas.map((f) => mapFila(config, f));
}

// --- Campo ---

function buildCampo(seccion: Seccion, campo: Campo, valorRaw: string | undefined): Record<string, unknown> {
  const esTabla = campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica';

  if (esTabla) {
    const config = campo.configTabla ?? { subtipo: 'filas_dinamicas', columnas: [] };
    return {
      id: campo.identificador,
      nombre: campo.etiqueta,
      tipo_nodo: 'campo',
      tipo: 'tabla',
      editable: campo.editable,
      config: {
        filas: config.subtipo === 'jerarquica' ? 'jerarquicas' : 'planas',
        columnas: config.columnaDinamicaId ? 'dinamicas' : 'fijas',
        agrupador: Boolean(config.agrupador),
      },
      captura: capturaTabla(seccion, config),
      cabecera: (config.cabeceras ?? []).map((g) => ({ titulo: g.titulo, hijos: g.hijoIds })),
      [config.subtipo === 'jerarquica' ? 'niveles' : 'columnas']: columnasLogicas(config),
      valor: valorTabla(config, valorRaw),
    };
  }

  return {
    id: campo.identificador,
    nombre: campo.etiqueta,
    tipo_nodo: 'campo',
    tipo: mapTipoCampo(campo.tipo),
    editable: campo.editable,
    captura: capturaCampo(seccion, campo),
    valor: coerceValor(campo.tipo, valorRaw),
  };
}

// --- Sección / grupo ---

function buildSeccion(seccion: Seccion, ejemplo?: Ejemplo): Record<string, unknown> {
  return {
    id: seccion.numero,
    nombre: seccion.nombre,
    tipo_nodo: 'seccion',
    hoja: seccion.hoja ?? '',
    campos: seccion.subsecciones.map((sub) => ({
      id: sub.codigo,
      nombre: sub.nombre,
      tipo_nodo: 'grupo',
      campos: sub.campos.map((campo) => {
        const valorRaw = ejemplo ? ejemplo.valores[campo.identificador] : campo.valorEjemplo;
        return buildCampo(seccion, campo, valorRaw);
      }),
    })),
  };
}

// --- Documento completo ---

export interface DocumentoJSON {
  schema_version: string;
  formato: {
    codigo: string;
    nombre: string;
    fuente_archivo: string;
    tipo_version: TipoVersionDocumento;
    nota_secciones: string;
  };
  secciones: Record<string, unknown>[];
}

export function buildDocumento(plantilla: Plantilla, tipoVersion: TipoVersionDocumento, ejemplo?: Ejemplo): DocumentoJSON {
  return {
    schema_version: '1.0',
    formato: {
      codigo: plantilla.codigo,
      nombre: plantilla.nombre,
      fuente_archivo: '',
      tipo_version: tipoVersion,
      nota_secciones: '',
    },
    secciones: plantilla.secciones.map((seccion) => buildSeccion(seccion, tipoVersion === 'ejemplo' ? ejemplo : undefined)),
  };
}
