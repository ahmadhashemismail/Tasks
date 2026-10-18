import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTask, deleteTask } from "../lib/api";
import { parseDate } from "../lib/dates";
import { Edit, ArrowLeft, Trash } from "../components/icons";
import TimeLeft from "../components/TimeLeft";
import Button from "../components/ui/Button";

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getTask(id);
        if (!cancelled) setTask(data);
      } catch (e) {
        if (!cancelled) setError(e?.message ?? "Couldn't load task.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      await deleteTask(id);
      navigate("/tasks", { replace: true });
    } catch (e) {
      setError(e?.message ?? "Couldn't delete task.");
      setDeleting(false);
    }
  };

  const formatDate = (d) => (d ? parseDate(d).toLocaleDateString() : "—");

  if (loading) return <main className="container"><p>Loading…</p></main>;
  if (!task) return <main className="container"><p>No task found.</p></main>;

  return (
    <main className="container">
      <article className="task-detail">
        <header className="task-detail__head">
          <TimeLeft task={task} />
          <h1>{task.title}</h1>
        </header>

        <dl className="task-detail__fields">
          <div>
            <dt>Status</dt>
            <dd>{task.done ? "Done" : "Active"}</dd>
          </div>
          <div>
            <dt>Start date</dt>
            <dd>{formatDate(task.date)}</dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>{formatDate(task.enddate)}</dd>
          </div>
          <div>
            <dt>Note</dt>
            <dd>{task.note || "—"}</dd>
          </div>
        </dl>

        {error && <div className="banner banner--error">{error}</div>}

        <div className="task-form__actions">
          <Link to={`/tasks/${id}/edit`} className="btn btn--ghost"><Edit size={16} /> Edit Task</Link>
          <Button variant="ghost" onClick={() => navigate("/tasks")}><ArrowLeft size={14} /> Back to List</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}><Trash size={16} /> Delete</Button>
        </div>
      </article>
    </main>
  );
}
