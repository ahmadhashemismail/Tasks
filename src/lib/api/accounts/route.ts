const Base = "/server/";

type Account = { name: string; email: string; clerk_user_id?: string };

export async function getAccount(id: number) {
  const res = await fetch(`${Base}accounts/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function createAccount(account: Account) {
  const res = await fetch(`${Base}accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function updateAccount(id: number, account: Account) {
  const res = await fetch(`${Base}accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function deleteAccount(id: number) {
  const res = await fetch(`${Base}accounts/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}