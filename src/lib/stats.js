import { DAYS } from "../data/routine";
import { startOfWeek, addDays, toISODate } from "./dates";

const exerciseMuscleMap = {};
DAYS.forEach((day) => {
  day.exercises.forEach((ex) => {
    exerciseMuscleMap[ex.id] = ex.muscle;
  });
});

export function getWeeklyMuscleVolume(logs, referenceDate = new Date()) {
  const start = startOfWeek(referenceDate);
  const volume = {};
  for (let i = 0; i < 7; i++) {
    const dateISO = toISODate(addDays(start, i));
    const day = logs[dateISO];
    if (!day) continue;
    Object.entries(day.entries || {}).forEach(([exId, sets]) => {
      const muscle = exerciseMuscleMap[exId];
      if (!muscle) return;
      volume[muscle] = (volume[muscle] || 0) + sets.length;
    });
  }
  return volume;
}

export function getAdherenceDates(logs) {
  return Object.keys(logs).filter((dateISO) => {
    const entries = logs[dateISO]?.entries || {};
    return Object.values(entries).some((sets) => sets.length > 0);
  });
}

export function getStreak(logs) {
  const dates = new Set(getAdherenceDates(logs));
  let streak = 0;
  let cursor = new Date();
  // permite que "hoy" no cuente todavía como fallo si aún no has entrenado
  if (!dates.has(toISODate(cursor))) {
    cursor = addDays(cursor, -1);
  }
  while (dates.has(toISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function getExerciseHistory(logs, exerciseId) {
  const points = [];
  Object.entries(logs).forEach(([dateISO, day]) => {
    const sets = day.entries?.[exerciseId];
    if (!sets || sets.length === 0) return;
    const maxWeight = Math.max(...sets.map((s) => Number(s.weight) || 0));
    const totalVolume = sets.reduce(
      (acc, s) => acc + (Number(s.weight) || 0) * (Number(s.reps) || 0),
      0
    );
    points.push({ date: dateISO, maxWeight, totalVolume, sets: sets.length });
  });
  return points.sort((a, b) => (a.date > b.date ? 1 : -1));
}

export function getLoggedExerciseIds(logs) {
  const ids = new Set();
  Object.values(logs).forEach((day) => {
    Object.entries(day.entries || {}).forEach(([exId, sets]) => {
      if (sets.length > 0) ids.add(exId);
    });
  });
  return ids;
}
