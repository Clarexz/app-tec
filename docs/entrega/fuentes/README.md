# Fuentes de los manuales integrados (v1.1)

| Carpeta | Contenido |
|---|---|
| `manual_tecnico/` | HTML del *Manual técnico de servicios e integración* v1.1 con sus figuras (1 y 2 vienen del manual v1.0; la 3 es `flujo_lr.mmd`). |
| `capturas_marcador/` | Marcadores de captura usados en el *Manual de usuario* v1.1. En Word: clic derecho sobre cada uno → **Cambiar imagen** → la captura real con el mismo nombre. |
| `scripts/` | Scripts con que se generaron los documentos. |

Regenerar el manual técnico (desde `docs/entrega/fuentes/`, con Chromium y Playwright disponibles):

```bash
python3 scripts/build_tecnico.py manual_tecnico/manual_tecnico.html /tmp/mt.html /tmp/mt.pdf paginas.json
```

Correrlo dos veces (la primera calcula las páginas del índice) y después estampar el logo del encabezado:

```bash
python3 scripts/logo_stamp.py /tmp/mt.pdf manual_tecnico/logo.png ../Manual_tecnico_servicios_integracion_v1.1.pdf /tmp/stamp.pdf
```

El *Manual de usuario* v1.1 se generó con `scripts/manual_usuario.py` a partir del `.docx` v1.0 del equipo; para cambios menores, edítalo directamente en Word.
