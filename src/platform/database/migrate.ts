/**
 * MARCUS Platform Database Migration Runner
 *
 * Manages versioned schema migrations with rollback support
 *
 * Features:
 * - Automatic migration tracking in schema_migrations table
 * - Up/down migration support (create/rollback)
 * - Transaction safety (atomic migrations)
 * - Migration validation (checksum verification)
 * - Dry-run mode
 *
 * Usage:
 *   npx tsx src/platform/database/migrate.ts up        # Run pending migrations
 *   npx tsx src/platform/database/migrate.ts down      # Rollback last migration
 *   npx tsx src/platform/database/migrate.ts status    # Show migration status
 *   npx tsx src/platform/database/migrate.ts create <name>  # Create new migration
 */

import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// =============================================================================
// Configuration
// =============================================================================

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

interface MigrationRecord {
  version: number;
  name: string;
  checksum: string;
  applied_at: Date;
}

interface Migration {
  version: number;
  name: string;
  filename: string;
  sql: string;
  checksum: string;
}

// =============================================================================
// Database Connection
// =============================================================================

function createPool(): Pool {
  return new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'citation_integrity',
    user: process.env.POSTGRES_USER || 'marcus',
    password: process.env.POSTGRES_PASSWORD || 'changeme',
  });
}

// =============================================================================
// Migration Tracking Table
// =============================================================================

async function ensureMigrationsTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(client: PoolClient): Promise<MigrationRecord[]> {
  const result = await client.query<MigrationRecord>(
    `SELECT version, name, checksum, applied_at FROM ${MIGRATIONS_TABLE} ORDER BY version ASC`
  );
  return result.rows;
}

async function recordMigration(
  client: PoolClient,
  migration: Migration
): Promise<void> {
  await client.query(
    `INSERT INTO ${MIGRATIONS_TABLE} (version, name, checksum, applied_at)
     VALUES ($1, $2, $3, NOW())`,
    [migration.version, migration.name, migration.checksum]
  );
}

async function removeMigration(client: PoolClient, version: number): Promise<void> {
  await client.query(
    `DELETE FROM ${MIGRATIONS_TABLE} WHERE version = $1`,
    [version]
  );
}

// =============================================================================
// Migration File Management
// =============================================================================

function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function parseMigrationFilename(filename: string): { version: number; name: string } | null {
  // Expected format: 001_initial_schema.sql or 002_add_performance_indexes.sql
  const match = filename.match(/^(\d{3})_(.+)\.sql$/);
  if (!match) return null;

  return {
    version: parseInt(match[1]),
    name: match[2],
  };
}

function loadMigrations(): Migration[] {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const migrations: Migration[] = [];

  for (const file of files) {
    const parsed = parseMigrationFilename(file);
    if (!parsed) {
      console.warn(`⚠️  Skipping invalid migration filename: ${file}`);
      continue;
    }

    const filepath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filepath, 'utf-8');
    const checksum = calculateChecksum(sql);

    migrations.push({
      version: parsed.version,
      name: parsed.name,
      filename: file,
      sql,
      checksum,
    });
  }

  return migrations;
}

function getPendingMigrations(
  allMigrations: Migration[],
  appliedMigrations: MigrationRecord[]
): Migration[] {
  const appliedVersions = new Set(appliedMigrations.map(m => m.version));
  return allMigrations.filter(m => !appliedVersions.has(m.version));
}

// =============================================================================
// Migration Validation
// =============================================================================

function validateMigrations(
  allMigrations: Migration[],
  appliedMigrations: MigrationRecord[]
): void {
  for (const applied of appliedMigrations) {
    const migration = allMigrations.find(m => m.version === applied.version);

    if (!migration) {
      throw new Error(
        `❌ Migration ${applied.version} was applied but file not found.\n` +
        `   Expected: ${applied.version.toString().padStart(3, '0')}_${applied.name}.sql\n` +
        `   This likely indicates a missing migration file.`
      );
    }

    if (migration.checksum !== applied.checksum) {
      throw new Error(
        `❌ Migration ${applied.version} checksum mismatch.\n` +
        `   Applied: ${applied.checksum.substring(0, 12)}...\n` +
        `   Current: ${migration.checksum.substring(0, 12)}...\n` +
        `   Migration files should NOT be modified after being applied.\n` +
        `   Create a new migration instead.`
      );
    }
  }
}

// =============================================================================
// Migration Operations
// =============================================================================

async function runMigration(
  client: PoolClient,
  migration: Migration,
  dryRun: boolean = false
): Promise<void> {
  console.log(`▶️  Running migration ${migration.version}: ${migration.name}`);

  if (dryRun) {
    console.log('   [DRY RUN] Would execute:');
    console.log(migration.sql.split('\n').slice(0, 10).join('\n'));
    console.log('   ...');
    return;
  }

  try {
    // Execute migration SQL
    await client.query(migration.sql);

    // Record successful migration
    await recordMigration(client, migration);

    console.log(`✅ Migration ${migration.version} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${migration.version} failed:`, error);
    throw error;
  }
}

