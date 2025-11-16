#!/usr/bin/env tsx
/**
 * Database Migration Runner
 *
 * Usage:
 *   npx tsx scripts/migrate.ts up      # Apply all pending migrations
 *   npx tsx scripts/migrate.ts down    # Rollback last migration
 *   npx tsx scripts/migrate.ts status  # Show migration status
 *   npx tsx scripts/migrate.ts reset   # Rollback all migrations
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'db/migrations');

interface MigrationRecord {
  version: number;
  name: string;
  applied_at: Date;
}

interface Migration {
  version: number;
  name: string;
  upPath: string;
  downPath: string;
}

// Database connection (use environment variables in production)
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'citation_platform',
  user: process.env.PGUSER || 'citation_platform',
  password: process.env.PGPASSWORD || 'changeme',
  max: 5,
  connectionTimeoutMillis: 5000,
});

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function ensureMigrationsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    log('✅ Migrations table ready', 'green');
  } finally {
    client.release();
  }
}

async function getAppliedMigrations(): Promise<MigrationRecord[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<MigrationRecord>(
      'SELECT version, name, applied_at FROM schema_migrations ORDER BY version'
    );
    return result.rows;
  } finally {
    client.release();
  }
}

function getAvailableMigrations(): Migration[] {
  const files = fs.readdirSync(MIGRATIONS_DIR);
  const migrations = new Map<number, Migration>();

  for (const file of files) {
    const match = file.match(/^(\d+)_([^.]+)(\.sql|_down\.sql)$/);
    if (!match) continue;

    const version = parseInt(match[1]);
    const name = match[2];
    const isDown = file.endsWith('_down.sql');

    if (!migrations.has(version)) {
      migrations.set(version, {
        version,
        name,
        upPath: '',
        downPath: '',
      });
    }

    const migration = migrations.get(version)!;
    if (isDown) {
      migration.downPath = path.join(MIGRATIONS_DIR, file);
    } else {
      migration.upPath = path.join(MIGRATIONS_DIR, file);
    }
  }

  return Array.from(migrations.values()).sort((a, b) => a.version - b.version);
}

async function applyMigration(migration: Migration) {
  if (!migration.upPath || !fs.existsSync(migration.upPath)) {
    throw new Error(`Migration file not found: ${migration.upPath}`);
  }

  const sql = fs.readFileSync(migration.upPath, 'utf-8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    log(`📝 Applying migration ${migration.version}: ${migration.name}`, 'cyan');

    // Execute migration SQL
    await client.query(sql);

    // Record migration
    await client.query(
      'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
      [migration.version, migration.name]
    );

    await client.query('COMMIT');
    log(`✅ Migration ${migration.version} applied successfully`, 'green');
  } catch (error) {
    await client.query('ROLLBACK');
    log(`❌ Migration ${migration.version} failed`, 'red');
    throw error;
  } finally {
    client.release();
  }
}

async function rollbackMigration(migration: Migration) {
  if (!migration.downPath || !fs.existsSync(migration.downPath)) {
    throw new Error(`Rollback file not found: ${migration.downPath}`);
  }

  const sql = fs.readFileSync(migration.downPath, 'utf-8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    log(`📝 Rolling back migration ${migration.version}: ${migration.name}`, 'cyan');

    // Execute rollback SQL
    await client.query(sql);

    // Remove migration record
    await client.query('DELETE FROM schema_migrations WHERE version = $1', [
      migration.version,
    ]);

    await client.query('COMMIT');
    log(`✅ Migration ${migration.version} rolled back successfully`, 'green');
  } catch (error) {
    await client.query('ROLLBACK');
    log(`❌ Rollback of migration ${migration.version} failed`, 'red');
    throw error;
  } finally {
    client.release();
  }
}

async function migrateUp() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const available = getAvailableMigrations();

  const appliedVersions = new Set(applied.map((m) => m.version));
  const pending = available.filter((m) => !appliedVersions.has(m.version));

  if (pending.length === 0) {
    log('✅ No pending migrations', 'green');
    return;
  }

  log(`\n📦 Applying ${pending.length} migration(s)...\n`, 'yellow');

  for (const migration of pending) {
    await applyMigration(migration);
  }

  log(`\n✅ All migrations applied successfully`, 'green');
}

async function migrateDown() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  if (applied.length === 0) {
    log('⚠️  No migrations to rollback', 'yellow');
    return;
  }

  const lastMigration = applied[applied.length - 1];
  const available = getAvailableMigrations();
  const migration = available.find((m) => m.version === lastMigration.version);

  if (!migration) {
    throw new Error(`Migration ${lastMigration.version} not found in migration files`);
  }

  log(`\n📦 Rolling back last migration...\n`, 'yellow');
  await rollbackMigration(migration);
  log(`\n✅ Rollback completed successfully`, 'green');
}

async function migrateReset() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const available = getAvailableMigrations();

  if (applied.length === 0) {
    log('⚠️  No migrations to rollback', 'yellow');
    return;
  }

  log(`\n📦 Rolling back all ${applied.length} migration(s)...\n`, 'yellow');

  // Rollback in reverse order
  for (let i = applied.length - 1; i >= 0; i--) {
    const appliedMigration = applied[i];
    const migration = available.find((m) => m.version === appliedMigration.version);

    if (!migration) {
      log(`⚠️  Migration ${appliedMigration.version} not found, skipping`, 'yellow');
      continue;
    }

    await rollbackMigration(migration);
  }

  log(`\n✅ All migrations rolled back successfully`, 'green');
}

async function showStatus() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const available = getAvailableMigrations();

  log('\n📊 Migration Status\n', 'cyan');
  log('─'.repeat(80), 'cyan');

  const appliedVersions = new Set(applied.map((m) => m.version));

  for (const migration of available) {
    const isApplied = appliedVersions.has(migration.version);
    const status = isApplied ? '✅ Applied' : '⏳ Pending';
    const color = isApplied ? 'green' : 'yellow';

    const appliedInfo = isApplied
      ? applied.find((m) => m.version === migration.version)
      : null;
    const timestamp = appliedInfo
      ? ` (${new Date(appliedInfo.applied_at).toISOString()})`
      : '';

    log(
      `${status.padEnd(12)} ${String(migration.version).padStart(3)}  ${migration.name}${timestamp}`,
      color
    );
  }

  log('─'.repeat(80), 'cyan');
  log(
    `\nTotal: ${available.length} migrations (${applied.length} applied, ${available.length - applied.length} pending)\n`,
    'cyan'
  );
}

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'up':
        await migrateUp();
        break;
      case 'down':
        await migrateDown();
        break;
      case 'reset':
        await migrateReset();
        break;
      case 'status':
        await showStatus();
        break;
      default:
        log('Usage: npx tsx scripts/migrate.ts <up|down|reset|status>', 'yellow');
        process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`, 'red');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
