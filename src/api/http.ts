import { config } from '@/config';
import { ApiError } from './errors';

export interface FetchOpts {
  method?: 'GET' | 'POST';
  body?: unknown;
  context?: 'taller' | 'inscripcion';
}

/** Construye "?a=1&b=2" con encodeURIComponent; omite valores indefinidos. */
export function queryString(params: Record<string, string | number | undefined>): string {
  const partes = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return partes.length ? `?${partes.join('&')}` : '';
}

export async function fetchJson<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const { method = 'GET', body, context } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (method === 'POST') headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    const abortado = e instanceof Error && e.name === 'AbortError';
    throw new ApiError(0, { context, message: abortado ? 'Tiempo de espera agotado' : 'Sin conexión' });
  }

  try {
    const texto = await res.text();
    let json: unknown;
    let esJson = false;
    try {
      json = texto ? JSON.parse(texto) : undefined;
      esJson = texto !== '';
    } catch {
      esJson = false; // p. ej. HTML de Flask
    }

    if (!res.ok) {
      let serverMessage: string | undefined;
      if (esJson && json && typeof json === 'object') {
        const o = json as { error?: unknown; mensaje?: unknown };
        const m = o.error ?? o.mensaje;
        if (typeof m === 'string') serverMessage = m;
      }
      throw new ApiError(res.status, { serverMessage, body: esJson ? json : undefined, context });
    }
    if (!esJson) throw new ApiError(res.status, { context, message: 'Respuesta no válida' });
    return json as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    // Se cortó la lectura del cuerpo (red/timeout)
    throw new ApiError(0, { context, message: 'Sin conexión' });
  } finally {
    clearTimeout(timer);
  }
}
