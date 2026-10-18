/**
 * Tasks store plain calendar dates ("YYYY-MM-DD"). Parse them as local dates so
 * they never shift a day depending on the viewer's timezone. Pass
 * `endOfDay: true` for due dates so a task is still due *during* that day.
 */
export function parseDate(
  value: string | null | undefined,
  { endOfDay = false }: { endOfDay?: boolean } = {}
): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return new Date(value);
  const [, y, m, d] = match.map(Number);
  return endOfDay
    ? new Date(y, m - 1, d, 23, 59, 59, 999)
    : new Date(y, m - 1, d);
}

/** "2026-10-17T00:00:00.000Z" -> "2026-10-17" (what <input type="date"> and the DB expect). */
export function toDateInput(value: string | null | undefined): string | null {
  return value ? String(value).slice(0, 10) : null;
}
