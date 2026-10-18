"use client";
import { SignInButton } from "@clerk/nextjs";

/** Shown instead of data when nobody is logged in. Uses the old empty-state look. */
export default function LoginPrompt({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      <SignInButton mode="modal">
        <button type="button" className="btn btn--primary">Login</button>
      </SignInButton>
    </div>
  );
}
