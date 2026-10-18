
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { Logo, Home, Plus } from "./components/icons";
import HomePage from "./pages/homepage";
import TaskListPage from "./pages/tasklistpage";
import TaskDetailPage from "./pages/TaskDetailPage";
import AddTaskPage from "./pages/addtaskpage";
import EditTaskPage from "./pages/edittaskpage";
import DebtsPage from "./pages/debts";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from "@clerk/clerk-react";

function App() {
  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-brand">
          <Logo size={18} className="nav-brand__icon" />
          <span>TaskFlow</span>
        </Link>

        <Link to="/tasks">
          <Home size={16} /> Home
        </Link>

        <Link to="/tasks/new">
          <Plus size={16} /> Add Task
        </Link>

        <Link to="/debts">Debts</Link>

        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/tasks/new" element={<AddTaskPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
        <Route path="/debts" element={<DebtsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
