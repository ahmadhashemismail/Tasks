import { sql } from "@/lib/db";
import { getAccountId } from "@/lib/getAccountId";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accountId = await getAccountId();
    if (!accountId) {
      return NextResponse.json(
        { error: "Please login to see your tasks" },
        { status: 401 },
      );
    }

    const rows = await sql`
      SELECT * FROM tasks
      WHERE account_id = ${accountId} AND done = true
      ORDER BY date`;

    return NextResponse.json({ tasks: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}
