# Gym App Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `gym-dashboard` (Fixmaself) data layer and features per `docs/superpowers/specs/2026-07-30-gym-app-redesign-design.md`: decoupled exercise library, weekly program, calendar/attendance, expanded progress stats, and a progression-suggestion engine — all still static/localStorage-only.

**Architecture:** Split `src/data/routine.js` into `src/data/exercises.js` (exercise library: how to do it) and `src/data/program.js` (weekly program: how much/when). Replace the flat `gd-logs` shape with `{ sessions: {}, bodyweight: [] }`, accessed only through new pure helpers in `src/lib/logs.js`. Stats (`src/lib/stats.js`) and a new progression engine (`src/lib/progression.js`) are pure functions over that shape, unit-tested with Vitest. UI components are updated to match; verification for UI is manual in the dev server (no component test framework exists in this repo today, and adding one is out of scope for a personal single-user app).

**Tech Stack:** React 19, Vite 8, Tailwind 4, Recharts 3, Vitest (new, for `src/lib/*.js` only).

**Important sequencing note:** Tasks 1–6 are additive (new files only, nothing removed) — the app keeps building and running throughout. Tasks 7–15 cut over `App.jsx` and every component from the old `routine.js`/flat-logs shape to the new one; the app will not build correctly until Task 15 (old `routine.js` deletion) is complete — this is expected mid-refactor breakage, not a bug. Task 16 is the full green-build/manual-QA checkpoint.

Content note: this plan migrates the **existing** 100×100 routine content into the new structure — it does not write the researched, fully personalized routine. That is Fase 2 (separate spec/plan) once the user's full personal data is collected. `proTips`/`commonMistakes`/`machineSetup`/`mediaUrl` fields are scaffolded now and populated later; where the current codebase already has a `note` per exercise, that note is migrated into `proTips` so no existing content is lost.

---

## Task 1: Add Vitest test tooling

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Install Vitest as a dev dependency**

Run: `npm install -D vitest`

- [ ] **Step 2: Add a `test` script**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

Full scripts block becomes:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "oxlint",
  "preview": "vite preview",
  "test": "vitest run"
},
```

- [ ] **Step 3: Point Vitest at the existing Vite config**

`vite.config.js` becomes:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 4: Verify Vitest runs with zero tests**

Run: `npm run test`
Expected: exits 0, reports "No test files found" (no `*.test.js` files exist yet — that's expected, later tasks add them).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.js
git commit -m "chore: add vitest for lib unit tests"
```

---

## Task 2: Exercise library data (`src/data/exercises.js`)

**Files:**
- Create: `src/data/exercises.js`
- Read (for migration source, do not modify yet): `src/data/routine.js`

- [ ] **Step 1: Create the exercise library**

Every exercise currently in `routine.js` `DAYS[].exercises[]` becomes one entry here, keyed by its existing `id`. `note` (if present) becomes the first (and for now, only) entry of `proTips`. `commonMistakes` and `machineSetup` start empty; `mediaUrl`/`mediaType` start `null` — populated in the content pass (plan for exercise media, tracked separately, not part of this implementation plan).

Create `src/data/exercises.js`:

```js
// Biblioteca de ejercicios — independiente del programa semanal activo.
// mediaUrl/mediaType, commonMistakes y machineSetup se completan en el
// pase de contenido (banco público + Gemini), ver spec "Plan de contenido".

export const EXERCISES = {
  "ta-1": {
    id: "ta-1",
    name: "Press banca (máquina o mancuernas)",
    muscle: "pecho",
    equipment: "máquina o mancuernas",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Controla la fase excéntrica, 2-3 s de bajada."],
    commonMistakes: [],
    machineSetup: "",
  },
  "ta-2": {
    id: "ta-2",
    name: "Press militar sentado con respaldo",
    muscle: "hombro",
    equipment: "mancuernas o máquina con respaldo",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Nunca detrás de la nuca. Usa mancuernas o máquina con respaldo."],
    commonMistakes: [],
    machineSetup: "",
  },
  "ta-3": {
    id: "ta-3",
    name: "Remo en máquina (pecho apoyado)",
    muscle: "espalda",
    equipment: "máquina",
    mediaUrl: null,
    mediaType: null,
    proTips: ["El apoyo del pecho protege la lumbar por completo."],
    commonMistakes: [],
    machineSetup: "",
  },
  "ta-4": {
    id: "ta-4",
    name: "Elevaciones laterales",
    muscle: "hombro",
    equipment: "mancuernas",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Codo ligeramente flexionado, sin impulso."],
    commonMistakes: [],
    machineSetup: "",
  },
  "ta-5": {
    id: "ta-5",
    name: "Extensión de tríceps en polea",
    muscle: "triceps",
    equipment: "polea",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Codos fijos junto al cuerpo."],
    commonMistakes: [],
    machineSetup: "",
  },
  "ta-6": {
    id: "ta-6",
    name: "Plancha frontal",
    muscle: "core",
    equipment: "peso corporal",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Isométrico. No dejes caer la cadera — línea recta de hombro a talón."],
    commonMistakes: [],
    machineSetup: "",
    isTime: true,
  },
  "pa-1": {
    id: "pa-1",
    name: "Prensa de piernas (leg press)",
    muscle: "cuadriceps",
    equipment: "máquina",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Sustituto seguro de la sentadilla libre al inicio: la máquina soporta tu espalda."],
    commonMistakes: [],
    machineSetup: "",
  },
  "pa-2": {
    id: "pa-2",
    name: "Sentadilla goblet (peso ligero) o hack squat",
    muscle: "cuadriceps",
    equipment: "mancuerna o máquina hack squat",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Rango cómodo, nunca fuerces la profundidad si duele."],
    commonMistakes: [],
    machineSetup: "",
  },
  "pa-3": {
    id: "pa-3",
    name: "Extensión de cuádriceps en máquina",
    muscle: "cuadriceps",
    equipment: "máquina",
    mediaUrl: null,
    mediaType: null,
    proTips: [],
    commonMistakes: [],
    machineSetup: "",
  },
  "pa-4": {
    id: "pa-4",
    name: "Curl femoral (tumbado o sentado)",
    muscle: "posterior",
    equipment: "máquina",
    mediaUrl: null,
    mediaType: null,
    proTips: [],
    commonMistakes: [],
    machineSetup: "",
  },
  "pa-5": {
    id: "pa-5",
    name: "Elevación de talones (gemelo)",
    muscle: "gemelo",
    equipment: "máquina o step",
    mediaUrl: null,
    mediaType: null,
    proTips: [],
    commonMistakes: [],
    machineSetup: "",
  },
  "pa-6": {
    id: "pa-6",
    name: "Dead bug",
    muscle: "core",
    equipment: "peso corporal",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Core anti-extensión. La lumbar no se mueve del suelo."],
    commonMistakes: [],
    machineSetup: "",
    perSide: true,
  },
  "tb-1": {
    id: "tb-1",
    name: "Jalón al pecho (lat pulldown)",
    muscle: "espalda",
    equipment: "polea alta",
    mediaUrl: null,
    mediaType: null,
    proTips: [],
    commonMistakes: [],
    machineSetup: "",
  },
  "tb-2": {
    id: "tb-2",
    name: "Remo horizontal en polea baja",
    muscle: "espalda",
    equipment: "polea baja",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Espalda neutra, sin redondear la zona lumbar."],
    commonMistakes: [],
    machineSetup: "",
  },
  "tb-3": {
    id: "tb-3",
    name: "Press inclinado con mancuernas",
    muscle: "pecho",
    equipment: "mancuernas, banco inclinado",
    mediaUrl: null,
    mediaType: null,
    proTips: [],
    commonMistakes: [],
    machineSetup: "",
  },
  "tb-4": {
    id: "tb-4",
    name: "Face pull en polea",
    muscle: "hombro",
    equipment: "polea con cuerda",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Clave para la salud del hombro a largo plazo."],
    commonMistakes: [],
    machineSetup: "",
  },
  "tb-5": {
    id: "tb-5",
    name: "Curl de bíceps con mancuernas",
    muscle: "biceps",
    equipment: "mancuernas",
    mediaUrl: null,
    mediaType: null,
    proTips: [],
    commonMistakes: [],
    machineSetup: "",
  },
  "tb-6": {
    id: "tb-6",
    name: "Pallof press (anti-rotación, polea)",
    muscle: "core",
    equipment: "polea",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Core anti-rotación."],
    commonMistakes: [],
    machineSetup: "",
    perSide: true,
  },
  "pb-1": {
    id: "pb-1",
    name: "Hip thrust (máquina o barra apoyada)",
    muscle: "posterior",
    equipment: "máquina o barra + banco",
    mediaUrl: null,
    mediaType: null,
    proTips: ["El mejor ejercicio de cadena posterior sin estrés lumbar."],
    commonMistakes: [],
    machineSetup: "",
  },
  "pb-2": {
    id: "pb-2",
    name: "Peso muerto rumano con mancuernas ligeras",
    muscle: "posterior",
    equipment: "mancuernas",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Mancuernas cerca del cuerpo. Rango parcial al inicio si notas tensión."],
    commonMistakes: [],
    machineSetup: "",
  },
  "pb-3": {
    id: "pb-3",
    name: "Zancadas o step-up",
    muscle: "cuadriceps",
    equipment: "mancuernas o step",
    mediaUrl: null,
    mediaType: null,
    proTips: [],
    commonMistakes: [],
    machineSetup: "",
    perSide: true,
  },
  "pb-4": {
    id: "pb-4",
    name: "Curl femoral",
    muscle: "posterior",
    equipment: "máquina",
    mediaUrl: null,
    mediaType: null,
    proTips: [],
    commonMistakes: [],
    machineSetup: "",
  },
  "pb-5": {
    id: "pb-5",
    name: "Abducción de cadera en máquina",
    muscle: "posterior",
    equipment: "máquina",
    mediaUrl: null,
    mediaType: null,
    proTips: ["Más estabilidad de cadera = menos compensación lumbar."],
    commonMistakes: [],
    machineSetup: "",
  },
  "pb-6": {
    id: "pb-6",
    name: "Bird dog",
    muscle: "core",
    equipment: "peso corporal",
    mediaUrl: null,
    mediaType: null,
    proTips: [],
    commonMistakes: [],
    machineSetup: "",
    perSide: true,
  },
};

export const MUSCLES = {
  pecho: { label: "Pecho", target: [6, 14] },
  espalda: { label: "Espalda", target: [8, 16] },
  hombro: { label: "Hombro", target: [6, 12] },
  triceps: { label: "Tríceps", target: [4, 10] },
  biceps: { label: "Bíceps", target: [4, 10] },
  cuadriceps: { label: "Cuádriceps", target: [8, 14] },
  posterior: { label: "Posterior (glúteo/isquio)", target: [8, 14] },
  gemelo: { label: "Gemelo", target: [3, 8] },
  core: { label: "Core", target: [6, 12] },
};
```

