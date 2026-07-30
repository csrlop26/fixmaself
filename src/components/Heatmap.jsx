import { getAdherenceDates } from "../lib/stats";
import { toISODate, addDays } from "../lib/dates";

export default function Heatmap({ logs, days = 14 }) {
  const adherent = new Set(getAdherenceDates(logs));
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateISO = toISODate(addDays(new Date(), -i));
    cells.push({ dateISO, on: adherent.has(dateISO) });
  }
  return (
    <div className="flex flex-wrap gap-1">
      {cells.map((c) => (
        <div
          key={c.dateISO}
          title={c.dateISO}
          className={`h-5 w-5 rounded-sm ${c.on ? "bg-progress" : "bg-panel-2 border border-line/60"}`}
        />
      ))}
    </div>
  );
}
