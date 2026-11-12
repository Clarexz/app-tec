// Réplica local del contrato de los 3 servicios (docs/Integracion_App_Servidor.md §2). Datos ficticios.
const http = require('http');
const json = (res, s, b) => { res.writeHead(s, {'Content-Type':'application/json'}); res.end(JSON.stringify(b)); };
const html404 = (res) => { res.writeHead(404, {'Content-Type':'text/html'}); res.end('<!doctype html><title>404 Not Found</title>'); };
const TALLERES = [
  {id:1,nombre:'Programación en Python',horario:'Lunes y Miércoles 10:00 - 12:00'},
  {id:2,nombre:'Diseño UI/UX Móvil',horario:'Martes y Jueves 14:00 - 16:00'},
  {id:3,nombre:'Fundamentos de Kubernetes y DevOps',horario:'Viernes 08:00 - 12:00'}];
let talleresArriba = true;
http.createServer((q, res) => {
  if (q.url === '/salud') return json(res, 200, {estado:'ok'});
  if (q.url === '/avisos') return json(res, 200, [{id:1,titulo:'Bienvenida',mensaje:'Bienvenidos a CampusConectado.'},{id:2,titulo:'Inicio de talleres',mensaje:'Consulta los horarios.'},{id:3,titulo:'Inscripciones',mensaje:'Ya puedes consultar los talleres.'}]);
  html404(res);
}).listen(30001);
const srvT = http.createServer((q, res) => {
  if (!talleresArriba) { q.socket.destroy(); return; }
  if (q.url === '/salud') return json(res, 200, {estado:'ok'});
  if (q.url === '/talleres') return json(res, 200, TALLERES);
  const m = q.url.match(/^\/talleres\/(\d+)$/);
  if (m) { const t = TALLERES.find(x => x.id === +m[1]); return t ? json(res, 200, t) : json(res, 404, {error:'Taller no encontrado', id_solicitado:+m[1]}); }
  html404(res);
}).listen(30002);
const ins = [];
http.createServer((q, res) => {
  let b=''; q.on('data', c => b+=c); q.on('end', async () => {
    if (q.url === '/salud') return json(res, 200, {estado:'ok'});
    if (q.url === '/__talleres_abajo') { talleresArriba = false; return json(res, 200, {}); }
    if (q.url === '/__talleres_arriba') { talleresArriba = true; return json(res, 200, {}); }
    if (q.method === 'POST' && q.url === '/inscripciones') {
      if (!(q.headers['content-type']||'').includes('application/json')) return json(res, 400, {error:'Faltan campos obligatorios'});
      let d; try { d = JSON.parse(b); } catch { return json(res, 400, {error:'Faltan campos obligatorios'}); }
      if (!('matricula' in d) || !('nombre' in d) || !('taller_id' in d)) return json(res, 400, {error:'Faltan campos obligatorios'});
      if (d.taller_id === 777) return setTimeout(() => json(res, 201, {}), 10000); // para probar el timeout de la app
      let st;
      try { const ctl = new AbortController(); setTimeout(() => ctl.abort(), 3000);
        st = (await fetch(`http://localhost:30002/talleres/${d.taller_id}`, {signal: ctl.signal})).status; }
      catch { return json(res, 503, {error:'El servicio de talleres no está disponible'}); }
      if (st === 404) return json(res, 404, {error:'El taller especificado no existe'});
      if (st !== 200) return json(res, 503, {error:'Error al comunicarse con el servicio de talleres'});
      if (ins.some(i => i.matricula === d.matricula && i.taller_id === d.taller_id)) return json(res, 409, {error:'El alumno ya se encuentra inscrito en este taller'});
      const n = {id: ins.length+1, matricula:d.matricula, nombre:d.nombre, taller_id:d.taller_id}; ins.push(n); return json(res, 201, n);
    }
    if (q.url.startsWith('/inscripciones')) {
      const u = new URL(q.url, 'http://x'); const m = u.searchParams.get('matricula');
      if (m === null) return json(res, 400, {error:'Se requiere el parámetro matricula'});
      return json(res, 200, ins.filter(i => i.matricula === m));
    }
    html404(res);
  });
}).listen(30003);
