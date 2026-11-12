// Pruebas de la capa de datos de la app (src/api) contra servidor-local.js. Ver README.md de esta carpeta.
import { realApi as api } from '@/api/real';
import { mensajeDeError, mensajeExito, ApiError } from '@/api/errors';
import { config } from '@/config';
const r: string[] = [];
const fmt = (e: unknown, t0: number) => { const m = mensajeDeError(e); return `status ${(e as ApiError).status} → "${m.titulo}" / "${m.texto}"${m.detalle ? ` | detalle: ${m.detalle}` : ''} (${Date.now()-t0} ms)`; };
async function caso(n: string, f: () => Promise<unknown>) {
  const t0 = Date.now();
  try { const v = await f(); r.push(`${n} => OK ${typeof v === 'string' ? v : JSON.stringify(v)}`); }
  catch (e) { r.push(`${n} => ${fmt(e, t0)}`); }
}
(async () => {
  r.push(`urls=${JSON.stringify(config.urls)} timeoutMs=${config.timeoutMs}`);
  await caso('P1 avisos', async () => (await api.avisos()).map(a => a.titulo).join(', '));
  await caso('P2 talleres', async () => (await api.talleres()).map(t => `#${t.id} ${t.nombre} (${t.horario})`).join(' | '));
  await caso('P3 taller 1', async () => (await api.taller(1)).nombre);
  await caso('P4 taller 999', () => api.taller(999));
  await caso('P5 inscribir 21580001 / Luis Pérez / taller 2', async () => { const i = await api.inscribir({ matricula: '21580001', nombre: 'Luis Pérez', taller_id: 2 }); return `${JSON.stringify(i)} → ${mensajeExito((await api.talleres()).find(t => t.id === i.taller_id), i.taller_id).texto}`; });
  await caso('P6 repetir', () => api.inscribir({ matricula: '21580001', nombre: 'Luis Pérez', taller_id: 2 }));
  await caso('P7 taller 999 al inscribir', () => api.inscribir({ matricula: '21580001', nombre: 'Luis Pérez', taller_id: 999 }));
  await caso('P8 400 servidor (cuerpo sin llaves)', () => api.inscribir({} as never));
  await caso('P9 mis inscripciones 21580001', () => api.inscripciones('21580001'));
  await caso('P10 mis inscripciones 99999999', () => api.inscripciones('99999999'));
  await caso('P12 salud', async () => (await Promise.all((['avisos','talleres','inscripciones'] as const).map(s => api.salud(s)))).map(s => `${s.servicio}:${s.ok ? 'En línea' : 'Sin respuesta'}:${s.ms}ms`).join(' '));
  await fetch('http://localhost:30003/__talleres_abajo');
  await caso('P503 talleres caído → inscribir', () => api.inscribir({ matricula: '21580002', nombre: 'Sofía Ramos', taller_id: 1 }));
  await caso('P503b salud talleres caído', async () => JSON.stringify(await api.salud('talleres')));
  await fetch('http://localhost:30003/__talleres_arriba');
  await caso('P404html ruta inexistente avisos (HTML)', () => import('@/api/http').then(h => h.fetchJson(`${config.urls.avisos}/avisos/1`)));
  await caso('PTO timeout (servidor tarda 10 s)', () => api.inscribir({ matricula: '21580003', nombre: 'Dani Ruiz', taller_id: 777 }));
  await caso('PRED puerto sin servicio', () => import('@/api/http').then(h => h.fetchJson('http://localhost:39999/avisos')));
  console.log(r.join('\n'));
})();
