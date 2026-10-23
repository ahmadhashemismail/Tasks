"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import {
  updateCustomer,
  getCustomers,
  uploadCustomerImage,
} from "@/lib/api/customers/route";
import type { Customer } from "@/lib/types/types";

function EditCustomerForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const emptyForm: Customer = {
    id: 0,
    name: "",
    debts: 0,
    cost: 0,
    balance: 0,
    image_url: null,
  };
  const [form, setForm] = useState<Customer>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl],
  );

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
      if (image) await uploadCustomerImage(form.id, image);
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
        <p className="page-subtitle">Update their information and profile image.</p>
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

          <div className="customer-edit__image-section">
            <div className="customer-edit__section-heading">
              <div>
                <h2>Profile image</h2>
                <p>JPEG, PNG, WebP, or GIF · up to 5 MB</p>
              </div>
            </div>
            <div className="customer-edit__image-control">
              <div className="customer-edit__preview">
                {image ? (
                  <Image
                    src={imagePreviewUrl ?? ""}
                    alt="Selected customer image preview"
                    fill
                    unoptimized
                    sizes="88px"
                  />
                ) : form.image_url ? (
                  <Image
                    src={form.image_url}
                    alt={`${form.name}'s profile`}
                    fill
                    unoptimized
                    sizes="88px"
                  />
                ) : (
                  <ImagePlus size={28} aria-hidden="true" />
                )}
              </div>
              <div className="customer-edit__file">
                <label className="btn customer-edit__choose" htmlFor="edit-customer-image">
                  <ImagePlus size={16} />
                  {image ? "Choose another image" : form.image_url ? "Change image" : "Choose image"}
                </label>
                <input
                  id="edit-customer-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] ?? null;
                    setImagePreviewUrl(
                      selected ? URL.createObjectURL(selected) : null,
                    );
                    setImage(selected);
                  }}
                  disabled={saving}
                  required={!form.image_url}
                />
                <span className="field__hint">
                  {image ? image.name : "Your image is stored securely in Supabase."}
                </span>
              </div>
            </div>
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