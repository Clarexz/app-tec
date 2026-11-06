export interface Salud { estado: 'ok' }

export interface Aviso {
  id: number;
  titulo: string;
  mensaje: string;
}

export interface Taller {
  id: number;
  nombre: string;
  horario: string;
}

export interface Inscripcion {
  id: number;
  matricula: string;
  nombre: string;
  taller_id: number;
}

export interface NuevaInscripcion {
  matricula: string;
  nombre: string;
  taller_id: number;
}

/** Formato de error del servidor: {"error": "..."} (se tolera {"mensaje": "..."} o cuerpo vacío). */
export interface ErrorApi { error?: string; mensaje?: string }

export type Servicio = 'avisos' | 'talleres' | 'inscripciones';
