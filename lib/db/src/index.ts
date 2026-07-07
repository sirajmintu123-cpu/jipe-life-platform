import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection
pool.query("SELECT NOW()")
  .then((result) => {
    console.log("✅ DATABASE CONNECTED");
    console.log("Server Time:", result.rows[0].now);
  })
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION FAILED");
    console.error(err);
  });

export const db = drizzle(pool, { schema });

export * from "./schema";