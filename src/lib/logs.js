// Helpers puros sobre la forma de gd-logs:
// { sessions: { [fecha]: { dayId, status, sets, durationMin, note } }, bodyweight: [] }

function emptySession(dayId) {
  return { dayId, status: "trained", sets: [], durationMin: null, note: "" };
}

// Convierte cualquier valor leído de localStorage (forma nueva ya válida, forma
// antigua { [fecha]: { dayId, entries: { [exerciseId]: [{weight,reps}] } } },
// o basura/`{}` de versiones rotas anteriores) a la forma nueva válida.
export function normalizeLogs(raw) {
  if (raw && typeof raw === "object" && "sessions" in raw && "bodyweight" in raw) {
    return raw;
  }
  if (!raw || typeof raw !== "object") {
    return { sessions: {}, bodyweight: [] };
  }
  const sessions = {};
  Object.entries(raw).forEach(([dateISO, day]) => {
    if (!day || typeof day !== "object") return;
    const entries = day.entries || {};
    const sets = [];
    Object.entries(entries).forEach(([exerciseId, exSets]) => {
      (Array.isArray(exSets) ? exSets : []).forEach((s, idx) => {
        sets.push({ exerciseId, weight: s?.weight ?? "", reps: s?.reps ?? "", rir: "", setNumber: idx + 1 });
      });
    });
    if (sets.length > 0) {
      sessions[dateISO] = { dayId: day.dayId, status: "trained", sets, durationMin: null, note: "" };
    }
  });
  return { sessions, bodyweight: [] };
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
    a.date.localeCompare(b.date)
  );
  return { ...logs, bodyweight: next };
}

export function getBodyweightSeries(logs) {
  return [...logs.bodyweight].sort((a, b) => a.date.localeCompare(b.date));
}
