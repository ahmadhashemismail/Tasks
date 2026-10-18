/** Small status badge. Variants: done | pending | expired | today | neutral */
export default function Badge({ variant = "neutral", className = "", children, ...props }) {
  return (
    <span
      className={["badge", `badge--${variant}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
