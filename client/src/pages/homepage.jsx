import { Link } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import { Home, Plus, Clipboard, Check, Clock, ArrowRight } from "../components/icons";
import StatCard from "../components/ui/StatCard";
import TaskList from "../components/TaskList";

export default function Homepage() {
  const { tasks, loading, error } = useTasks();
  const list = tasks ?? [];
  const total = list.length;
  const done = list.filter((t) => t.done).length;
  const left = total - done;
  const upcoming = list.filter((t) => !t.done).slice(0, 5);

  if (loading) return <main className="container"><p>Loading…</p></main>;

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <h1><Home size={22} /> TaskFlow</h1>
          <p className="page-subtitle">Your dashboard at a glance.</p>
        </div>
        <div className="page-header__actions">
          <Link to="/debts" className="btn btn--ghost">Debts</Link>
          <Link to="/tasks/new" className="btn btn--primary"><Plus size={16} /> New Task</Link>
        </div>
      </header>

      {error && <div className="banner banner--error">{error}</div>}

      <section className="stats" aria-label="Task stats">
        <StatCard icon={<Clipboard size={22} />} label="Total tasks" value={total} />
        <StatCard icon={<Check size={22} />} label="Completed" value={done} variant="done" />
        <StatCard icon={<Clock size={22} />} label="Left to do" value={left} variant="pending" />
      </section>

      <section className="recent" aria-label="Upcoming tasks">
        <div className="recent__header">
          <h2>Up next</h2>
          <Link to="/tasks" className="recent__link"><ArrowRight size={14} /> View all tasks</Link>
        </div>
        <TaskList
          tasks={upcoming}
          emptyMessage="All caught up! Create a task to get started."
          emptyAction={<Link to="/tasks/new" className="btn btn--primary"><Plus size={16} /> New Task</Link>}
        />
      </section>
    </main>
  );
}
