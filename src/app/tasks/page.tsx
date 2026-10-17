"use client";
import { useEffect, useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { getTasks, addTask } from "@/lib/api/tasks/route";

type Task = {
  id: number;
  title: string;
  note: string | null;
  date: string | null;
  enddate: string | null;
  done: boolean;
};

export default function TasksPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // function 1: get the tasks (only when logged in)
  async function loadTasks() {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data.tasks ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) loadTasks();
  }, [isLoaded, isSignedIn]);

  // function 2: add a task (asks to login if needed)
  async function handleAddTask() {
    if (!isSignedIn) {
      setError("Please login to add tasks");
      return;
    }
    if (!title.trim()) return;
    try {
      await addTask({ title });
      setTitle("");
      setError("");
      loadTasks();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h1>My Tasks</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}{" "}
          {!isSignedIn && (
            <SignInButton mode="modal">
              <button>Login</button>
            </SignInButton>
          )}
        </p>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
      />
      <button onClick={handleAddTask}>Add</button>
{loading && <p>Loading tasks...</p>}
      {!isSignedIn  ? (
        <p>Login to see and add your tasks.</p>
      ) : tasks.length === 0 && !loading ? (
        <>
        <p>No tasks yet. Add your first task.</p>
       
        </> 
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}