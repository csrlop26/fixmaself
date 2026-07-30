# Diseño — Rediseño Fixmaself (gym-dashboard)

Fecha: 2026-07-30

## Contexto

Proyecto existente (`gym-dashboard`, dominio `fixmaself`) ya cubre lo básico: rutina fija hardcoded, registro de series en localStorage, vistas de Dashboard/Sesión/Progreso/Guía/Ajustes, stack React 19 + Vite + Tailwind 4 + Recharts, desplegado como static site en GitHub Pages vía Actions.

Objetivo de este rediseño: convertir la app en una guía completa de entrenamiento personal — rutina semanal personalizada, calentamiento/estiramientos, guía visual de ejercicios con pro tips y ajuste de máquinas, calendario de asistencia, seguimiento detallado de progreso (pesos, reps, volumen, PRs, racha, peso corporal), y motor de progresión que sugiere cuándo subir peso.

## Alcance y restricciones de arquitectura

- **Uso exclusivamente personal**, sin login ni multi-usuario.
- **Un solo dispositivo** (móvil, en el gym) — no se requiere sincronización entre dispositivos.
- **Persistencia**: localStorage + export/import JSON manual como backup. No se introduce backend ni base de datos en la nube.
- Se mantiene el stack actual (React/Vite/Tailwind/Recharts) y el despliegue estático en GitHub Pages.
- Editor de rutina **no** se construye dentro de la app: la rutina personalizada se define con investigación (fase 2, fuera de este spec) y vive en código; se revisa/actualiza junto con el usuario cuando toque cambiar de mesociclo.

## Decisiones de arquitectura

### 1. Biblioteca de ejercicios desacoplada del programa semanal

Se separan dos ficheros de datos en vez de mantener un único `routine.js` monolítico:

- **`src/data/exercises.js`** — biblioteca de ejercicios, independiente de qué semana/mesociclo esté activo:
  ```js
  {
    id, name, muscle, equipment, mediaUrl, mediaType: 'gif' | 'image',
    proTips: [],          // consejos técnicos
    commonMistakes: [],   // errores frecuentes
    machineSetup: "",     // cómo ajustar la máquina (altura, respaldo, etc.)
    isTime,                // ejercicio isométrico (por tiempo, no reps)
    perSide,               // ejercicio unilateral
  }
  ```

- **`src/data/program.js`** — rutina semanal activa, solo referencia ejercicios por id:
  ```js
  {
    mesocycleId, startDate,
    days: [
      {
        id, label, weekday,
        warmup: [{ name, reps }],     // específico por tipo de día
        cooldown: [{ name, reps }],   // estiramientos de cierre, específico por tipo de día
        exercises: [{ exerciseId, sets, repsLow, repsHigh, rest, order }],
      },
    ],
  }
  ```

Justificación: un ejercicio se documenta (tips, imagen, ajuste de máquina) una única vez aunque aparezca en varios días o sobreviva a varios mesociclos. Cambiar de rutina no obliga a reescribir contenido de guía.

### 2. Motor de estadísticas basado en logs crudos, sin agregados persistidos

Toda métrica derivada (volumen, PRs, rachas, 1RM estimado, tonelaje) se calcula on-the-fly a partir de logs crudos, vía funciones en `lib/stats.js`. No se guardan tablas agregadas aparte. Para un dataset de un solo usuario esto nunca alcanza volumen que justifique pre-agregación, y evita bugs de sincronización entre datos crudos y agregados.

## Modelo de datos (localStorage)

```js
// gd-logs
{
  sessions: {
    [dateISO]: {
      dayId,                 // referencia a program.js days[].id
      status: 'trained' | 'rest' | 'missed',
      sets: [{ exerciseId, weight, reps, rir, setNumber }], // vacío si status !== 'trained'
      durationMin,
      note,
    },
  },
  bodyweight: [{ date: dateISO, kg }],
}
```

`status` permite tanto el auto-registro (al completar sesión se marca `trained`) como el marcado manual (usuario marca `rest`/`missed`/`trained` sin pasar por el flujo de sesión).

## Funcionalidad por vista

