import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit as EditIcon, Save } from "./icons";
import { createTask, updateTask, getTask } from "../lib/api";
import Field from "./ui/Field";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";

/**
 * Shared Add / Edit form. `mode` toggles between creating a new task
 * and editing an existing one (fetched by `taskId`). Validation is
 * inline — no `alert()`s — and dates are validated so the due date
 * can't precede the start date.
 */
export default function TaskForm({ mode = "create", taskId }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [enddate, setEnddate] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const heading =
    mode === "edit" ? (
      <>
        <EditIcon size={20} /> Edit Task
      </>
    ) : (
      <>
        <Plus size={20} /> Create New Task
      </>
    );
  const actionLabel = mode === "edit" ? "Update Task" : "Save Task";
  const cancelTo = mode === "edit" ? `/tasks/${taskId}` : "/tasks";

  useEffect(() => {
    if (mode !== "edit" || !taskId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getTask(taskId);
        if (cancelled) return;
        setTitle(data.title ?? "");
        setNote(data.note ?? "");
        setDate(data.date ? String(data.date).slice(0, 10) : "");
        setEnddate(data.enddate ? String(data.enddate).slice(0, 10) : "");
        setDone(Boolean(data.done));
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "Couldn't load task.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, taskId]);

  const validate = () => {
    const next = {};
    if (!title.trim()) next.title = "Title is required.";
    if (!date) next.date = "Pick a start date.";
    if (date && enddate && enddate < date) {
      next.enddate = "Due date can't be before the start date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    setError("");
    try {
      // Editing must not silently un-complete a finished task.
      const payload = { title, note, date, enddate, done: mode === "edit" ? done : false };
      if (mode === "edit" && taskId) {
        await updateTask(taskId, payload);
        navigate(`/tasks/${taskId}`, { replace: true });
      } else {
        const created = await createTask(payload);
        navigate(created?.id ? `/tasks/${created.id}` : "/tasks");
      }
    } catch (err) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="container"><p>Loading…</p></main>;

  return (
    <main className="container">
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <h1 className="task-form__title">{heading}</h1>

        <Field label="Title" htmlFor="title" error={errors.title}>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
          />
        </Field>

        <Field label="Note" htmlFor="note" hint="Optional details" error={errors.note}>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note…"
          />
        </Field>

        <Field label="Start date" htmlFor="date" error={errors.date}>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <Field
          label="Due date"
          htmlFor="enddate"
          hint="Optional — must be on or after the start date"
          error={errors.enddate}
        >
          <Input
            id="enddate"
            type="date"
            value={enddate}
            onChange={(e) => setEnddate(e.target.value)}
          />
        </Field>

        {error && <div className="banner banner--error">{error}</div>}

        <div className="task-form__actions">
          <Button type="submit" variant="primary" loading={submitting}>
            <Save size={16} /> {actionLabel}
          </Button>
          <Link to={cancelTo} className="btn btn--ghost">Cancel</Link>
        </div>
      </form>
    </main>
  );
}
