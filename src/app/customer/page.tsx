
import { useEffect, useState } from "react";
import { getCustomers, addCustomer } from "@/lib/api/customers/route";

type Customer = {
  id: number;
  name: string;
  debts: string; // numeric columns come back from Postgres as strings
  cost: string;
  balance: string;
};

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [debts, setDebts] = useState("");
  const [error, setError] = useState("");

  // function 1: get the customers (with their debts) from the api
  async function loadCustomers() {
    try {
      const data = await getCustomers();
      setCustomers(data.customers ?? []);
    } catch (e: any) {
      setError(e.message);
    }
  }

  // run once when the page opens
  useEffect(() => {
    loadCustomers();
  }, []);

  // function 2: add a customer with a debt using the api
  async function handleAddCustomer() {
    if (!name.trim()) return;
    try {
      await addCustomer({ name, debts: Number(debts) || 0 });
      setName("");
      setDebts("");
      loadCustomers(); // reload the list
    } catch (e: any) {
      setError(e.message);
    }
  }

  // total of all debts
  const totalDebts = customers.reduce((sum, c) => sum + Number(c.debts), 0);

  return (
    <div>
      <h1>Customers & Debts</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Customer name..."
      />
      <input
        type="number"
        min="0"
        value={debts}
        onChange={(e) => setDebts(e.target.value)}
        placeholder="Debts..."
      />
      <button onClick={handleAddCustomer}>Add</button>

      {customers.length === 0 ? (
        <p>No customers yet. Add your first customer.</p>
      ) : (
        <>
          <ul>
            {customers.map((c) => (
              <li key={c.id}>
                {c.name} — debts: {c.debts}
              </li>
            ))}
          </ul>
          <p>Total debts: {totalDebts}</p>
        </>
      )}
    </div>
  );
}