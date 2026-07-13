import type { Campo, ConfigTabla, Plantilla } from '../types';

// Una columna de tabla necesita su propia posición en Excel (columnaExcel) — si falta,
// excelWriter.ts la salta silenciosamente al insertar valores (ver writeFilaColumnas/writeCampoTabla).
export function columnaFaltaCaptura(col: { columnaExcel?: string }): boolean {
  return !col.columnaExcel;
}

function tablaFaltaCaptura(config: ConfigTabla | undefined): boolean {
  if (!config || config.columnas.length === 0) return true;
  if (!config.captura?.filaInicial) return true;
  return config.columnas.some(columnaFaltaCaptura);
}

// Un campo "falta captura" si no tiene registrada la posición donde se escribe su valor en el
// Excel — para tablas, la fila inicial de la tabla y la columna de cada una de sus columnas;
// para campos sueltos, columna + fila. Sin esto, excelWriter.ts no puede insertar el valor.
export function campoFaltaCaptura(campo: Campo): boolean {
  const esTabla = campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica';
  if (esTabla) return tablaFaltaCaptura(campo.configTabla);
  return !campo.captura?.columna || !campo.captura?.fila;
}

export function contarCamposSinCaptura(plantilla: Plantilla): number {
  let total = 0;
  for (const seccion of plantilla.secciones) {
    for (const sub of seccion.subsecciones) {
      for (const campo of sub.campos) {
        if (campoFaltaCaptura(campo)) total++;
      }
    }
  }
  return total;
}
