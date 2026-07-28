export function toISODate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO() {
  return toISODate(new Date());
}

export function startOfWeek(d = new Date()) {
  const dt = new Date(d);
  const day = dt.getDay(); // 0 domingo ... 6 sábado
  const diff = (day === 0 ? -6 : 1) - day; // lunes como inicio
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function weekKey(d = new Date()) {
  return toISODate(startOfWeek(d));
}

export function addDays(d, n) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

export function diffInWeeks(fromISO, toDate = new Date()) {
  const from = new Date(fromISO);
  const ms = toDate.getTime() - from.getTime();
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
}

export function diffInDays(fromISO, toDate = new Date()) {
  const from = new Date(fromISO);
  const ms = toDate.getTime() - from.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export const WEEKDAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
