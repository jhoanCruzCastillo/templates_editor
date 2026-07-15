import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import * as store from './store';
import type { Sector, Plantilla, Ejemplo, ActividadReciente, ArchivoExcel, CatalogoExcelPlantilla, Usuario, FacturacionMock, SesionMentoria } from '../types';

interface AppState {
  sectores: Sector[];
  plantillas: Plantilla[];
  ejemplos: Ejemplo[];
  actividad: ActividadReciente[];
  excelCatalogos: Record<string, CatalogoExcelPlantilla>;
  excelEjemplos: Record<string, ArchivoExcel>;
  usuarios: Usuario[];
  facturacion: Record<string, FacturacionMock>;
  mentorias: SesionMentoria[];

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

  // Usuarios
  addUsuario: (usuario: Usuario) => void;
  updateUsuario: (id: string, data: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;

  // Facturación (datos de muestra)
  updateFacturacion: (usuarioId: string, data: Partial<FacturacionMock>) => void;

  // Mentorías grupales
  inscribirseAMentoria: (sesionId: string, cuentaId: string) => void;

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
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => store.loadUsuarios());
  const [facturacion, setFacturacion] = useState<Record<string, FacturacionMock>>(() => store.loadFacturacion());
  const [mentorias, setMentorias] = useState<SesionMentoria[]>(() => store.loadMentorias());

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

  // Algunas plantillas semilla traen un `archivoDefaultUrl` (ruta pública bajo /fichas_oficiales)
  // — la primera vez que se cargan sin ningún archivo en su catálogo, se asignan automáticamente,
  // así el usuario no tiene que subir a mano el Excel oficial de cada ficha. Se guarda la RUTA
  // pública tal cual como `dataUrl` (fetch() funciona igual con una ruta que con un data: URL) en
  // vez de descargar y convertir el archivo a base64 — varios de estos Excel pesan varios MB, muy
  // por encima de la cuota de localStorage (~5-10 MB) si se guardaran codificados.
  useEffect(() => {
    // Se calcula "pendientes" contra `prev` (el estado más reciente dentro del propio updater),
    // no contra la variable `excelCatalogos` del closure — StrictMode ejecuta este efecto dos
    // veces seguidas en desarrollo, y comparar contra el closure (desactualizado en la segunda
    // pasada) duplicaba el archivo asignado.
    setExcelCatalogos((prev) => {
      const pendientes = plantillas.filter((p) => p.archivoDefaultUrl && !prev[p.id]?.archivos.length);
      if (pendientes.length === 0) return prev;
      const next = { ...prev };
      for (const p of pendientes) {
        const archivo: ArchivoExcel = {
          id: store.generateId(),
          nombre: p.archivoDefaultUrl!.split('/').pop() || p.codigo,
          dataUrl: p.archivoDefaultUrl!,
          fechaSubida: new Date().toLocaleDateString('es-PE'),
        };
        next[p.id] = { archivos: [archivo], asignadoId: archivo.id };
      }
      store.saveCatalogosExcel(next);
      return next;
    });
  }, [plantillas]);

  // --- Copia de Excel por ejemplo ---

  const setExcelEjemplo = useCallback((ejemploId: string, archivo: ArchivoExcel) => {
    setExcelEjemplos((prev) => {
      const next = { ...prev, [ejemploId]: archivo };
      store.saveExcelEjemplos(next);
      return next;
    });
  }, []);

  // --- Usuarios ---

  const addUsuario = useCallback((usuario: Usuario) => {
    setUsuarios((prev) => {
      const next = [...prev, usuario];
      store.saveUsuarios(next);
      return next;
    });
  }, []);

  const updateUsuario = useCallback((id: string, data: Partial<Usuario>) => {
    setUsuarios((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...data } : u));
      store.saveUsuarios(next);
      return next;
    });
  }, []);

  const deleteUsuario = useCallback((id: string) => {
    setUsuarios((prev) => {
      const next = prev.filter((u) => u.id !== id);
      store.saveUsuarios(next);
      return next;
    });
  }, []);

  // --- Facturación (datos de muestra) ---

  const updateFacturacion = useCallback((usuarioId: string, data: Partial<FacturacionMock>) => {
    setFacturacion((prev) => {
      const actual = prev[usuarioId] ?? store.generarFacturacionDefault();
      const next = { ...prev, [usuarioId]: { ...actual, ...data } };
      store.saveFacturacion(next);
      return next;
    });
  }, []);

  // --- Mentorías grupales ---

  const inscribirseAMentoria = useCallback((sesionId: string, cuentaId: string) => {
    setMentorias((prev) => {
      const next = prev.map((m) => {
        if (m.id !== sesionId || m.inscritos.includes(cuentaId) || m.inscritos.length >= m.cuposTotales) return m;
        return { ...m, inscritos: [...m.inscritos, cuentaId] };
      });
      store.saveMentorias(next);
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
        usuarios,
        facturacion,
        mentorias,
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
        addUsuario,
        updateUsuario,
        deleteUsuario,
        updateFacturacion,
        inscribirseAMentoria,
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
