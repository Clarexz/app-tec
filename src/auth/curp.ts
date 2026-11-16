/**
 * Primeras 4 letras de la CURP a partir del nombre completo, según el
 * Instructivo Normativo para la Asignación de la CURP (RENAPO):
 *
 * 1. Inicial del primer apellido (Ñ → X).
 * 2. Primera vocal interna del primer apellido (si no hay → X).
 * 3. Inicial del segundo apellido (si no hay → X).
 * 4. Inicial del nombre; si hay varios nombres y el primero es María o José
 *    (o sus abreviaturas), se usa el siguiente.
 *
 * Se omiten preposiciones, conjunciones y contracciones (DE, DEL, LA, LOS, Y, MC, VAN…)
 * y, si las 4 letras forman una palabra altisonante del anexo del instructivo,
 * la segunda letra se cambia por X.
 *
 * Limitación: la CURP real la asigna RENAPO y puede tener excepciones que no se
 * pueden deducir del nombre (homónimos, errores de captura, registros antiguos).
 */
export interface NombreAlumno {
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
}

const PARTICULAS = new Set([
  'DA', 'DAS', 'DE', 'DEL', 'DER', 'DI', 'DIE', 'DD', 'EL', 'LA', 'LOS', 'LAS', 'LE', 'LES', 'MAC', 'MC', 'VAN', 'VON', 'Y',
]);
const NOMBRES_COMUNES = new Set(['MARIA', 'MA', 'MA.', 'JOSE', 'J', 'J.']);
const ALTISONANTES = new Set(
  ('BACA BAKA BUEI BUEY CACA CACO CAGA CAGO CAKA CAKO COGE COGI COJA COJE COJI COJO COLA CULO FALO FETO GETA GUEI GUEY ' +
    'JETA JOTO KACA KACO KAGA KAGO KAKA KAKO KOGE KOGI KOJA KOJE KOJI KOJO KOLA KULO LILO LOCA LOCO LOKA LOKO MAME MAMO ' +
    'MEAR MEAS MEON MIAR MION MOCO MOKO MULA MULO NACA NACO PEDA PEDO PENE PIPI PITO POPO PUTA PUTO QULO RATA ROBA ROBE ' +
    'ROBO RUIN SENO TETA VACA VAGA VAGO VAKA VUEI VUEY WUEI WUEY').split(' '),
);
const VOCALES = 'AEIOU';

/** Mayúsculas, sin acentos ni diéresis; la Ñ se conserva para tratarla aparte. */
function normalizar(s: string): string {
  return s
    .toUpperCase()
    .replace(/Ñ/g, '\u0000')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\u0000/g, 'Ñ')
    .replace(/[^A-ZÑ. ]/g, ' ');
}

/** Palabras significativas: sin partículas ("de la Cruz" → ["CRUZ"]). */
function palabras(s: string | undefined): string[] {
  const todas = normalizar(s ?? '').split(/\s+/).filter(Boolean);
  const utiles = todas.filter((p) => !PARTICULAS.has(p));
  return utiles.length ? utiles : todas;
}

const letra = (c: string | undefined) => (!c ? 'X' : c === 'Ñ' ? 'X' : c);

export function letrasCurp({ nombres, primerApellido, segundoApellido }: NombreAlumno): string {
  let ap1 = palabras(primerApellido);
  let ap2 = palabras(segundoApellido);
  // Solo un apellido (capturado en cualquiera de los dos campos): va primero y el tercero es X.
  if (!ap1.length && ap2.length) [ap1, ap2] = [ap2, []];

  let ns = palabras(nombres);
  if (ns.length > 1 && NOMBRES_COMUNES.has(ns[0])) ns = ns.slice(1);

  const a1 = ap1[0] ?? '';
  const vocalInterna = [...a1.slice(1)].find((c) => VOCALES.includes(c));
  let r = letra(a1[0]) + (vocalInterna ?? 'X') + letra(ap2[0]?.[0]) + letra(ns[0]?.[0]);
  if (ALTISONANTES.has(r)) r = r[0] + 'X' + r.slice(2);
  return r;
}

/** "Luis Pérez Gómez" → con nombres, primer y segundo apellido ya separados. */
export function nombreCompleto({ nombres, primerApellido, segundoApellido }: NombreAlumno): string {
  return [nombres, primerApellido, segundoApellido].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}
