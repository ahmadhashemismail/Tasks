import Link from "next/link";
import { Suspense } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Logo, Home, Plus } from "./icons";

export default function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <Logo size={18} className="nav-brand__icon" />
        <span>TaskFlow</span>
      </Link>

      <Link href="/tasks">
        <Home size={16} /> Home
      </Link>

      <Link href="/tasks/new">
        <Plus size={16} /> Add Task
      </Link>

      <Link href="/debts">Debts</Link>

      {/* Show reads the login cookie, so it must sit inside <Suspense> */}
      <Suspense fallback={null}>
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </Suspense>
    </nav>
  );
}
