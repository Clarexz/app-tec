/**
 * Verificación de credenciales.
 *
 * TEMPORAL: el servidor todavía no tiene un servicio de login. La contraseña son las
 * 4 primeras letras de la CURP, que se calculan del nombre del alumno en el padrón
 * (`padron.ts`). Cuando exista el servicio escolar, reemplaza solo `verificarCredenciales`
 * (misma firma) por la llamada HTTP; el resto de la app no cambia.
 *
 * Ojo: esas 4 letras se deducen del nombre, así que no son un secreto. Sirven para la demo,
 * no para un sistema real (ver DECISIONES.md).
 */
import { letrasCurp, nombreCompleto } from './curp';
import { buscarAlumno } from './padron';

export interface Cuenta {
  noControl: string;
  /** Nombre completo si el servidor lo conoce; si no, se le pide al alumno la primera vez. */
  nombre?: string;
}

export type ResultadoLogin =
  | { ok: true; cuenta: Cuenta }
  | { ok: false; motivo: 'credenciales' | 'red' };

/** Cuentas sin nombre en el padrón (la contraseña se fija a mano). */
const CUENTAS_FIJAS: { noControl: string; clave: string }[] = [
  { noControl: '22580076', clave: 'MACB' },
];

/** Normaliza el número de control: sin espacios y en mayúsculas. */
export const normNoControl = (s: string) => s.replace(/\s+/g, '').toUpperCase();
/** La contraseña son las 4 letras iniciales de la CURP; no distingue mayúsculas. */
export const normClave = (s: string) => s.trim().toUpperCase();

export async function verificarCredenciales(noControl: string, clave: string): Promise<ResultadoLogin> {
  await new Promise((r) => setTimeout(r, 450)); // simula la latencia de red
  const n = normNoControl(noControl);
  const c = normClave(clave);

  const alumno = await buscarAlumno(n);
  if (alumno) {
    if (letrasCurp(alumno) !== c) return { ok: false, motivo: 'credenciales' };
    return { ok: true, cuenta: { noControl: alumno.noControl, nombre: nombreCompleto(alumno) } };
  }

  const fija = CUENTAS_FIJAS.find((x) => x.noControl === n && x.clave === c);
  if (!fija) return { ok: false, motivo: 'credenciales' };
  return { ok: true, cuenta: { noControl: fija.noControl } };
}
