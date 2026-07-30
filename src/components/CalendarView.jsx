import { useState } from "react";
import { PROGRAM } from "../data/program";
import { getMonthMatrix, toISODate } from "../lib/dates";
import { markAttendance } from "../lib/logs";

const STATUS_COLOR = {
  trained: "bg-progress text-bg",
  missed: "bg-warn text-bg",
  rest: "bg-panel-2 text-muted border border-line/60",
};

function statusOf(logs, dateISO) {
  return logs.sessions[dateISO]?.status ?? null;
}

export default function CalendarView({ logs, setLogs }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(null);

  const weeks = getMonthMatrix(cursor.year, cursor.month);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  function changeMonth(delta) {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(null);
  }

  function markSelected(status) {
    if (!selected) return;
    const scheduledDay = PROGRAM.days.find((d) => d.weekday === selected.getDay());
    const dayId = logs.sessions[toISODate(selected)]?.dayId ?? scheduledDay?.id ?? PROGRAM.days[0].id;
    setLogs((prev) => markAttendance(prev, toISODate(selected), dayId, status));
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Calendario</div>
        <h1 className="font-mono text-2xl text-ink mt-1">Asistencia</h1>
      </header>

      <div className="flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="font-mono text-xs text-muted hover:text-ink">← mes anterior</button>
        <div className="font-mono text-sm text-ink capitalize">{monthLabel}</div>
        <button onClick={() => changeMonth(1)} className="font-mono text-xs text-muted hover:text-ink">mes siguiente →</button>
      </div>

      <div className="rounded border border-line/60 bg-panel p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-1 font-mono text-[10px] uppercase text-faint mb-1">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((date, di) => {
              if (!date) return <div key={di} />;
              const dateISO = toISODate(date);
              const status = statusOf(logs, dateISO);
              const isSelected = selected && toISODate(selected) === dateISO;
              return (
                <button
                  key={di}
                  onClick={() => setSelected(date)}
                  className={`aspect-square rounded text-xs font-mono flex items-center justify-center ${
                    status ? STATUS_COLOR[status] : "bg-panel-2 text-muted border border-line/60"
                  } ${isSelected ? "ring-2 ring-blueprint" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selected && (
        <div className="rounded border border-line/60 bg-panel p-4 sm:p-5">
          <div className="font-mono text-xs text-muted uppercase tracking-wide">
            {toISODate(selected)} · estado actual: {statusOf(logs, toISODate(selected)) ?? "sin registrar"}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => markSelected("trained")} className="rounded bg-progress-dim text-progress font-mono text-xs uppercase px-3 py-1.5 hover:brightness-125">
              Marcar entrenado
            </button>
            <button onClick={() => markSelected("rest")} className="rounded border border-line/60 text-muted font-mono text-xs uppercase px-3 py-1.5 hover:text-ink">
              Marcar descanso
            </button>
            <button onClick={() => markSelected("missed")} className="rounded border border-warn-dim text-warn font-mono text-xs uppercase px-3 py-1.5 hover:bg-warn-dim/20">
              Marcar perdido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
