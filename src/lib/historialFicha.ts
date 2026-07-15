import type { Plantilla, CampoCambio } from '../types';

// Compara los valores guardados de una ficha antes/después de un "Guardar" y arma la lista de
// campos que realmente cambiaron, con etiqueta legible — usado para el histórico de cambios
// (Nivel 2).
export function calcularCambios(
  plantilla: Plantilla,
  anteriores: Record<string, string>,
  nuevos: Record<string, string>,
): CampoCambio[] {
  const cambios: CampoCambio[] = [];
  for (const seccion of plantilla.secciones) {
    for (const sub of seccion.subsecciones) {
      for (const campo of sub.campos) {
        const antes = anteriores[campo.identificador] ?? '';
        const despues = nuevos[campo.identificador] ?? '';
        if (antes !== despues) {
          cambios.push({
            identificador: campo.identificador,
            etiqueta: campo.etiqueta,
            valorAnterior: antes,
            valorNuevo: despues,
          });
        }
      }
    }
  }
  return cambios;
}
