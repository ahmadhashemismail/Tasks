
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");
const { clerkMiddleware, getAuth } = require("@clerk/express");

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// ── Health check ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Tasks API is running");
});

// ── Authentication middleware ─────────────────────────────
function requireClerkUser(req, res, next) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      error: "Please sign in to access your tasks.",
    });
  }

  req.clerkUserId = userId;
  next();
}

// ── Initialize Neon database ──────────────────────────────
async function initializeDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      note TEXT,
      date DATE,
      enddate DATE,
      done BOOLEAN DEFAULT FALSE,
      clerk_user_id TEXT
    )
  `);

  // Add the column to an existing tasks table if necessary.
  await db.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS clerk_user_id TEXT
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_tasks_clerk_user_id
    ON tasks (clerk_user_id)
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS customer (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      debts NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (debts >= 0),
      cost NUMERIC(12, 2) NOT NULL DEFAULT 0
        CHECK (cost >= 0),
      balance NUMERIC(12, 2) NOT NULL DEFAULT 0
    )
  `);

  // Support older customer tables that had account_id NOT NULL.
  await db.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'customer'
          AND column_name = 'account_id'
      ) THEN
        ALTER TABLE customer
        ALTER COLUMN account_id DROP NOT NULL;
      END IF;
    END $$;
  `);
}

// ── Customer debts ────────────────────────────────────────
// These endpoints are preserved from your original server.
// They are NOT user-specific or protected by Clerk yet.

app.get("/api/customers", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM customer ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers." });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { name, debts, cost = 0 } = req.body;

    const cleanName =
      typeof name === "string" ? name.trim() : "";

    const debtAmount = Number(debts);
    const costAmount = Number(cost);

    if (
      !cleanName ||
      !Number.isFinite(debtAmount) ||
      !Number.isFinite(costAmount) ||
      debtAmount < 0 ||
      costAmount < 0
    ) {
      return res.status(400).json({
        error:
          "Enter a name and valid non-negative debt and cost amounts.",
      });
    }

    const result = await db.query(
      `INSERT INTO customer (name, debts, cost, balance)
       VALUES ($1, $2, $3, $2::numeric - $3::numeric)
       RETURNING *`,
      [cleanName, debtAmount, costAmount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating customer debt:", error);
    res.status(500).json({ error: "Failed to create customer." });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const { name, debts, cost } = req.body;

    const cleanName =
      typeof name === "string" ? name.trim() : "";

    const debtAmount = Number(debts);
    const costAmount = Number(cost);

    if (
      !cleanName ||
      !Number.isFinite(debtAmount) ||
      !Number.isFinite(costAmount) ||
      debtAmount < 0 ||
      costAmount < 0
    ) {
      return res.status(400).json({
        error:
          "Enter a name and valid non-negative debt and cost amounts.",
      });
    }

    const result = await db.query(
      `UPDATE customer
       SET name = $1,
           debts = $2,
           cost = $3,
           balance = $2::numeric - $3::numeric
       WHERE id = $4
       RETURNING *`,
      [cleanName, debtAmount, costAmount, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Debt not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating customer debt:", error);
    res.status(500).json({ error: "Failed to update customer." });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM customer WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Debt not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error deleting customer debt:", error);
    res.status(500).json({ error: "Failed to delete customer." });
  }
});

// ── Tasks: each task belongs to its Clerk user ────────────

// Get only the signed-in user's tasks.
app.get("/api/tasks", requireClerkUser, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM tasks
       WHERE clerk_user_id = $1
       ORDER BY id`,
      [req.clerkUserId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

// Get one task only if it belongs to this user.
app.get("/api/tasks/:id", requireClerkUser, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM tasks
       WHERE id = $1 AND clerk_user_id = $2`,
      [req.params.id, req.clerkUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task." });
  }
});

// Create a task for the authenticated user.
app.post("/api/tasks", requireClerkUser, async (req, res) => {
  try {
    const { title, note, date, enddate, done = false } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        error: "Task title is required.",
      });
    }

    if (typeof done !== "boolean") {
      return res.status(400).json({
        error: "done must be true or false.",
      });
    }

    const result = await db.query(
      `INSERT INTO tasks
         (title, note, date, enddate, done, clerk_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title.trim(),
        note ?? null,
        date || null,
        enddate || null,
        done,
        req.clerkUserId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task." });
  }
});

// Update only this user's task.
app.put("/api/tasks/:id", requireClerkUser, async (req, res) => {
  try {
    const { title, note, date, enddate, done } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        error: "Task title is required.",
      });
    }

    if (typeof done !== "boolean") {
      return res.status(400).json({
        error: "done must be true or false.",
      });
    }

    const result = await db.query(
      `UPDATE tasks
       SET title = $1,
           note = $2,
           date = $3,
           enddate = $4,
           done = $5
       WHERE id = $6 AND clerk_user_id = $7
       RETURNING *`,
      [
        title.trim(),
        note ?? null,
        date || null,
        enddate || null,
        done,
        req.params.id,
        req.clerkUserId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task." });
  }
});

// Mark done/undone, only for this user's task.
app.put("/api/markdone/:id", requireClerkUser, async (req, res) => {
  try {
    const { done } = req.body;

    if (typeof done !== "boolean") {
      return res.status(400).json({
        error: "done must be true or false.",
      });
    }

    const result = await db.query(
      `UPDATE tasks
       SET done = $1
       WHERE id = $2 AND clerk_user_id = $3
       RETURNING *`,
      [done, req.params.id, req.clerkUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error marking task:", error);
    res.status(500).json({ error: "Failed to update task." });
  }
});

// Delete only this user's task.
app.delete("/api/tasks/:id", requireClerkUser, async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM tasks
       WHERE id = $1 AND clerk_user_id = $2
       RETURNING *`,
      [req.params.id, req.clerkUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task." });
  }
});

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 4000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
