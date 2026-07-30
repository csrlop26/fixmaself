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
