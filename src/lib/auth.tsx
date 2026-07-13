import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import * as store from './store';
import type { Sesion } from '../types';

interface AuthState {
  sesion: Sesion | null;
  login: (usuario: string, password: string) => Sesion | null;
  logout: () => void;
  actualizarNombreSesion: (nombre: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => store.loadSesion());

  const login = useCallback((usuario: string, password: string): Sesion | null => {
    const u = store.findUsuario(usuario, password);
    if (!u) return null;
    const nueva: Sesion = {
      usuarioId: u.id,
      nombre: u.nombre,
      usuario: u.usuario,
      rol: u.rol,
      iniciadaEn: new Date().toISOString(),
    };
    store.saveSesion(nueva);
    setSesion(nueva);
    return nueva;
  }, []);

  const logout = useCallback(() => {
    store.clearSesion();
    setSesion(null);
  }, []);

  const actualizarNombreSesion = useCallback((nombre: string) => {
    setSesion((prev) => {
      if (!prev) return prev;
      const next = { ...prev, nombre };
      store.saveSesion(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ sesion, login, logout, actualizarNombreSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
