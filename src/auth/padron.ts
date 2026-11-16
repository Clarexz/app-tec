import type { NombreAlumno } from './curp';

/**
 * Padrón de alumnos (datos ficticios).
 *
 * TEMPORAL: representa lo que devolvería el servicio escolar de alumnos, que aún no existe.
 * Cuando exista, reemplaza solo `buscarAlumno` por la llamada HTTP (por ejemplo
 * `GET /alumnos/{noControl}` → `{ noControl, nombres, primerApellido, segundoApellido }`).
 * El resto del inicio de sesión no cambia.
 *
 * Los apellidos van separados del nombre porque la CURP los trata distinto y un nombre
 * completo en una sola cadena es ambiguo ("María José Luna" ¿es nombre compuesto o apellido?).
 */
export interface Alumno extends NombreAlumno {
  noControl: string;
}

const ALUMNOS: Alumno[] = [
  { noControl: '21580001', nombres: 'Luis', primerApellido: 'Pérez', segundoApellido: 'Gómez' },
  { noControl: '21580002', nombres: 'Sofía', primerApellido: 'Ramos', segundoApellido: 'Treviño' },
  { noControl: '21580003', nombres: 'María Fernanda', primerApellido: 'Hernández', segundoApellido: 'Salinas' },
  { noControl: '21580004', nombres: 'José Ángel', primerApellido: 'De la Garza', segundoApellido: 'Cantú' },
  { noControl: '21580005', nombres: 'Ximena', primerApellido: 'Núñez', segundoApellido: 'Villarreal' },
  { noControl: '21580006', nombres: 'Diego', primerApellido: 'Ibarra', segundoApellido: 'Ochoa' },
  { noControl: '21580007', nombres: 'Valeria', primerApellido: 'Martínez' },
  { noControl: '21580008', nombres: 'Carlos Eduardo', primerApellido: 'Mc Gregor', segundoApellido: 'Leal' },
  { noControl: '21580009', nombres: 'Andrea', primerApellido: 'Zúñiga', segundoApellido: 'Ríos' },
  { noControl: '21580010', nombres: 'Emiliano', primerApellido: 'Ochoa', segundoApellido: 'Ávila' },
];

export async function buscarAlumno(noControl: string): Promise<Alumno | null> {
  return ALUMNOS.find((a) => a.noControl === noControl) ?? null;
}
