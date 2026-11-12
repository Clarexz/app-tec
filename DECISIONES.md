# Decisiones técnicas

Registro de decisiones de CampusConectado y su motivo.

1. **Rutas en `src/app/`** (convención de la plantilla de Expo SDK 58) en lugar de `app/` en la raíz.
2. ~~**Modo mixto por servicio:** `EXPO_PUBLIC_MOCK_SERVICES` permite usar Avisos e Inscripciones reales con Talleres falso, porque Talleres no está desplegado.~~ Reemplazada por la 17.
3. **Host por defecto `http://2.24.29.189`**, según la documentación del servidor del 2026-11-06.
4. **Formato de Taller asumido `{id, nombre, horario}`** hasta que el Equipo 3 publique su contrato; el código está aislado en `src/api/real.ts`.
5. **Errores:** se lee `error` y se tolera `mensaje`. Si el cuerpo no es JSON (por ejemplo, el 404 HTML de Flask), se usa solo el mensaje amigable.
6. **Timeout de 8 s.** La documentación sugiere unos 5 s, pero Inscripciones espera hasta 3 s a Talleres; 8 s deja margen en redes móviles lentas.
7. **Reintento:** una vez en lecturas; nunca en errores 4xx ni al inscribirse.
8. ~~**El mock guarda las inscripciones en AsyncStorage** para que sobrevivan al recargar la app.~~ Ya no hay mock.
9. ~~**Botón discreto "Enviar sin validar (prueba)"** solo en modo de prueba, para demostrar el 400.~~ Eliminado.
10. **Fuentes desde `@expo-google-fonts`**, una familia por peso, porque Android lo requiere.
11. **Ícono y splash provisionales** (C marfil sobre rosa), generados porque el kit de marca no está en este entorno. Reemplazar con `logo/symbol/app-icon-1024.png` y `symbol-color-1024.png` del kit.
12. **`web.output` "single":** la app es solo para Android; la versión web solo sirve para revisar rápido.
13. ~~**Perfil de EAS `real` adicional.**~~ Todos los perfiles apuntan al servidor real.
14. **No hay cancelar inscripción,** porque el servidor no lo ofrece.
15. **Avisos sin detalle:** no existe `GET /avisos/{id}`, así que la app solo usa la lista.
16. **Releases con Gradle en GitHub Actions** en lugar de EAS, para no depender de una cuenta de Expo ni de créditos. Los perfiles de EAS siguen disponibles.
17. **Sin datos de prueba:** los tres servicios están desplegados; se eliminó `src/api/mock` y las variables `USE_MOCKS`/`MOCK_SERVICES`.
18. **Login local temporal:** no hay servicio de login, así que `src/auth/cuentas.ts` valida contra una lista local. La sesión vive en AsyncStorage y un contexto (`src/auth/sesion.tsx`); cambiar a un login real solo toca `verificarCredenciales`.
19. **Número de control como matrícula:** en la app se dice "No. de control"; al servidor se manda en el campo `matricula`.
20. **Nombre pedido una vez:** la cuenta no trae el nombre, así que se pide al primer inicio de sesión y se guarda con la sesión.
