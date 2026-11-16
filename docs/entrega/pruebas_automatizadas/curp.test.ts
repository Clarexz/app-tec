// Pruebas de las 4 letras de la CURP (src/auth/curp.ts) y del inicio de sesión con el padrón.
import { letrasCurp } from '@/auth/curp';
import { verificarCredenciales } from '@/auth/cuentas';

const casos: [string, Parameters<typeof letrasCurp>[0], string][] = [
  ['normal', { nombres: 'Luis', primerApellido: 'Pérez', segundoApellido: 'Gómez' }, 'PEGL'],
  ['acentos y Ñ interna', { nombres: 'Sofía', primerApellido: 'Ramos', segundoApellido: 'Treviño' }, 'RATS'],
  ['María + otro nombre', { nombres: 'María Fernanda', primerApellido: 'Hernández', segundoApellido: 'Salinas' }, 'HESF'],
  ['María José', { nombres: 'María José', primerApellido: 'Soto', segundoApellido: 'Ruiz' }, 'SORJ'],
  ['José solo', { nombres: 'José', primerApellido: 'Lara', segundoApellido: 'Ruiz' }, 'LARJ'],
  ['partículas "De la"', { nombres: 'José Ángel', primerApellido: 'De la Garza', segundoApellido: 'Cantú' }, 'GACA'],
  ['partícula "Mc"', { nombres: 'Carlos Eduardo', primerApellido: 'Mc Gregor', segundoApellido: 'Leal' }, 'GELC'],
  ['vocal con diéresis/acento', { nombres: 'Andrea', primerApellido: 'Zúñiga', segundoApellido: 'Ríos' }, 'ZURA'],
  ['Ñ inicial → X', { nombres: 'Ana', primerApellido: 'Ñando', segundoApellido: 'Ruiz' }, 'XARA'],
  ['sin segundo apellido → X', { nombres: 'Valeria', primerApellido: 'Martínez' }, 'MAXV'],
  ['apellido sin vocal interna → X', { nombres: 'Luis', primerApellido: 'Ng', segundoApellido: 'Lee' }, 'NXLL'],
  ['altisonante BUEI → BXEI', { nombres: 'Ignacio', primerApellido: 'Bueno', segundoApellido: 'Estrada' }, 'BXEI'],
  ['vocal inicial (OCHOA: la vocal interna es la 2.ª O)', { nombres: 'Emiliano', primerApellido: 'Ochoa', segundoApellido: 'Ávila' }, 'OOAE'],
];

(async () => {
  let fallas = 0;
  for (const [n, entrada, esperado] of casos) {
    const r = letrasCurp(entrada);
    if (r !== esperado) fallas++;
    console.log(`${r === esperado ? 'OK ' : 'MAL'} ${n}: ${r} (esperado ${esperado})`);
  }
  const login = [
    ['21580001', 'pegl', true], ['21580001', 'PEGX', false], ['21580003', 'HESF', true],
    ['21580007', 'MAXV', true], ['99999999', 'ABCD', false],
    ['21580011', 'HECS', true], ['21580012', 'FOHM', true], ['21580013', 'SOCJ', true], ['21580014', 'AAFA', true],
  ] as const;
  for (const [nc, clave, ok] of login) {
    const r = await verificarCredenciales(nc, clave);
    if (r.ok !== ok) fallas++;
    console.log(`${r.ok === ok ? 'OK ' : 'MAL'} login ${nc}/${clave}: ${JSON.stringify(r)}`);
  }
  console.log(fallas ? `${fallas} FALLAS` : 'Todo correcto');
  process.exit(fallas ? 1 : 0);
})();
