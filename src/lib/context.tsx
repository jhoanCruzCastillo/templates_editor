import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import * as store from './store';
import type { Sector, Plantilla, Ejemplo, ActividadReciente, ArchivoExcel, CatalogoExcelPlantilla } from '../types';

interface AppState {
  sectores: Sector[];
  plantillas: Plantilla[];
  ejemplos: Ejemplo[];
  actividad: ActividadReciente[];
  excelCatalogos: Record<string, CatalogoExcelPlantilla>;
  excelEjemplos: Record<string, ArchivoExcel>;

  // Sectores
  addSector: (sector: Sector) => void;
  updateSector: (id: string, data: Partial<Sector>) => void;
  deleteSector: (id: string) => void;

  // Plantillas
  addPlantilla: (plantilla: Plantilla) => void;
  updatePlantilla: (id: string, data: Partial<Plantilla>) => void;
  duplicatePlantilla: (id: string) => void;
  deletePlantilla: (id: string) => void;

  // Ejemplos
  addEjemplo: (ejemplo: Ejemplo) => void;
  updateEjemplo: (id: string, data: Partial<Ejemplo>) => void;
  deleteEjemplo: (id: string) => void;

  // Actividad
  pushActividad: (mensaje: string, color: ActividadReciente['color']) => void;

  // Catálogo de Excel por plantilla
  addArchivoExcel: (plantillaId: string, archivo: ArchivoExcel) => void;
  deleteArchivoExcel: (plantillaId: string, archivoId: string) => void;
  asignarArchivoExcel: (plantillaId: string, archivoId: string) => void;

  // Copia de Excel por ejemplo
  setExcelEjemplo: (ejemploId: string, archivo: ArchivoExcel) => void;

