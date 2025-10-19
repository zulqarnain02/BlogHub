import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import * as schema from "./schema";
import fs from "fs";
import path from "path";
dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Build a robust SSL config: prefer explicit CA via file if available.
let sslConfig: any = { rejectUnauthorized: true };
try {
  const caPath = path.join(process.cwd(), "ca.pem");
  if (fs.existsSync(caPath)) {
    sslConfig.ca = fs.readFileSync(caPath).toString();
  }
} catch {
  // ignore; fall back to default SSL behavior
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: sslConfig,
});

pool
  .connect()
  .then((client) => {
    console.log("✅ Database connected successfully!");
    client.release(); // release client back to the pool
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

export const db = drizzle(pool, { schema });