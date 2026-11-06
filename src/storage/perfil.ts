import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface Perfil {
  matricula: string;
  nombre: string;
}

const CLAVE = 'perfil.v1';

export async function leerPerfil(): Promise<Perfil | null> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Perfil>;
    if (typeof p.matricula === 'string' && typeof p.nombre === 'string') return { matricula: p.matricula, nombre: p.nombre };
  } catch {
    // se ignora
  }
  return null;
}

export async function guardarPerfil(p: Perfil): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(p));
  } catch {
    // se ignora
  }
}

export function usePerfil(): { perfil: Perfil | null; cargado: boolean; guardar: (p: Perfil) => Promise<void> } {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    let vivo = true;
    leerPerfil().then((p) => {
      if (!vivo) return;
      setPerfil(p);
      setCargado(true);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const guardar = useCallback(async (p: Perfil) => {
    setPerfil(p);
    await guardarPerfil(p);
  }, []);

  return { perfil, cargado, guardar };
}