async function migrateUp(dryRun: boolean = false): Promise<void> {
  const pool = createPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await ensureMigrationsTable(client);

    const allMigrations = loadMigrations();
    const appliedMigrations = await getAppliedMigrations(client);

    // Validate integrity
    validateMigrations(allMigrations, appliedMigrations);

    const pending = getPendingMigrations(allMigrations, appliedMigrations);

    if (pending.length === 0) {
      console.log('✅ No pending migrations - database is up to date');
      await client.query('COMMIT');
      return;
    }

    console.log(`\n📦 Found ${pending.length} pending migration(s):\n`);

    for (const migration of pending) {
      await runMigration(client, migration, dryRun);
    }

    if (!dryRun) {
      await client.query('COMMIT');
      console.log(`\n✅ All ${pending.length} migration(s) applied successfully!`);
    } else {
      await client.query('ROLLBACK');
      console.log('\n✅ Dry run complete - no changes made');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed - rolled back all changes');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function migrateDown(): Promise<void> {
  console.error('❌ Down migrations not yet implemented');
  console.error('   Reason: SQL migrations don\'t include rollback logic');
  console.error('   Workaround: Manually create rollback migration');
  console.error('   Example: 999_rollback_002_indexes.sql with DROP INDEX statements');
  process.exit(1);
}

async function showStatus(): Promise<void> {
  const pool = createPool();
  const client = await pool.connect();

  try {
    await ensureMigrationsTable(client);

    const allMigrations = loadMigrations();
    const appliedMigrations = await getAppliedMigrations(client);

    validateMigrations(allMigrations, appliedMigrations);

    const appliedVersions = new Set(appliedMigrations.map(m => m.version));

    console.log('\n📊 Migration Status\n');
    console.log('Version | Status    | Name');
    console.log('--------|-----------|------------------------------------------');

    for (const migration of allMigrations) {
      const status = appliedVersions.has(migration.version) ? '✅ Applied' : '⏳ Pending';
      console.log(
        `${migration.version.toString().padStart(3, '0')}     | ${status.padEnd(9)} | ${migration.name}`
      );
    }

    const pending = allMigrations.filter(m => !appliedVersions.has(m.version));

    console.log('');
    console.log(`Total migrations: ${allMigrations.length}`);
    console.log(`Applied: ${appliedMigrations.length}`);
    console.log(`Pending: ${pending.length}`);
  } finally {
    client.release();
    await pool.end();
  }
}

async function createMigration(name: string): Promise<void> {
  const allMigrations = loadMigrations();
  const nextVersion = allMigrations.length > 0
    ? Math.max(...allMigrations.map(m => m.version)) + 1
    : 1;

  const filename = `${nextVersion.toString().padStart(3, '0')}_${name}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const template = `/**
 * Migration ${nextVersion}: ${name.replace(/_/g, ' ')}
 *
 * Created: ${new Date().toISOString().split('T')[0]}
 * Author: ${process.env.USER || 'unknown'}
 *
 * Description:
 * [Describe what this migration does and why]
 *
 * Related Issues:
 * - [Issue #123] [Brief description]
 */

-- ============================================================================
-- UP Migration
-- ============================================================================

-- [Add your schema changes here]
-- Example:
-- CREATE TABLE example (
--   id SERIAL PRIMARY KEY,
--   name TEXT NOT NULL,
--   created_at TIMESTAMP NOT NULL DEFAULT NOW()
-- );

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Uncomment to verify migration success:
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'example';

-- ============================================================================
-- Rollback Instructions
-- ============================================================================

-- To rollback this migration, create a new migration with:
-- DROP TABLE IF EXISTS example;
-- UPDATE schema_migrations SET ... -- if needed
`;

  fs.writeFileSync(filepath, template);
  console.log(`✅ Created new migration: ${filename}`);
  console.log(`   Edit file: ${filepath}`);
  console.log('   Then run: npx tsx src/platform/database/migrate.ts up');
}

// =============================================================================
// CLI Interface
// =============================================================================

async function main() {
  const command = process.argv[2] || 'status';
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'up':
        await migrateUp(false);
        break;

      case 'up:dry':
        console.log('🔍 Running dry-run (no changes will be made)\n');
        await migrateUp(true);
        break;

      case 'down':
        await migrateDown();
        break;

      case 'status':
        await showStatus();
        break;

      case 'create':
        if (!arg) {
          console.error('❌ Error: Migration name required');
          console.error('   Usage: migrate.ts create <name>');
          console.error('   Example: migrate.ts create add_user_roles');
          process.exit(1);
        }
        await createMigration(arg);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('');
        console.error('Usage:');
        console.error('  migrate.ts up           Run pending migrations');
        console.error('  migrate.ts up:dry       Dry-run (show what would run)');
        console.error('  migrate.ts down         Rollback last migration (not implemented)');
        console.error('  migrate.ts status       Show migration status');
        console.error('  migrate.ts create <name> Create new migration file');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { migrateUp, migrateDown, showStatus, createMigration };
