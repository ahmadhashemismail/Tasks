"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateCustomer, getCustomers } from "@/lib/api/customers/route";
import type { Customer } from "@/lib/types/types";

function EditCustomerForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const emptyForm = { id: 0, name: "", debts: 0, cost: 0, balance: 0 };
  const [form, setForm] = useState<Customer>(emptyForm);

  // fill the inputs with the values of the customer that has this id
  useEffect(() => {
    async function load() {
      const data = await getCustomers();
      const found = (data.customers ?? []).find(
        (c: Customer) => c.id === Number(id)
      );
      if (found) {
        setForm({
          ...found,
          debts: Number(found.debts),
          cost: Number(found.cost),
        });
      }
    }
    load();
  }, [id]);

  async function handleeditcustomer(form: Customer) {
    await updateCustomer(form);
    router.push("/customer");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleeditcustomer(form);
      }}
    >
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Customer name..."
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={form.debts}
        onChange={(e) =>
          setForm({ ...form, debts: parseFloat(e.target.value) || 0 })
        }
        placeholder="Debts..."
      />
      <input
        type="number"
        min="0"
        step="0.01"
        value={form.cost}
        onChange={(e) =>
          setForm({ ...form, cost: parseFloat(e.target.value) || 0 })
        }
        placeholder="Cost..."
      />
      <button type="submit">Edit</button>
      <button type="button" onClick={() => router.push("/customer")}>
        Cancel
      </button>
    </form>
  );
}

export default function EditCustomerPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <EditCustomerForm />
    </Suspense>
  );
}