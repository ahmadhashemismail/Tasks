"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
  updateCustomer,
  getCustomers,
} from "@/lib/api/customers/route";
import type { Customer } from "@/lib/types/types";
import { uploadImage } from "@/lib/api/upload";
function EditCustomerForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const emptyForm: Customer = {
    id: 0,
    name: "",
    debts: 0,
    cost: 0,
    balance: 0,
  };
  const [form, setForm] = useState<Customer>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomers();
        const found = data.customers.find((customer) => customer.id === Number(id));
        if (found) {
          setForm({
            ...found,
            debts: Number(found.debts),
            cost: Number(found.cost),
          });
        } else {
          setError("Customer not found.");
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Could not load this customer.",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleeditcustomer(form: Customer) {
    setSaving(true);
    setError("");
    try {
      await updateCustomer(form);
      router.push("/customer");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save the customer. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }


async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploading(true);
  setError("");
  try {
    const url = await uploadImage(file);
    setForm((f) => ({ ...f, image_url: url }));
  } catch (err) {
    setError(err instanceof Error ? err.message : "Upload failed");
  } finally {
    setUploading(false);
  }
}

  return (
    <main className="container customer-edit">
      <div className="customer-edit__top">
        <Link href="/customer" className="customer-edit__back">
          <ArrowLeft size={16} /> Back to customers
        </Link>
      </div>

      <header className="customer-edit__header">
        <span className="customer-edit__eyebrow">CUSTOMER DETAILS</span>
        <h1>Edit customer</h1>
        <p className="page-subtitle">Update their information and account details.</p>
      </header>

      {loading ? (
        <div className="task-detail customer-edit__status" role="status">
          Loading customer details…
        </div>
      ) : form.id === 0 ? (
        <div className="empty-state">
          {error && <p className="banner banner--error">{error}</p>}
          <Link href="/customer" className="btn btn--primary">
            Return to customers
          </Link>
        </div>
      ) : (
        <form
          className="task-form customer-edit__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleeditcustomer(form);
          }}
        >
          <div className="customer-edit__section-heading">
            <div>
              <h2>Profile</h2>
              <p>Customer name and account figures.</p>
            </div>
            <span className="customer-edit__id">ID #{form.id}</span>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="customer-name">Name</label>
            <input
              id="customer-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Customer name"
              required
              disabled={saving}
            />
          </div>

          <div className="customer-edit__numbers">
            <div className="field">
              <label className="field__label" htmlFor="customer-debts">Debts</label>
              <div className="customer-edit__input-wrap">
                <span aria-hidden="true">$</span>
                <input
                  id="customer-debts"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.debts}
                  onChange={(e) =>
                    setForm({ ...form, debts: parseFloat(e.target.value) || 0 })
                  }
                  required
                  disabled={saving}
                />
              </div>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="customer-cost">Cost</label>
              <div className="customer-edit__input-wrap">
                <span aria-hidden="true">$</span>
                <input
                  id="customer-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={(e) =>
                    setForm({ ...form, cost: parseFloat(e.target.value) || 0 })
                  }
                  required
                  disabled={saving}
                />
              </div>
            </div>
          </div>
<div className="field">
  <label className="field__label" htmlFor="customer-photo">Photo</label>
  {form.image_url && (
    <img
      src={form.image_url}
      alt={form.name}
      width={96}
      height={96}
      style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}
    />
  )}
  <input
    id="customer-photo"
    type="file"
    accept="image/png,image/jpeg,image/webp"
    onChange={handleFile}
    disabled={saving || uploading}
  />
  {uploading && <p>Uploading...</p>}
</div>
          {error && <p className="banner banner--error" role="alert">{error}</p>}

          <div className="customer-edit__actions">
            <button type="button" className="btn btn--ghost" onClick={() => router.push("/customer")} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? <span className="spinner" /> : <Save size={16} />}
              {saving ? "Saving changes…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default function EditCustomerPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <EditCustomerForm />
    </Suspense>
  );
}