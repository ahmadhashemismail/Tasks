import Badge from "./ui/Badge";
import { parseDate } from "../lib/dates";

/**
 * Derives a human-readable, color-coded status badge from a task's dates.
 * Replaces the previous inline `<span style={{ color }}>` logic.
 */
export default function TimeLeft({ task }) {
  if (task.done) return <Badge variant="done">Completed</Badge>;

  const start = parseDate(task.date);
  const end = parseDate(task.enddate, { endOfDay: true });
  const now = new Date();
  const msDay = 1000 * 60 * 60 * 24;

  let label, variant;

  if (!end) {
    label = "No due date";
    variant = "neutral";
  } else {
    const days = Math.floor((end - now) / msDay);
    const started = start ? now >= start : true;

    if (days < 0) {
      label = "Expired";
      variant = "expired";
    } else if (days === 0) {
      label = started ? "Due today" : "Starts today";
      variant = "today";
    } else if (!started) {
      label = "Not started";
      variant = "pending";
    } else {
      label = `${days} day${days === 1 ? "" : "s"} left`;
      variant = "pending";
    }
  }

  return <Badge variant={variant}>{label}</Badge>;
}
