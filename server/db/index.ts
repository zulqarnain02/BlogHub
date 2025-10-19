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

const pool = new Pool({
  connectionString: `${dbUrl}?sslmode=require&sslrootcert=ca.pem`,
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