- [ ] **Step 2: No test for this task** — it's static data, not logic. Verified by Task 3's smoke check and Task 7+ integration.

- [ ] **Step 3: Commit**

```bash
git add src/data/exercises.js
git commit -m "feat: add decoupled exercise library data"
```

---

## Task 3: Weekly program data (`src/data/program.js`)

**Files:**
- Create: `src/data/program.js`

- [ ] **Step 1: Create the program file**

Warmup/cooldown are now per day-type (torso vs pierna) instead of one global list, per spec. Torso warmup targets shoulder/scapular mobility; pierna warmup keeps the existing lumbar-safe hip/core activation (already appropriate for leg days). Cooldown stretches are new, targeting the muscles trained that day.

Create `src/data/program.js`:

```js
// Programa semanal activo — referencia ejercicios de exercises.js por id.
// Contenido migrado 1:1 desde el routine.js anterior (mismo mesociclo
// "100x100"). La rutina personalizada e investigada llega en Fase 2.

const TORSO_WARMUP = [
  { name: "Círculos de brazos", reps: "x10 cada sentido" },
  { name: "Cat-cow", reps: "x10" },
  { name: "Band pull-apart o rotación externa con banda", reps: "x15" },
  { name: "Push-up con retracción escapular (flexión de pared)", reps: "x10" },
];

const TORSO_COOLDOWN = [
  { name: "Estiramiento de pectoral en marco de puerta", reps: "30s por lado" },
  { name: "Estiramiento de dorsal (child's pose lateral)", reps: "30s por lado" },
  { name: "Estiramiento cruzado de hombro", reps: "30s por lado" },
];

const PIERNA_WARMUP = [
  { name: "Cat-cow", reps: "x10" },
  { name: "Dead bug", reps: "x8 por lado" },
  { name: "Bird dog", reps: "x8 por lado" },
  { name: "Puente de glúteo", reps: "x12" },
  { name: "Movilidad de cadera (90/90)", reps: "x5 por lado" },
];

const PIERNA_COOLDOWN = [
  { name: "Estiramiento de cuádriceps de pie", reps: "30s por lado" },
  { name: "Estiramiento de isquiotibial sentado", reps: "30s por lado" },
  { name: "Estiramiento de flexor de cadera (zancada baja)", reps: "30s por lado" },
];

export const PROGRAM = {
  mesocycleId: "100x100-v1",
  days: [
    {
      id: "torsoA",
      label: "Torso A",
      subtitle: "Empuje dominante",
      weekday: 1, // lunes
      warmup: TORSO_WARMUP,
      cooldown: TORSO_COOLDOWN,
      exercises: [
        { exerciseId: "ta-1", order: 1, sets: 3, repsLow: 8, repsHigh: 10, rest: 90 },
        { exerciseId: "ta-2", order: 2, sets: 3, repsLow: 8, repsHigh: 10, rest: 90 },
        { exerciseId: "ta-3", order: 3, sets: 3, repsLow: 10, repsHigh: 12, rest: 90 },
        { exerciseId: "ta-4", order: 4, sets: 3, repsLow: 12, repsHigh: 15, rest: 60 },
        { exerciseId: "ta-5", order: 5, sets: 3, repsLow: 10, repsHigh: 12, rest: 60 },
        { exerciseId: "ta-6", order: 6, sets: 3, repsLow: 20, repsHigh: 40, rest: 45 },
      ],
    },
    {
      id: "piernaA",
      label: "Pierna A",
      subtitle: "Cuádriceps + core",
      weekday: 2, // martes
      warmup: PIERNA_WARMUP,
      cooldown: PIERNA_COOLDOWN,
      exercises: [
        { exerciseId: "pa-1", order: 1, sets: 4, repsLow: 10, repsHigh: 12, rest: 120 },
        { exerciseId: "pa-2", order: 2, sets: 3, repsLow: 10, repsHigh: 12, rest: 90 },
        { exerciseId: "pa-3", order: 3, sets: 3, repsLow: 12, repsHigh: 15, rest: 60 },
        { exerciseId: "pa-4", order: 4, sets: 3, repsLow: 12, repsHigh: 15, rest: 60 },
        { exerciseId: "pa-5", order: 5, sets: 3, repsLow: 15, repsHigh: 15, rest: 45 },
        { exerciseId: "pa-6", order: 6, sets: 3, repsLow: 8, repsHigh: 10, rest: 45 },
      ],
    },
    {
      id: "torsoB",
      label: "Torso B",
      subtitle: "Tracción dominante",
      weekday: 4, // jueves
      warmup: TORSO_WARMUP,
      cooldown: TORSO_COOLDOWN,
      exercises: [
        { exerciseId: "tb-1", order: 1, sets: 4, repsLow: 8, repsHigh: 10, rest: 90 },
        { exerciseId: "tb-2", order: 2, sets: 3, repsLow: 10, repsHigh: 12, rest: 90 },
        { exerciseId: "tb-3", order: 3, sets: 3, repsLow: 8, repsHigh: 10, rest: 90 },
        { exerciseId: "tb-4", order: 4, sets: 3, repsLow: 12, repsHigh: 15, rest: 60 },
        { exerciseId: "tb-5", order: 5, sets: 3, repsLow: 10, repsHigh: 12, rest: 60 },
        { exerciseId: "tb-6", order: 6, sets: 3, repsLow: 10, repsHigh: 10, rest: 45 },
      ],
    },
    {
      id: "piernaB",
      label: "Pierna B",
      subtitle: "Cadera / posterior + core",
      weekday: 5, // viernes
      warmup: PIERNA_WARMUP,
      cooldown: PIERNA_COOLDOWN,
      exercises: [
        { exerciseId: "pb-1", order: 1, sets: 4, repsLow: 10, repsHigh: 12, rest: 90 },
        { exerciseId: "pb-2", order: 2, sets: 3, repsLow: 10, repsHigh: 12, rest: 90 },
        { exerciseId: "pb-3", order: 3, sets: 3, repsLow: 10, repsHigh: 10, rest: 90 },
        { exerciseId: "pb-4", order: 4, sets: 3, repsLow: 12, repsHigh: 15, rest: 60 },
        { exerciseId: "pb-5", order: 5, sets: 3, repsLow: 15, repsHigh: 15, rest: 45 },
        { exerciseId: "pb-6", order: 6, sets: 3, repsLow: 8, repsHigh: 8, rest: 45 },
      ],
    },
  ],
};

export const PHASE0_WEEKS = 3;
export const DELOAD_EVERY_WEEKS = 6;

export const NUTRITION = {
  tdeeRange: [2600, 2800],
  surplus: [150, 300],
  proteinPerKg: [1.8, 2.2],
  carbsPerKg: [4, 5],
  fatPerKg: [0.8, 1.0],
};

export const WARNING_SIGNS = [
  "Dolor que baja o se irradia por la pierna",
  "Hormigueo o adormecimiento",
  "Pérdida de fuerza notable en una pierna",
  "Dolor que no mejora tras el reposo de una sesión",
];

export const PROGRESSION_NOTES = [
  {
    title: "Doble progresión",
    text: "Si en la última serie llegas al límite superior del rango de reps con buena técnica y podrías hacer 1-2 reps más (RIR 1-2), sube el peso un 2.5-5% la próxima sesión.",
  },
  {
    title: "RIR objetivo",
    text: "RIR 2-3 las primeras semanas, bajando a RIR 1-2 conforme mejora tu técnica y confianza.",
  },
  {
    title: "Reintroducción de barra libre",
    text: "Si en 3-4 semanas el hip thrust, el RDL con mancuernas y la goblet squat no generan molestia, prueba versión con barra ligera, siempre con técnica supervisada.",
  },
  {
    title: "Deload",
    text: `Cada ${DELOAD_EVERY_WEEKS} semanas, una semana a -40% de volumen para gestionar la fatiga acumulada, sobre todo en la zona lumbar.`,
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/program.js
git commit -m "feat: add weekly program data referencing exercise library"
```

