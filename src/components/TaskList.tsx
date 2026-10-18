"use client";
import type { ReactNode } from "react";
import TaskCard from "./TaskCard";
import type { Task } from "@/lib/types";

type TaskListProps = {
  tasks: Task[];
  onToggle?: (task: Task) => void;
  onDelete?: (id: number) => void;
  emptyMessage?: string;
  emptyAction?: ReactNode;
};

/** Renders the empty state or the list of TaskCards. */
export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  emptyMessage = "Nothing here yet.",
  emptyAction,
}: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
