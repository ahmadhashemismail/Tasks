/**
 * Field — label + control + optional hint/error. Children is the control
 * (Input/Textarea/etc) so the component stays generic.
 */
export default function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
  ...props
}) {
  return (
    <div className={["field", className].filter(Boolean).join(" ")} {...props}>
      {label && (
        <label htmlFor={htmlFor} className="field__label">
          {label}
        </label>
      )}
      {children}
      {error && <p className="field__error">{error}</p>}
      {hint && !error && <p className="field__hint">{hint}</p>}
    </div>
  );
}
