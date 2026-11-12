# Pruebas automatizadas de la capa de datos

Prueban `src/api` (la misma `fetchJson`, `realApi` y `mensajeDeError` que usa la app) contra **`servidor-local.js`**, una réplica local del contrato de los tres servicios (`docs/Integracion_App_Servidor.md` §2) con datos ficticios. No necesitan celular ni el servidor real.

| Archivo | Qué es |
|---|---|
| `servidor-local.js` | Levanta Avisos (`:30001`), Talleres (`:30002`) e Inscripciones (`:30003`) en `localhost`. Inscripciones consulta a Talleres igual que en el clúster. |
| `integracion.test.ts` | Casos P1–P12, 503, 404 en HTML, timeout y sin red. |
| `asyncstorage-shim.js` | Sustituto en memoria de AsyncStorage para correr en Node. |
| `resultado.txt` | Salida de la última corrida (2026-11-12). |

## Cómo correrlas

Desde la raíz del repo, en una terminal:

```bash
node docs/entrega/pruebas_automatizadas/servidor-local.js
```

En otra terminal, empaqueta las pruebas (resuelve el alias `@/` del `tsconfig.json`):

```bash
npx -y esbuild@0.24.0 docs/entrega/pruebas_automatizadas/integracion.test.ts --bundle --platform=node --tsconfig=tsconfig.json --alias:@react-native-async-storage/async-storage=./docs/entrega/pruebas_automatizadas/asyncstorage-shim.js --outfile=/tmp/integracion.js
```

Y córrelas apuntando a `localhost`:

```bash
EXPO_PUBLIC_API_HOST=http://localhost node /tmp/integracion.js
```

La prueba de timeout tarda unos 8 s (el timeout de la app). Reinicia `servidor-local.js` antes de repetir, porque guarda las inscripciones en memoria.
