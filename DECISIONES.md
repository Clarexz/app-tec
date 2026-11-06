# Decisiones técnicas

Registro de decisiones de CampusConectado y su motivo.

1. **Rutas en `src/app/`** (convención de la plantilla de Expo SDK 58) en lugar de `app/` en la raíz.
2. **Modo mixto por servicio:** `EXPO_PUBLIC_MOCK_SERVICES` permite usar Avisos e Inscripciones reales con Talleres falso, porque Talleres no está desplegado.
3. **Host por defecto `http://2.24.29.189`**, según la documentación del servidor del 2026-11-06.
4. **Formato de Taller asumido `{id, nombre, horario}`** hasta que el Equipo 3 publique su contrato; el código está aislado en `src/api/real.ts`.
5. **Errores:** se lee `error` y se tolera `mensaje`. Si el cuerpo no es JSON (por ejemplo, el 404 HTML de Flask), se usa solo el mensaje amigable.
6. **Timeout de 8 s.** La documentación sugiere unos 5 s, pero Inscripciones espera hasta 3 s a Talleres; 8 s deja margen en redes móviles lentas.
7. **Reintento:** una vez en lecturas; nunca en errores 4xx ni al inscribirse.
8. **El mock guarda las inscripciones en AsyncStorage** para que sobrevivan al recargar la app.
9. **Botón discreto "Enviar sin validar (prueba)"** solo en modo de prueba, para demostrar el 400.
10. **Fuentes desde `@expo-google-fonts`**, una familia por peso, porque Android lo requiere.
11. **Ícono y splash provisionales** (C marfil sobre rosa), generados porque el kit de marca no está en este entorno. Reemplazar con `logo/symbol/app-icon-1024.png` y `symbol-color-1024.png` del kit.
12. **`web.output` "single":** la app es solo para Android; la versión web solo sirve para revisar rápido.
13. **Perfil de EAS `real` adicional:** APK que apunta al servidor real, para la demo.
14. **No hay cancelar inscripción,** porque el servidor no lo ofrece.
15. **Avisos sin detalle:** no existe `GET /avisos/{id}`, así que la app solo usa la lista.
