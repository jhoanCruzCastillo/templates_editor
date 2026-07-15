import type { Campo, Plantilla } from '../types';

// Validación de los VALORES que llena el cliente (obligatoriedad + tipo) — distinto de
// campoValidation.ts, que valida la posición de captura en Excel (cosa del admin).

export function validarValorCampo(campo: Campo, valor: string | undefined): string | null {
  const v = (valor ?? '').trim();
  if (!v) return campo.requerido ? 'Este campo es obligatorio' : null;
  if (campo.tipo === 'numero' || campo.tipo === 'decimal') {
    if (Number.isNaN(Number(v))) return 'Debe ser un número válido';
  }
  if (campo.tipo === 'fecha' && Number.isNaN(Date.parse(v))) {
    return 'Debe ser una fecha válida';
  }
  return null;
}

// Recorre toda la plantilla y devuelve un mapa identificador → mensaje de error, solo para
// campos simples (tabla/tabla_jerarquica quedan fuera por ahora — su valor es una estructura
// JSON, no un string plano comparable con estas reglas).
export function validarValoresPlantilla(plantilla: Plantilla, valores: Record<string, string>): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const seccion of plantilla.secciones) {
    for (const sub of seccion.subsecciones) {
      for (const campo of sub.campos) {
        if (campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica' || !campo.editable) continue;
        const error = validarValorCampo(campo, valores[campo.identificador]);
        if (error) errores[campo.identificador] = error;
      }
    }
  }
  return errores;
}

export interface ProgresoFicha {
  llenos: number;
  total: number;
  /** 0-100. Si la plantilla no tiene campos simples que llenar, se considera 100 (nada pendiente). */
  porcentaje: number;
}

// Progreso de LLENADO (cuántos campos tienen algún valor) — distinto de validarValoresPlantilla,
// que solo mira obligatoriedad/formato. Un campo opcional vacío cuenta como pendiente aquí aunque
// no genere ningún error de validación.
export function calcularProgresoValores(plantilla: Plantilla, valores: Record<string, string>): ProgresoFicha {
  let total = 0;
  let llenos = 0;
  for (const seccion of plantilla.secciones) {
    for (const sub of seccion.subsecciones) {
      for (const campo of sub.campos) {
        if (campo.tipo === 'tabla' || campo.tipo === 'tabla_jerarquica' || !campo.editable) continue;
        total++;
        if ((valores[campo.identificador] ?? '').trim()) llenos++;
      }
    }
  }
  const porcentaje = total > 0 ? Math.round((llenos / total) * 100) : 100;
  return { llenos, total, porcentaje };
}
