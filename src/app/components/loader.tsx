export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="task-list">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-lines">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--note" />
            <div className="skeleton skeleton--badge" />
          </div>
          <div className="skeleton-actions">
            <div className="skeleton skeleton--btn" />
            <div className="skeleton skeleton--btn" />
            <div className="skeleton skeleton--btn" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="loader-center">
      <div className="loader-ring" />
      <span className="mono">{text}</span>
    </div>
  );
}