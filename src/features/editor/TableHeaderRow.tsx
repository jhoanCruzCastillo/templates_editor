import type { ColumnaTabla } from '../../types';

interface Props {
  cols: ColumnaTabla[];
  periodos: string[];
  columnaDinamicaId?: string;
}

// Encabezado compartido entre DynamicEditor y GroupedRowsEditor.
// La columna dinámica se expande en una celda de encabezado por período (subrayada, resaltada en ámbar).
export default function TableHeaderRow({ cols, periodos, columnaDinamicaId }: Props) {
  return (
    <tr className="bg-brand-50/40">
      {cols.map((col) => {
        if (col.id === columnaDinamicaId && periodos.length > 0) {
          return periodos.map((p, pi) => (
            <th key={`${col.id}-${pi}`} className="px-2 py-1.5 text-left font-medium text-heading border-b border-amber-300 bg-amber-50 whitespace-nowrap text-[11px] underline decoration-amber-400">
              {p}
            </th>
          ));
        }
        return (
          <th key={col.id} className="px-2 py-1.5 text-left font-medium text-heading border-b border-brand-100 whitespace-nowrap text-[11px]">
            {col.nombre}
          </th>
        );
      })}
      <th className="w-8 border-b border-brand-100" />
    </tr>
  );
}
