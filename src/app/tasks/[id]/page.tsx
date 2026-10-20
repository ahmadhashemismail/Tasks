"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, Circle, FileText, Pencil } from "lucide-react";
import type { Task } from "@/lib/types/types";
import { getTask } from "@/lib/api/tasks/route";

type Status = "loading" | "ready" | "notfound" | "error";

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const data = await getTask(Number(id));
        if (!cancelled) {
          setTask(data);
          setStatus("ready");
        }
      } catch (error: unknown) {
        console.error(error);
        if (cancelled) return;
        setStatus(
          error instanceof Error && error.message === "Task not found"
            ? "notfound"
            : "error",
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="container task-details-page">
      <Link href="/tasks" className="task-details__back">
        <ArrowLeft size={16} />
        <span>Back to tasks</span>
      </Link>

      {status === "loading" && (
        <div className="task-details__message">
          <span className="spinner" />
          <p>Loading your task...</p>
        </div>
      )}

      {status === "notfound" && (
        <div className="empty-state task-details__message">
          <p>This task couldn&apos;t be found.</p>
          <Link href="/tasks" className="btn btn--primary">
            View all tasks
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="banner banner--error task-details__error">
          Failed to load the task. Please try again.
        </div>
      )}

      {status === "ready" && task && (
        <article className="task-details">
          <header className="task-details__header">
            <div className="task-details__heading">
              <span className="task-details__eyebrow">Task details</span>
              <h1>{task.title}</h1>
              <span
                className={`badge ${task.done ? "badge--done" : "badge--pending"}`}
              >
                {task.done ? <Check size={13} /> : <Circle size={11} />}
                {task.done ? "Completed" : "In progress"}
              </span>
            </div>
            <Link
              href={`/tasks/edittask/${task.id}`}
              className="btn btn--ghost task-details__edit"
            >
              <Pencil size={15} />
              Edit task
            </Link>
          </header>

          <div className="task-details__body">
            <section className="task-details__note">
              <h2>
                <FileText size={16} />
                Notes
              </h2>
              <p>{task.note || "No notes added yet."}</p>
            </section>

            <section className="task-details__dates" aria-label="Task dates">
              <div className="task-details__date">
                <span className="task-details__date-icon">
                  <CalendarDays size={17} />
                </span>
                <div>
                  <span className="task-details__label">Start date</span>
                  <strong>{formatDate(task.date)}</strong>
                </div>
              </div>
              <div className="task-details__date">
                <span className="task-details__date-icon">
                  <CalendarDays size={17} />
                </span>
                <div>
                  <span className="task-details__label">Due date</span>
                  <strong>{formatDate(task.enddate)}</strong>
                </div>
              </div>
            </section>
          </div>
        </article>
      )}
    </main>
  );
}
