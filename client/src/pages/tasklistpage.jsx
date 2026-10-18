import { Link } from "react-router-dom";
import { List, Plus, Clear } from "../components/icons";
import { useTasks } from "../hooks/useTasks";
import TaskList from "../components/TaskList";
import Button from "../components/ui/Button";

export default function TaskListPage() {
  const { tasks, loading, error, toggleDone, remove, clearDone } = useTasks();
  const list = tasks ?? [];
  const doneCount = list.filter((t) => t.done).length;

  if (loading) return <main className="container"><p>Loading…</p></main>;

  return (
    <main className="container">
      <header className="page-header">
        <h1><List size={22} /> Task List</h1>
        <Link to="/tasks/new" className="btn btn--primary"><Plus size={16} /> New Task</Link>
      </header>

      {error && <div className="banner banner--error">{error}</div>}

      <TaskList
        tasks={list}
        onToggle={toggleDone}
        onDelete={remove}
        emptyMessage="No tasks yet. Create one to get started!"
        emptyAction={<Link to="/tasks/new" className="btn btn--primary"><Plus size={16} /> Create Your First Task</Link>}
      />

      {doneCount > 0 && (
        <div className="list-footer">
          <Button variant="ghost" onClick={clearDone}><Clear size={16} /> Remove Done Tasks</Button>
        </div>
      )}
    </main>
  );
}
