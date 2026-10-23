import type {Customer} from "@/lib/types/types";
const Base = "/server/";

export async function getCustomers(): Promise<{ customers: Customer[] }> {
  const res = await fetch(`${Base}customer`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data as { customers: Customer[] };
}

export async function getCustomer(id: number) {
  const res = await fetch(`${Base}customer/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function addCustomer(customer: Customer): Promise<Customer> {
  const res = await fetch(`${Base}customer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data as Customer;
}

export async function updateCustomer( customer: Customer) {
  const res = await fetch(`${Base}customer/${customer.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function deleteCustomer(id: number) {
  const res = await fetch(`${Base}customer/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}