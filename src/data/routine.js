// Datos base de la rutina 100x100 — recomposición corporal
// Perfil: 28 años · 75 kg · 181 cm · ectomorfo · molestia lumbar postural

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

export const DAYS = [
  {
    id: "torsoA",
    label: "Torso A",
    subtitle: "Empuje dominante",
    weekday: 1, // lunes
    exercises: [
      { id: "ta-1", name: "Press banca (máquina o mancuernas)", muscle: "pecho", sets: 3, repsLow: 8, repsHigh: 10, rest: 90, note: "Controla la fase excéntrica, 2-3 s de bajada." },
      { id: "ta-2", name: "Press militar sentado con respaldo", muscle: "hombro", sets: 3, repsLow: 8, repsHigh: 10, rest: 90, note: "Nunca detrás de la nuca. Mancuernas o máquina con respaldo." },
      { id: "ta-3", name: "Remo en máquina (pecho apoyado)", muscle: "espalda", sets: 3, repsLow: 10, repsHigh: 12, rest: 90, note: "El apoyo del pecho protege la lumbar por completo." },
      { id: "ta-4", name: "Elevaciones laterales", muscle: "hombro", sets: 3, repsLow: 12, repsHigh: 15, rest: 60, note: "Codo ligeramente flexionado, sin impulso." },
      { id: "ta-5", name: "Extensión de tríceps en polea", muscle: "triceps", sets: 3, repsLow: 10, repsHigh: 12, rest: 60, note: "Codos fijos junto al cuerpo." },
      { id: "ta-6", name: "Plancha frontal", muscle: "core", sets: 3, repsLow: 20, repsHigh: 40, rest: 45, isTime: true, note: "Isométrico. No dejes caer la cadera — línea recta de hombro a talón." },
    ],
  },
  {
    id: "piernaA",
    label: "Pierna A",
    subtitle: "Cuádriceps + core",
    weekday: 2, // martes
    exercises: [
      { id: "pa-1", name: "Prensa de piernas (leg press)", muscle: "cuadriceps", sets: 4, repsLow: 10, repsHigh: 12, rest: 120, note: "Sustituto seguro de la sentadilla libre al inicio: la máquina soporta tu espalda." },
      { id: "pa-2", name: "Sentadilla goblet (peso ligero) o hack squat", muscle: "cuadriceps", sets: 3, repsLow: 10, repsHigh: 12, rest: 90, note: "Rango cómodo, nunca fuerces la profundidad si duele." },
      { id: "pa-3", name: "Extensión de cuádriceps en máquina", muscle: "cuadriceps", sets: 3, repsLow: 12, repsHigh: 15, rest: 60, note: "" },
      { id: "pa-4", name: "Curl femoral (tumbado o sentado)", muscle: "posterior", sets: 3, repsLow: 12, repsHigh: 15, rest: 60, note: "" },
      { id: "pa-5", name: "Elevación de talones (gemelo)", muscle: "gemelo", sets: 3, repsLow: 15, repsHigh: 15, rest: 45, note: "" },
      { id: "pa-6", name: "Dead bug", muscle: "core", sets: 3, repsLow: 8, repsHigh: 10, rest: 45, perSide: true, note: "Core anti-extensión. La lumbar no se mueve del suelo." },
    ],
  },
  {
    id: "torsoB",
    label: "Torso B",
    subtitle: "Tracción dominante",
    weekday: 4, // jueves
    exercises: [
      { id: "tb-1", name: "Jalón al pecho (lat pulldown)", muscle: "espalda", sets: 4, repsLow: 8, repsHigh: 10, rest: 90, note: "" },
      { id: "tb-2", name: "Remo horizontal en polea baja", muscle: "espalda", sets: 3, repsLow: 10, repsHigh: 12, rest: 90, note: "Espalda neutra, sin redondear la zona lumbar." },
      { id: "tb-3", name: "Press inclinado con mancuernas", muscle: "pecho", sets: 3, repsLow: 8, repsHigh: 10, rest: 90, note: "" },
      { id: "tb-4", name: "Face pull en polea", muscle: "hombro", sets: 3, repsLow: 12, repsHigh: 15, rest: 60, note: "Clave para la salud del hombro a largo plazo." },
      { id: "tb-5", name: "Curl de bíceps con mancuernas", muscle: "biceps", sets: 3, repsLow: 10, repsHigh: 12, rest: 60, note: "" },
      { id: "tb-6", name: "Pallof press (anti-rotación, polea)", muscle: "core", sets: 3, repsLow: 10, repsHigh: 10, rest: 45, perSide: true, note: "Core anti-rotación." },
    ],
  },
  {
    id: "piernaB",
    label: "Pierna B",
    subtitle: "Cadera / posterior + core",
    weekday: 5, // viernes
    exercises: [
      { id: "pb-1", name: "Hip thrust (máquina o barra apoyada)", muscle: "posterior", sets: 4, repsLow: 10, repsHigh: 12, rest: 90, note: "El mejor ejercicio de cadena posterior sin estrés lumbar." },
      { id: "pb-2", name: "Peso muerto rumano con mancuernas ligeras", muscle: "posterior", sets: 3, repsLow: 10, repsHigh: 12, rest: 90, note: "Mancuernas cerca del cuerpo. Rango parcial al inicio si notas tensión." },
      { id: "pb-3", name: "Zancadas o step-up", muscle: "cuadriceps", sets: 3, repsLow: 10, repsHigh: 10, rest: 90, perSide: true, note: "" },
      { id: "pb-4", name: "Curl femoral", muscle: "posterior", sets: 3, repsLow: 12, repsHigh: 15, rest: 60, note: "" },
      { id: "pb-5", name: "Abducción de cadera en máquina", muscle: "posterior", sets: 3, repsLow: 15, repsHigh: 15, rest: 45, note: "Más estabilidad de cadera = menos compensación lumbar." },
      { id: "pb-6", name: "Bird dog", muscle: "core", sets: 3, repsLow: 8, repsHigh: 8, rest: 45, perSide: true, note: "" },
    ],
  },
];

export const WARMUP = [
  { name: "Cat-cow", reps: "x10" },
  { name: "Dead bug", reps: "x8 por lado" },
  { name: "Bird dog", reps: "x8 por lado" },
  { name: "Puente de glúteo", reps: "x12" },
  { name: "Movilidad de cadera (90/90)", reps: "x5 por lado" },
];

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
