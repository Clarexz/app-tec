/**
 * Verificación de credenciales.
 *
 * TEMPORAL: el servidor todavía no tiene un servicio de login, así que se valida
 * contra esta lista local. Cuando exista el endpoint, reemplaza solo `verificarCredenciales`
 * (misma firma) por la llamada HTTP; el resto de la app no cambia.
 */
export interface Cuenta {
  noControl: string;
  /** Nombre completo si el servidor lo conoce; si no, se le pide al alumno la primera vez. */
  nombre?: string;
}

export type ResultadoLogin =
  | { ok: true; cuenta: Cuenta }
  | { ok: false; motivo: 'credenciales' | 'red' };

const CUENTAS: { noControl: string; clave: string; nombre?: string }[] = [
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
  const cuenta = CUENTAS.find((x) => x.noControl === n && x.clave === c);
  if (!cuenta) return { ok: false, motivo: 'credenciales' };
  return { ok: true, cuenta: { noControl: cuenta.noControl, nombre: cuenta.nombre } };
}
