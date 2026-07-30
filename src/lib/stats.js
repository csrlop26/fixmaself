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
  // sinceISO se parsea como UTC medianoche; getDay() usa hora local. Aceptable porque
  // los llamadores siempre pasan strings YYYY-MM-DD planos, nunca Date arbitrarios.
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
      if (EXERCISES[s.exerciseId]?.isTime) return;
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
