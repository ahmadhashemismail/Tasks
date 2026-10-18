import TaskCard from "./TaskCard";

/**
 * Renders a TaskList empty state or the list of TaskCards.
 * Consumers pass the same action handlers they'd hand to TaskCard.
 */
export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  emptyMessage = "Nothing here yet.",
  emptyAction,
}) {
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
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
