"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Pencil, Trash2, Wallet, Scale } from "lucide-react";
import Image from "next/image";
import type { Customer } from "@/lib/types/types";
import { getCustomers, deleteCustomer } from "@/lib/api/customers/route";
import AddCustomerPage from "./addcustomer/page";
import { ListSkeleton } from "../components/loader";
export default function CustomerPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data.customers ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) loadCustomers();
  }, [isLoaded, isSignedIn]);

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      await loadCustomers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete customer");
    }
  }

  const totalDebts = customers.reduce((sum, c) => sum + Number(c.debts), 0);
  const totalBalance = customers.reduce((sum, c) => sum + Number(c.balance), 0);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Debts</h1>
          <p className="page-subtitle">Customers and what they owe.</p>
        </div>
      </div>

      {error && (
        <div className="banner banner--error">
          {error}{" "}
          {!isSignedIn && (
            <SignInButton mode="modal"><button className="btn">Login</button></SignInButton>
          )}
        </div>
      )}

      <div className="stats">
        <div className="stat-card stat-card--pending">
          <Wallet className="stat-card__icon" />
          <div className="stat-card__body">
            <span className="stat-card__value">{totalDebts}</span>
            <span className="stat-card__label">Total debts</span>
          </div>
        </div>
        <div className="stat-card stat-card--done">
          <Scale className="stat-card__icon" />
          <div className="stat-card__body">
            <span className="stat-card__value">{totalBalance}</span>
            <span className="stat-card__label">Total balance</span>
          </div>
        </div>
      </div>

   <div style={{ margin: "var(--space-3) 0" }}>
  <AddCustomerPage onAdded={loadCustomers} />
</div>

            {loading && <ListSkeleton count={2} />}

      {!isSignedIn ? (
        <div className="empty-state"><p>Login to see and add your customers.</p></div>
      ) : customers.length === 0 && !loading ? (
        <div className="empty-state"><p>No customers yet. Add your first customer.</p></div>
      ) : (
        <div className="debt-list">
          {customers.map((c) => (
            <div className="debt-item" key={c.id}>
              {c.image_url && (
                <Image
                  src={c.image_url}
                  alt={`${c.name}'s image`}
                  width={56}
                  height={56}
                  unoptimized
                  className="debt-item__image"
                />
              )}
              <div className="debt-item__details">
                <h2>{c.name}</h2>
                <div className="debt-item__numbers">
                  <span>Debts: {c.debts}</span>
                  <span>Cost: {c.cost}</span>
                  <span className="debt-item__balance">Balance: {c.balance}</span>
                </div>
              </div>
              <div className="task-actions">
                <Link href={`/customer/editcustomer/${c.id}`} className="action action--edit" aria-label="Edit customer">
                  <Pencil size={16} />
                </Link>
                <button className="action action--delete" onClick={() => handleDelete(c.id)} aria-label="Delete customer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}