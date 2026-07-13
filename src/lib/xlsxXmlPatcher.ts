import JSZip from 'jszip';

// Parcheador quirúrgico de OOXML (.xlsx/.xlsm): en vez de re-serializar el libro entero con
// SheetJS (XLSX.write), que en la edición gratuita descarta por completo los estilos de celda
// (rellenos, bordes, fuentes) al reconstruir el archivo, este módulo abre el .xlsx/.xlsm como un
// ZIP y edita únicamente los nodos <c> de valor dentro de cada sheetN.xml — el resto del archivo
// (styles.xml, tema, macros, formato de las celdas que no tocamos) queda byte a byte intacto.
const SML_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

export interface CeldaEdicion {
  columna: string;
  fila: number;
  valor: string | number | boolean;
  /** Fórmula nativa de Excel (sin el "=" inicial) — si está presente, `valor` es solo el caché
   * numérico mostrado antes de que Excel recalcule al abrir el archivo. */
  formula?: string;
}

export interface Crecimiento {
  /** Última fila base de la tabla, antes de crecer — las filas nuevas se insertan justo debajo */
  despuesDeFila: number;
  /** Cantidad de filas nuevas a insertar */
  cantidad: number;
}

interface HojaEdits {
  celdas: CeldaEdicion[];
  merges: Set<string>;
  crecimientos: Crecimiento[];
}

export class LibroEdits {
  private hojas = new Map<string, HojaEdits>();

  private getHoja(hoja: string): HojaEdits {
    let h = this.hojas.get(hoja);
    if (!h) { h = { celdas: [], merges: new Set(), crecimientos: [] }; this.hojas.set(hoja, h); }
    return h;
  }

  escribirCelda(hoja: string, columna: string, fila: number, valor: string | number | boolean) {
    this.getHoja(hoja).celdas.push({ columna, fila, valor });
  }

  // Escribe una fórmula nativa de Excel (sin el "=" inicial) — Excel la recalcula al abrir el
  // archivo; `valorCache` es el número que se muestra mientras tanto (y en visores que no evalúan
  // fórmulas, como nuestra propia vista previa).
  escribirFormula(hoja: string, columna: string, fila: number, formula: string, valorCache: number) {
    this.getHoja(hoja).celdas.push({ columna, fila, valor: valorCache, formula });
  }

  fusionar(hoja: string, rango: string) {
    this.getHoja(hoja).merges.add(rango);
  }

  // Registra que una tabla creció más allá de sus filas base — las filas físicas de Excel deben
  // insertarse (desplazando todo lo que está debajo) antes de escribir ningún valor.
  registrarCrecimiento(hoja: string, despuesDeFila: number, cantidad: number) {
    if (cantidad <= 0) return;
    this.getHoja(hoja).crecimientos.push({ despuesDeFila, cantidad });
  }

  // Cuánto se desplaza hacia abajo una fila que originalmente (según la plantilla oficial) estaba
  // en `filaOriginal`, por efecto de todas las tablas que crecieron ANTES de ella en la misma hoja.
  desplazamientoPara(hoja: string, filaOriginal: number): number {
    const h = this.hojas.get(hoja);
    if (!h) return 0;
    let total = 0;
    for (const c of h.crecimientos) if (c.despuesDeFila < filaOriginal) total += c.cantidad;
    return total;
  }

  entries(): [string, HojaEdits][] {
    return Array.from(this.hojas.entries());
  }
}

