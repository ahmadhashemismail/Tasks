import { sql } from "@/lib/db";
import { getAccountId } from "@/lib/getAccountId";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  try {
    const accountId = await getAccountId();
    if (!accountId) return NextResponse.json({ error: "Please login" }, { status: 401 });

    const { id } = await params;
    const rows = await sql`
      SELECT id, name, debts, cost, account_id, balance, image_url
      FROM public.customer
      WHERE id = ${id} AND account_id = ${accountId}`;
    if (!rows[0]) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const accountId = await getAccountId();
    if (!accountId) return NextResponse.json({ error: "Please login" }, { status: 401 });

    const { id } = await params;
    const { name, debts, cost } = await req.json();

    const rows = await sql`
      UPDATE public.customer
      SET name = ${name}, debts = ${debts}, cost = ${cost}
      WHERE id = ${id} AND account_id = ${accountId}
      RETURNING id, name, debts, cost, account_id, balance, image_url`;
    if (!rows[0]) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const accountId = await getAccountId();
    if (!accountId) return NextResponse.json({ error: "Please login" }, { status: 401 });

    const { id } = await params;
    const rows = await sql`
      DELETE FROM public.customer
      WHERE id = ${id} AND account_id = ${accountId}
      RETURNING id`;
    if (!rows[0]) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}