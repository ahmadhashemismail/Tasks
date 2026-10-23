import { NextResponse } from "next/server";
import { getAccountId } from "@/lib/getAccountId";
import { supabaseAdmin, IMAGE_BUCKET } from "@/lib/supabase-admin";

// Gives a logged-in user permission to upload ONE file to the bucket.
export async function POST(req: Request) {
  try {
    const accountId = await getAccountId();
    if (!accountId) return NextResponse.json({ error: "Please login" }, { status: 401 });

    const { fileName, contentType } = await req.json();
    if (!fileName) return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    if (contentType && !String(contentType).startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
    }

    const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
    // the account id in the path keeps every user's files under their own folder
    const path = `customers/${accountId}/${crypto.randomUUID()}-${safeName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(IMAGE_BUCKET)
      .createSignedUploadUrl(path);
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Could not prepare upload" }, { status: 500 });
    }
    return NextResponse.json({ path, token: data.token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to prepare upload" }, { status: 500 });
  }
}