function colLetterToIndex(letter: string): number {
  let n = 0;
  for (const ch of letter.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function parseDireccion(direccion: string): { columna: string; fila: number } {
  const m = direccion.match(/^([A-Za-z]+)(\d+)$/);
  if (!m) throw new Error(`Dirección de celda inválida: ${direccion}`);
  return { columna: m[1].toUpperCase(), fila: Number(m[2]) };
}

async function leerMapaHojas(zip: JSZip): Promise<Map<string, string>> {
  const wbFile = zip.file('xl/workbook.xml');
  const relsFile = zip.file('xl/_rels/workbook.xml.rels');
  if (!wbFile || !relsFile) throw new Error('El archivo no tiene una estructura de libro Excel válida');
  const parser = new DOMParser();
  const wbDoc = parser.parseFromString(await wbFile.async('string'), 'application/xml');
  const relsDoc = parser.parseFromString(await relsFile.async('string'), 'application/xml');

  const ridToTarget = new Map<string, string>();
  for (const rel of Array.from(relsDoc.getElementsByTagName('Relationship'))) {
    const id = rel.getAttribute('Id');
    const target = rel.getAttribute('Target');
    if (id && target) ridToTarget.set(id, target);
  }

  const nombreToPath = new Map<string, string>();
  for (const sheetEl of Array.from(wbDoc.getElementsByTagName('sheet'))) {
    const nombre = sheetEl.getAttribute('name');
    const rid = sheetEl.getAttributeNS(R_NS, 'id') || sheetEl.getAttribute('r:id');
    if (!nombre || !rid) continue;
    const target = ridToTarget.get(rid);
    if (!target) continue;
    const path = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
    nombreToPath.set(nombre, path);
  }
  return nombreToPath;
}

function limpiarHijos(el: Element) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function aplicarValorCelda(doc: Document, celda: Element, valor: string | number | boolean, formula?: string) {
  limpiarHijos(celda);
  if (formula) {
    // Fórmula nativa: Excel la recalcula al abrir el archivo. El <v> es solo el caché que se
    // muestra mientras tanto (y lo que usa nuestra propia vista previa, que no evalúa fórmulas).
    celda.removeAttribute('t');
    const f = doc.createElementNS(SML_NS, 'f');
    f.textContent = formula;
    celda.appendChild(f);
    const v = doc.createElementNS(SML_NS, 'v');
    v.textContent = String(valor);
    celda.appendChild(v);
    return;
  }
  if (typeof valor === 'number' && Number.isFinite(valor)) {
    celda.removeAttribute('t');
    const v = doc.createElementNS(SML_NS, 'v');
    v.textContent = String(valor);
    celda.appendChild(v);
  } else if (typeof valor === 'boolean') {
    celda.setAttribute('t', 'b');
    const v = doc.createElementNS(SML_NS, 'v');
    v.textContent = valor ? '1' : '0';
    celda.appendChild(v);
  } else {
    celda.setAttribute('t', 'inlineStr');
    const is = doc.createElementNS(SML_NS, 'is');
    const t = doc.createElementNS(SML_NS, 't');
    t.setAttribute('xml:space', 'preserve');
    t.textContent = valor == null ? '' : String(valor);
    is.appendChild(t);
    celda.appendChild(is);
  }
}

function ensureRow(doc: Document, sheetData: Element, fila: number): Element {
  const filas = Array.from(sheetData.children).filter((el) => el.localName === 'row');
  for (const r of filas) {
    if (Number(r.getAttribute('r')) === fila) return r;
  }
  const nueva = doc.createElementNS(SML_NS, 'row');
  nueva.setAttribute('r', String(fila));
  let before: Element | null = null;
  for (const r of filas) {
    if (Number(r.getAttribute('r')) > fila) { before = r; break; }
  }
  sheetData.insertBefore(nueva, before);
  return nueva;
}

function ensureCell(doc: Document, fila: Element, columna: string, numFila: number): Element {
  const direccion = `${columna}${numFila}`;
  const colIdx = colLetterToIndex(columna);
  const celdas = Array.from(fila.children).filter((el) => el.localName === 'c');
  for (const c of celdas) {
    if (c.getAttribute('r') === direccion) return c;
  }
  const nueva = doc.createElementNS(SML_NS, 'c');
  nueva.setAttribute('r', direccion);
  let before: Element | null = null;
  for (const c of celdas) {
    const ref = c.getAttribute('r') ?? '';
    const m = ref.match(/^([A-Za-z]+)\d+$/);
    if (m && colLetterToIndex(m[1]) > colIdx) { before = c; break; }
  }
  fila.insertBefore(nueva, before);
  return nueva;
}

// Desplaza hacia abajo (r += delta) todas las filas — y las celdas dentro de ellas — que estén
// estrictamente debajo de `desdeFila`. Se procesa de mayor a menor número de fila para no generar
// colisiones de atributos `r` duplicados mientras se reetiquetan.
function desplazarFilasDesde(sheetData: Element, desdeFila: number, delta: number) {
  const aDesplazar = Array.from(sheetData.children)
    .filter((el) => el.localName === 'row' && Number(el.getAttribute('r')) > desdeFila)
    .sort((a, b) => Number(b.getAttribute('r')) - Number(a.getAttribute('r')));
  for (const fila of aDesplazar) {
    const nuevaFila = Number(fila.getAttribute('r')) + delta;
    fila.setAttribute('r', String(nuevaFila));
    for (const celda of Array.from(fila.children).filter((el) => el.localName === 'c')) {
      const ref = celda.getAttribute('r');
      if (!ref) continue;
      const { columna } = parseDireccion(ref);
      celda.setAttribute('r', `${columna}${nuevaFila}`);
    }
  }
}

// Ajusta los rangos de <mergeCell> que caen (total o parcialmente) debajo del punto de inserción.
function desplazarMergesDesde(worksheet: Element, desdeFila: number, delta: number) {
  const mergeCellsEl = Array.from(worksheet.children).find((el) => el.localName === 'mergeCells');
  if (!mergeCellsEl) return;
  for (const mc of Array.from(mergeCellsEl.children)) {
    const ref = mc.getAttribute('ref');
    if (!ref) continue;
    const [inicioRef, finRef] = ref.split(':');
    const inicio = parseDireccion(inicioRef);
    const fin = finRef ? parseDireccion(finRef) : inicio;
    let cambio = false;
    let nuevoInicio = inicio.fila;
    let nuevoFin = fin.fila;
    if (inicio.fila > desdeFila) { nuevoInicio += delta; cambio = true; }
    if (fin.fila > desdeFila) { nuevoFin += delta; cambio = true; }
    if (cambio) {
      mc.setAttribute('ref', finRef ? `${inicio.columna}${nuevoInicio}:${fin.columna}${nuevoFin}` : `${inicio.columna}${nuevoInicio}`);
    }
  }
}

// Clona una fila existente como plantilla en blanco para una fila nueva: conserva el atributo de
// estilo (`s`) de cada celda (así la fila nueva se ve igual que la original) pero limpia su valor.
function clonarFilaComoPlantilla(filaOrigen: Element, nuevoNumero: number): Element {
  const clon = filaOrigen.cloneNode(true) as Element;
  clon.setAttribute('r', String(nuevoNumero));
  for (const celda of Array.from(clon.children).filter((el) => el.localName === 'c')) {
    const ref = celda.getAttribute('r');
    if (ref) {
      const { columna } = parseDireccion(ref);
      celda.setAttribute('r', `${columna}${nuevoNumero}`);
    }
    limpiarHijos(celda);
    celda.removeAttribute('t');
  }
  return clon;
}

// Inserta físicamente `cantidad` filas nuevas justo debajo de `despuesDeFila`, desplazando todo lo
// que está debajo (filas, celdas y fusiones) y copiando el formato de esa última fila base en las
// filas nuevas — así el estilo (bordes, colores) de la tabla se mantiene consistente al crecer.
function insertarFilasEnHoja(worksheet: Element, sheetData: Element, crecimiento: Crecimiento) {
  const { despuesDeFila, cantidad } = crecimiento;
  const filaBase = Array.from(sheetData.children).find(
    (el) => el.localName === 'row' && Number(el.getAttribute('r')) === despuesDeFila,
  );
  if (!filaBase) return; // sin fila base no hay estilo que copiar — se omite la inserción física

  desplazarFilasDesde(sheetData, despuesDeFila, cantidad);
  desplazarMergesDesde(worksheet, despuesDeFila, cantidad);

  const filaSiguiente = Array.from(sheetData.children).find(
    (el) => el.localName === 'row' && Number(el.getAttribute('r')) === despuesDeFila + cantidad + 1,
  ) ?? null;
  for (let i = 1; i <= cantidad; i++) {
    const nueva = clonarFilaComoPlantilla(filaBase, despuesDeFila + i);
    sheetData.insertBefore(nueva, filaSiguiente);
  }
}

// mergeCells siempre debe ir después de sheetData en el orden del esquema — insertarlo
// como hermano inmediato de sheetData garantiza que quede antes de cualquier otro elemento
// opcional posterior (hyperlinks, pageMargins, etc.), sin importar cuáles existan.
function ensureMergeCells(doc: Document, worksheet: Element, sheetData: Element): Element {
  const existentes = Array.from(worksheet.children).filter((el) => el.localName === 'mergeCells');
  if (existentes.length > 0) return existentes[0];
  const nuevo = doc.createElementNS(SML_NS, 'mergeCells');
  nuevo.setAttribute('count', '0');
  worksheet.insertBefore(nuevo, sheetData.nextSibling);
  return nuevo;
}

interface RangoCeldas { c1: number; r1: number; c2: number; r2: number }

function parseRango(rango: string): RangoCeldas {
  const [ini, fin] = rango.split(':');
  const i = parseDireccion(ini);
  const f = fin ? parseDireccion(fin) : i;
  return { c1: colLetterToIndex(i.columna), r1: i.fila, c2: colLetterToIndex(f.columna), r2: f.fila };
}

function seSuperponen(a: RangoCeldas, b: RangoCeldas): boolean {
  return a.c1 <= b.c2 && b.c1 <= a.c2 && a.r1 <= b.r2 && b.r1 <= a.r2;
}

// Agrega una fusión nueva — si ya existe idéntica, no hace nada; si se SOLAPA con una fusión
// existente pero de otro tamaño (p. ej. la plantilla oficial asumía 3 hijos por grupo jerárquico y
// este grupo real solo tiene 2), la fusión vieja se elimina primero: dos <mergeCell> superpuestos
// son XML inválido y Excel repara/descarta el archivo al abrirlo.
function agregarMerge(doc: Document, worksheet: Element, sheetData: Element, rango: string) {
  const mergeCells = ensureMergeCells(doc, worksheet, sheetData);
  const nuevoRango = parseRango(rango);
  for (const existente of Array.from(mergeCells.children)) {
    const ref = existente.getAttribute('ref');
    if (!ref) continue;
    if (ref === rango) return; // idéntica — nada que hacer
    if (seSuperponen(nuevoRango, parseRango(ref))) mergeCells.removeChild(existente);
  }
  const nuevo = doc.createElementNS(SML_NS, 'mergeCell');
  nuevo.setAttribute('ref', rango);
  mergeCells.appendChild(nuevo);
  mergeCells.setAttribute('count', String(mergeCells.children.length));
}

async function extraerMimeYBuffer(dataUrl: string): Promise<{ mime: string; buffer: ArrayBuffer }> {
  const res = await fetch(dataUrl);
  const mime = res.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const buffer = await res.arrayBuffer();
  return { mime, buffer };
}

// Aplica todas las ediciones acumuladas (celdas + fusiones nuevas) directamente sobre el XML de
// cada hoja del ZIP, preservando estilos.xml, tema, macros y cualquier otra celda intacta.
export async function aplicarEdicionesXlsx(dataUrl: string, ediciones: LibroEdits): Promise<string> {
  const { mime, buffer } = await extraerMimeYBuffer(dataUrl);
  const zip = await JSZip.loadAsync(buffer);
  const mapaHojas = await leerMapaHojas(zip);
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  for (const [nombreHoja, edits] of ediciones.entries()) {
    const path = mapaHojas.get(nombreHoja);
    if (!path) continue; // hoja no encontrada en el libro asignado — se omite silenciosamente
    const file = zip.file(path);
    if (!file) continue;
    const xmlStr = await file.async('string');
    const doc = parser.parseFromString(xmlStr, 'application/xml');
    const worksheet = doc.documentElement;
    const sheetData = worksheet.getElementsByTagName('sheetData')[0];
    if (!sheetData) continue;

    // Insertar filas de mayor a menor `despuesDeFila`: así cada inserción solo desplaza contenido
    // que está debajo de ella, sin invalidar los puntos de inserción de las tablas de más arriba.
    const crecimientosOrdenados = [...edits.crecimientos].sort((a, b) => b.despuesDeFila - a.despuesDeFila);
    for (const crecimiento of crecimientosOrdenados) {
      insertarFilasEnHoja(worksheet, sheetData, crecimiento);
    }

    for (const { columna, fila, valor, formula } of edits.celdas) {
      const filaEl = ensureRow(doc, sheetData, fila);
      const celda = ensureCell(doc, filaEl, columna, fila);
      aplicarValorCelda(doc, celda, valor, formula);
    }
    for (const rango of edits.merges) {
      agregarMerge(doc, worksheet, sheetData, rango);
    }

    zip.file(path, serializer.serializeToString(doc));
  }

  const outBuffer = await zip.generateAsync({ type: 'base64', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  return `data:${mime};base64,${outBuffer}`;
}

export { parseDireccion };