---

## Task 4: Logs helpers (`src/lib/logs.js`)

**Files:**
- Create: `src/lib/logs.js`
- Test: `src/lib/logs.test.js`

New `gd-logs` shape: `{ sessions: { [dateISO]: { dayId, status, sets: [{exerciseId, weight, reps, rir, setNumber}], durationMin, note } }, bodyweight: [{ date, kg }] }`.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/logs.test.js`:

```js
import { describe, it, expect } from "vitest";
import { getExerciseSets, setExerciseSets, markAttendance, addBodyweightEntry, getBodyweightSeries } from "./logs";

const EMPTY_LOGS = { sessions: {}, bodyweight: [] };

describe("getExerciseSets", () => {
  it("returns empty array when the session does not exist", () => {
    expect(getExerciseSets(EMPTY_LOGS, "2026-07-30", "ta-1")).toEqual([]);
  });

  it("returns only the sets for the requested exercise, ordered by setNumber", () => {
    const logs = {
      sessions: {
        "2026-07-30": {
          dayId: "torsoA",
          status: "trained",
          sets: [
            { exerciseId: "ta-2", weight: 20, reps: 10, rir: 2, setNumber: 1 },
            { exerciseId: "ta-1", weight: 40, reps: 8, rir: 2, setNumber: 2 },
            { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          ],
        },
      },
      bodyweight: [],
    };
    expect(getExerciseSets(logs, "2026-07-30", "ta-1")).toEqual([
      { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
      { exerciseId: "ta-1", weight: 40, reps: 8, rir: 2, setNumber: 2 },
    ]);
  });
});

describe("setExerciseSets", () => {
  it("creates a new trained session with the given sets when none existed", () => {
    const result = setExerciseSets(EMPTY_LOGS, "2026-07-30", "torsoA", "ta-1", [
      { weight: 40, reps: 9, rir: 2 },
    ]);
    expect(result.sessions["2026-07-30"]).toEqual({
      dayId: "torsoA",
      status: "trained",
      sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
      durationMin: null,
      note: "",
    });
  });

  it("replaces only the target exercise's sets, keeping other exercises intact", () => {
    const logs = {
      sessions: {
        "2026-07-30": {
          dayId: "torsoA",
          status: "trained",
          sets: [{ exerciseId: "ta-2", weight: 20, reps: 10, rir: 2, setNumber: 1 }],
          durationMin: null,
          note: "",
        },
      },
      bodyweight: [],
    };
    const result = setExerciseSets(logs, "2026-07-30", "torsoA", "ta-1", [
      { weight: 40, reps: 9, rir: 2 },
    ]);
    expect(result.sessions["2026-07-30"].sets).toEqual([
      { exerciseId: "ta-2", weight: 20, reps: 10, rir: 2, setNumber: 1 },
      { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
    ]);
  });

  it("does not mutate the original logs object", () => {
    const result = setExerciseSets(EMPTY_LOGS, "2026-07-30", "torsoA", "ta-1", [
      { weight: 40, reps: 9, rir: 2 },
    ]);
    expect(EMPTY_LOGS.sessions).toEqual({});
    expect(result).not.toBe(EMPTY_LOGS);
  });
});

describe("markAttendance", () => {
  it("sets a manual status on a day with no prior session", () => {
    const result = markAttendance(EMPTY_LOGS, "2026-07-31", "piernaA", "missed", "dolor de espalda");
    expect(result.sessions["2026-07-31"]).toEqual({
      dayId: "piernaA",
      status: "missed",
      sets: [],
      durationMin: null,
      note: "dolor de espalda",
    });
  });

  it("overrides status on an existing session without dropping its sets", () => {
    const logs = {
      sessions: {
        "2026-07-30": {
          dayId: "torsoA",
          status: "trained",
          sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
          durationMin: null,
          note: "",
        },
      },
      bodyweight: [],
    };
    const result = markAttendance(logs, "2026-07-30", "torsoA", "rest", "");
    expect(result.sessions["2026-07-30"].status).toBe("rest");
    expect(result.sessions["2026-07-30"].sets).toEqual(logs.sessions["2026-07-30"].sets);
  });
});

describe("bodyweight", () => {
  it("adds a new entry sorted by date", () => {
    let logs = addBodyweightEntry(EMPTY_LOGS, "2026-07-30", 75.2);
    logs = addBodyweightEntry(logs, "2026-07-15", 75.8);
    expect(getBodyweightSeries(logs)).toEqual([
      { date: "2026-07-15", kg: 75.8 },
      { date: "2026-07-30", kg: 75.2 },
    ]);
  });

  it("upserts an existing date instead of duplicating it", () => {
    let logs = addBodyweightEntry(EMPTY_LOGS, "2026-07-30", 75.2);
    logs = addBodyweightEntry(logs, "2026-07-30", 74.9);
    expect(getBodyweightSeries(logs)).toEqual([{ date: "2026-07-30", kg: 74.9 }]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- logs.test.js`
Expected: FAIL — `src/lib/logs.js` does not exist yet.

- [ ] **Step 3: Implement `src/lib/logs.js`**

```js
// Helpers puros sobre la forma de gd-logs:
// { sessions: { [fecha]: { dayId, status, sets, durationMin, note } }, bodyweight: [] }

function emptySession(dayId) {
  return { dayId, status: "trained", sets: [], durationMin: null, note: "" };
}

export function getSession(logs, dateISO) {
  return logs.sessions[dateISO] || null;
}

export function getExerciseSets(logs, dateISO, exerciseId) {
  const session = getSession(logs, dateISO);
  if (!session) return [];
  return session.sets
    .filter((s) => s.exerciseId === exerciseId)
    .sort((a, b) => a.setNumber - b.setNumber);
}

export function setExerciseSets(logs, dateISO, dayId, exerciseId, sets) {
  const prevSession = logs.sessions[dateISO] || emptySession(dayId);
  const otherSets = prevSession.sets.filter((s) => s.exerciseId !== exerciseId);
  const nextSets = sets.map((s, idx) => ({ ...s, exerciseId, setNumber: idx + 1 }));
  return {
    ...logs,
    sessions: {
      ...logs.sessions,
      [dateISO]: {
        ...prevSession,
        dayId,
        status: "trained",
        sets: [...otherSets, ...nextSets],
      },
    },
  };
}

export function markAttendance(logs, dateISO, dayId, status, note = "") {
  const prevSession = logs.sessions[dateISO] || emptySession(dayId);
  return {
    ...logs,
    sessions: {
      ...logs.sessions,
      [dateISO]: { ...prevSession, dayId, status, note },
    },
  };
}

export function addBodyweightEntry(logs, dateISO, kg) {
  const withoutDate = logs.bodyweight.filter((e) => e.date !== dateISO);
  const next = [...withoutDate, { date: dateISO, kg }].sort((a, b) =>
    a.date > b.date ? 1 : -1
  );
  return { ...logs, bodyweight: next };
}

export function getBodyweightSeries(logs) {
  return [...logs.bodyweight].sort((a, b) => (a.date > b.date ? 1 : -1));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- logs.test.js`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/logs.js src/lib/logs.test.js
git commit -m "feat: add pure helpers for the new logs schema"
```

---

## Task 5: Progression engine (`src/lib/progression.js`)

**Files:**
- Create: `src/lib/progression.js`
- Test: `src/lib/progression.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/progression.test.js`:

```js
import { describe, it, expect } from "vitest";
import { suggestProgression } from "./progression";

const RANGE = { repsLow: 8, repsHigh: 10 };

describe("suggestProgression", () => {
  it("suggests starting weight when there is no history", () => {
    const result = suggestProgression([], RANGE);
    expect(result.action).toBe("start");
  });

  it("suggests increasing weight when the top set hit repsHigh at low RIR", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 10, rir: 1 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("increase");
    expect(result.weightDeltaPct).toBeGreaterThanOrEqual(0.025);
    expect(result.weightDeltaPct).toBeLessThanOrEqual(0.05);
  });

  it("holds weight when the top set is within range but RIR is still high", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 10, rir: 3 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("hold");
  });

  it("holds weight after a single session below repsLow", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 6, rir: 0 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("hold");
  });

  it("suggests decreasing weight after two sessions in a row below repsLow", () => {
    const recentSessions = [
      { date: "2026-07-28", sets: [{ weight: 40, reps: 6, rir: 0 }] },
      { date: "2026-07-21", sets: [{ weight: 40, reps: 7, rir: 0 }] },
    ];
    const result = suggestProgression(recentSessions, RANGE);
    expect(result.action).toBe("decrease");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- progression.test.js`
Expected: FAIL — `src/lib/progression.js` does not exist yet.

- [ ] **Step 3: Implement `src/lib/progression.js`**

```js
// Motor de progresión — doble progresión + RIR, ver PROGRESSION_NOTES en program.js.
// recentSessions: más reciente primero, cada uno { date, sets: [{ weight, reps, rir }] }.

function topSetOf(session) {
  return session.sets.reduce((best, s) => (s.weight > (best?.weight ?? -Infinity) ? s : best), null);
}

export function suggestProgression(recentSessions, { repsLow, repsHigh }) {
  if (recentSessions.length === 0) {
    return { action: "start", weightDeltaPct: 0, message: "Registra tu primer peso con RIR 2-3." };
  }

  const last = topSetOf(recentSessions[0]);

  if (last.reps >= repsHigh && last.rir <= 2) {
    return {
      action: "increase",
      weightDeltaPct: 0.05,
      message: "Llegaste al límite superior con RIR bajo — sube un 2.5-5% el peso.",
    };
  }

  if (last.reps < repsLow) {
    const previous = recentSessions[1] ? topSetOf(recentSessions[1]) : null;
    if (previous && previous.reps < repsLow) {
      return {
        action: "decrease",
        weightDeltaPct: -0.05,
        message: "Dos sesiones seguidas por debajo del rango — baja el peso.",
      };
    }
    return { action: "hold", weightDeltaPct: 0, message: "Por debajo del rango — mantén el peso una sesión más." };
  }

  return { action: "hold", weightDeltaPct: 0, message: "Dentro del rango — mantén el peso." };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- progression.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/progression.js src/lib/progression.test.js
git commit -m "feat: add double-progression suggestion engine"
```

---

## Task 6: Rewrite `src/lib/stats.js` for the new schema

**Files:**
- Modify: `src/lib/stats.js` (full rewrite)
- Test: `src/lib/stats.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/stats.test.js`:

```js
import { describe, it, expect } from "vitest";
import {
  getWeeklyMuscleVolume,
  getAdherenceDates,
  getStreak,
  getExerciseHistory,
  getLoggedExerciseIds,
  getPRs,
  getEstimated1RMTrend,
  getTonnageSeries,
  getAvgRIRSeries,
} from "./stats";

function logsWith(sessions) {
  return { sessions, bodyweight: [] };
}

describe("getWeeklyMuscleVolume", () => {
  it("counts trained sets per muscle for the week of the reference date", () => {
    const logs = logsWith({
      "2026-07-27": {
        dayId: "torsoA",
        status: "trained",
        sets: [
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 2 },
          { exerciseId: "ta-2", weight: 20, reps: 9, rir: 2, setNumber: 1 },
        ],
      },
    });
    const volume = getWeeklyMuscleVolume(logs, new Date("2026-07-29"));
    expect(volume.pecho).toBe(2);
    expect(volume.hombro).toBe(1);
  });
});

describe("getAdherenceDates / getStreak", () => {
  it("only counts sessions with status trained", () => {
    const logs = logsWith({
      "2026-07-29": { dayId: "torsoA", status: "trained", sets: [] },
      "2026-07-28": { dayId: "piernaA", status: "missed", sets: [] },
    });
    expect(getAdherenceDates(logs)).toEqual(["2026-07-29"]);
  });
});

describe("getExerciseHistory", () => {
  it("computes max weight and total volume per date for one exercise", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          { exerciseId: "ta-1", weight: 42.5, reps: 8, rir: 1, setNumber: 2 },
        ],
      },
    });
    const history = getExerciseHistory(logs, "ta-1");
    expect(history).toEqual([
      { date: "2026-07-28", maxWeight: 42.5, totalVolume: 40 * 9 + 42.5 * 8, sets: 2 },
    ]);
  });
});

describe("getLoggedExerciseIds", () => {
  it("returns ids that have at least one set logged", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
      },
    });
    expect(getLoggedExerciseIds(logs)).toEqual(new Set(["ta-1"]));
  });
});

describe("getPRs", () => {
  it("tracks the best weight ever logged per exercise, with date", () => {
    const logs = logsWith({
      "2026-07-14": {
        dayId: "torsoA",
        status: "trained",
        sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
      },
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [{ exerciseId: "ta-1", weight: 42.5, reps: 8, rir: 1, setNumber: 1 }],
      },
    });
    const prs = getPRs(logs);
    expect(prs["ta-1"]).toEqual({ bestWeight: 42.5, bestWeightDate: "2026-07-28" });
  });
});

describe("getEstimated1RMTrend", () => {
  it("applies the Epley formula to the top set of each session", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [{ exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 }],
      },
    });
    const trend = getEstimated1RMTrend(logs, "ta-1");
    expect(trend).toEqual([{ date: "2026-07-28", oneRM: 40 * (1 + 9 / 30) }]);
  });
});

describe("getTonnageSeries", () => {
  it("sums weight times reps across all sets per date", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          { exerciseId: "ta-2", weight: 20, reps: 10, rir: 2, setNumber: 1 },
        ],
      },
    });
    expect(getTonnageSeries(logs)).toEqual([{ date: "2026-07-28", tonnage: 40 * 9 + 20 * 10 }]);
  });
});

describe("getAvgRIRSeries", () => {
  it("averages RIR across sets that have it, per date", () => {
    const logs = logsWith({
      "2026-07-28": {
        dayId: "torsoA",
        status: "trained",
        sets: [
          { exerciseId: "ta-1", weight: 40, reps: 9, rir: 2, setNumber: 1 },
          { exerciseId: "ta-2", weight: 20, reps: 10, rir: 4, setNumber: 1 },
        ],
      },
    });
    expect(getAvgRIRSeries(logs)).toEqual([{ date: "2026-07-28", avgRIR: 3 }]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- stats.test.js`
Expected: FAIL — current `stats.js` still uses the old `logs[date].entries` shape and doesn't export the new functions.

- [ ] **Step 3: Replace `src/lib/stats.js` entirely**

```js
import { EXERCISES } from "../data/exercises";
import { startOfWeek, addDays, toISODate } from "./dates";

export function getWeeklyMuscleVolume(logs, referenceDate = new Date()) {
  const start = startOfWeek(referenceDate);
  const volume = {};
  for (let i = 0; i < 7; i++) {
    const dateISO = toISODate(addDays(start, i));
    const session = logs.sessions[dateISO];
    if (!session || session.status !== "trained") continue;
    session.sets.forEach((s) => {
      const muscle = EXERCISES[s.exerciseId]?.muscle;
      if (!muscle) return;
      volume[muscle] = (volume[muscle] || 0) + 1;
    });
  }
  return volume;
}

export function getAdherenceDates(logs) {
  return Object.keys(logs.sessions).filter(
    (dateISO) => logs.sessions[dateISO].status === "trained"
  );
}

export function getStreak(logs) {
  const dates = new Set(getAdherenceDates(logs));
  let streak = 0;
  let cursor = new Date();
  if (!dates.has(toISODate(cursor))) {
    cursor = addDays(cursor, -1);
  }
  while (dates.has(toISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function getAdherenceRate(logs, program, sinceISO, referenceDate = new Date()) {
  const scheduledWeekdays = new Set(program.days.map((d) => d.weekday));
  let planned = 0;
  let completed = 0;
  let cursor = new Date(sinceISO);
  const end = new Date(toISODate(referenceDate));
  while (cursor <= end) {
    const dateISO = toISODate(cursor);
    if (scheduledWeekdays.has(cursor.getDay())) {
      planned += 1;
      if (logs.sessions[dateISO]?.status === "trained") completed += 1;
    }
    cursor = addDays(cursor, 1);
  }
  return { planned, completed, pct: planned === 0 ? 0 : Math.round((completed / planned) * 100) };
}

export function getExerciseHistory(logs, exerciseId) {
  const points = [];
  Object.entries(logs.sessions).forEach(([dateISO, session]) => {
    const sets = session.sets.filter((s) => s.exerciseId === exerciseId);
    if (sets.length === 0) return;
    const maxWeight = Math.max(...sets.map((s) => Number(s.weight) || 0));
    const totalVolume = sets.reduce((acc, s) => acc + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
    points.push({ date: dateISO, maxWeight, totalVolume, sets: sets.length });
  });
  return points.sort((a, b) => (a.date > b.date ? 1 : -1));
}

export function getLoggedExerciseIds(logs) {
  const ids = new Set();
  Object.values(logs.sessions).forEach((session) => {
    session.sets.forEach((s) => ids.add(s.exerciseId));
  });
  return ids;
}

export function getPRs(logs) {
  const prs = {};
  Object.entries(logs.sessions).forEach(([dateISO, session]) => {
    session.sets.forEach((s) => {
      const weight = Number(s.weight) || 0;
      const current = prs[s.exerciseId];
      if (!current || weight > current.bestWeight) {
        prs[s.exerciseId] = { bestWeight: weight, bestWeightDate: dateISO };
      }
    });
  });
  return prs;
}

export function getEstimated1RMTrend(logs, exerciseId) {
  return getExerciseHistory(logs, exerciseId).map((h) => {
    const session = logs.sessions[h.date];
    const topSet = session.sets
      .filter((s) => s.exerciseId === exerciseId)
      .reduce((best, s) => (s.weight > (best?.weight ?? -Infinity) ? s : best), null);
    return { date: h.date, oneRM: topSet.weight * (1 + topSet.reps / 30) };
  });
}

export function getTonnageSeries(logs) {
  return Object.entries(logs.sessions)
    .filter(([, session]) => session.sets.length > 0)
    .map(([dateISO, session]) => ({
      date: dateISO,
      tonnage: session.sets.reduce((acc, s) => acc + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0),
    }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}

export function getAvgRIRSeries(logs) {
  return Object.entries(logs.sessions)
    .map(([dateISO, session]) => {
      const withRIR = session.sets.filter((s) => s.rir != null);
      if (withRIR.length === 0) return null;
      const avgRIR = withRIR.reduce((acc, s) => acc + s.rir, 0) / withRIR.length;
      return { date: dateISO, avgRIR };
    })
    .filter(Boolean)
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- stats.test.js`
Expected: PASS (8 tests)

- [ ] **Step 5: Run the full test suite**

Run: `npm run test`
Expected: PASS (22 tests across logs.test.js, progression.test.js, stats.test.js)

- [ ] **Step 6: Commit**

```bash
git add src/lib/stats.js src/lib/stats.test.js
git commit -m "feat: rewrite stats engine for the new logs schema, add PRs/1RM/tonnage/RIR"
```

---

## Task 7: Add month-grid helper to `src/lib/dates.js`

**Files:**
- Modify: `src/lib/dates.js`

Needed by the new Calendar view (Task 12).

- [ ] **Step 1: Add `getMonthMatrix`**

Append to `src/lib/dates.js`:

```js
export function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay() === 0 ? 6 : first.getDay() - 1; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/dates.js
git commit -m "feat: add month-grid helper for calendar view"
```

---

## Task 8: Cut over `App.jsx` to the new data shape and add the Calendar tab

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Update default logs shape and wire the Calendar tab**

`src/App.jsx` becomes:

```jsx
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import SessionView from "./components/SessionView";
import CalendarView from "./components/CalendarView";
import ProgressView from "./components/ProgressView";
import GuideView from "./components/GuideView";
import SettingsView from "./components/SettingsView";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { todayISO } from "./lib/dates";

const DEFAULT_SETTINGS = {
  weightKg: 75,
  heightCm: 181,
  age: 28,
  startDate: todayISO(),
};

const DEFAULT_LOGS = { sessions: {}, bodyweight: [] };

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [settings, setSettings] = useLocalStorage("gd-settings", DEFAULT_SETTINGS);
  const [logs, setLogs] = useLocalStorage("gd-logs", DEFAULT_LOGS);

  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar active={tab} onChange={setTab} />
      <div className="relative flex-1 min-w-0">
        <div className="blueprint-grid pointer-events-none fixed inset-0 -z-10" />
        <main className="mx-auto max-w-4xl px-4 sm:px-8 py-8 pb-24 md:pb-12">
          {tab === "dashboard" && (
            <Dashboard settings={settings} logs={logs} onNavigate={setTab} />
          )}
          {tab === "session" && <SessionView logs={logs} setLogs={setLogs} />}
          {tab === "calendar" && <CalendarView logs={logs} setLogs={setLogs} />}
          {tab === "progress" && <ProgressView logs={logs} />}
          {tab === "guide" && <GuideView />}
          {tab === "settings" && (
            <SettingsView settings={settings} setSettings={setSettings} logs={logs} setLogs={setLogs} />
          )}
        </main>
      </div>
    </div>
  );
}
```

Note: `CalendarView` (Task 12) doesn't exist yet — this is expected, the build stays red until Task 12 lands, per the sequencing note at the top of this plan.

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: cut App.jsx over to sessions/bodyweight logs shape, add calendar tab"
```

---

## Task 9: Add Calendar tab to `Sidebar.jsx`

**Files:**
- Modify: `src/components/Sidebar.jsx:1-7`

- [ ] **Step 1: Insert the tab and renumber**

Replace lines 1-7 of `src/components/Sidebar.jsx`:

```jsx
const TABS = [
  { id: "dashboard", label: "Dashboard", num: "01" },
  { id: "session", label: "Sesión", num: "02" },
  { id: "calendar", label: "Calendario", num: "03" },
  { id: "progress", label: "Progreso", num: "04" },
  { id: "guide", label: "Guía", num: "05" },
  { id: "settings", label: "Ajustes", num: "06" },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Sidebar.jsx
git commit -m "feat: add calendar tab to sidebar nav"
```

---

## Task 10: Extract shared `Heatmap` component

**Files:**
- Create: `src/components/Heatmap.jsx`
- Modify: `src/components/Dashboard.jsx`

Dashboard already has an inline `Heatmap` (lines 10-28 of the old file); Task 13's Progress rewrite needs the same visual for a longer window, so it's extracted now instead of duplicated.

- [ ] **Step 1: Create `src/components/Heatmap.jsx`**

```jsx
import { getAdherenceDates } from "../lib/stats";
import { toISODate, addDays } from "../lib/dates";

export default function Heatmap({ logs, days = 14 }) {
  const adherent = new Set(getAdherenceDates(logs));
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateISO = toISODate(addDays(new Date(), -i));
    cells.push({ dateISO, on: adherent.has(dateISO) });
  }
  return (
    <div className="flex flex-wrap gap-1">
      {cells.map((c) => (
        <div
          key={c.dateISO}
          title={c.dateISO}
          className={`h-5 w-5 rounded-sm ${c.on ? "bg-progress" : "bg-panel-2 border border-line/60"}`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Update `Dashboard.jsx` to use it**

Rewrite `src/components/Dashboard.jsx`:

```jsx
import { PHASE0_WEEKS, DELOAD_EVERY_WEEKS, WARNING_SIGNS } from "../data/program";
import { PROGRAM } from "../data/program";
import { diffInWeeks } from "../lib/dates";
import { getStreak } from "../lib/stats";
import Heatmap from "./Heatmap";

function getTodaySession() {
  const weekday = new Date().getDay();
  return PROGRAM.days.find((d) => d.weekday === weekday) || null;
}

export default function Dashboard({ settings, logs, onNavigate }) {
  const today = getTodaySession();
  const weeksSinceStart = Math.max(0, diffInWeeks(settings.startDate));
  const inPhase0 = weeksSinceStart < PHASE0_WEEKS;
  const weeksUntilDeload = DELOAD_EVERY_WEEKS - (weeksSinceStart % DELOAD_EVERY_WEEKS);
  const streak = getStreak(logs);

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          Semana {weeksSinceStart + 1} · {inPhase0 ? "Fase 0 — Cimentación" : "Fase de progresión"}
        </div>
        <h1 className="font-mono text-2xl text-ink mt-1">Dashboard</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="tick-corners rounded border border-line/60 bg-panel p-5 lg:col-span-2">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wide">Hoy</div>
          {today ? (
            <>
              <div className="mt-2 flex items-baseline justify-between">
                <h2 className="text-xl text-ink font-medium">{today.label}</h2>
                <span className="font-mono text-xs text-muted">{today.subtitle}</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {today.exercises.length} ejercicios · toca "Sesión" en el menú para registrar tus series.
              </p>
              <button
                onClick={() => onNavigate("session")}
                className="mt-4 rounded bg-progress-dim text-progress font-mono text-xs uppercase tracking-wide px-4 py-2 hover:brightness-125 transition"
              >
                Ir a la sesión →
              </button>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-xl text-ink font-medium">Descanso</h2>
              <p className="mt-2 text-sm text-muted">
                Hoy no hay sesión programada. Aprovecha para caminar, estirar o hacer cardio ligero si te apetece.
              </p>
            </>
          )}
        </div>

        <div className="tick-corners rounded border border-line/60 bg-panel p-5 flex flex-col">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wide">Racha actual</div>
          <div className="mt-2 font-mono text-4xl text-progress">{streak}</div>
          <div className="text-sm text-muted">días con registro consecutivo</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="tick-corners rounded border border-line/60 bg-panel p-5">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wide">Próximo deload</div>
          <div className="mt-2 font-mono text-3xl text-blueprint">
            {weeksUntilDeload === DELOAD_EVERY_WEEKS ? "Esta semana" : `${weeksUntilDeload} sem.`}
          </div>
          <div className="text-sm text-muted mt-1">-40% de volumen esa semana</div>
        </div>

        <div className="tick-corners rounded border border-line/60 bg-panel p-5 lg:col-span-2">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wide">Últimos 14 días</div>
          <div className="mt-3">
            <Heatmap logs={logs} days={14} />
          </div>
        </div>
      </div>

      <div className="tick-corners rounded border border-warn-dim/60 bg-panel p-5">
        <div className="font-mono text-[11px] text-warn uppercase tracking-wide">Señales de alarma lumbar</div>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {WARNING_SIGNS.map((s) => (
            <li key={s}>· {s}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-faint">
          Si aparece alguna, para el ejercicio y consulta a un profesional antes de seguir.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Heatmap.jsx src/components/Dashboard.jsx
git commit -m "refactor: extract shared Heatmap, cut Dashboard over to program.js/new stats"
```

---

## Task 11: Rewrite `ExerciseCard.jsx` with progression suggestion and rest timer

**Files:**
- Create: `src/components/RestTimer.jsx`
- Modify: `src/components/ExerciseCard.jsx` (full rewrite)

- [ ] **Step 1: Create `src/components/RestTimer.jsx`**

```jsx
import { useEffect, useState } from "react";

export default function RestTimer({ seconds }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  if (remaining === null) {
    return (
      <button
        onClick={() => setRemaining(seconds)}
        className="font-mono text-[11px] text-blueprint hover:brightness-125"
      >
        ⏱ iniciar descanso ({seconds}s)
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono text-[11px]">
      <span className={remaining === 0 ? "text-progress" : "text-blueprint"}>
        {remaining === 0 ? "¡Listo!" : `${remaining}s restantes`}
      </span>
      <button onClick={() => setRemaining(null)} className="text-faint hover:text-ink">
        reiniciar
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `src/components/ExerciseCard.jsx`**

`exercise` prop now carries the merged shape `{ ...libraryEntry, ...programEntry }` built by the caller (SessionView, Task 12). `progression` prop is the `suggestProgression(...)` result, or `null` while there isn't enough history.

```jsx
import { MUSCLES } from "../data/exercises";
import RestTimer from "./RestTimer";

export default function ExerciseCard({ exercise, progression, loggedSets, onUpdateSet, onAddSet, onRemoveSet, onOpenGuide }) {
  const targetLabel = exercise.isTime
    ? `${exercise.sets} × ${exercise.repsLow}-${exercise.repsHigh}s`
    : exercise.repsLow === exercise.repsHigh
    ? `${exercise.sets} × ${exercise.repsLow}${exercise.perSide ? " /lado" : ""}`
    : `${exercise.sets} × ${exercise.repsLow}-${exercise.repsHigh}${exercise.perSide ? " /lado" : ""}`;

  return (
    <div className="tick-corners rounded border border-line/60 bg-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <button onClick={onOpenGuide} className="text-ink font-medium hover:text-progress text-left">
            {exercise.name}
          </button>
          <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-muted">
            <span className="text-blueprint">{MUSCLES[exercise.muscle]?.label}</span>
            <span>{targetLabel}</span>
            <RestTimer seconds={exercise.rest} />
          </div>
        </div>
      </div>

      {progression && (
        <p className="mt-2 text-xs text-progress">💡 {progression.message}</p>
      )}

      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-[2rem_1fr_1fr_1fr_1.5rem] gap-2 font-mono text-[10px] uppercase tracking-wide text-faint">
          <span>Serie</span>
          <span>{exercise.isTime ? "Segundos" : "Peso (kg)"}</span>
          <span>Reps</span>
          <span>RIR</span>
          <span></span>
        </div>
        {loggedSets.map((set, idx) => (
          <div key={idx} className="grid grid-cols-[2rem_1fr_1fr_1fr_1.5rem] gap-2 items-center">
            <span className="font-mono text-xs text-muted">{idx + 1}</span>
            <input
              type="number"
              inputMode="decimal"
              value={exercise.isTime ? set.reps ?? "" : set.weight ?? ""}
              onChange={(e) => onUpdateSet(idx, exercise.isTime ? "reps" : "weight", e.target.value)}
              placeholder={exercise.isTime ? "seg" : "kg"}
              className="w-full rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-progress"
            />
            {!exercise.isTime && (
              <input
                type="number"
                inputMode="numeric"
                value={set.reps ?? ""}
                onChange={(e) => onUpdateSet(idx, "reps", e.target.value)}
                placeholder="reps"
                className="w-full rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-progress"
              />
            )}
            {exercise.isTime && <span />}
            <input
              type="number"
              inputMode="numeric"
              value={set.rir ?? ""}
              onChange={(e) => onUpdateSet(idx, "rir", e.target.value)}
              placeholder="rir"
              className="w-full rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-progress"
            />
            <button onClick={() => onRemoveSet(idx)} aria-label="Eliminar serie" className="text-faint hover:text-warn text-sm">
              ×
            </button>
          </div>
        ))}
        <button onClick={onAddSet} className="mt-1 font-mono text-[11px] text-progress hover:brightness-125">
          + añadir serie
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RestTimer.jsx src/components/ExerciseCard.jsx
git commit -m "feat: add rest timer and RIR input, show progression suggestion on exercise card"
```

---

## Task 12: Rewrite `SessionView.jsx`

**Files:**
- Modify: `src/components/SessionView.jsx` (full rewrite)

- [ ] **Step 1: Rewrite the file**

```jsx
import { useState } from "react";
import { PROGRAM } from "../data/program";
import { EXERCISES } from "../data/exercises";
import { todayISO } from "../lib/dates";
import { getExerciseSets, setExerciseSets } from "../lib/logs";
import { getExerciseHistory } from "../lib/stats";
import { suggestProgression } from "../lib/progression";
import ExerciseCard from "./ExerciseCard";

function getTodayDayId() {
  const weekday = new Date().getDay();
  const found = PROGRAM.days.find((d) => d.weekday === weekday);
  return found ? found.id : PROGRAM.days[0].id;
}

export default function SessionView({ logs, setLogs }) {
  const [dayId, setDayId] = useState(getTodayDayId());
  const [showWarmup, setShowWarmup] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);
  const [guideExerciseId, setGuideExerciseId] = useState(null);
  const day = PROGRAM.days.find((d) => d.id === dayId);
  const dateISO = todayISO();

  function mergedExercise(programExercise) {
    return { ...EXERCISES[programExercise.exerciseId], ...programExercise };
  }

  function getSetsFor(programExercise) {
    const existing = getExerciseSets(logs, dateISO, programExercise.exerciseId);
    if (existing.length > 0) return existing;
    return Array.from({ length: programExercise.sets }, () => ({ weight: "", reps: "", rir: "" }));
  }

  function progressionFor(programExercise) {
    const history = getExerciseHistory(logs, programExercise.exerciseId)
      .filter((h) => h.date !== dateISO)
      .slice(-2)
      .reverse()
      .map((h) => ({
        date: h.date,
        sets: logs.sessions[h.date].sets.filter((s) => s.exerciseId === programExercise.exerciseId),
      }));
    if (history.length === 0) return null;
    return suggestProgression(history, programExercise);
  }

  function updateEntries(exerciseId, sets) {
    setLogs((prev) => setExerciseSets(prev, dateISO, dayId, exerciseId, sets));
  }

  function handleUpdateSet(programExercise, idx, field, value) {
    const sets = [...getSetsFor(programExercise)];
    sets[idx] = { ...sets[idx], [field]: value };
    updateEntries(programExercise.exerciseId, sets);
  }

  function handleAddSet(programExercise) {
    const sets = [...getSetsFor(programExercise), { weight: "", reps: "", rir: "" }];
    updateEntries(programExercise.exerciseId, sets);
  }

  function handleRemoveSet(programExercise, idx) {
    const sets = getSetsFor(programExercise).filter((_, i) => i !== idx);
    updateEntries(programExercise.exerciseId, sets);
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Sesión</div>
        <h1 className="font-mono text-2xl text-ink mt-1">Registro de entrenamiento</h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {PROGRAM.days.map((d) => (
          <button
            key={d.id}
            onClick={() => setDayId(d.id)}
            className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wide border ${
              dayId === d.id ? "border-progress text-progress bg-progress-dim/40" : "border-line/60 text-muted hover:text-ink"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="rounded border border-line/60 bg-panel">
        <button
          onClick={() => setShowWarmup((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted"
        >
          Calentamiento ({day.label})
          <span>{showWarmup ? "−" : "+"}</span>
        </button>
        {showWarmup && (
          <ul className="px-4 pb-4 space-y-1 text-sm text-muted">
            {day.warmup.map((w) => (
              <li key={w.name}>· {w.name} <span className="text-faint">{w.reps}</span></li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        {day.exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((programExercise) => {
            const exercise = mergedExercise(programExercise);
            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                progression={progressionFor(programExercise)}
                loggedSets={getSetsFor(programExercise)}
                onUpdateSet={(idx, field, value) => handleUpdateSet(programExercise, idx, field, value)}
                onAddSet={() => handleAddSet(programExercise)}
                onRemoveSet={(idx) => handleRemoveSet(programExercise, idx)}
                onOpenGuide={() => setGuideExerciseId(exercise.id)}
              />
            );
          })}
      </div>

      <div className="rounded border border-line/60 bg-panel">
        <button
          onClick={() => setShowCooldown((s) => !s)}
          className="w-full flex items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wide text-muted"
        >
          Estiramientos de cierre
          <span>{showCooldown ? "−" : "+"}</span>
        </button>
        {showCooldown && (
          <ul className="px-4 pb-4 space-y-1 text-sm text-muted">
            {day.cooldown.map((w) => (
              <li key={w.name}>· {w.name} <span className="text-faint">{w.reps}</span></li>
            ))}
          </ul>
        )}
      </div>

      {guideExerciseId && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 p-4" onClick={() => setGuideExerciseId(null)}>
          <div
            className="max-w-md w-full rounded border border-line/60 bg-panel p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const ex = EXERCISES[guideExerciseId];
              return (
                <>
                  <h3 className="text-ink font-medium">{ex.name}</h3>
                  <div className="mt-1 font-mono text-[11px] text-blueprint">{ex.equipment}</div>
                  {ex.proTips.length > 0 && (
                    <ul className="mt-3 text-sm text-muted space-y-1">
                      {ex.proTips.map((t) => <li key={t}>· {t}</li>)}
                    </ul>
                  )}
                  <button
                    onClick={() => setGuideExerciseId(null)}
                    className="mt-4 font-mono text-[11px] text-faint hover:text-ink"
                  >
                    cerrar
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SessionView.jsx
git commit -m "refactor: rewrite SessionView on program.js/exercises.js with progression + guide popup"
```

---

## Task 13: Build `CalendarView.jsx`

**Files:**
- Create: `src/components/CalendarView.jsx`

- [ ] **Step 1: Create the component**

```jsx
import { useState } from "react";
import { PROGRAM } from "../data/program";
import { getMonthMatrix, toISODate } from "../lib/dates";
import { markAttendance } from "../lib/logs";

const STATUS_COLOR = {
  trained: "bg-progress text-bg",
  missed: "bg-warn text-bg",
  rest: "bg-panel-2 text-muted border border-line/60",
};

function statusOf(logs, dateISO) {
  return logs.sessions[dateISO]?.status ?? null;
}

export default function CalendarView({ logs, setLogs }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(null);

  const weeks = getMonthMatrix(cursor.year, cursor.month);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(delta) {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(null);
  }

  function markSelected(status) {
    if (!selected) return;
    const scheduledDay = PROGRAM.days.find((d) => d.weekday === selected.getDay());
    const dayId = logs.sessions[toISODate(selected)]?.dayId ?? scheduledDay?.id ?? PROGRAM.days[0].id;
    setLogs((prev) => markAttendance(prev, toISODate(selected), dayId, status));
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Calendario</div>
        <h1 className="font-mono text-2xl text-ink mt-1">Asistencia</h1>
      </header>

      <div className="flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="font-mono text-xs text-muted hover:text-ink">← mes anterior</button>
        <div className="font-mono text-sm text-ink capitalize">{monthLabel}</div>
        <button onClick={() => changeMonth(1)} className="font-mono text-xs text-muted hover:text-ink">mes siguiente →</button>
      </div>

      <div className="rounded border border-line/60 bg-panel p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-1 font-mono text-[10px] uppercase text-faint mb-1">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} />;
              const dateISO = toISODate(date);
              const status = statusOf(logs, dateISO);
              const isSelected = selected && toISODate(selected) === dateISO;
              return (
                <button
                  key={di}
                  onClick={() => setSelected(date)}
                  className={`aspect-square rounded text-xs font-mono flex items-center justify-center ${
                    status ? STATUS_COLOR[status] : "bg-panel-2 text-muted border border-line/60"
                  } ${isSelected ? "ring-2 ring-blueprint" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selected && (
        <div className="rounded border border-line/60 bg-panel p-4 sm:p-5">
          <div className="font-mono text-xs text-muted uppercase tracking-wide">
            {toISODate(selected)} · estado actual: {statusOf(logs, toISODate(selected)) ?? "sin registrar"}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => markSelected("trained")} className="rounded bg-progress-dim text-progress font-mono text-xs uppercase px-3 py-1.5 hover:brightness-125">
              Marcar entrenado
            </button>
            <button onClick={() => markSelected("rest")} className="rounded border border-line/60 text-muted font-mono text-xs uppercase px-3 py-1.5 hover:text-ink">
              Marcar descanso
            </button>
            <button onClick={() => markSelected("missed")} className="rounded border border-warn-dim text-warn font-mono text-xs uppercase px-3 py-1.5 hover:bg-warn-dim/20">
              Marcar perdido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CalendarView.jsx
git commit -m "feat: add monthly attendance calendar with manual marking"
```

---

## Task 14: Add exercise library to `GuideView.jsx`

**Files:**
- Create: `src/components/ExerciseLibrary.jsx`
- Modify: `src/components/GuideView.jsx`

- [ ] **Step 1: Create `src/components/ExerciseLibrary.jsx`**

```jsx
import { useMemo, useState } from "react";
import { EXERCISES, MUSCLES } from "../data/exercises";

const ALL = Object.values(EXERCISES);

export default function ExerciseLibrary() {
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  const filtered = useMemo(
    () => (muscleFilter === "all" ? ALL : ALL.filter((e) => e.muscle === muscleFilter)),
    [muscleFilter]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setMuscleFilter("all")}
          className={`rounded px-3 py-1.5 font-mono text-[11px] uppercase border ${
            muscleFilter === "all" ? "border-progress text-progress" : "border-line/60 text-muted hover:text-ink"
          }`}
        >
          Todos
        </button>
        {Object.entries(MUSCLES).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setMuscleFilter(key)}
            className={`rounded px-3 py-1.5 font-mono text-[11px] uppercase border ${
              muscleFilter === key ? "border-progress text-progress" : "border-line/60 text-muted hover:text-ink"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((ex) => (
          <div key={ex.id} className="rounded border border-line/60 bg-panel">
            <button
              onClick={() => setOpenId(openId === ex.id ? null : ex.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <div className="text-ink text-sm">{ex.name}</div>
                <div className="font-mono text-[10px] text-blueprint uppercase">{MUSCLES[ex.muscle]?.label} · {ex.equipment}</div>
              </div>
              <span className="text-faint">{openId === ex.id ? "−" : "+"}</span>
            </button>
            {openId === ex.id && (
              <div className="px-4 pb-4 text-sm text-muted space-y-2">
                {ex.mediaUrl ? (
                  <img src={ex.mediaUrl} alt={ex.name} className="rounded border border-line/60 max-w-xs" />
                ) : (
                  <p className="text-xs text-faint">Imagen/gif pendiente (pase de contenido).</p>
                )}
                {ex.proTips.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] text-progress uppercase">Pro tips</div>
                    <ul className="space-y-0.5">{ex.proTips.map((t) => <li key={t}>· {t}</li>)}</ul>
                  </div>
                )}
                {ex.commonMistakes.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] text-warn uppercase">Errores comunes</div>
                    <ul className="space-y-0.5">{ex.commonMistakes.map((t) => <li key={t}>· {t}</li>)}</ul>
                  </div>
                )}
                {ex.machineSetup && (
                  <div>
                    <div className="font-mono text-[10px] text-blueprint uppercase">Ajuste de máquina</div>
                    <p>{ex.machineSetup}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into `GuideView.jsx`**

In `src/components/GuideView.jsx`, change the import line and add a new section. Replace line 1:

```jsx
import { PHASE0_WEEKS, NUTRITION, WARNING_SIGNS, PROGRESSION_NOTES } from "../data/program";
import { PROGRAM } from "../data/program";
import ExerciseLibrary from "./ExerciseLibrary";
```

Replace the `WARMUP` reference inside the Fase 0 section (previously `WARMUP.map(...)`) — that block now reads from the current day in `SessionView`/`CalendarView`, not from a single global list, so remove the warmup `<ul>` from `GuideView`'s Fase 0 section entirely (it duplicated per-day content that's now shown in the Sesión warmup panel). The Fase 0 `<Section>` becomes:

```jsx
<Section title={`Fase 0 — cimentación (semanas 1-${PHASE0_WEEKS})`}>
  <p className="text-sm text-muted">
    Antes de cargar patrones de bisagra de cadera pesados, construyes control de tronco.
    Todos los ejercicios de pierna/bisagra usan máquina o rango controlado, no barra libre
    desde el suelo. No te la saltes.
  </p>
</Section>
```

Then add a new `Section` right after the header, before "Fase 0":

```jsx
<Section title="Biblioteca de ejercicios">
  <ExerciseLibrary />
</Section>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ExerciseLibrary.jsx src/components/GuideView.jsx
git commit -m "feat: add filterable exercise library to guide view"
```

---

## Task 15: Rewrite `ProgressView.jsx` with tabs, delete `routine.js`

**Files:**
- Modify: `src/components/ProgressView.jsx` (full rewrite)
- Modify: `src/components/SettingsView.jsx` (add bodyweight entry)
- Delete: `src/data/routine.js`

- [ ] **Step 1: Rewrite `src/components/ProgressView.jsx`**

```jsx
import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PROGRAM } from "../data/program";
import { EXERCISES, MUSCLES } from "../data/exercises";
import {
  getWeeklyMuscleVolume, getExerciseHistory, getLoggedExerciseIds, getPRs,
  getAdherenceRate, getStreak, getEstimated1RMTrend, getTonnageSeries, getAvgRIRSeries,
} from "../lib/stats";
import { getBodyweightSeries } from "../lib/logs";
import Heatmap from "./Heatmap";

const ALL_EXERCISES = PROGRAM.days.flatMap((d) =>
  d.exercises.map((pe) => ({ ...EXERCISES[pe.exerciseId], day: d.label }))
);

const TABS = ["Volumen", "PRs", "Racha", "Peso corporal", "Extra"];

function statusFor(value, [min, max]) {
  if (value < min) return { text: "por debajo", color: "text-warn" };
  if (value > max) return { text: "por encima", color: "text-blueprint" };
  return { text: "en rango", color: "text-progress" };
}

function LineCard({ title, data, dataKey, yLabel }) {
  return (
    <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
      <h2 className="font-mono text-xs uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-4 h-56">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -10 }}>
              <CartesianGrid stroke="var(--color-line)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="date" stroke="var(--color-muted)" fontSize={11} tickLine={false} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="var(--color-muted)" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-panel-2)", border: "1px solid var(--color-line)", fontSize: 12 }} labelStyle={{ color: "var(--color-ink)" }} />
              <Line type="monotone" dataKey={dataKey} stroke="var(--color-progress)" strokeWidth={2} dot={{ r: 3 }} name={yLabel} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted">Necesitas al menos 2 puntos para ver la curva.</div>
        )}
      </div>
    </section>
  );
}

export default function ProgressView({ logs }) {
  const [tab, setTab] = useState(TABS[0]);
  const loggedIds = useMemo(() => getLoggedExerciseIds(logs), [logs]);
  const loggableExercises = ALL_EXERCISES.filter((e) => !e.isTime);
  const [selectedId, setSelectedId] = useState(
    loggableExercises.find((e) => loggedIds.has(e.id))?.id || loggableExercises[0]?.id
  );

  const history = useMemo(() => getExerciseHistory(logs, selectedId), [logs, selectedId]);
  const weeklyVolume = useMemo(() => getWeeklyMuscleVolume(logs), [logs]);
  const prs = useMemo(() => getPRs(logs), [logs]);
  const adherence = useMemo(
    () => getAdherenceRate(logs, PROGRAM, `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`),
    [logs]
  );
  const streak = useMemo(() => getStreak(logs), [logs]);
  const bodyweight = useMemo(() => getBodyweightSeries(logs), [logs]);
  const oneRMTrend = useMemo(() => getEstimated1RMTrend(logs, selectedId), [logs, selectedId]);
  const tonnage = useMemo(() => getTonnageSeries(logs), [logs]);
  const avgRIR = useMemo(() => getAvgRIRSeries(logs), [logs]);

  const chartData = history.map((h) => ({ date: h.date, peso: h.maxWeight }));

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Progreso</div>
        <h1 className="font-mono text-2xl text-ink mt-1">Evolución y volumen</h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wide border ${
              tab === t ? "border-progress text-progress bg-progress-dim/40" : "border-line/60 text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Volumen" && (
        <>
          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Peso máximo por sesión</h2>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-sm text-ink"
              >
                {loggableExercises.map((e) => (
                  <option key={e.id} value={e.id}>{e.day} · {e.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <LineCard title="" data={chartData} dataKey="peso" yLabel="peso" />
            </div>
          </section>

          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Volumen de esta semana por grupo muscular</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(MUSCLES).map(([key, m]) => {
                const value = weeklyVolume[key] || 0;
                const [min, max] = m.target;
                const pct = Math.min(100, (value / max) * 100);
                const st = statusFor(value, m.target);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                      <span>{m.label}</span>
                      <span>{value} series · <span className={st.color}>{st.text}</span> ({min}-{max})</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-panel-2 overflow-hidden">
                      <div className="h-full bg-progress" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {tab === "PRs" && (
        <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">Récords personales</h2>
          <div className="space-y-2">
            {Object.entries(prs).map(([exerciseId, pr]) => (
              <div key={exerciseId} className="flex items-center justify-between text-sm">
                <span className="text-ink">{EXERCISES[exerciseId]?.name}</span>
                <span className="font-mono text-progress">{pr.bestWeight} kg <span className="text-faint">({pr.bestWeightDate})</span></span>
              </div>
            ))}
            {Object.keys(prs).length === 0 && <p className="text-sm text-muted">Registra series para ver tus PRs.</p>}
          </div>
        </section>
      )}

      {tab === "Racha" && (
        <div className="space-y-4">
          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Racha actual</h2>
            <div className="mt-2 font-mono text-4xl text-progress">{streak}</div>
            <div className="text-sm text-muted">días con registro consecutivo</div>
          </section>
          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Adherencia este mes</h2>
            <div className="mt-2 font-mono text-3xl text-blueprint">{adherence.pct}%</div>
            <div className="text-sm text-muted">{adherence.completed} de {adherence.planned} sesiones planificadas</div>
          </section>
        </div>
      )}

      {tab === "Peso corporal" && (
        <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
          <LineCard title="Peso corporal en el tiempo" data={bodyweight.map((b) => ({ date: b.date, kg: b.kg }))} dataKey="kg" yLabel="kg" />
        </section>
      )}

      {tab === "Extra" && (
        <div className="space-y-4">
          <LineCard title="1RM estimado (Epley)" data={oneRMTrend.map((h) => ({ date: h.date, oneRM: Math.round(h.oneRM * 10) / 10 }))} dataKey="oneRM" yLabel="1RM" />
          <LineCard title="Tonelaje total por sesión" data={tonnage} dataKey="tonnage" yLabel="tonelaje" />
          <LineCard title="RIR promedio por sesión" data={avgRIR.map((r) => ({ date: r.date, avgRIR: Math.round(r.avgRIR * 10) / 10 }))} dataKey="avgRIR" yLabel="RIR" />
          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <h2 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">Consistencia (90 días)</h2>
            <Heatmap logs={logs} days={90} />
          </section>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add bodyweight quick-entry to `SettingsView.jsx`**

In `src/components/SettingsView.jsx`, add the import and a new section. Change line 1:

```jsx
import { useRef, useState } from "react";
import { addBodyweightEntry } from "../lib/logs";
import { todayISO } from "../lib/dates";
```

Add inside the component, after the `handleReset` function (was line 42):

```jsx
  function handleLogBodyweight(kg) {
    if (!kg) return;
    setLogs((prev) => addBodyweightEntry(prev, todayISO(), Number(kg)));
  }
```

Add state for the input near the top of the component body (after `const fileInput = useRef(null);`):

```jsx
  const [bwInput, setBwInput] = useState("");
```

Add a new `<section>` right after the "Perfil" section (after its closing `</section>`, before "Backup de datos"):

```jsx
      <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">Peso corporal de hoy</h2>
        <div className="flex gap-3 max-w-xs">
          <input
            type="number"
            inputMode="decimal"
            value={bwInput}
            onChange={(e) => setBwInput(e.target.value)}
            placeholder="kg"
            className="w-full rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-ink"
          />
          <button
            onClick={() => { handleLogBodyweight(bwInput); setBwInput(""); }}
            className="rounded bg-progress-dim text-progress font-mono text-xs uppercase tracking-wide px-4 py-2 hover:brightness-125"
          >
            Guardar
          </button>
        </div>
        <p className="mt-2 text-xs text-faint">Se ve reflejado en Progreso → Peso corporal.</p>
      </section>
```

- [ ] **Step 3: Delete the old routine data file**

```bash
rm src/data/routine.js
```

- [ ] **Step 4: Confirm nothing still imports `data/routine`**

Run: `grep -rn "data/routine" src/`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add -A src/components/ProgressView.jsx src/components/SettingsView.jsx src/data/routine.js
git commit -m "refactor: rewrite ProgressView with PRs/streak/bodyweight/extra tabs, log bodyweight in settings, remove legacy routine.js"
```

---

## Task 16: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit test suite**

Run: `npm run test`
Expected: PASS, all lib tests green.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors (warnings from `react/only-export-components` are pre-existing/acceptable).

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds with no errors, no warnings about missing modules (confirms `routine.js` removal didn't leave a dangling import).

- [ ] **Step 4: Manual walkthrough in the dev server**

Run: `npm run dev`, open the printed local URL, and check:
1. **Dashboard** — shows today's day (or "Descanso"), streak, deload countdown, 14-day heatmap, lumbar warning list.
2. **Sesión** — switch between the 4 days; expand calentamiento (differs between a Torso day and a Pierna day) and estiramientos de cierre; log a set with weight/reps/RIR, confirm it persists on reload; click an exercise name to open the guide popup with its pro tips; start a rest timer and watch it count down.
3. **Calendario** — today's date should now show as trained (green) after logging a set in Sesión; click another day and mark it "perdido", confirm it turns the warn color; navigate to the previous/next month.
4. **Progreso** — switch all 5 tabs (Volumen, PRs, Racha, Peso corporal, Extra); Volumen and PRs should reflect the set logged above; log a bodyweight entry in Ajustes and confirm it appears under "Peso corporal".
5. **Guía** — biblioteca de ejercicios filterable by muscle group; expand an exercise, confirm pro tips show and the missing-media message shows (since `mediaUrl` is still `null` for everything at this stage).
6. **Ajustes** — export a backup JSON, confirm it contains the new `sessions`/`bodyweight` shape; import it back; edit profile fields and confirm Dashboard's week/phase counter updates.

- [ ] **Step 5: Update README to match the new structure**

In `README.md`, replace the "Estructura" section (previously referencing a single `routine.js`) with:

```markdown
## Estructura

​```
src/
  data/exercises.js      ← biblioteca de ejercicios (nombre, músculo, pro tips, media)
  data/program.js         ← rutina semanal activa (referencias a exercises.js + series/reps/descanso)
  lib/                     ← fechas, estadísticas, motor de progresión, helpers de logs
  hooks/useLocalStorage    ← persistencia
  components/              ← Dashboard, Sesión, Calendario, Progreso, Guía, Ajustes
​```

Para cambiar la rutina activa, edita `src/data/program.js`. Para añadir o documentar un
ejercicio nuevo (pro tips, errores comunes, ajuste de máquina, imagen), edita `src/data/exercises.js`.
```

(Use real triple-backtick fences, not the escaped ones shown above — those are escaped here only so this plan step doesn't break its own Markdown code block.)

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "docs: update README structure section for exercises.js/program.js split"
```

---

## Explicitly out of scope (per spec)

- Multi-user/login, cross-device sync, cloud backend/DB.
- Daily nutrition logging.
- In-app routine editor UI.
- Sourcing real exercise media (public DB mapping + Gemini generation) and writing the researched, personalized Fase-2 routine — both are content work for a separate plan once the user's full personal data is collected.
- Mesocycle-switcher UI in Ajustes: `PROGRAM` only ever has one mesocycle right now, so there's nothing to switch between. Once Fase 2 introduces a second mesocycle, add a simple dropdown there — not worth building against a single option today.