### Dashboard
- Próxima sesión programada (según `program.js` + fecha actual).
- Racha actual de días entrenados.
- Mini-calendario del mes con estado de asistencia.
- Aviso cuando toca semana de deload (`DELOAD_EVERY_WEEKS`).

### Calendario (nuevo)
- Vista mensual, cada día coloreado según `status` (entrenado / descanso planificado / perdido / marcado manual).
- Click en un día → detalle de esa sesión o formulario de marcado manual.

### Sesión
- Lista de ejercicios del día activo con:
  - Sugerencia de peso (motor de progresión, ver abajo).
  - Input de peso/reps/RIR por serie.
  - Temporizador de descanso (`rest` del ejercicio).
  - Acceso directo a la guía del ejercicio (imagen/gif + pro tips) sin salir de la sesión.
- Al completar la sesión, se guarda en `gd-logs.sessions[fecha]` con `status: 'trained'` (auto-registro en calendario).

### Guía (ampliada)
- Biblioteca completa de `exercises.js`, filtrable por músculo/equipo.
- Por ejercicio: imagen o gif, pro tips, errores comunes, ajuste de máquina.
- Independiente del programa activo — sirve de referencia general, no solo de "lo que toca hoy".

### Progreso
Pestañas:
1. **Volumen por músculo/semana** vs rango objetivo (`MUSCLES.target`).
2. **PRs por ejercicio** — marca automática al superar peso o reps máximos previos.
3. **Racha y adherencia** — % de sesiones completadas vs planificadas en el mes, racha de días seguidos.
4. **Peso corporal en el tiempo** — gráfica sobre `bodyweight[]`, input manual periódico.
5. **Extra** (perfil stats-heavy confirmado por usuario):
   - 1RM estimado por ejercicio (fórmula Epley) con tendencia en el tiempo.
   - Tonelaje total acumulado (peso × reps × series) por semana/mes.
   - RIR promedio por sesión, como proxy de fatiga real vs planificada.
   - Heatmap semanal de consistencia.

### Ajustes
- Perfil (peso/altura/edad).
- Nutrición básica mantenida tal cual existe hoy (rangos TDEE/macros vía `NUTRITION`), sin registro diario de comidas.
- Backup: export/import JSON de `gd-logs` y `gd-settings`.
- Gestión de mesociclo activo (referencia a `program.js`).

## Motor de progresión (`src/lib/progression.js`, nuevo)

Dado el historial de la última sesión de un ejercicio:
- Si la última serie alcanzó `repsHigh` con RIR ≤ 2 → sugerir subir peso 2.5–5%.
- Si no alcanzó `repsLow` en dos sesiones seguidas → sugerir mantener o bajar peso.
- Reglas basadas en `PROGRESSION_NOTES` ya existentes (doble progresión, RIR objetivo, deload cada `DELOAD_EVERY_WEEKS` semanas).
- Deload se señaliza automáticamente en Dashboard cuando toca.

## Plan de contenido — biblioteca de ejercicios

1. Mapear cada ejercicio del programa personalizado (definido en fase 2) contra un banco público abierto (free-exercise-db en GitHub, wger) por nombre/equipo, para reutilizar imágenes/gifs libres.
2. Ejercicios sin match o con estilo visual inconsistente → generar con Gemini usando un prompt base fijo (ángulo, fondo, estilo) para mantener estética uniforme entre todos los ejercicios.
3. Assets servidos estáticos en `public/exercises/{exerciseId}.gif` o `.webp`, referenciados desde `exercises.js` por `mediaUrl`.

## Fuera de alcance (v1)

- Multi-usuario / login.
- Sincronización entre dispositivos / backend en la nube.
- Registro nutricional diario o ajuste dinámico de macros.
- Editor de rutina dentro de la app (constructor visual de días/ejercicios).

## Fase 2 (spec/plan separado, posterior a este)

Recopilar información personal completa del usuario (antropometría, lesiones/molestias — ya se conoce una molestia lumbar postural en los datos actuales —, experiencia previa de entrenamiento, equipo disponible en su gym real, horario, objetivos concretos de recomposición) e investigar para escribir el contenido real de `program.js` y completar `exercises.js`. Es trabajo de contenido/investigación, no de arquitectura de software, y se aborda con su propio spec e implementación una vez cerrada la base técnica de este documento.
