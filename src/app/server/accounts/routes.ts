import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await sql`SELECT id, name, email, clerk_user_id FROM accounts`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, clerk_user_id } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }
    const rows = await sql`
      INSERT INTO accounts (name, email, clerk_user_id)
      VALUES (${name}, ${email}, ${clerk_user_id})
      RETURNING id, name, email, clerk_user_id`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}