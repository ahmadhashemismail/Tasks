"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  Check,
  Clock,
  Home,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { getTasks, updateTask, deleteTask } from "@/lib/api/tasks/route";
import { ListSkeleton } from "./components/loader";
import type { Task } from "@/lib/types/types";

function dueBadge(t: Task) {
  const today = new Date().toISOString().slice(0, 10);
  if (!t.enddate)
    return <span className="badge badge--neutral">No due date</span>;
  const d = t.enddate.slice(0, 10);
  if (d < today && !t.done)
    return <span className="badge badge--expired">Expired {d}</span>;
  if (d === today) return <span className="badge badge--today">Due today</span>;
  return <span className="badge badge--neutral">Due {d}</span>;
}

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : (data?.tasks ?? []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false); // always stop the skeleton
    }
  }

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) loadTasks();
    else setLoading(false);
  }, [isLoaded, isSignedIn]);

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(id);
    await loadTasks();
  }

  async function handleToggle(task: Task) {
    await updateTask({ ...task, done: !task.done });
    await loadTasks();
  }

  const completed = tasks.filter((t) => t.done).length;
  const upNext = tasks.filter((t) => !t.done).slice(0, 5);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>
            <Home size={28} style={{ verticalAlign: "-4px" }} /> TaskFlow
          </h1>
          <p className="page-subtitle">Your dashboard at a glance.</p>
        </div>
        <div className="page-header__actions">
          <Link href="/customer" className="btn">
            Debts
          </Link>
          <Link href="/tasks/add-tasks" className="btn btn--primary">
            <Plus size={16} /> New Task
          </Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <ShoppingBag className="stat-card__icon" />
          <div className="stat-card__body">
            <Link href="/tasks" className="stat-card__body" >
              <span className="stat-card__value">{tasks.length}</span>
              <span className="stat-card__label">Total tasks</span>
            </Link>{" "}
          </div>
        </div>
        <div className="stat-card stat-card--done">
          <Check className="stat-card__icon" />
          <div >
             <Link href="/tasks/donetasks" className="stat-card__body">
            <span className="stat-card__value">{completed}</span>
            <span className="stat-card__label">Completed</span>
         </Link> </div>
        </div>
        <div className="stat-card stat-card--pending">
          <Clock className="stat-card__icon" />
          <div className="stat-card__body">
            <Link href="/tasks/notdone" className="stat-card__body">
            <span className="stat-card__value">{tasks.length - completed}</span>
            <span className="stat-card__label">Left to do</span>
          </Link></div>
        </div>
      </div>

      <div className="recent__header">
        <h2>Up next</h2>
        <Link href="/tasks" className="recent__link">
          <ArrowRight size={16} /> View all tasks
        </Link>
      </div>

      {!isLoaded || loading ? (
        <ListSkeleton />
      ) : !isSignedIn ? (
        <div className="empty-state">
          <p>Sign in to see your tasks.</p>
        </div>
      ) : upNext.length === 0 ? (
        <div className="empty-state">
          <p>No tasks left. Add a new one.</p>
        </div>
      ) : (
        <div className="task-list">
          {upNext.map((t) => (
            <div className="task-item" key={t.id}>
              <div className="task-item__content">
                <h3 className="task-item__title">{t.title}</h3>
                {t.note && <p className="task-item__note">{t.note}</p>}
                <div className="task-item__meta">{dueBadge(t)}</div>
              </div>
              <div className="task-actions">
                <button
                  className={`action action--toggle ${t.done ? "action--toggle--on" : ""}`}
                  onClick={() => handleToggle(t)}
                  aria-label="Toggle done"
                >
                  <Check size={16} />
                </button>
                <Link
                  href={`/tasks/edittask/${t.id}`}
                  className="action action--edit"
                  aria-label="Edit task"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  className="action action--delete"
                  onClick={() => handleDelete(t.id)}
                  aria-label="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
