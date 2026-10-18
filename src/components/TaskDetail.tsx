"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getTask, deleteTask } from "@/lib/api/tasks/route";
import { parseDate } from "@/lib/dates";
import { errorMessage } from "@/lib/format";
import type { Task } from "@/lib/types";
import { Edit, ArrowLeft, Trash } from "./icons";
import TimeLeft from "./TimeLeft";
import Button from "./ui/Button";
import LoginPrompt from "./LoginPrompt";

export default function TaskDetail({ id }: { id: string }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || !isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const data: Task = await getTask(Number(id));
        if (!cancelled) setTask(data);
      } catch (e) {
        if (!cancelled) setError(errorMessage(e, "Couldn't load task."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isLoaded, isSignedIn]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      await deleteTask(Number(id));
      router.replace("/tasks");
    } catch (e) {
      setError(errorMessage(e, "Couldn't delete task."));
      setDeleting(false);
    }
  };

  const formatDate = (d: string | null) => {
    const parsed = parseDate(d);
    return parsed ? parsed.toLocaleDateString() : "—";
  };

  if (isLoaded && !isSignedIn) {
    return (
      <main className="container">
        <LoginPrompt message="Login to see this task." />
      </main>
    );
  }
  if (!isLoaded || loading) return <main className="container"><p>Loading…</p></main>;
  if (!task) return <main className="container"><p>{error || "No task found."}</p></main>;

  return (
    <main className="container">
      <article className="task-detail">
        <header className="task-detail__head">
          <TimeLeft task={task} />
          <h1>{task.title}</h1>
        </header>

        <dl className="task-detail__fields">
          <div>
            <dt>Status</dt>
            <dd>{task.done ? "Done" : "Active"}</dd>
          </div>
          <div>
            <dt>Start date</dt>
            <dd>{formatDate(task.date)}</dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>{formatDate(task.enddate)}</dd>
          </div>
          <div>
            <dt>Note</dt>
            <dd>{task.note || "—"}</dd>
          </div>
        </dl>

        {error && <div className="banner banner--error">{error}</div>}

        <div className="task-form__actions">
          <Link href={`/tasks/${id}/edit`} className="btn btn--ghost"><Edit size={16} /> Edit Task</Link>
          <Button variant="ghost" onClick={() => router.push("/tasks")}><ArrowLeft size={14} /> Back to List</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}><Trash size={16} /> Delete</Button>
        </div>
      </article>
    </main>
  );
}
