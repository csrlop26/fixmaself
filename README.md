# 100×100 — Dashboard de entrenamiento

Dashboard personal para seguir la rutina de recomposición corporal (Torso/Pierna x2, 4 días/semana).
Todo el registro de series se guarda **solo en tu navegador** (localStorage) — es una app 100% estática,
sin backend ni cuentas.

## Desarrollo local

```bash
npm install
npm run dev
```

## Desplegar en GitHub Pages (automático)

1. Crea un repositorio en GitHub y sube este proyecto:
   ```bash
   git init
   git add .
   git commit -m "Dashboard inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```
2. En el repositorio en GitHub: **Settings → Pages → Source → GitHub Actions**.
3. El workflow en `.github/workflows/deploy.yml` construye y publica la app automáticamente
   en cada push a `main`. En unos minutos estará en:
   `https://TU_USUARIO.github.io/TU_REPO/`

No necesitas cambiar nada en `vite.config.js` — usa rutas relativas (`base: './'`), así que
funciona sin importar el nombre del repositorio.

## Privacidad

Esta app no está protegida por contraseña — si el repo es público, cualquiera con el enlace
puede ver la interfaz. Pero tus datos personales (series registradas) viven únicamente en el
localStorage de tu propio navegador/dispositivo, nunca se suben a ningún servidor. Si quieres
que ni la interfaz sea visible para nadie, crea el repositorio como **privado** (GitHub Pages en
repos privados requiere GitHub Pro).

## Backup de tus datos

En **Ajustes → Backup de datos** puedes exportar un `.json` con todo tu historial e importarlo
de nuevo (por ejemplo, si cambias de móvil u ordenador, o simplemente quieres una copia de
seguridad).

## Estructura

```
src/
  data/exercises.js      ← biblioteca de ejercicios (nombre, músculo, pro tips, media)
  data/program.js         ← rutina semanal activa (referencias a exercises.js + series/reps/descanso)
  lib/                     ← fechas, estadísticas, motor de progresión, helpers de logs
  hooks/useLocalStorage    ← persistencia
  components/              ← Dashboard, Sesión, Calendario, Progreso, Guía, Ajustes
```

Para cambiar la rutina activa, edita `src/data/program.js`. Para añadir o documentar un
ejercicio nuevo (pro tips, errores comunes, ajuste de máquina, imagen), edita `src/data/exercises.js`.
