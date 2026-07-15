import type { ReactNode } from 'react';

// Intérprete de Markdown minimalista y sin dependencias — cubre lo que necesita el contenido de
// "Ayuda para llenar" (encabezados, negrita/cursiva/código inline, enlaces, listas, párrafos).
// No es un parser CommonMark completo a propósito: el contenido lo escribe el propio admin, no
// hace falta soportar la especificación entera.

function renderInline(texto: string, keyPrefix: string): ReactNode[] {
  const nodos: ReactNode[] = [];
  let restante = texto;
  let i = 0;
  const patron = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/;
  while (restante) {
    const m = restante.match(patron);
    if (!m || m.index === undefined) {
      nodos.push(restante);
      break;
    }
    if (m.index > 0) nodos.push(restante.slice(0, m.index));
    if (m[2] !== undefined) nodos.push(<strong key={`${keyPrefix}-${i++}`}>{m[2]}</strong>);
    else if (m[3] !== undefined) nodos.push(<em key={`${keyPrefix}-${i++}`}>{m[3]}</em>);
    else if (m[4] !== undefined)
      nodos.push(
        <code key={`${keyPrefix}-${i++}`} className="px-1 py-0.5 rounded bg-gray-100 text-[13px] font-mono">
          {m[4]}
        </code>,
      );
    else if (m[5] !== undefined && m[6] !== undefined)
      nodos.push(
        <a key={`${keyPrefix}-${i++}`} href={m[6]} target="_blank" rel="noreferrer" className="text-brand-600 underline">
          {m[5]}
        </a>,
      );
    restante = restante.slice(m.index + m[0].length);
  }
  return nodos;
}

export function renderMarkdown(texto: string): ReactNode {
  if (!texto.trim()) return null;
  const lineas = texto.split('\n');
  const bloques: ReactNode[] = [];
  let lista: { tipo: 'ul' | 'ol'; items: string[] } | null = null;

  const cerrarLista = () => {
    if (!lista) return;
    const Tag = lista.tipo;
    const clases = Tag === 'ul' ? 'list-disc pl-5 space-y-1 my-2' : 'list-decimal pl-5 space-y-1 my-2';
    bloques.push(
      <Tag key={`lista-${bloques.length}`} className={clases}>
        {lista.items.map((item, i) => (
          <li key={i} className="text-sm text-gray-700 leading-relaxed">{renderInline(item, `li-${bloques.length}-${i}`)}</li>
        ))}
      </Tag>,
    );
    lista = null;
  };

  lineas.forEach((linea, idx) => {
    const trim = linea.trim();
    if (!trim) { cerrarLista(); return; }

    const encabezado = trim.match(/^(#{1,3})\s+(.*)$/);
    if (encabezado) {
      cerrarLista();
      const nivel = encabezado[1].length;
      const clases = nivel === 1 ? 'text-base font-bold text-heading mt-3 mb-1' : nivel === 2 ? 'text-sm font-bold text-heading mt-3 mb-1' : 'text-sm font-semibold text-heading mt-2 mb-1';
      const Tag = (`h${nivel}` as 'h1' | 'h2' | 'h3');
      bloques.push(<Tag key={idx} className={clases}>{renderInline(encabezado[2], `h-${idx}`)}</Tag>);
      return;
    }

    const itemUl = trim.match(/^[-*]\s+(.*)$/);
    if (itemUl) {
      if (!lista || lista.tipo !== 'ul') { cerrarLista(); lista = { tipo: 'ul', items: [] }; }
      lista.items.push(itemUl[1]);
      return;
    }

    const itemOl = trim.match(/^\d+\.\s+(.*)$/);
    if (itemOl) {
      if (!lista || lista.tipo !== 'ol') { cerrarLista(); lista = { tipo: 'ol', items: [] }; }
      lista.items.push(itemOl[1]);
      return;
    }

    cerrarLista();
    bloques.push(<p key={idx} className="text-sm text-gray-700 leading-relaxed">{renderInline(trim, `p-${idx}`)}</p>);
  });
  cerrarLista();

  return <div className="space-y-1">{bloques}</div>;
}
