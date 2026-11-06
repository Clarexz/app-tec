import type { Servicio } from '@/types/api';

const TODOS: Servicio[] = ['avisos', 'talleres', 'inscripciones'];

// Importante: acceso literal a process.env.EXPO_PUBLIC_* para que Expo lo inyecte.
const useMocks = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';
const host = process.env.EXPO_PUBLIC_API_HOST ?? 'http://2.24.29.189';
const mockServicesEnv = process.env.EXPO_PUBLIC_MOCK_SERVICES ?? '';

const ports: Record<Servicio, number> = { avisos: 30001, talleres: 30002, inscripciones: 30003 };

const mockServices: Servicio[] = useMocks
  ? [...TODOS]
  : mockServicesEnv
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is Servicio => (TODOS as string[]).includes(s));

export const config = {
  useMocks,
  host,
  ports,
  urls: {
    avisos: `${host}:${ports.avisos}`,
    talleres: `${host}:${ports.talleres}`,
    inscripciones: `${host}:${ports.inscripciones}`,
  } as Record<Servicio, string>,
  mockServices,
  timeoutMs: 8000,
};

export function isMocked(s: Servicio): boolean {
  return config.mockServices.includes(s);
}
