export class ApiError extends Error {
  status: number;
  serverMessage?: string;
  body?: unknown;
  context?: 'taller' | 'inscripcion';

  constructor(
    status: number,
    opts: { serverMessage?: string; body?: unknown; context?: 'taller' | 'inscripcion'; message?: string } = {},
  ) {
    super(opts.message ?? opts.serverMessage ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.serverMessage = opts.serverMessage;
    this.body = opts.body;
    this.context = opts.context;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface MensajeUsuario {
  titulo: string;
  texto: string;
  detalle?: string; // error/mensaje del servidor
}

export function esNoEncontrado(err: unknown): boolean {
  return err instanceof ApiError && err.status === 404;
}

export function mensajeDeError(err: unknown): MensajeUsuario {
  if (!(err instanceof ApiError)) {
    return { titulo: 'Algo no salió', texto: 'Intenta de nuevo en un momento.' };
  }
  const detalle = err.serverMessage;
  const base = ((): Omit<MensajeUsuario, 'detalle'> => {
    if (err.status === 0)
      return {
        titulo: 'Sin conexión con el campus',
        texto: 'No pudimos llegar al servidor. Revisa tu internet e intenta de nuevo.',
      };
    if (err.status === 400)
      return { titulo: 'Faltan datos', texto: 'Revisa tu matrícula, tu nombre y el taller, y vuelve a intentarlo.' };
    if (err.status === 404 && err.context === 'taller')
      return { titulo: 'Ese taller no existe', texto: 'Revisa el número del taller o elige uno de la lista.' };
    if (err.status === 409)
      return { titulo: 'Ya estás inscrito', texto: 'Ya tienes lugar en este taller. Lo ves en *Mis inscripciones*.' };
    if (err.status === 503)
      return { titulo: 'Talleres no responde', texto: 'Algo no salió de nuestro lado. Intenta de nuevo en un momento.' };
    if (err.status >= 500)
      return { titulo: 'Algo no salió', texto: 'Ya lo estamos revisando; intenta de nuevo en un momento.' };
    return { titulo: 'Algo no salió', texto: 'Intenta de nuevo en un momento.' };
  })();
  return detalle ? { ...base, detalle } : base;
}

export function mensajeExito(
  taller: { nombre: string; horario: string } | undefined,
  tallerId: number,
): MensajeUsuario {
  const texto = taller ? `Te esperamos en ${taller.nombre}, ${taller.horario}.` : `Te esperamos en Taller #${tallerId}.`;
  return { titulo: '¡Listo, ya estás inscrito!', texto };
}
