import type { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={["input", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
