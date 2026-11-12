import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { queryClient } from '@/api/queryClient';
import { normNoControl, verificarCredenciales, type ResultadoLogin } from './cuentas';

export interface Sesion {
  /** Número de control del alumno (el servidor lo llama "matricula"). */
  noControl: string;
  /** Nombre completo; vacío hasta que el alumno lo captura en el primer inicio de sesión. */
  nombre: string;
}

export interface SesionCtx {
  /** null = sin sesión. */
  sesion: Sesion | null;
  /** true mientras se lee la sesión guardada al abrir la app. */
  cargando: boolean;
  /** Valida y, si es correcto, guarda la sesión. Nunca lanza. */
  iniciarSesion(noControl: string, clave: string): Promise<ResultadoLogin>;
  /** Guarda o cambia el nombre del alumno en la sesión actual. */
  guardarNombre(nombre: string): Promise<void>;
  /** Borra la sesión y la caché de datos. */
  cerrarSesion(): Promise<void>;
}

const CLAVE = 'sesion.v1';
const CLAVE_ULTIMO = 'sesion.ultimo';
const Ctx = createContext<SesionCtx | null>(null);

async function leer(clave: string = CLAVE): Promise<Sesion | null> {
  try {
    const raw = await AsyncStorage.getItem(clave);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Sesion>;
    if (typeof s.noControl === 'string' && s.noControl) {
      return { noControl: s.noControl, nombre: typeof s.nombre === 'string' ? s.nombre : '' };
    }
  } catch {
    // se ignora: sin sesión
  }
  return null;
}

async function escribir(s: Sesion | null): Promise<void> {
  try {
    if (s) await AsyncStorage.setItem(CLAVE, JSON.stringify(s));
    else await AsyncStorage.removeItem(CLAVE);
  } catch {
    // se ignora
  }
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    void leer().then((s) => {
      if (!vivo) return;
      setSesion(s);
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const iniciarSesion = useCallback(async (noControl: string, clave: string) => {
    let r: ResultadoLogin;
    try {
      r = await verificarCredenciales(noControl, clave);
    } catch {
      return { ok: false, motivo: 'red' } as const;
    }
    if (r.ok) {
      const previa = (await leer()) ?? (await leer(CLAVE_ULTIMO));
      const n = normNoControl(r.cuenta.noControl);
      // Conserva el nombre si es el mismo alumno que ya lo había capturado.
      const nombre = r.cuenta.nombre ?? (previa?.noControl === n ? previa.nombre : '');
      const s: Sesion = { noControl: n, nombre };
      await escribir(s);
      queryClient.clear();
      setSesion(s);
    }
    return r;
  }, []);

  const guardarNombre = useCallback(async (nombre: string) => {
    const limpio = nombre.trim().replace(/\s+/g, ' ');
    setSesion((s) => {
      if (!s) return s;
      const nueva = { ...s, nombre: limpio };
      void escribir(nueva);
      return nueva;
    });
  }, []);

  const cerrarSesion = useCallback(async () => {
    // Se conserva el nombre en disco para precargarlo si el mismo alumno vuelve a entrar.
    try {
      const s = await leer();
      if (s) await AsyncStorage.setItem(CLAVE_ULTIMO, JSON.stringify(s));
    } catch {
      // se ignora
    }
    await escribir(null);
    queryClient.clear();
    setSesion(null);
  }, []);

  const value = useMemo<SesionCtx>(
    () => ({ sesion, cargando, iniciarSesion, guardarNombre, cerrarSesion }),
    [sesion, cargando, iniciarSesion, guardarNombre, cerrarSesion],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSesion(): SesionCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return v;
}

/** Atajo para pantallas protegidas: la sesión siempre existe ahí. */
export function useAlumno(): Sesion {
  const { sesion } = useSesion();
  return sesion ?? { noControl: '', nombre: '' };
}
