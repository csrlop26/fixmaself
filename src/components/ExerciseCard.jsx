import { MUSCLES } from "../data/exercises";
import RestTimer from "./RestTimer";

export default function ExerciseCard({ exercise, progression, loggedSets, onUpdateSet, onAddSet, onRemoveSet, onOpenGuide = () => {} }) {
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
