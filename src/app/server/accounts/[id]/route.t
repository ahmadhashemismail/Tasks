import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const rows = await sql`SELECT id, name, email, clerk_user_id FROM accounts WHERE id = ${id}`;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { name, email } = await req.json();
    const rows = await sql`
      UPDATE accounts SET name = ${name}, email = ${email}
      WHERE id = ${id} RETURNING id, name, email`;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    await sql`DELETE FROM accounts WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}