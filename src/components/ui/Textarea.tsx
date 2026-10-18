import type { TextareaHTMLAttributes } from "react";

export default function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={["textarea", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
