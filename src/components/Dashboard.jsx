import { PROGRAM, PHASE0_WEEKS, DELOAD_EVERY_WEEKS, WARNING_SIGNS } from "../data/program";
import { diffInWeeks } from "../lib/dates";
import { getStreak } from "../lib/stats";
import Heatmap from "./Heatmap";

function getTodaySession() {
  const weekday = new Date().getDay();
  return PROGRAM.days.find((d) => d.weekday === weekday) || null;
}

export default function Dashboard({ settings, logs, onNavigate }) {
  const today = getTodaySession();
  const weeksSinceStart = Math.max(0, diffInWeeks(settings.startDate));
  const inPhase0 = weeksSinceStart < PHASE0_WEEKS;
  const weeksUntilDeload =
    DELOAD_EVERY_WEEKS - (weeksSinceStart % DELOAD_EVERY_WEEKS);
  const streak = getStreak(logs);

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          Semana {weeksSinceStart + 1} · {inPhase0 ? "Fase 0 — Cimentación" : "Fase de progresión"}
        </div>
        <h1 className="font-mono text-2xl text-ink mt-1">Dashboard</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Sesión de hoy */}
        <div className="tick-corners rounded border border-line/60 bg-panel p-5 lg:col-span-2">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wide">Hoy</div>
          {today ? (
            <>
              <div className="mt-2 flex items-baseline justify-between">
                <h2 className="text-xl text-ink font-medium">{today.label}</h2>
                <span className="font-mono text-xs text-muted">{today.subtitle}</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                {today.exercises.length} ejercicios · toca "Sesión" en el menú para registrar tus series.
              </p>
              <button
                onClick={() => onNavigate("session")}
                className="mt-4 rounded bg-progress-dim text-progress font-mono text-xs uppercase tracking-wide px-4 py-2 hover:brightness-125 transition"
              >
                Ir a la sesión →
              </button>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-xl text-ink font-medium">Descanso</h2>
              <p className="mt-2 text-sm text-muted">
                Hoy no hay sesión programada. Aprovecha para caminar, estirar o hacer cardio ligero si te apetece.
              </p>
            </>
          )}
        </div>

        {/* Racha */}
        <div className="tick-corners rounded border border-line/60 bg-panel p-5 flex flex-col">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wide">Racha actual</div>
          <div className="mt-2 font-mono text-4xl text-progress">{streak}</div>
          <div className="text-sm text-muted">días con registro consecutivo</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Deload */}
        <div className="tick-corners rounded border border-line/60 bg-panel p-5">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wide">Próximo deload</div>
          <div className="mt-2 font-mono text-3xl text-blueprint">
            {weeksUntilDeload === DELOAD_EVERY_WEEKS ? "Esta semana" : `${weeksUntilDeload} sem.`}
          </div>
          <div className="text-sm text-muted mt-1">-40% de volumen esa semana</div>
        </div>

        {/* Adherencia */}
        <div className="tick-corners rounded border border-line/60 bg-panel p-5 lg:col-span-2">
          <div className="font-mono text-[11px] text-muted uppercase tracking-wide">Últimos 14 días</div>
          <div className="mt-3">
            <Heatmap logs={logs} />
          </div>
        </div>
      </div>

      {/* Aviso lumbar siempre visible */}
      <div className="tick-corners rounded border border-warn-dim/60 bg-panel p-5">
        <div className="font-mono text-[11px] text-warn uppercase tracking-wide">Señales de alarma lumbar</div>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {WARNING_SIGNS.map((s) => (
            <li key={s}>· {s}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-faint">
          Si aparece alguna, para el ejercicio y consulta a un profesional antes de seguir.
        </p>
      </div>
    </div>
  );
}
