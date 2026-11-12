import { ApiError, mensajeDeError, mensajeExito } from './errors';
import { realApi } from './real';
import type { CampusApi } from './services';

export const api: CampusApi = realApi;

export { ApiError, mensajeDeError, mensajeExito };
export { esNoEncontrado } from './errors';
export type { MensajeUsuario } from './errors';
export type { CampusApi, SaludResultado } from './services';
