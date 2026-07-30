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
  if (!last) {
    return { action: "start", weightDeltaPct: 0, message: "Registra tu primer peso con RIR 2-3." };
  }

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
