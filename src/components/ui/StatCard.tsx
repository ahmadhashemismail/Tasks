import type { HTMLAttributes, ReactNode } from "react";

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  variant?: "default" | "done" | "pending" | "expired";
};

/** Dashboard stat card: an icon, a value, and a label. */
export default function StatCard({
  icon,
  value,
  label,
  variant = "default",
  className = "",
  ...props
}: StatCardProps) {
  return (
    <div
      className={["stat-card", `stat-card--${variant}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      <span className="stat-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="stat-card__body">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </div>
  );
}
