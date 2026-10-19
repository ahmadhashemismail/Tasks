"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

export default function ConfirmDialog({
  open,
  title = "Delete this item?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    // 1. lock the page scroll behind the popup
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`; // no layout jump

    // 2. Escape closes it, and no other key reaches the page behind
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey, true);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  // portal: renders directly in <body>, so the popup is not affected by the
  // page's transforms and clicks inside it don't bubble to cards underneath
  return createPortal(
    <div
      className="dialog-overlay"
      onClick={(e) => {
        e.stopPropagation();
        onCancel();
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        className="dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="dialog__icon"><Trash2 size={22} /></div>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="dialog__actions">
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn btn--danger ${loading ? "btn--loading" : ""}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="spinner" />} {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}