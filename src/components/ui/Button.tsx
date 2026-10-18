import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost" | "danger";
  loading?: boolean;
};

/**
 * Button — variants map 1:1 to the `.btn--*` classes in app.css.
 * `loading` disables the button and shows a spinner.
 */
export default function Button({
  variant = "default",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, loading && "btn--loading", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      {loading && <span className="spinner" aria-hidden="true" />}
    </button>
  );
}
