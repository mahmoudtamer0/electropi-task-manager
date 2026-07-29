import fs from "fs";
import path from "path";
import pool from "../config/db";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function ensureMigrationsTable() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
    const result = await pool.query<{ name: string }>("SELECT name FROM schema_migrations");
    return new Set(result.rows.map((row) => row.name));
}

async function runMigrations() {
    await ensureMigrationsTable();
    const applied = await getAppliedMigrations();

    const files = fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith(".sql"))
        .sort();

    for (const file of files) {
        if (applied.has(file)) {
            console.log(`skip (already applied): ${file}`);
            continue;
        }

        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await client.query(sql);
            await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
            await client.query("COMMIT");
            console.log(`applied: ${file}`);
        } catch (err) {
            await client.query("ROLLBACK");
            console.error(`failed: ${file}`, err);
            throw err;
        } finally {
            client.release();
        }
    }

    console.log("migrations up to date");
    await pool.end();
}

runMigrations().catch((err) => {
    console.error(err);
    process.exit(1);
});
