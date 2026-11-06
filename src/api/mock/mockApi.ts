import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config';
import type { Inscripcion, NuevaInscripcion, Servicio } from '@/types/api';
import { ApiError } from '../errors';
import type { CampusApi, SaludResultado } from '../services';
import { avisos, inscripcionesIniciales, talleres } from './data';
import { getMockFlags } from './flags';

const CLAVE = 'mock.inscripciones';
let lista: Inscripcion[] | null = null;

async function cargar(): Promise<Inscripcion[]> {
  if (lista) return lista;
  let cargada: Inscripcion[] | null = null;
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    if (raw) {
      const p: unknown = JSON.parse(raw);
      if (Array.isArray(p)) cargada = p as Inscripcion[];
    }
  } catch {
    // se ignora
  }
  if (!lista) lista = cargada ?? [...inscripcionesIniciales];
  return lista;
}

async function guardar(): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    // se ignora
  }
}

const norm = (m: string) => m.trim().toUpperCase();

/** Latencia simulada; devuelve los ms esperados. */
async function latencia(): Promise<number> {
  const ms = getMockFlags().slow ? 3000 : 300 + Math.floor(Math.random() * 500);
  await new Promise<void>((r) => setTimeout(r, ms));
  return ms;
}

async function red(): Promise<number> {
  const ms = await latencia();
  if (getMockFlags().offline) throw new ApiError(0, { message: 'Sin conexión (simulado)' });
  return ms;
}

export const mockApi: CampusApi = {
  async salud(s: Servicio): Promise<SaludResultado> {
    const ms = await latencia();
    const ok = !getMockFlags().offline;
    return { servicio: s, ok, ms, url: config.urls[s], mock: true, ...(ok ? {} : { error: 'Sin conexión (simulado)' }) };
  },
  async avisos() {
    await red();
    return avisos.map((a) => ({ ...a }));
  },
  async talleres() {
    await red();
    return talleres.map((t) => ({ ...t }));
  },
  async taller(id) {
    await red();
    const t = talleres.find((x) => x.id === id);
    if (!t) throw new ApiError(404, { serverMessage: 'El taller especificado no existe', context: 'taller' });
    return { ...t };
  },
  async inscribir(n: NuevaInscripcion) {
    await red();
    if (getMockFlags().fail503)
      throw new ApiError(503, { serverMessage: 'El servicio de talleres no está disponible', context: 'inscripcion' });
    const matricula = norm(String(n.matricula ?? ''));
    const nombre = String(n.nombre ?? '').trim();
    if (!matricula || !nombre || typeof n.taller_id !== 'number' || !Number.isInteger(n.taller_id))
      throw new ApiError(400, { serverMessage: 'Faltan campos obligatorios', context: 'inscripcion' });
    if (!talleres.some((t) => t.id === n.taller_id))
      throw new ApiError(404, { serverMessage: 'El taller especificado no existe', context: 'taller' });
    const datos = await cargar();
    if (datos.some((i) => norm(i.matricula) === matricula && i.taller_id === n.taller_id))
      throw new ApiError(409, {
        serverMessage: 'El alumno ya se encuentra inscrito en este taller',
        context: 'inscripcion',
      });
    const nueva: Inscripcion = {
      id: datos.reduce((m, i) => Math.max(m, i.id), 0) + 1,
      matricula,
      nombre,
      taller_id: n.taller_id,
    };
    datos.push(nueva);
    await guardar();
    return { ...nueva };
  },
  async inscripciones(matricula) {
    await red();
    const m = norm(matricula);
    if (!m) return [];
    const datos = await cargar();
    return datos.filter((i) => norm(i.matricula) === m).map((i) => ({ ...i }));
  },
};
