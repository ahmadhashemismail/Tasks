import { useEffect, useState } from "react";
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "../lib/api";
import Field from "../components/ui/Field";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Edit as EditIcon, Save, Trash } from "../components/icons";

const emptyForm = { name: "", debts: "", cost: "" };
const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DebtsPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const refresh = async () => {
    setError("");
    try {
      setCustomers(await getCustomers());
    } catch (err) {
      setError(err.message || "Could not load debts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  };

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setForm({ name: customer.name, debts: String(customer.debts), cost: String(customer.cost) });
    setError("");
    setFormOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const debts = Number(form.debts);
    const cost = Number(form.cost);
    if (!form.name.trim() || form.debts === "" || form.cost === "" || !Number.isFinite(debts) || !Number.isFinite(cost) || debts < 0 || cost < 0) {
      setError("Enter a name and valid non-negative amounts for debt and cost.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { name: form.name.trim(), debts, cost };
      if (editingId) await updateCustomer(editingId, payload);
      else await createCustomer(payload);
      setFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Could not save debt.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this debt record?")) return;
    try {
      await deleteCustomer(id);
      setCustomers((current) => current.filter((item) => item.id !== id));
      setError("");
    } catch (err) {
      setError(err.message || "Could not delete debt.");
    }
  };

  const balance = (Number(form.debts) || 0) - (Number(form.cost) || 0);
  const totalBalance = customers.reduce((sum, item) => sum + Number(item.balance || 0), 0);

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <h1>Customer debts</h1>
          <p className="page-subtitle">Track amounts owed, costs, and the remaining balance.</p>
        </div>
        <div className="debt-item__balance">Total balance: {money(totalBalance)}</div>
      </header>

      {error && <div className="banner banner--error" role="alert">{error}</div>}

      {formOpen && (
        <form className="task-form debt-form" onSubmit={submit} noValidate>
          <h2 className="task-form__title">{editingId ? "Edit debt" : "Add a debt"}</h2>
          <Field label="Customer name" htmlFor="customer-name">
            <Input id="customer-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Customer name" />
          </Field>
          <Field label="Debts" htmlFor="customer-debts" hint="The amount owed">
            <Input id="customer-debts" type="number" min="0" step="0.01" value={form.debts} onChange={(event) => setForm({ ...form, debts: event.target.value })} placeholder="0.00" />
          </Field>
          <Field label="Cost" htmlFor="customer-cost" hint="Amount already paid or deducted">
            <Input id="customer-cost" type="number" min="0" step="0.01" value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} placeholder="0.00" />
          </Field>
          <p className="debt-item__balance">Balance (debts − cost): {money(balance)}</p>
          <div className="task-form__actions">
            <Button type="submit" variant="primary" loading={saving}><Save size={16} /> {editingId ? "Save changes" : "Save debt"}</Button>
            <Button type="button" variant="ghost" onClick={() => { setFormOpen(false); setError(""); }}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? <p>Loading debts…</p> : customers.length === 0 ? (
        <section className="empty-state"><p>No debt records yet. Add a customer to get started.</p></section>
      ) : (
        <ul className="debt-list">
          {customers.map((customer) => (
            <li className="debt-item" key={customer.id}>
              <div className="debt-item__details">
                <h2>{customer.name}</h2>
                <div className="debt-item__numbers">
                  <span>Debts: {money(customer.debts)}</span>
                  <span>Cost: {money(customer.cost)}</span>
                  <span className="debt-item__balance">Balance: {money(customer.balance)}</span>
                </div>
              </div>
              <div className="task-actions">
                <button className="action action--edit" type="button" title={`Edit ${customer.name}`} aria-label={`Edit ${customer.name}`} onClick={() => startEdit(customer)}><EditIcon size={16} /></button>
                <button className="action action--delete" type="button" title={`Delete ${customer.name}`} aria-label={`Delete ${customer.name}`} onClick={() => remove(customer.id)}><Trash size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!formOpen && <button className="debt-fab" type="button" onClick={openNew} aria-label="Add new debt" title="Add new debt">+</button>}
    </main>
  );
}
