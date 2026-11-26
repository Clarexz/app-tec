# Documentación del Equipo 1 · App e integración

`Documentacion_Equipo1_App_CampusConectado.pdf`: cómo se construyó la app CampusConectado de 0 a 100, por fases, con guion sugerido para la presentación. Mismo formato que el *Manual de usuario* y el *Manual técnico*.

Regenerar el PDF (desde `docs/equipo1/fuentes/`, con Chromium, Playwright, poppler-utils, pypdf y reportlab):

```bash
python3 scripts/build.py documentacion_equipo1.html ../Documentacion_Equipo1_App_CampusConectado.pdf
```

El script calcula las páginas del índice y estampa el logo en el encabezado.
