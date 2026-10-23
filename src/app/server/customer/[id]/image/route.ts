import "server-only";
import { createClient } from "@supabase/supabase-js";
import { sql } from "@/lib/db";
import { getAuthState } from "@/lib/getAccountId";
import { NextResponse } from "next/server";

const DEFAULT_BUCKET = "public";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type Ctx = { params: Promise<{ id: string }> };

function isMissingImageColumn(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "42703"
  );
}

export async function POST(req: Request, { params }: Ctx) {
  let stage = "authentication";
  try {
    const { userId, accountId } = await getAuthState();
    if (!userId || !accountId) {
      return NextResponse.json({ error: "Please login to upload an image" }, { status: 401 });
    }

    stage = "customer lookup in Neon";
    const { id } = await params;
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    }

    const customers = await sql`
      SELECT id FROM public.customer
      WHERE id = ${id} AND account_id = ${accountId}`;
    if (!customers[0]) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const contentLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_SIZE + 64 * 1024) {
      return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 413 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error("Customer image form parsing failed", error);
      return NextResponse.json(
        { error: "The uploaded image could not be read. Please try again." },
        { status: 400 },
      );
    }

    const image = formData.get("image");
    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload" }, { status: 400 });
    }
    if (!IMAGE_TYPES[image.type]) {
      return NextResponse.json(
        { error: "Choose a JPEG, PNG, WebP, or GIF image" },
        { status: 400 },
      );
    }
    if (image.size === 0 || image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image must be between 1 byte and 5 MB" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
    const bucket = (process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET).trim() || DEFAULT_BUCKET;
    if (!supabaseUrl || !supabaseSecretKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be configured");
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const objectPath = `${accountId}/${id}/image`;
    stage = `upload to Supabase Storage bucket "${bucket}"`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(objectPath, await image.arrayBuffer(), {
        cacheControl: "0",
        contentType: image.type,
        upsert: true,
      });
    if (uploadError) {
      console.error("Supabase customer image upload failed", uploadError);
      const message =
        uploadError.message === "Bucket not found"
          ? `Supabase Storage bucket "${bucket}" was not found. Create it in Supabase Storage or set SUPABASE_STORAGE_BUCKET to an existing bucket.`
          : "Failed to upload image to Supabase";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
    const imageUrl = `${publicUrl}?v=${Date.now()}`;
    let updated;
    stage = "saving image URL to Neon";
    try {
      updated = await sql`
        UPDATE public.customer SET image_url = ${imageUrl}
        WHERE id = ${id} AND account_id = ${accountId}
        RETURNING id, image_url`;
    } catch (error) {
      if (isMissingImageColumn(error)) {
        console.error("Neon public.customer.image_url column is missing", error);
        return NextResponse.json(
          {
            error:
              "The connected Neon database does not have public.customer.image_url. Verify that DATABASE_URL points to the Neon database with the customer schema shown.",
          },
          { status: 500 },
        );
      }
      throw error;
    }
    if (!updated[0]) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({ image_url: imageUrl });
  } catch (error) {
    console.error(`Customer image failed during ${stage}`, error);
    return NextResponse.json(
      { error: `Customer image failed during ${stage}. Check the Vercel function logs for details.` },
      { status: 500 },
    );
  }
}
