import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { openDatabase } from "../src/db/connection";

const { db, client } = openDatabase(
  process.env.DATABASE_URL ?? "./data/app.sqlite",
);
try {
  migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrações aplicadas. SQLite pronto.");
} finally {
  client.close();
}
