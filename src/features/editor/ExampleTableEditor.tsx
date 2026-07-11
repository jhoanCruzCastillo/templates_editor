import { useState, useCallback, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import DynamicEditor from './DynamicEditor';
import GroupedRowsEditor from './GroupedRowsEditor';
import { createNodeChain, parseTree, type TreeNode } from '../../lib/tableRowHelpers';
import type { ConfigTabla, CabeceraGrupo } from '../../types';

interface Props {
  config: ConfigTabla;
  value: string;
  onChange: (value: string) => void;
  /** Cuando se puede editar la estructura de la tabla desde este preview (solo tab Estructura) — permite agregar columnas dinámicas */
  onConfigChange?: (config: ConfigTabla) => void;
}

// --- Helpers (jerárquica) ---

function cloneTree(roots: TreeNode[]): TreeNode[] { return JSON.parse(JSON.stringify(roots)); }

function getNode(roots: TreeNode[], path: number[]): TreeNode | null {
  let current: TreeNode | undefined = roots[path[0]];
  for (let i = 1; i < path.length && current; i++) current = current.children[path[i]];
  return current ?? null;
}

// --- Componente principal ---

export default function ExampleTableEditor({ config, value, onChange, onConfigChange }: Props) {
  if (config.subtipo === 'jerarquica') return <HierarchicalEditor columns={config.columnas} value={value} onChange={onChange} cabeceras={config.cabeceras} />;
  if (config.agrupador) return <GroupedRowsEditor config={config} value={value} onChange={onChange} onConfigChange={onConfigChange} />;
  return <DynamicEditor config={config} value={value} onChange={onChange} onConfigChange={onConfigChange} />;
}

// ==================== JERÁRQUICA ====================

interface ColDef { id: string; nombre: string }

// Celda en la grilla aplanada
type FlatCell =
  | { type: 'data'; value: string; path: number[]; rowSpan: number }
  | { type: 'add'; parentPath: number[] }
  | { type: 'empty' }
  | null;

interface FlatRow { cells: FlatCell[]; isGroupStart?: boolean }

// Estructura para navegación: mapa de celdas navegables
interface NavCell { path: number[]; colIndex: number }

function HierarchicalEditor({ columns, value, onChange, cabeceras }: { columns: ColDef[]; value: string; onChange: (v: string) => void; cabeceras?: CabeceraGrupo[] }) {
  const numCols = columns.length;
  const [roots, setRoots] = useState<TreeNode[]>(() => parseTree(value, numCols));
  const [selectedPath, setSelectedPath] = useState<number[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const persist = useCallback((next: TreeNode[]) => { setRoots(next); onChange(JSON.stringify(next)); }, [onChange]);

  const updateNodeValue = (path: number[], val: string) => {
    const next = cloneTree(roots);
    const node = getNode(next, path);
    if (node) node.value = val;
    persist(next);
  };

  const addRoot = () => {
    const newIdx = roots.length;
    persist([...roots, createNodeChain(numCols)]);
    setSelectedPath([newIdx]);
    setIsEditing(true);
    setFocusPath(JSON.stringify([newIdx]));
  };

  const addChildAt = (path: number[]) => {
    const next = cloneTree(roots);
    const parent = getNode(next, path);
    if (!parent) return;
    const newChildIdx = parent.children.length;
    parent.children.push(createNodeChain(numCols - path.length));
    persist(next);
    const newPath = [...path, newChildIdx];
    setSelectedPath(newPath);
    setIsEditing(true);
    setFocusPath(JSON.stringify(newPath));
  };

  const removeNode = (path: number[]) => {
    const next = cloneTree(roots);
    if (path.length === 1) { if (next.length <= 1) return; next.splice(path[0], 1); }
    else { const parent = getNode(next, path.slice(0, -1)); if (parent) parent.children.splice(path[path.length - 1], 1); }
    persist(next);
    if (selectedPath && JSON.stringify(selectedPath) === JSON.stringify(path)) { setSelectedPath(null); setIsEditing(false); }
  };

  // Construir grilla de navegación: lista de todas las celdas data en orden de fila
  const navGrid = useCallback((): NavCell[] => {
    const cells: NavCell[] = [];
    function walk(node: TreeNode, colIdx: number, path: number[]) {
      cells.push({ path, colIndex: colIdx });
      node.children.forEach((child, ci) => walk(child, colIdx + 1, [...path, ci]));
    }
    roots.forEach((root, ri) => walk(root, 0, [ri]));
    return cells;
  }, [roots]);

  // Encontrar la celda vecina en una dirección
  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedPath) return;
    const grid = navGrid();
    const currentIdx = grid.findIndex((c) => JSON.stringify(c.path) === JSON.stringify(selectedPath));
    if (currentIdx === -1) return;
    const current = grid[currentIdx];

    let target: NavCell | undefined;

    if (direction === 'up' || direction === 'down') {
      // Buscar hermano anterior/siguiente (mismo padre, misma columna)
      const parentPath = selectedPath.slice(0, -1);
      const siblings = grid.filter((c) =>
        c.colIndex === current.colIndex &&
        JSON.stringify(c.path.slice(0, -1)) === JSON.stringify(parentPath)
      );
      const sibIdx = siblings.findIndex((c) => JSON.stringify(c.path) === JSON.stringify(selectedPath));
      if (direction === 'up' && sibIdx > 0) target = siblings[sibIdx - 1];
      if (direction === 'down' && sibIdx < siblings.length - 1) target = siblings[sibIdx + 1];
    } else if (direction === 'left') {
      if (selectedPath.length > 1) {
        target = { path: selectedPath.slice(0, -1), colIndex: current.colIndex - 1 };
      }
    } else if (direction === 'right') {
      // Ir al primer hijo
      const node = getNode(roots, selectedPath);
      if (node && node.children.length > 0) {
        target = { path: [...selectedPath, 0], colIndex: current.colIndex + 1 };
      }
    }

    if (target) {
      setSelectedPath(target.path);
      setIsEditing(false);
    }
  }, [selectedPath, navGrid, roots]);

  // Keyboard handler en el contenedor de la tabla
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selectedPath) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isEditing) {
        // Salir de edición, celda sigue seleccionada
        setIsEditing(false);
        const input = inputRefs.current.get(JSON.stringify(selectedPath));
        input?.blur();
        tableRef.current?.focus();
      } else {
        // Entrar a edición
        setIsEditing(true);
        setFocusPath(JSON.stringify(selectedPath));
      }
      return;
    }

    // Las flechas solo navegan cuando NO estamos editando
    if (!isEditing) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dir = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        navigate(dir);
      }
      // Escape deselecciona
      if (e.key === 'Escape') {
        setSelectedPath(null);
        setIsEditing(false);
      }
    } else {
      // En modo edición, Escape sale de edición
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsEditing(false);
        const input = inputRefs.current.get(JSON.stringify(selectedPath));
        input?.blur();
        tableRef.current?.focus();
      }
    }
  }, [selectedPath, isEditing, navigate]);

  // Focus en input cuando cambia focusPath
  useEffect(() => {
    if (focusPath) {
      const input = inputRefs.current.get(focusPath);
      if (input) { input.focus(); setFocusPath(null); }
    }
  }, [focusPath, roots]);

  const isPathSelected = (path: number[]) => selectedPath && JSON.stringify(selectedPath) === JSON.stringify(path);
  const isPathAncestor = (path: number[]) => {
    if (!selectedPath || path.length >= selectedPath.length) return false;
    return path.every((v, i) => selectedPath[i] === v);
  };

  const flatRows = buildFlatRows(roots, numCols, selectedPath);

  const grupos = cabeceras ?? [];
  const hasCabeceras = grupos.length > 0;
  const grupoForId = (id: string) => grupos.find((g) => g.hijoIds.includes(id));
  const runs: { grupo?: CabeceraGrupo; cols: ColDef[] }[] = [];
  for (const col of columns) {
    const g = grupoForId(col.id);
    const last = runs[runs.length - 1];
    if (last && g && last.grupo === g) last.cols.push(col);
    else runs.push({ grupo: g, cols: [col] });
  }
  const colHeaderCls = (isLast: boolean) =>
    `px-3 py-2 text-left font-semibold text-heading border-b-2 border-gray-300 whitespace-nowrap text-[11px] uppercase tracking-wider align-top ${isLast ? '' : 'border-r border-gray-300'}`;

  return (
    <div className="mt-2">
      <div
        ref={tableRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="overflow-x-auto rounded-lg border border-gray-300 outline-none"
      >
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            {hasCabeceras && (
              <tr className="bg-indigo-50">
                {runs.map((run, ri) =>
                  run.grupo ? (
                    <th key={`grp-${ri}`} colSpan={run.cols.length} className="px-2 py-1.5 text-center font-semibold text-indigo-700 border-2 border-indigo-400 bg-indigo-100 whitespace-nowrap text-[11px]">
                      {run.grupo.titulo || 'Sin título'}
                    </th>
                  ) : (
                    run.cols.map((col) => (
                      <th key={col.id} rowSpan={2} className={colHeaderCls(col.id === columns[numCols - 1].id)}>
                        {col.nombre}
                      </th>
                    ))
                  )
                )}
                <th rowSpan={2} className="w-6 border-b-2 border-gray-300" />
              </tr>
            )}
            <tr className="bg-gray-100">
              {hasCabeceras
                ? runs.flatMap((run) =>
                    run.grupo
                      ? run.cols.map((col) => (
                          <th key={col.id} className={colHeaderCls(col.id === columns[numCols - 1].id)}>
                            {col.nombre}
                          </th>
                        ))
                      : []
                  )
                : columns.map((col, ci) => (
                    <th key={col.id} className={colHeaderCls(ci === numCols - 1)}>
                      {col.nombre}
                    </th>
                  ))}
              {!hasCabeceras && <th className="w-6 border-b-2 border-gray-300" />}
            </tr>
          </thead>
          <tbody>
            {flatRows.map((row, ri) => (
              <tr key={ri} className={row.isGroupStart ? 'border-t-2 border-gray-400' : 'border-t border-gray-200'}>
                {row.cells.map((cell, ci) => {
                  if (cell === null) return null;
                  if (cell.type === 'add') {
                    return (
                      <td key={ci} className={`px-1.5 py-1 ${ci < numCols - 1 ? 'border-r border-gray-300' : ''}`}>
                        <button onClick={(e) => { e.stopPropagation(); addChildAt(cell.parentPath); }}
                          className="w-full py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors">
                          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" /> {columns[ci]?.nombre}
                        </button>
                      </td>
                    );
                  }
                  if (cell.type === 'empty') {
                    return <td key={ci} className={`px-1.5 py-1 bg-gray-50/50 ${ci < numCols - 1 ? 'border-r border-gray-300' : ''}`} />;
                  }
                  const sel = isPathSelected(cell.path);
                  const anc = isPathAncestor(cell.path);
                  const editing = sel && isEditing;
                  const pathStr = JSON.stringify(cell.path);
                  return (
                    <td
                      key={ci}
                      rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                      className={`px-1.5 py-1 align-top cursor-pointer transition-colors duration-75 ${
                        ci < numCols - 1 ? 'border-r border-gray-300' : ''
                      } ${
                        sel
                          ? 'bg-brand-100 ring-2 ring-inset ring-brand-500'
                          : anc
                            ? 'bg-brand-50/50'
                            : ci === 0
                              ? 'bg-amber-50/40 hover:bg-amber-50'
                              : 'hover:bg-gray-50'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPath(cell.path);
                        setIsEditing(true);
                        setFocusPath(pathStr);
                      }}
                    >
                      <div className="flex items-start gap-0.5 group/cell">
                        <input
                          type="text"
                          value={cell.value}
                          onChange={(e) => { e.stopPropagation(); updateNodeValue(cell.path, e.target.value); }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!editing) { setSelectedPath(cell.path); setIsEditing(true); setFocusPath(pathStr); }
                          }}
                          readOnly={!editing}
                          tabIndex={-1}
                          placeholder={`${columns[ci]?.nombre}...`}
                          className={`flex-1 px-1.5 py-1 rounded border text-xs text-heading focus:outline-none min-w-0 ${
                            editing
                              ? 'border-brand-400 bg-white ring-1 ring-brand-500/30'
                              : 'border-transparent bg-transparent cursor-pointer'
                          }`}
                          ref={(el) => { if (el) inputRefs.current.set(pathStr, el); }}
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeNode(cell.path); }}
                          className="w-4 h-4 rounded flex items-center justify-center text-gray-300 opacity-0 group-hover/cell:opacity-100 hover:text-red-500 transition-opacity shrink-0 mt-1"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-2 h-2" />
                        </button>
                      </div>
                    </td>
                  );
                })}
                <td className="w-6" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        <button onClick={(e) => { e.stopPropagation(); addRoot(); }}
          className="py-1.5 px-4 rounded-lg border border-dashed border-gray-300 text-[10px] font-medium text-gray-500 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors flex items-center gap-1">
          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" /> Item
        </button>
        <span className="text-[9px] text-muted">Enter: editar · Flechas: navegar · Esc: salir</span>
      </div>
    </div>
  );
}

// ==================== Flat rows builder ====================

function getNodeSpan(node: TreeNode, colIdx: number, numCols: number, selectedPath: number[] | null, path: number[]): number {
  const isLeaf = node.children.length === 0 || colIdx >= numCols - 1;
  const baseSpan = isLeaf ? 1 : node.children.reduce((s, c, ci) => s + getNodeSpan(c, colIdx + 1, numCols, selectedPath, [...path, ci]), 0);
  const sel = selectedPath !== null && JSON.stringify(selectedPath) === JSON.stringify(path);
  return baseSpan + (sel && colIdx < numCols - 1 ? 1 : 0);
}

function buildFlatRows(roots: TreeNode[], numCols: number, selectedPath: number[] | null): FlatRow[] {
  const rows: FlatRow[] = [];

  function isPathSelected(path: number[]): boolean {
    return selectedPath !== null && JSON.stringify(selectedPath) === JSON.stringify(path);
  }

  function walkNode(node: TreeNode, colIdx: number, path: number[]) {
    const isLeaf = node.children.length === 0 || colIdx >= numCols - 1;
    const baseSpan = isLeaf ? 1 : node.children.reduce((s, c, ci) => s + getNodeSpan(c, colIdx + 1, numCols, selectedPath, [...path, ci]), 0);
    const sel = isPathSelected(path);
    const addRowNeeded = sel && colIdx < numCols - 1;
    const totalSpan = baseSpan + (addRowNeeded ? 1 : 0);

    if (isLeaf) {
      const row: FlatRow = { cells: Array(numCols).fill(null) };
      row.cells[colIdx] = { type: 'data', value: node.value, path, rowSpan: totalSpan };
      for (let i = colIdx + 1; i < numCols; i++) row.cells[i] = { type: 'empty' };
      rows.push(row);
    } else {
      const startRow = rows.length;
      node.children.forEach((child, ci) => walkNode(child, colIdx + 1, [...path, ci]));
      if (rows[startRow]) rows[startRow].cells[colIdx] = { type: 'data', value: node.value, path, rowSpan: totalSpan };
      for (let r = startRow + 1; r < startRow + baseSpan; r++) { if (rows[r]) rows[r].cells[colIdx] = null; }
    }

    if (addRowNeeded) {
      const addRow: FlatRow = { cells: Array(numCols).fill(null) };
      addRow.cells[colIdx + 1] = { type: 'add', parentPath: path };
      for (let i = colIdx + 2; i < numCols; i++) addRow.cells[i] = { type: 'empty' };
      rows.push(addRow);
    }
  }

  roots.forEach((root, ri) => {
    const startIdx = rows.length;
    walkNode(root, 0, [ri]);
    if (rows[startIdx]) rows[startIdx].isGroupStart = ri > 0;
  });
  return rows;
}
