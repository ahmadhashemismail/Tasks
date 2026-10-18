import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../lib/api";

/**
 * Task list lifecycle: load, optimistic toggle, soft remove, bulk-clear done.
 * A ref mirrors `tasks` so mutation callbacks stay stable (no stale closures)
 * and stay lint-clean on exhaustive-deps.
 */
export function useTasks() {
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const remove = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearDone = useCallback(async () => {
    const done = tasksRef.current?.filter((t) => t.done) ?? [];
    await Promise.all(done.map((t) => api.deleteTask(t.id)));
    setTasks((prev) => prev.filter((t) => !t.done));
  }, []);

  const toggleDone = useCallback(async (task) => {
    const next = { ...task, done: !task.done };
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? next : t))
    );
    try {
      await api.markDone(task.id, next);
    } catch (e) {
      // revert on failure and surface the error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...task } : t))
      );
      setError(e?.message ?? "Couldn't update task.");
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    remove,
    clearDone,
    toggleDone,
  };
}
