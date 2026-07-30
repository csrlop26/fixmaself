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
