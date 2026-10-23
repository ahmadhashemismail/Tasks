import { sql } from "@/lib/db";
import { getAuthState } from "@/lib/getAccountId";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId, accountId } = await getAuthState();

    if (!userId) {
      return NextResponse.json({ error: "Please login to see your customers" }, { status: 401 });
    }
    if (!accountId) {
      return NextResponse.json(
        { error: "No account found. Please set up your account first.", code: "NO_ACCOUNT" },
        { status: 404 }
      );
    }

    const rows = await sql`
      SELECT id, name, debts, cost, account_id, balance
      FROM public.customer
      WHERE account_id = ${accountId}
      ORDER BY id`;

    if (rows.length === 0) {
      return NextResponse.json({ customers: [], message: "No customers yet. Add your first customer." });
    }
    return NextResponse.json({ customers: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, accountId } = await getAuthState();

    if (!userId) {
      return NextResponse.json({ error: "Please login to add customers" }, { status: 401 });
    }
    if (!accountId) {
      return NextResponse.json(
        { error: "No account found. Please set up your account first.", code: "NO_ACCOUNT" },
        { status: 404 }
      );
    }

    const { name, debts = 0, cost = 0 } = await req.json();
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const rows = await sql`
      INSERT INTO public.customer (name, debts, cost, account_id)
      VALUES (${name}, ${debts}, ${cost}, ${accountId})
      RETURNING id, name, debts, cost, account_id, balance`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}