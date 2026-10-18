"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Plus, Edit as EditIcon, Save } from "./icons";
import { addTask, updateTask, getTask } from "@/lib/api/tasks/route";
import { errorMessage } from "@/lib/format";
import { toDateInput } from "@/lib/dates";
import type { Task } from "@/lib/types";
import Field from "./ui/Field";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";
import LoginPrompt from "./LoginPrompt";

type FormErrors = { title?: string; date?: string; enddate?: string };

/**
 * Shared Add / Edit form. `mode` toggles between creating a new task
 * and editing an existing one (fetched by `taskId`). Validation is
 * inline, and the due date can't precede the start date.
 */
export default function TaskForm({
  mode = "create",
  taskId,
}: {
  mode?: "create" | "edit";
  taskId?: string;
}) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [enddate, setEnddate] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

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
    if (mode !== "edit" || !taskId || !isLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const data: Task = await getTask(Number(taskId));
        if (cancelled) return;
        setTitle(data.title ?? "");
        setNote(data.note ?? "");
        setDate(toDateInput(data.date) ?? "");
        setEnddate(toDateInput(data.enddate) ?? "");
        setDone(Boolean(data.done));
      } catch (e) {
        if (!cancelled) setError(errorMessage(e, "Couldn't load task."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, taskId, isLoaded, isSignedIn]);

  const validate = () => {
    const next: FormErrors = {};
    if (!title.trim()) next.title = "Title is required.";
    if (!date) next.date = "Pick a start date.";
    if (date && enddate && enddate < date) {
      next.enddate = "Due date can't be before the start date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    setError("");
    try {
      // Empty optional fields go to the database as null, never as "".
      const payload = {
        title: title.trim(),
        note: note.trim() ? note : null,
        date,
        enddate: enddate || null,
      };
      if (mode === "edit" && taskId) {
        // Editing must not silently un-complete a finished task.
        await updateTask(Number(taskId), { ...payload, done });
        router.replace(`/tasks/${taskId}`);
      } else {
        const created = await addTask(payload);
        router.push(created?.id ? `/tasks/${created.id}` : "/tasks");
      }
    } catch (err) {
      setError(errorMessage(err, "Something went wrong."));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoaded && !isSignedIn) {
    return (
      <main className="container">
        <LoginPrompt message={mode === "edit" ? "Login to edit tasks." : "Login to add tasks."} />
      </main>
    );
  }

  if (!isLoaded || loading) return <main className="container"><p>Loading…</p></main>;

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

        <Field label="Note" htmlFor="note" hint="Optional details">
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
          <Link href={cancelTo} className="btn btn--ghost">Cancel</Link>
        </div>
      </form>
    </main>
  );
}
