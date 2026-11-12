import { config } from '@/config';
import type { Aviso, Inscripcion, NuevaInscripcion, Salud, Servicio, Taller } from '@/types/api';
import { fetchJson, queryString } from './http';
import type { CampusApi, SaludResultado } from './services';

export const realApi: CampusApi = {
  async salud(s: Servicio): Promise<SaludResultado> {
    const url = config.urls[s];
    const t0 = Date.now();
    try {
      const r = await fetchJson<Salud>(`${url}/salud`);
      return { servicio: s, ok: r?.estado === 'ok', ms: Date.now() - t0, url };
    } catch (e) {
      return {
        servicio: s,
        ok: false,
        ms: Date.now() - t0,
        url,
        error: e instanceof Error ? e.message : 'Error',
      };
    }
  },
  avisos: () => fetchJson<Aviso[]>(`${config.urls.avisos}/avisos`),
  talleres: () => fetchJson<Taller[]>(`${config.urls.talleres}/talleres`),
  taller: (id) => fetchJson<Taller>(`${config.urls.talleres}/talleres/${encodeURIComponent(String(id))}`, { context: 'taller' }),
  inscribir: (n: NuevaInscripcion) =>
    fetchJson<Inscripcion>(`${config.urls.inscripciones}/inscripciones`, {
      method: 'POST',
      body: n,
      context: 'inscripcion',
    }),
  async inscripciones(matricula) {
    if (!matricula.trim()) return [];
    return fetchJson<Inscripcion[]>(
      `${config.urls.inscripciones}/inscripciones${queryString({ matricula })}`,
    );
  },
};
