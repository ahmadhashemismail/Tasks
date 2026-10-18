import { Suspense } from "react";
import TaskForm from "@/components/TaskForm";

type Params = Promise<{ id: string }>;

// `params` is request-time data, so it is read inside <Suspense>
async function Content({ params }: { params: Params }) {
  const { id } = await params;
  return (
    <main className="container">
      <TaskForm mode="edit" taskId={id} />
    </main>
  );
}

export default function EditTaskPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<main className="container"><p>Loading…</p></main>}>
      <Content params={params} />
    </Suspense>
  );
}
