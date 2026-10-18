const { Pool, types } = require("pg");

// Return DATE columns as plain "YYYY-MM-DD" strings. By default pg turns them
// into JS Dates at server-local midnight, which shifts the day whenever the
// server's timezone isn't UTC.
types.setTypeParser(1082, (value) => value);

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

module.exports = pool;
