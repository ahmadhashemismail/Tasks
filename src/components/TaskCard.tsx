"use client";
import Link from "next/link";
import { Check, Circle, Edit, Trash } from "./icons";
import TimeLeft from "./TimeLeft";
import type { Task } from "@/lib/types";

type TaskCardProps = {
  task: Task;
  onToggle?: (task: Task) => void;
  onDelete?: (id: number) => void;
};

/**
 * A single task row: a tappable card body plus a compact icon
 * action strip (toggle / edit / delete).
 */
export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const titleClasses = ["task-item__title", task.done && "task-item__title--done"]
    .filter(Boolean)
    .join(" ");

  return (
    <li className="task-item" data-state={task.done ? "done" : "active"}>
      <Link href={`/tasks/${task.id}`} className="task-item__content">
        <h2 className={titleClasses}>{task.title}</h2>
        {task.note && <p className="task-item__note">{task.note}</p>}
        <div className="task-item__meta">
          <TimeLeft task={task} />
        </div>
      </Link>

      <div className="task-actions">
        {onToggle && (
          <button
            type="button"
            className={
              task.done
                ? "action action--toggle action--toggle--on"
                : "action action--toggle"
            }
            aria-label={task.done ? "Mark as not done" : "Mark as done"}
            title={task.done ? "Mark as not done" : "Mark as done"}
            onClick={() => onToggle(task)}
          >
            {task.done ? <Check size={16} /> : <Circle size={16} />}
          </button>
        )}
        <Link
          href={`/tasks/${task.id}/edit`}
          className="action action--edit"
          aria-label="Edit"
          title="Edit"
        >
          <Edit size={16} />
        </Link>
        {onDelete && (
          <button
            type="button"
            className="action action--delete"
            aria-label="Delete"
            title="Delete"
            onClick={() => onDelete(task.id)}
          >
            <Trash size={16} />
          </button>
        )}
      </div>
    </li>
  );
}
