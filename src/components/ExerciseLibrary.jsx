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
