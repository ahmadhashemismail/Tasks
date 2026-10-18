/**
 * Button — works as <button> or <a> (pass `as`). Variants map 1:1 to the
 * `.btn--*` classes in App.css. `loading` disables + shows a spinner.
 */
export default function Button({
  variant = "default",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    loading && "btn--loading",
    className,
  ]
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
