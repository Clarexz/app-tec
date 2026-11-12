import type { Servicio } from '@/types/api';

// Importante: acceso literal a process.env.EXPO_PUBLIC_* para que Expo lo inyecte.
const host: string = (process.env.EXPO_PUBLIC_API_HOST ?? 'http://2.24.29.189').replace(/\/+$/, '');

const ports: Record<Servicio, number> = {
  avisos: Number(process.env.EXPO_PUBLIC_PORT_AVISOS) || 30001,
  talleres: Number(process.env.EXPO_PUBLIC_PORT_TALLERES) || 30002,
  inscripciones: Number(process.env.EXPO_PUBLIC_PORT_INSCRIPCIONES) || 30003,
};

export const config = {
  host,
  ports,
  urls: {
    avisos: `${host}:${ports.avisos}`,
    talleres: `${host}:${ports.talleres}`,
    inscripciones: `${host}:${ports.inscripciones}`,
  } as Record<Servicio, string>,
  timeoutMs: 8000,
};
