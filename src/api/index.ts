import { isMocked } from '@/config';
import { ApiError, mensajeDeError, mensajeExito } from './errors';
import { mockApi } from './mock/mockApi';
import { realApi } from './real';
import type { CampusApi } from './services';

const por = (nombre: 'avisos' | 'talleres' | 'inscripciones') => (isMocked(nombre) ? mockApi : realApi);

export const api: CampusApi = {
  salud: (s) => por(s).salud(s),
  avisos: () => por('avisos').avisos(),
  talleres: () => por('talleres').talleres(),
  taller: (id) => por('talleres').taller(id),
  inscribir: (n) => por('inscripciones').inscribir(n),
  inscripciones: (m) => por('inscripciones').inscripciones(m),
};

export { ApiError, mensajeDeError, mensajeExito };
export { esNoEncontrado } from './errors';
export type { MensajeUsuario } from './errors';
export type { CampusApi, SaludResultado } from './services';
