import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "done" | "pending" | "expired" | "today" | "neutral";
};

/** Small status badge. */
export default function Badge({
  variant = "neutral",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={["badge", `badge--${variant}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
