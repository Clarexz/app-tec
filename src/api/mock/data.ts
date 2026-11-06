import type { Aviso, Inscripcion, Taller } from '@/types/api';

export const avisos: Aviso[] = [
  { id: 1, titulo: 'Bienvenida', mensaje: 'Inician los talleres de este semestre. ¡Inscríbete desde la app!' },
  { id: 2, titulo: 'Cambio de aula', mensaje: 'El taller de Robótica ahora será en el Laboratorio 3.' },
  { id: 3, titulo: 'Semana de la ciencia', mensaje: 'Del 17 al 21 de noviembre habrá conferencias en el auditorio.' },
  { id: 4, titulo: 'Credencial', mensaje: 'Recoge tu credencial en Servicios Escolares de 9:00 a 14:00.' },
];

export const talleres: Taller[] = [
  { id: 1, nombre: 'Programación en Python', horario: 'Lunes y miércoles 16:00–18:00' },
  { id: 2, nombre: 'Robótica básica', horario: 'Martes y jueves 15:00–17:00' },
  { id: 3, nombre: 'Fotografía con celular', horario: 'Viernes 12:00–14:00' },
  { id: 4, nombre: 'Inglés conversacional', horario: 'Sábados 9:00–11:00' },
  { id: 5, nombre: 'Ajedrez', horario: 'Miércoles 13:00–15:00' },
];

export const inscripcionesIniciales: Inscripcion[] = [{ id: 1, matricula: 'A001', nombre: 'Ana', taller_id: 1 }];
