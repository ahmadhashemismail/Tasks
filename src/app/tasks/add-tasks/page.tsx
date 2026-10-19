"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTask } from "@/lib/api/tasks/route";
import type { Task } from "@/lib/types/types";

const emptyForm: Task = {
  id: 0,
  title: "",
  note: null,
  date: null,
  enddate: null,
  done: false,
};

export default function AddTaskPage() {
  const router = useRouter();
  const [form, setForm] = useState<Task>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please enter a title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addTask(form);
      router.push("/tasks");
    } catch (e: any) {
      setError(e.message || "Could not add the task");
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <form className="task-form" onSubmit={handleSubmit}>
        <h1 className="task-form__title">Add a new task</h1>

        {error && <div className="banner banner--error">{error}</div>}

        <div className="field">
          <label className="field__label">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Task title..."
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field__label">Note</label>
          <textarea
            value={form.note ?? ""}
            onChange={(e) => setForm({ ...form, note: e.target.value || null })}
            placeholder="Task note..."
          />
        </div>

        <div className="field">
          <label className="field__label">Start date</label>
          <input
            type="date"
            value={form.date ?? ""}
            onChange={(e) => setForm({ ...form, date: e.target.value || null })}
          />
        </div>

        <div className="field">
          <label className="field__label">End date</label>
          <input
            type="date"
            value={form.enddate ?? ""}
            onChange={(e) => setForm({ ...form, enddate: e.target.value || null })}
          />
        </div>

        <div className="task-form__actions">
          <button
            type="submit"
            className={`btn btn--primary ${saving ? "btn--loading" : ""}`}
            disabled={saving}
          >
            {saving && <span className="spinner" />} {saving ? "Adding..." : "Add task"}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => router.push("/tasks")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}