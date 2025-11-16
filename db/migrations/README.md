# Database Migrations

This directory contains versioned database migrations for the Citation Integrity Platform.

## Migration Naming Convention

```
<number>_<description>.sql         # Up migration
<number>_<description>_down.sql    # Down migration (rollback)
```

Example:
- `001_initial_schema.sql` - Creates initial tables
- `001_initial_schema_down.sql` - Drops initial tables

## Running Migrations

### Using psql (Manual)

```bash
# Run all migrations
for file in db/migrations/*[0-9]*.sql; do
  psql -U citation_platform -d citation_db -f "$file"
done

# Rollback last migration
psql -U citation_platform -d citation_db -f db/migrations/001_initial_schema_down.sql
```

### Using node-pg-migrate (Recommended)

```bash
# Install
npm install -g node-pg-migrate

# Create new migration
npm run migrate:create <migration_name>

# Run migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Rollback all migrations
npm run migrate:reset
```

### Using migration script

```bash
# Apply all pending migrations
npx tsx scripts/migrate.ts up

# Rollback last migration
npx tsx scripts/migrate.ts down

# Show migration status
npx tsx scripts/migrate.ts status
```

## Migration Guidelines

1. **Never modify existing migrations** - Create new migrations instead
2. **Always provide rollback** - Every migration needs a `_down.sql` file
3. **Test rollback** - Verify down migration works before committing
4. **Idempotent migrations** - Use `IF EXISTS` and `IF NOT EXISTS`
5. **Data migrations** - Separate schema changes from data changes
6. **Backup first** - Always backup production DB before migrating

## Migration Tracking

Migrations are tracked in the `schema_migrations` table:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Migration History

| Version | Description | Applied | Author |
|---------|-------------|---------|--------|
| 001 | Initial schema (13 tables, triggers, views) | 2025-11-16 | Marcus |
