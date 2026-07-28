import { useState } from "react";
import { DAYS, WARMUP } from "../data/routine";
import { todayISO } from "../lib/dates";
import ExerciseCard from "./ExerciseCard";

function getTodayDayId() {
  const weekday = new Date().getDay();
  const found = DAYS.find((d) => d.weekday === weekday);
  return found ? found.id : DAYS[0].id;
}

export default function SessionView({ logs, setLogs }) {
  const [dayId, setDayId] = useState(getTodayDayId());
  const [showWarmup, setShowWarmup] = useState(false);
  const day = DAYS.find((d) => d.id === dayId);
  const dateISO = todayISO();

  const dayLog = logs[dateISO]?.entries || {};

  function getSetsFor(exercise) {
    const existing = dayLog[exercise.id];
    if (existing && existing.length > 0) return existing;
    return Array.from({ length: exercise.sets }, () => ({ weight: "", reps: "" }));
  }

  function updateEntries(exerciseId, sets) {
    setLogs((prev) => {
      const prevDay = prev[dateISO] || { dayId, entries: {} };
      return {
        ...prev,
        [dateISO]: {
          dayId,
          entries: { ...prevDay.entries, [exerciseId]: sets },
        },
      };
    });
  }

  function handleUpdateSet(exercise, idx, field, value) {
    const sets = [...getSetsFor(exercise)];
    sets[idx] = { ...sets[idx], [field]: value };
    updateEntries(exercise.id, sets);
  }

  function handleAddSet(exercise) {
    const sets = [...getSetsFor(exercise), { weight: "", reps: "" }];
    updateEntries(exercise.id, sets);
  }

  function handleRemoveSet(exercise, idx) {
    const sets = getSetsFor(exercise).filter((_, i) => i !== idx);
    updateEntries(exercise.id, sets);
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Sesión</div>
        <h1 className="font-mono text-2xl text-ink mt-1">Registro de entrenamiento</h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {DAYS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDayId(d.id)}
            className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wide border ${
              dayId === d.id
                ? "border-progress text-progress bg-progress-dim/40"
                : "border-line/60 text-muted hover:text-ink"
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
          Calentamiento fijo (5-7 min)
          <span>{showWarmup ? "−" : "+"}</span>
        </button>
        {showWarmup && (
          <ul className="px-4 pb-4 space-y-1 text-sm text-muted">
            {WARMUP.map((w) => (
              <li key={w.name}>
                · {w.name} <span className="text-faint">{w.reps}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        {day.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            loggedSets={getSetsFor(exercise)}
            onUpdateSet={(idx, field, value) => handleUpdateSet(exercise, idx, field, value)}
            onAddSet={() => handleAddSet(exercise)}
            onRemoveSet={(idx) => handleRemoveSet(exercise, idx)}
          />
        ))}
      </div>
    </div>
  );
}
