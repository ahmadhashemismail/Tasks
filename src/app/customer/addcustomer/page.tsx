"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { addCustomer, uploadCustomerImage } from "@/lib/api/customers/route";
import type { Customer } from "@/lib/types/types";

const emptyForm: Customer = {
  id: 0,
  name: "",
  debts: 0,
  cost: 0,
  balance: 0,
  image_url: null,
};

export default function AddCustomer({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [pendingCustomerId, setPendingCustomerId] = useState<number | null>(null);
  const [form, setForm] = useState<Customer>(emptyForm);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      setError("Choose an image for this customer");
      return;
    }
    setSaving(true);
    setError("");
    let customerSaved = pendingCustomerId !== null;
    try {
      let customerId = pendingCustomerId;
      if (customerId === null) {
        const customer = await addCustomer(form);
        customerId = customer.id;
        setPendingCustomerId(customerId);
        customerSaved = true;
      }
      if (image && customerId !== null) {
        await uploadCustomerImage(customerId, image);
      }

      setForm(emptyForm);
      setImage(null);
      setPendingCustomerId(null);
      setOpen(false);
      onAdded?.();
    } catch (e) {
      if (customerSaved) onAdded?.();
      setError(
        e instanceof Error
          ? e.message
          : "Could not save the customer. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button className="btn btn--primary" onClick={() => setOpen(true)}>
        <Plus size={16} /> Add customer
      </button>
    );
  }

  return (
    <form className="task-form debt-form" onSubmit={handleSubmit}>
      <h2 className="task-form__title">Add customer</h2>
      <div className="field">
        <label className="field__label">Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Customer name..."
          autoFocus
        />
      </div>
      <div className="field">
        <label className="field__label">Debts</label>
        <input
          type="number" min="0" step="0.01" value={form.debts}
          onChange={(e) => setForm({ ...form, debts: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className="field">
        <label className="field__label">Cost</label>
        <input
          type="number" min="0" step="0.01" value={form.cost}
          onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="customer-image">Image</label>
        <input
          id="customer-image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          disabled={saving}
          required
        />
      </div>
      {error && <p className="banner banner--error">{error}</p>}
      <div className="task-form__actions">
        <button
          type="submit"
          className={`btn btn--primary ${saving ? "btn--loading" : ""}`}
          disabled={saving}
        >
          {saving && <span className="spinner" />}
          {saving
            ? image
              ? "Saving..."
              : "Adding..."
            : pendingCustomerId
              ? "Retry image upload"
              : "Add"}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}