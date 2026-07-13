import type { Campo } from '../types';

// Fórmulas tipo Excel para campos calculados (no-tabla): "=1.01.1+1.02.3*2". Los operandos son
// identificadores de OTROS campos (deben ser tipo numero/decimal) o números literales.

export function esFormula(valor: string | undefined | null): boolean {
  return !!valor && valor.trim().startsWith('=');
}

export function tokenizarFormula(formula: string): string[] {
  const expr = formula.trim().replace(/^=/, '').trim();
  return expr.split(/([+\-*/()])/).map((t) => t.trim()).filter((t) => t !== '');
}

export type ResolucionToken =
  | { tipo: 'valor'; valor: number }
  | { tipo: 'no-existe' }
  | { tipo: 'invalido'; mensaje: string };

export interface ResultadoFormula {
  valor: number | null;
  error: string | null;
}

// Evalúa la fórmula token por token — el resolver decide si un token es una referencia válida a
// otro campo (numero/decimal), inválida (campo de otro tipo, o inexistente) o debe interpretarse
// como número literal. Solo soporta +, -, *, /, paréntesis y negación unaria — suficiente para
// combinar valores de campos, sin necesitar un motor de expresiones completo.
export function evaluarFormula(formula: string, resolver: (token: string) => ResolucionToken): ResultadoFormula {
  const tokens = tokenizarFormula(formula);
  if (tokens.length === 0) return { valor: null, error: null };
  let pos = 0;
  let error: string | null = null;

  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function resolverToken(tok: string): number {
    const r = resolver(tok);
    if (r.tipo === 'valor') return r.valor;
    if (r.tipo === 'invalido') { error = r.mensaje; return 0; }
    // no-existe como campo — ¿es un número literal?
    if (/^\d+(\.\d+)?$/.test(tok)) return Number(tok);
    error = `"${tok}" no es un campo válido ni un número`;
    return 0;
  }

  function parseFactor(): number {
    if (error) return 0;
    const t = peek();
    if (t === '(') {
      consume();
      const v = parseExpr();
      if (peek() === ')') consume();
      else if (!error) error = 'Falta un paréntesis de cierre';
      return v;
    }
    if (t === '-') { consume(); return -parseFactor(); }
    if (t === '+') { consume(); return parseFactor(); }
    const tok = consume();
    if (tok === undefined) { error = 'Fórmula incompleta'; return 0; }
    return resolverToken(tok);
  }

  function parseTerm(): number {
    let v = parseFactor();
    while (!error && (peek() === '*' || peek() === '/')) {
      const op = consume();
      const rhs = parseFactor();
      v = op === '*' ? v * rhs : v / rhs;
    }
    return v;
  }

  function parseExpr(): number {
    let v = parseTerm();
    while (!error && (peek() === '+' || peek() === '-')) {
      const op = consume();
      const rhs = parseTerm();
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  }

  const valor = parseExpr();
  if (!error && pos < tokens.length) error = `Símbolo inesperado: "${tokens[pos]}"`;
  if (error) return { valor: null, error };
  return { valor, error: null };
}

export type ResolucionCelda = { tipo: 'celda'; referencia: string } | { tipo: 'no-disponible' };

// Traduce la fórmula a sintaxis nativa de Excel, sustituyendo cada identificador de campo por su
// referencia real de celda (con el nombre de hoja delante si el campo referenciado vive en otra
// hoja) — así el Excel resultante tiene una fórmula viva que Excel recalcula al abrir el archivo,
// no solo el número que calculamos en este momento. Si algún operando no se puede traducir (el
// campo referenciado no tiene posición en el Excel, es de otro tipo, o no existe), devuelve null —
// el llamador debe usar el valor ya calculado como número fijo en su lugar.
export function traducirFormulaAExcel(formula: string, resolver: (token: string) => ResolucionCelda): string | null {
  const tokens = tokenizarFormula(formula);
  if (tokens.length === 0) return null;
  const partes: string[] = [];
  for (const tok of tokens) {
    if (/^[+\-*/()]$/.test(tok)) { partes.push(tok); continue; }
    if (/^\d+(\.\d+)?$/.test(tok)) { partes.push(tok); continue; }
    const r = resolver(tok);
    if (r.tipo !== 'celda') return null;
    partes.push(r.referencia);
  }
  return partes.join('');
}

// Crea un resolver a partir de la lista de campos de la plantilla — `obtenerValorRaw` da el valor
// crudo actual de un campo por su identificador (viene de valorEjemplo en Estructura, o del mapa de
// valores del ejemplo activo en Ejemplos). No se permiten fórmulas encadenadas (un campo calculado
// referenciando a otro campo calculado) para evitar ciclos y mantener la evaluación simple.
export function crearResolver(
  campos: Pick<Campo, 'identificador' | 'etiqueta' | 'tipo'>[],
  obtenerValorRaw: (identificador: string) => string | undefined,
): (token: string) => ResolucionToken {
  const porId = new Map(campos.map((c) => [c.identificador, c]));
  return (token: string): ResolucionToken => {
    const campo = porId.get(token);
    if (!campo) return { tipo: 'no-existe' };
    if (campo.tipo !== 'numero' && campo.tipo !== 'decimal') {
      return { tipo: 'invalido', mensaje: `El campo "${token}" (${campo.etiqueta}) no es de tipo Número o Decimal` };
    }
    const raw = obtenerValorRaw(token) ?? '';
    if (esFormula(raw)) {
      return { tipo: 'invalido', mensaje: `El campo "${token}" (${campo.etiqueta}) es a su vez una fórmula — no se pueden encadenar` };
    }
    const n = Number(raw);
    return { tipo: 'valor', valor: Number.isFinite(n) ? n : 0 };
  };
}
