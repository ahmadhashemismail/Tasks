import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAccountId } from "@/lib/getAccountId";
import { supabaseAdmin, IMAGE_BUCKET } from "@/lib/supabase-admin";

type Ctx = { params: Promise<{ id: string }> };

// Saves the image path (not the file) in Neon for one customer.
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const accountId = await getAccountId();
    if (!accountId) return NextResponse.json({ error: "Please login" }, { status: 401 });

    const { id } = await params;
    const { imagePath } = await req.json();

    // only accept paths that were created for this account by /server/upload
    if (typeof imagePath !== "string" || !imagePath.startsWith(`customers/${accountId}/`)) {
      return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
    }

    const old = await sql`
      SELECT image_path FROM customer WHERE id = ${id} AND account_id = ${accountId}`;
    if (!old[0]) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const rows = await sql`
      UPDATE customer SET image_path = ${imagePath}
      WHERE id = ${id} AND account_id = ${accountId}
      RETURNING *`;

    // remove the previous image so old files do not pile up in the bucket
    if (old[0].image_path && old[0].image_path !== imagePath) {
      await supabaseAdmin.storage.from(IMAGE_BUCKET).remove([old[0].image_path]);
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}
