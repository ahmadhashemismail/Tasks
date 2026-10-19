"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { getTasks, updateTask, deleteTask } from "@/lib/api/tasks/route";
import type { Task } from "@/lib/types/types";
import { ListSkeleton } from "../components/loader";
import ConfirmDialog from "../components/ConfirmDialog";
function dueBadge(t: Task) {
  if (t.done) return <span className="badge badge--done">Done</span>;
  const today = new Date().toISOString().slice(0, 10);
  if (!t.enddate) return <span className="badge badge--neutral">No due date</span>;
  const d = t.enddate.slice(0, 10);
  if (d < today) return <span className="badge badge--expired">Expired {d}</span>;
  if (d === today) return <span className="badge badge--today">Due today</span>;
  return <span className="badge badge--neutral">Due {d}</span>;
}

export default function TasksPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  async function loadTasks() {
    setLoading(true);
    setError("");
    try {
      const data = await getTasks();
      // accept both { tasks: [...] } and a plain array
      setTasks(Array.isArray(data) ? data : data?.tasks ?? []);
    } catch (e: any) {
      setError(e.message || "Could not load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) loadTasks();
  }, [isLoaded, isSignedIn]);


  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      await loadTasks();
    } catch (e: any) {
      setError(e.message || "Could not delete");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleToggle(task: Task) {
    try {
      await updateTask({ ...task, done: !task.done });
      await loadTasks();
    } catch (e: any) {
      setError(e.message || "Could not update");
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>All tasks</h1>
          <p className="page-subtitle">{tasks.length} tasks in total.</p>
        </div>
        <div className="page-header__actions">
          <Link href="/tasks/add-tasks" className="btn btn--primary">
            <Plus size={16} /> New Task
          </Link>
        </div>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

          {!isLoaded || loading ? (
        <ListSkeleton />
      ) : !isSignedIn ? (
        <div className="empty-state">
          <p>Login to see your tasks.</p>
          <SignInButton mode="modal">
            <button className="btn btn--primary">Sign in</button>
          </SignInButton>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state"><p>No tasks yet. Add your first task.</p></div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-item" key={task.id} data-state={task.done ? "done" : "open"}>
              <div className="task-item__content">
                <h3 className={`task-item__title ${task.done ? "task-item__title--done" : ""}`}>
                  {task.title}
                </h3>
                {task.note && <p className="task-item__note">{task.note}</p>}
                <div className="task-item__meta">{dueBadge(task)}</div>
              </div>

              <div className="task-actions">
                <button
                  className={`action action--toggle ${task.done ? "action--toggle--on" : ""}`}
                  onClick={() => handleToggle(task)}
                  aria-label="Toggle done"
                  title="Done / not done"
                >
                  <Check size={16} />
                </button>
                <Link
                  href={`/tasks/edittask/${task.id}`}
                  className="action action--edit"
                  aria-label="Edit task"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                             <button
                  className="action action--delete"
                  onClick={() => setDeleteTarget(task)}
                  aria-label="Delete task"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
                    <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this task?"
        message={`"${deleteTarget?.title ?? ""}" will be removed permanently.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}