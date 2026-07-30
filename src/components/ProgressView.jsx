import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { PROGRAM } from "../data/program";
import { EXERCISES, MUSCLES } from "../data/exercises";
import {
  getWeeklyMuscleVolume, getExerciseHistory, getLoggedExerciseIds, getPRs,
  getAdherenceRate, getStreak, getEstimated1RMTrend, getTonnageSeries, getAvgRIRSeries,
} from "../lib/stats";
import { getBodyweightSeries } from "../lib/logs";
import Heatmap from "./Heatmap";

const ALL_EXERCISES = PROGRAM.days.flatMap((d) =>
  d.exercises.map((pe) => ({ ...EXERCISES[pe.exerciseId], day: d.label }))
);

const TABS = ["Volumen", "PRs", "Racha", "Peso corporal", "Extra"];

function statusFor(value, [min, max]) {
  if (value < min) return { text: "por debajo", color: "text-warn" };
  if (value > max) return { text: "por encima", color: "text-blueprint" };
  return { text: "en rango", color: "text-progress" };
}

function LineCard({ title, data, dataKey, yLabel }) {
  return (
    <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
      <h2 className="font-mono text-xs uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-4 h-56">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -10 }}>
              <CartesianGrid stroke="var(--color-line)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="date" stroke="var(--color-muted)" fontSize={11} tickLine={false} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="var(--color-muted)" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-panel-2)", border: "1px solid var(--color-line)", fontSize: 12 }} labelStyle={{ color: "var(--color-ink)" }} />
              <Line type="monotone" dataKey={dataKey} stroke="var(--color-progress)" strokeWidth={2} dot={{ r: 3 }} name={yLabel} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted">Necesitas al menos 2 puntos para ver la curva.</div>
        )}
      </div>
    </section>
  );
}

export default function ProgressView({ logs }) {
  const [tab, setTab] = useState(TABS[0]);
  const loggedIds = useMemo(() => getLoggedExerciseIds(logs), [logs]);
  const loggableExercises = ALL_EXERCISES.filter((e) => !e.isTime);
  const [selectedId, setSelectedId] = useState(
    loggableExercises.find((e) => loggedIds.has(e.id))?.id || loggableExercises[0]?.id
  );

  const history = useMemo(() => getExerciseHistory(logs, selectedId), [logs, selectedId]);
  const weeklyVolume = useMemo(() => getWeeklyMuscleVolume(logs), [logs]);
  const prs = useMemo(() => getPRs(logs), [logs]);
  const adherence = useMemo(
    () => getAdherenceRate(logs, PROGRAM, `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`),
    [logs]
  );
  const streak = useMemo(() => getStreak(logs), [logs]);
  const bodyweight = useMemo(() => getBodyweightSeries(logs), [logs]);
  const oneRMTrend = useMemo(() => getEstimated1RMTrend(logs, selectedId), [logs, selectedId]);
  const tonnage = useMemo(() => getTonnageSeries(logs), [logs]);
  const avgRIR = useMemo(() => getAvgRIRSeries(logs), [logs]);

  const chartData = history.map((h) => ({ date: h.date, peso: h.maxWeight }));

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Progreso</div>
        <h1 className="font-mono text-2xl text-ink mt-1">Evolución y volumen</h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded px-3 py-1.5 font-mono text-xs uppercase tracking-wide border ${
              tab === t ? "border-progress text-progress bg-progress-dim/40" : "border-line/60 text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Volumen" && (
        <>
          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Peso máximo por sesión</h2>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="rounded bg-panel-2 border border-line/60 px-2 py-1.5 text-sm text-ink"
              >
                {loggableExercises.map((e) => (
                  <option key={e.id} value={e.id}>{e.day} · {e.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <LineCard title="" data={chartData} dataKey="peso" yLabel="peso" />
            </div>
          </section>

          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Volumen de esta semana por grupo muscular</h2>
            <div className="mt-4 space-y-3">
              {Object.entries(MUSCLES).map(([key, m]) => {
                const value = weeklyVolume[key] || 0;
                const [min, max] = m.target;
                const pct = Math.min(100, (value / max) * 100);
                const st = statusFor(value, m.target);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                      <span>{m.label}</span>
                      <span>{value} series · <span className={st.color}>{st.text}</span> ({min}-{max})</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-panel-2 overflow-hidden">
                      <div className="h-full bg-progress" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {tab === "PRs" && (
        <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">Récords personales</h2>
          <div className="space-y-2">
            {Object.entries(prs).map(([exerciseId, pr]) => (
              <div key={exerciseId} className="flex items-center justify-between text-sm">
                <span className="text-ink">{EXERCISES[exerciseId]?.name}</span>
                <span className="font-mono text-progress">{pr.bestWeight} kg <span className="text-faint">({pr.bestWeightDate})</span></span>
              </div>
            ))}
            {Object.keys(prs).length === 0 && <p className="text-sm text-muted">Registra series para ver tus PRs.</p>}
          </div>
        </section>
      )}

      {tab === "Racha" && (
        <div className="space-y-4">
          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Racha actual</h2>
            <div className="mt-2 font-mono text-4xl text-progress">{streak}</div>
            <div className="text-sm text-muted">días con registro consecutivo</div>
          </section>
          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Adherencia este mes</h2>
            <div className="mt-2 font-mono text-3xl text-blueprint">{adherence.pct}%</div>
            <div className="text-sm text-muted">{adherence.completed} de {adherence.planned} sesiones planificadas</div>
          </section>
        </div>
      )}

      {tab === "Peso corporal" && (
        <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
          <LineCard title="Peso corporal en el tiempo" data={bodyweight.map((b) => ({ date: b.date, kg: b.kg }))} dataKey="kg" yLabel="kg" />
        </section>
      )}

      {tab === "Extra" && (
        <div className="space-y-4">
          <LineCard title="1RM estimado (Epley)" data={oneRMTrend.map((h) => ({ date: h.date, oneRM: Math.round(h.oneRM * 10) / 10 }))} dataKey="oneRM" yLabel="1RM" />
          <LineCard title="Tonelaje total por sesión" data={tonnage} dataKey="tonnage" yLabel="tonelaje" />
          <LineCard title="RIR promedio por sesión" data={avgRIR.map((r) => ({ date: r.date, avgRIR: Math.round(r.avgRIR * 10) / 10 }))} dataKey="avgRIR" yLabel="RIR" />
          <section className="rounded border border-line/60 bg-panel p-4 sm:p-5">
            <h2 className="font-mono text-xs uppercase tracking-wide text-muted mb-3">Consistencia (90 días)</h2>
            <Heatmap logs={logs} days={90} />
          </section>
        </div>
      )}
    </div>
  );
}
