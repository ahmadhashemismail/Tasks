"use client";
import Link from "next/link";
import { List, Plus, Clear } from "@/components/icons";
import { useTasks } from "@/hooks/useTasks";
import TaskList from "@/components/TaskList";
import Button from "@/components/ui/Button";
import LoginPrompt from "@/components/LoginPrompt";

export default function TaskListPage() {
  const { isLoaded, isSignedIn, tasks, loading, error, toggleDone, remove, clearDone } = useTasks();
  const list = tasks ?? [];
  const doneCount = list.filter((t) => t.done).length;

  if (!isLoaded || (isSignedIn && loading)) {
    return <main className="container"><p>Loading…</p></main>;
  }

  return (
    <main className="container">
      <header className="page-header">
        <h1><List size={22} /> Task List</h1>
        <Link href="/tasks/new" className="btn btn--primary"><Plus size={16} /> New Task</Link>
      </header>

      {error && <div className="banner banner--error">{error}</div>}

      {!isSignedIn ? (
        <LoginPrompt message="Login to see and add your tasks." />
      ) : (
        <>
          <TaskList
            tasks={list}
            onToggle={toggleDone}
            onDelete={remove}
            emptyMessage="No tasks yet. Create one to get started!"
            emptyAction={<Link href="/tasks/new" className="btn btn--primary"><Plus size={16} /> Create Your First Task</Link>}
          />

          {doneCount > 0 && (
            <div className="list-footer">
              <Button variant="ghost" onClick={clearDone}><Clear size={16} /> Remove Done Tasks</Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
