/**
 * Tasks store plain calendar dates ("YYYY-MM-DD"). Parse them as local dates so
 * they never shift a day depending on the viewer's timezone. Pass
 * `endOfDay: true` for due dates so a task is still due *during* that day.
 */
export function parseDate(value, { endOfDay = false } = {}) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return new Date(value);
  const [, y, m, d] = match.map(Number);
  return endOfDay
    ? new Date(y, m - 1, d, 23, 59, 59, 999)
    : new Date(y, m - 1, d);
}
