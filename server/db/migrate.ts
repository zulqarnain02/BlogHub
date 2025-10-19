import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}
const client = new Client({
  connectionString: `${dbUrl}?sslmode=require&sslrootcert=ca.pem`,
});

const db = drizzle(client);

async function main() {
  await client.connect();
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "server/db/migrations" });
  console.log("Migrations finished!");
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
