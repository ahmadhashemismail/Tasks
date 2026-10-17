import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function getAuthState() {
  const { userId } = await auth();
  if (!userId) return { userId: null, accountId: null };

  // 1. account already exists
  const rows = await sql`SELECT id FROM accounts WHERE clerk_user_id = ${userId}`;
  if (rows[0]) return { userId, accountId: rows[0].id };

  // 2. first login: get the Clerk user
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) return { userId, accountId: null };

  // 3. old row with the same email but no clerk id: link it to this user
  const linked = await sql`
    UPDATE accounts SET clerk_user_id = ${userId}
    WHERE email = ${email} AND clerk_user_id IS NULL
    RETURNING id`;
  if (linked[0]) return { userId, accountId: linked[0].id };

  // 4. otherwise create a new account
  const name = user?.fullName || user?.firstName || email.split("@")[0];
  await sql`
    INSERT INTO accounts (name, email, clerk_user_id)
    VALUES (${name}, ${email}, ${userId})
    ON CONFLICT DO NOTHING`;

  // 5. read it back (also works if two requests created it at the same time)
  const created = await sql`SELECT id FROM accounts WHERE clerk_user_id = ${userId}`;
  return { userId, accountId: created[0]?.id ?? null };
}

export async function getAccountId() {
  const { accountId } = await getAuthState();
  return accountId;
}