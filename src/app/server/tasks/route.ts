import { sql } from "@/lib/db";
import { getAccountId } from "@/lib/getAccountId";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accountId = await getAccountId();
    if (!accountId) {
      return NextResponse.json({ error: "Please login to see your tasks" }, { status: 401 });
    }

    const rows = await sql`
      SELECT * FROM tasks WHERE account_id = ${accountId} ORDER BY date`;

    if (rows.length === 0) {
      return NextResponse.json({ tasks: [], message: "No tasks yet. Add your first task." });
    }
    return NextResponse.json({ tasks: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const accountId = await getAccountId();
    if (!accountId) {
      return NextResponse.json({ error: "Please login to add tasks" }, { status: 401 });
    }

    const { title, note, date, enddate } = await req.json();
    if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

    const rows = await sql`
      INSERT INTO tasks (title, note, date, enddate, account_id)
      VALUES (${title}, ${note}, ${date}, ${enddate}, ${accountId})
      RETURNING *`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}