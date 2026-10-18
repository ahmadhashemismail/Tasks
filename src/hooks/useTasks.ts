"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getTasks, updateTask, deleteTask } from "@/lib/api/tasks/route";
import { toDateInput } from "@/lib/dates";
import { errorMessage } from "@/lib/format";
import type { Task } from "@/lib/types";

/**
 * Task list lifecycle: load (only when logged in), optimistic toggle,
 * remove, bulk-clear done.
 */
export function useTasks() {
  const { isLoaded, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getTasks();
        if (!cancelled) setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
      } catch (e) {
        if (!cancelled) {
          setError(errorMessage(e, "Couldn't load tasks."));
          setTasks([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  const remove = useCallback(async (id: number) => {
    try {
      await deleteTask(id);
      setTasks((prev) => (prev ?? []).filter((t) => t.id !== id));
    } catch (e) {
      setError(errorMessage(e, "Couldn't delete task."));
    }
  }, []);

  const clearDone = useCallback(async () => {
    const done = (tasks ?? []).filter((t) => t.done);
    try {
      await Promise.all(done.map((t) => deleteTask(t.id)));
      setTasks((prev) => (prev ?? []).filter((t) => !t.done));
    } catch (e) {
      setError(errorMessage(e, "Couldn't remove done tasks."));
    }
  }, [tasks]);

  const toggleDone = useCallback(async (task: Task) => {
    const next = { ...task, done: !task.done };
    setTasks((prev) => (prev ?? []).map((t) => (t.id === task.id ? next : t)));
    try {
      await updateTask(task.id, {
        title: task.title,
        note: task.note,
        date: toDateInput(task.date),
        enddate: toDateInput(task.enddate),
        done: next.done,
      });
    } catch (e) {
      // revert on failure and surface the error
      setTasks((prev) => (prev ?? []).map((t) => (t.id === task.id ? { ...task } : t)));
      setError(errorMessage(e, "Couldn't update task."));
    }
  }, []);

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    tasks,
    loading,
    error,
    remove,
    clearDone,
    toggleDone,
  };
}
