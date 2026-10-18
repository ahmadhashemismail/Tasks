import TaskForm from "../components/TaskForm";

export default function AddTaskPage() {
  return (
    <main className="container">
      <TaskForm mode="create" />
    </main>
  );
}