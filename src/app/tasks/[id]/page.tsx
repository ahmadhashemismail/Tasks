import { Suspense } from "react";
import TaskDetail from "@/components/TaskDetail";

type Params = Promise<{ id: string }>;

// `params` is request-time data, so it is read inside <Suspense>
async function Content({ params }: { params: Params }) {
  const { id } = await params;
  return <TaskDetail id={id} />;
}

export default function TaskDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<main className="container"><p>Loading…</p></main>}>
      <Content params={params} />
    </Suspense>
  );
}
