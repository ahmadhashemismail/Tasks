import type { Task } from "@/lib/types/types";
const Base = "/server/";
// GET all tasks
export async function getTasks() {
  const res = await fetch(`${Base}tasks`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// GET one task
export async function getTask(id: number) {
  const res = await fetch(`${Base}tasks/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// POST new task

// POST new task
export async function addTask(task: Task) {
  const res = await fetch(`${Base}tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// PUT update task
export async function updateTask(task: Task) {
  const res = await fetch(`${Base}tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

// DELETE task
export async function deleteTask(id: number) {
  const res = await fetch(`${Base}tasks/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}
