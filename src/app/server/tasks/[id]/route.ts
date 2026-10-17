import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const rows = await sql`SELECT * FROM tasks WHERE id = ${id}`;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const { title, note, date, enddate, done } = await req.json();
    const rows = await sql`
      UPDATE tasks
      SET title = ${title}, note = ${note}, date = ${date}, enddate = ${enddate}, done = ${done}
      WHERE id = ${id} RETURNING *`;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    await sql`DELETE FROM tasks WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}