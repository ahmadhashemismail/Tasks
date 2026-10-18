import type { HTMLAttributes, ReactNode } from "react";

type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

/** Field — label + control + optional hint/error. */
export default function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
  ...props
}: FieldProps) {
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
