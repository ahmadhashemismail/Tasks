import { useParams } from "react-router-dom";
import TaskForm from "../components/TaskForm";

export default function EditTaskPage() {
  const { id } = useParams();
  return (
    <main className="container">
      <TaskForm mode="edit" taskId={id} />
    </main>
  );
}