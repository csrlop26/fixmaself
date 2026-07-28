import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DAYS, MUSCLES } from "../data/routine";
import { getWeeklyMuscleVolume, getExerciseHistory, getLoggedExerciseIds } from "../lib/stats";

const ALL_EXERCISES = DAYS.flatMap((d) => d.exercises.map((e) => ({ ...e, day: d.label })));

function statusFor(value, [min, max]) {
  if (value < min) return { text: "por debajo", color: "text-warn" };
  if (value > max) return { text: "por encima", color: "text-blueprint" };
  return { text: "en rango", color: "text-progress" };
}

export default function ProgressView({ logs }) {
  const loggedIds = useMemo(() => getLoggedExerciseIds(logs), [logs]);
  const loggableExercises = ALL_EXERCISES.filter((e) => !e.isTime);
  const [selectedId, setSelectedId] = useState(
    loggableExercises.find((e) => loggedIds.has(e.id))?.id || loggableExercises[0]?.id
  );

  const history = useMemo(() => getExerciseHistory(logs, selectedId), [logs, selectedId]);
  const weeklyVolume = useMemo(() => getWeeklyMuscleVolume(logs), [logs]);

  const chartData = history.map((h) => ({
    date: h.date.slice(5),
    peso: h.maxWeight,
  }));

  return (
    <div className="space-y-8">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Progreso</div>
        <h1 className="font-mono text-2xl text-ink mt-1">Evolución y volumen</h1>
      </header>

      <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Peso máximo por sesión</h2>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-sm text-ink"
          >
            {loggableExercises.map((e) => (
              <option key={e.id} value={e.id}>
                {e.day} · {e.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 h-64">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -10 }}>
                <CartesianGrid stroke="var(--color-line)" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-panel-2)",
                    border: "1px solid var(--color-line)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--color-ink)" }}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="var(--color-progress)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted">
              Registra al menos 2 sesiones de este ejercicio para ver la curva de progreso.
            </div>
          )}
        </div>
      </section>

      <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted">
          Volumen de esta semana por grupo muscular
        </h2>
        <div className="mt-4 space-y-3">
          {Object.entries(MUSCLES)
            .filter(([key]) => key !== "core" && key !== "gemelo")
            .map(([key, m]) => {
              const value = weeklyVolume[key] || 0;
              const [min, max] = m.target;
              const pct = Math.min(100, (value / max) * 100);
              const st = statusFor(value, m.target);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                    <span>{m.label}</span>
                    <span>
                      {value} series · <span className={st.color}>{st.text}</span> ({min}-{max})
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-panel-2 overflow-hidden">
                    <div
                      className="h-full bg-progress"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
        <p className="mt-4 text-xs text-faint">
          Rangos orientativos según tu nivel actual. Crecerán conforme avances de fase.
        </p>
      </section>
    </div>
  );
}
