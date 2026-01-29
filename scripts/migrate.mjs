/**
 * Run Better Auth DB migrations (user, session, account, verification, etc.).
 * Run from project root: node scripts/migrate.mjs
 */
import { getMigrations } from "better-auth/db";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dbPath = path.join(projectRoot, "sqlite.db");

const config = {
  database: new Database(dbPath),
};

const { runMigrations, toBeCreated } = await getMigrations(config);
if (toBeCreated?.length) {
  process.stdout.write("Creating tables: " + toBeCreated.map((t) => t.table).join(", ") + "\n");
}
await runMigrations();
process.stdout.write("Better Auth migrations complete.\n");
