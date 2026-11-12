import type { Aviso, Inscripcion, NuevaInscripcion, Servicio, Taller } from '@/types/api';

export interface SaludResultado {
  servicio: Servicio;
  ok: boolean;
  ms: number;
  url: string;
  error?: string;
}

export interface CampusApi {
  salud(s: Servicio): Promise<SaludResultado>; // nunca lanza
  avisos(): Promise<Aviso[]>;
  talleres(): Promise<Taller[]>;
  taller(id: number): Promise<Taller>; // 404 → ApiError(404)
  inscribir(n: NuevaInscripcion): Promise<Inscripcion>; // 400/404/409/503/0
  inscripciones(matricula: string): Promise<Inscripcion[]>;
}
