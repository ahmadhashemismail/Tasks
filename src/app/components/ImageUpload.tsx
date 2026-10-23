"use client";
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { supabase, IMAGE_BUCKET } from "@/lib/supabase-browser";
import { setCustomerImage } from "@/lib/api/customers/route";

const MAX_BYTES = 5 * 1024 * 1024; // the bucket limit is 5 MB

export default function ImageUpload({
  customerId,
  hasImage,
  onUploaded,
}: {
  customerId: number;
  hasImage?: boolean;
  onUploaded?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) return setError("Please choose an image.");
    if (file.size > MAX_BYTES) return setError("Image is bigger than 5 MB.");

    setBusy(true);
    try {
      // 1. ask the server for permission to upload
      const res = await fetch("/server/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. upload the file to Supabase Storage
      const { error: upErr } = await supabase.storage
        .from(IMAGE_BUCKET)
        .uploadToSignedUrl(data.path, data.token, file);
      if (upErr) throw new Error(upErr.message);

      // 3. save only the path in Neon
      await setCustomerImage(customerId, data.path);
      onUploaded?.();
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onChange}
      />
      <button
        type="button"
        className="btn btn--ghost"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus size={16} /> {busy ? "Uploading..." : hasImage ? "Change image" : "Add image"}
      </button>
      {error && <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>}
    </div>
  );
}
