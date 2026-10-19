"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateTask, getTasks } from "@/lib/api/tasks/route";
import type { Task } from "@/lib/types/types";

function EditTaskForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const emptyForm: Task = {
    id: 0,
    title: "",
    note: null,
    date: null,
    enddate: null,
    done: false,
  };
  const [form, setForm] = useState<Task>(emptyForm);
const [saving, setSaving] = useState(false)
  // fill the inputs with the values of the task that has this id
  useEffect(() => {
    async function load() {
      const data = await getTasks();
      const found = (data.tasks ?? []).find((t: Task) => t.id === Number(id));
      if (found) {
        setForm({
          ...found,
          date: found.date ? found.date.slice(0, 10) : null,
          enddate: found.enddate ? found.enddate.slice(0, 10) : null,
        });
      }
    }
    load();
  }, [id]);

  async function handleedittask(form: Task) {
  setSaving(true);
  await updateTask(form);
  router.push("/tasks");
}
 return (
  <form
    className="task-form"
    onSubmit={(e) => {
      e.preventDefault();
      handleedittask(form);
    }}
  >
    <h1 className="task-form__title">Edit task</h1>
    <div className="field">
      <label className="field__label">Title</label>
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
    </div>
    <div className="field">
      <label className="field__label">Note</label>
      <textarea value={form.note ?? ""} onChange={(e) => setForm({ ...form, note: e.target.value || null })} />
    </div>
    <div className="field">
      <label className="field__label">Start date</label>
      <input type="date" value={form.date ?? ""} onChange={(e) => setForm({ ...form, date: e.target.value || null })} />
    </div>
    <div className="field">
      <label className="field__label">End date</label>
      <input type="date" value={form.enddate ?? ""} onChange={(e) => setForm({ ...form, enddate: e.target.value || null })} />
    </div>
    <label className="field__row">
      <input type="checkbox" checked={form.done} onChange={(e) => setForm({ ...form, done: e.target.checked })} />
      Done
    </label>
    <div className="task-form__actions">
     <button type="submit" className={`btn btn--primary ${saving ? "btn--loading" : ""}`} disabled={saving}>
  {saving && <span className="spinner" />} {saving ? "Saving..." : "Save"}
</button>
      <button type="button" className="btn btn--ghost" onClick={() => router.push("/tasks")}>Cancel</button>
    </div>
  </form>
);
}

export default function EditTaskPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <EditTaskForm />
    </Suspense>
  );
}