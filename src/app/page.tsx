"use client";
import Link from "next/link";
import { useTasks } from "@/hooks/useTasks";
import { Home, Plus, Clipboard, Check, Clock, ArrowRight } from "@/components/icons";
import StatCard from "@/components/ui/StatCard";
import TaskList from "@/components/TaskList";
import LoginPrompt from "@/components/LoginPrompt";

export default function HomePage() {
  const { isLoaded, isSignedIn, tasks, loading, error } = useTasks();
  const list = tasks ?? [];
  const total = list.length;
  const done = list.filter((t) => t.done).length;
  const left = total - done;
  const upcoming = list.filter((t) => !t.done).slice(0, 5);

  if (!isLoaded || (isSignedIn && loading)) {
    return <main className="container"><p>Loading…</p></main>;
  }

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <h1><Home size={22} /> TaskFlow</h1>
          <p className="page-subtitle">Your dashboard at a glance.</p>
        </div>
        <div className="page-header__actions">
          <Link href="/debts" className="btn btn--ghost">Debts</Link>
          <Link href="/tasks/new" className="btn btn--primary"><Plus size={16} /> New Task</Link>
        </div>
      </header>

      {error && <div className="banner banner--error">{error}</div>}

      {!isSignedIn ? (
        <LoginPrompt message="Login to see your dashboard and add tasks." />
      ) : (
        <>
          <section className="stats" aria-label="Task stats">
            <StatCard icon={<Clipboard size={22} />} label="Total tasks" value={total} />
            <StatCard icon={<Check size={22} />} label="Completed" value={done} variant="done" />
            <StatCard icon={<Clock size={22} />} label="Left to do" value={left} variant="pending" />
          </section>

          <section className="recent" aria-label="Upcoming tasks">
            <div className="recent__header">
              <h2>Up next</h2>
              <Link href="/tasks" className="recent__link"><ArrowRight size={14} /> View all tasks</Link>
            </div>
            <TaskList
              tasks={upcoming}
              emptyMessage="All caught up! Create a task to get started."
              emptyAction={<Link href="/tasks/new" className="btn btn--primary"><Plus size={16} /> New Task</Link>}
            />
          </section>
        </>
      )}
    </main>
  );
}
