import { defineConfig } from "drizzle-kit";
import fs from "fs"
import path from "path";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}

const caCert = fs.readFileSync(path.join(process.cwd(), "ca.pem")).toString();

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: `${dbUrl}?sslmode=require&sslrootcert=ca.pem`,
  },
});
