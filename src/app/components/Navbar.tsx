"use client";
import Link from "next/link";
import { CircleCheck, Home, Plus } from "lucide-react";
import { Show, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <CircleCheck size={20} className="nav-brand__icon" /> TaskFlow
      </Link>
      <Link href="/"><Home size={16} /> Home</Link>
      <Link href="/tasks">Tasks</Link>
      <Link href="/tasks/add-tasks"><Plus size={16} /> Add Task</Link>
      <Link href="/customer">Debts</Link>

      <Show
        when="signed-in"
        fallback={
          <>
            <SignInButton mode="modal"><button className="btn">Sign in</button></SignInButton>
            <SignUpButton mode="modal"><button className="btn">Sign up</button></SignUpButton>
          </>
        }
      >
        <UserButton />
      </Show>
    </nav>
  );
}