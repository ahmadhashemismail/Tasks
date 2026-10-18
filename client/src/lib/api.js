
import { useAuth } from "@clerk/clerk-react";

// Local development uses Express; production uses configured API URL
// or the same origin as the deployed frontend.
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:4000"
    : window.location.origin)
).replace(/\/$/, "");

const BASE = `${API_URL}/api`;

// Create this inside a React component and pass getToken to the helper.
export function createApi(getToken) {
  async function request(path, { method = "GET", body } = {}) {
    const token = await getToken();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const error = new Error(
        data?.error || res.statusText || "Request failed"
      );
      error.status = res.status;
      error.payload = data;
      throw error;
    }

    return data;
  }

  return {
    getTasks: () => request("/tasks"),

    getTask: (id) => request(`/tasks/${encodeURIComponent(id)}`),

    createTask: (task) =>
      request("/tasks", { method: "POST", body: task }),

    updateTask: (id, task) =>
      request(`/tasks/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: task,
      }),

    markDone: (id, task) =>
      request(`/markdone/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: task,
      }),

    deleteTask: (id) =>
      request(`/tasks/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),

    getCustomers: () => request("/customers"),

    createCustomer: (customer) =>
      request("/customers", { method: "POST", body: customer }),

    updateCustomer: (id, customer) =>
      request(`/customers/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: customer,
      }),

    deleteCustomer: (id) =>
      request(`/customers/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  };
}

// Use this hook from your React components.
export function useApi() {
  const { getToken } = useAuth();

  return createApi(getToken);
}
