import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAccountId } from "@/lib/getAccountId";

const BUCKET = "tasks";
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: Request) {
  try {
    const accountId = await getAccountId();
    if (!accountId) {
      return NextResponse.json({ error: "Please login" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file sent" }, { status: 400 });
    }
    const ext = TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Use a JPG, PNG or WebP image" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image must be under 4 MB" }, { status: 400 });
    }

    const path = `${accountId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
      });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}