  // Métricas
  getMetricas: () => { totalSectores: number; totalPlantillas: number; totalEjemplos: number };
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sectores, setSectores] = useState<Sector[]>(() => store.loadSectores());
  const [plantillas, setPlantillas] = useState<Plantilla[]>(() => store.loadPlantillas());
  const [ejemplos, setEjemplos] = useState<Ejemplo[]>(() => store.loadEjemplos());
  const [actividad, setActividad] = useState<ActividadReciente[]>(() => store.loadActividad());
  const [excelCatalogos, setExcelCatalogos] = useState<Record<string, CatalogoExcelPlantilla>>(() => store.loadCatalogosExcel());
  const [excelEjemplos, setExcelEjemplos] = useState<Record<string, ArchivoExcel>>(() => store.loadExcelEjemplos());

  // --- Sectores ---

  const addSector = useCallback((sector: Sector) => {
    setSectores((prev) => {
      const next = [...prev, sector];
      store.saveSectores(next);
      return next;
    });
  }, []);

  const updateSector = useCallback((id: string, data: Partial<Sector>) => {
    setSectores((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      store.saveSectores(next);
      return next;
    });
  }, []);

  const deleteSector = useCallback((id: string) => {
    setSectores((prev) => {
      const next = prev.filter((s) => s.id !== id);
      store.saveSectores(next);
      return next;
    });
    setPlantillas((prev) => {
      const next = prev.filter((p) => p.sectorId !== id);
      store.savePlantillas(next);
      return next;
    });
  }, []);

  // --- Plantillas ---

  const addPlantilla = useCallback((plantilla: Plantilla) => {
    setPlantillas((prev) => {
      const next = [...prev, plantilla];
      store.savePlantillas(next);
      return next;
    });
    setSectores((prev) => {
      const next = prev.map((s) =>
        s.id === plantilla.sectorId
          ? { ...s, cantidadPlantillas: s.cantidadPlantillas + 1 }
          : s
      );
      store.saveSectores(next);
      return next;
    });
  }, []);

  const updatePlantilla = useCallback((id: string, data: Partial<Plantilla>) => {
    setPlantillas((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      store.savePlantillas(next);
      return next;
    });
  }, []);

  const duplicatePlantilla = useCallback((id: string) => {
    setPlantillas((prev) => {
      const original = prev.find((p) => p.id === id);
      if (!original) return prev;
      const newId = store.generateId();
      const copy: Plantilla = {
        ...original,
        id: newId,
        codigo: `${original.codigo}-copia`,
        nombre: `${original.nombre} (copia)`,
        fechaActualizacion: new Date().toLocaleDateString('es-PE'),
        cantidadEjemplos: 0,
      };
      const next = [...prev, copy];
      store.savePlantillas(next);
      return next;
    });
    setSectores((prev) => {
      const original = plantillas.find((p) => p.id === id);
      if (!original) return prev;
      const next = prev.map((s) =>
        s.id === original.sectorId
          ? { ...s, cantidadPlantillas: s.cantidadPlantillas + 1 }
          : s
      );
      store.saveSectores(next);
      return next;
    });
  }, [plantillas]);

  const deletePlantilla = useCallback((id: string) => {
    setPlantillas((prev) => {
      const target = prev.find((p) => p.id === id);
      const next = prev.filter((p) => p.id !== id);
      store.savePlantillas(next);
      if (target) {
        setSectores((sPrev) => {
          const sNext = sPrev.map((s) =>
            s.id === target.sectorId
              ? { ...s, cantidadPlantillas: Math.max(0, s.cantidadPlantillas - 1) }
              : s
          );
          store.saveSectores(sNext);
          return sNext;
        });
      }
      return next;
    });
  }, []);

  // --- Ejemplos ---

  const addEjemplo = useCallback((ejemplo: Ejemplo) => {
    setEjemplos((prev) => {
      const next = [...prev, ejemplo];
      store.saveEjemplos(next);
      return next;
    });
  }, []);

  const updateEjemplo = useCallback((id: string, data: Partial<Ejemplo>) => {
    setEjemplos((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...data } : e));
      store.saveEjemplos(next);
      return next;
    });
  }, []);

  const deleteEjemplo = useCallback((id: string) => {
    setEjemplos((prev) => {
      const next = prev.filter((e) => e.id !== id);
      store.saveEjemplos(next);
      return next;
    });
    setExcelEjemplos((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      store.saveExcelEjemplos(next);
      return next;
    });
  }, []);

  // --- Actividad ---

  const pushActividad = useCallback((mensaje: string, color: ActividadReciente['color']) => {
    setActividad((prev) => {
      const entry: ActividadReciente = {
        id: store.generateId(),
        mensaje,
        fecha: 'Ahora',
        color,
      };
      const next = [entry, ...prev].slice(0, 20);
      store.saveActividad(next);
      return next;
    });
  }, []);

  // --- Catálogo de Excel por plantilla ---

  const addArchivoExcel = useCallback((plantillaId: string, archivo: ArchivoExcel) => {
    setExcelCatalogos((prev) => {
      const actual = prev[plantillaId] ?? { archivos: [] };
      const next = {
        ...prev,
        [plantillaId]: {
          archivos: [...actual.archivos, archivo],
          asignadoId: actual.asignadoId ?? archivo.id,
        },
      };
      store.saveCatalogosExcel(next);
      return next;
    });
  }, []);

  const deleteArchivoExcel = useCallback((plantillaId: string, archivoId: string) => {
    setExcelCatalogos((prev) => {
      const actual = prev[plantillaId];
      if (!actual) return prev;
      const next = {
        ...prev,
        [plantillaId]: {
          archivos: actual.archivos.filter((a) => a.id !== archivoId),
          asignadoId: actual.asignadoId === archivoId ? undefined : actual.asignadoId,
        },
      };
      store.saveCatalogosExcel(next);
      return next;
    });
  }, []);

  const asignarArchivoExcel = useCallback((plantillaId: string, archivoId: string) => {
    setExcelCatalogos((prev) => {
      const actual = prev[plantillaId] ?? { archivos: [] };
      const next = { ...prev, [plantillaId]: { ...actual, asignadoId: archivoId } };
      store.saveCatalogosExcel(next);
      return next;
    });
  }, []);

  // --- Copia de Excel por ejemplo ---

  const setExcelEjemplo = useCallback((ejemploId: string, archivo: ArchivoExcel) => {
    setExcelEjemplos((prev) => {
      const next = { ...prev, [ejemploId]: archivo };
      store.saveExcelEjemplos(next);
      return next;
    });
  }, []);

  // --- Métricas ---

  const getMetricas = useCallback(() => {
    return {
      totalSectores: sectores.filter((s) => s.activo).length,
      totalPlantillas: sectores.reduce((sum, s) => sum + s.cantidadPlantillas, 0),
      totalEjemplos: sectores.reduce((sum, s) => sum + s.cantidadEjemplos, 0),
    };
  }, [sectores]);

  return (
    <AppContext.Provider
      value={{
        sectores,
        plantillas,
        ejemplos,
        actividad,
        excelCatalogos,
        excelEjemplos,
        addSector,
        updateSector,
        deleteSector,
        addPlantilla,
        updatePlantilla,
        duplicatePlantilla,
        deletePlantilla,
        addEjemplo,
        updateEjemplo,
        deleteEjemplo,
        pushActividad,
        addArchivoExcel,
        deleteArchivoExcel,
        asignarArchivoExcel,
        setExcelEjemplo,
        getMetricas,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
