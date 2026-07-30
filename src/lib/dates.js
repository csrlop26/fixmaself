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

export function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay() === 0 ? 6 : first.getDay() - 1; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
