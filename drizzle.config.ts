import { defineConfig } from "drizzle-kit";
import fs from "fs"
import path from "path";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}

let extraParams = "?sslmode=require";
try {
  const caPath = path.join(process.cwd(), "ca.pem");
  if (fs.existsSync(caPath)) {
    // drizzle-kit only needs the file path via sslrootcert in URL
    extraParams = "?sslmode=require&sslrootcert=ca.pem";
  }
} catch {
  // fallback to sslmode only
}

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: `${dbUrl}${extraParams}`,
  },
});
