"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Check, Trash2 } from "lucide-react";
import { getnonDoneTasks, updateTask, deleteTask } from "@/lib/api/tasks/route";
import type { Task } from "@/lib/types/types";
import { ListSkeleton } from "../../components/loader";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function NotDoneTasksPage() {
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
      const data = await getnonDoneTasks();
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

  async function handleMarkDone(task: Task) {
    try {
      await updateTask({ ...task, done: true });
      await loadTasks();
    } catch (e: any) {
      setError(e.message || "Could not update");
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Not completed tasks</h1>
          <p className="page-subtitle">{tasks.length} not completed.</p>
        </div>
        <div className="page-header__actions">
          <Link href="/tasks" className="btn btn--ghost">
            All tasks
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
        <div className="empty-state">
          <p>No tasks left to do.</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-item" key={task.id} data-state="open">
              <div className="task-item__content">
                <h3 className="task-item__title">
                  <Link href={`/tasks/${task.id}`}>{task.title}</Link>
                </h3>
                {task.note && <p className="task-item__note">{task.note}</p>}
                <div className="task-item__meta">
                  <span className="badge badge--pending">Not done</span>
                </div>
              </div>

              <div className="task-actions">
                <button
                  className="action action--toggle"
                  onClick={() => handleMarkDone(task)}
                  aria-label="Mark as done"
                  title="Mark as done"
                >
                  <Check size={16} />
                </button>
                <button
                  className="action action--delete"
                  onClick={() => setDeleteTarget(task)}
                  aria-label="Delete task"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this task?"
        message={`"${deleteTarget?.title ?? ""}" will be removed permanently.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}