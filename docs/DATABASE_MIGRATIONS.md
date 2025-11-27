# MARCUS Platform Database Migrations

**Last Updated:** November 22, 2025
**Author:** Marcus (Platform Engineer)

---

## Overview

MARCUS Platform uses a custom TypeScript-based migration framework for versioned schema management. All migrations are tracked in the `schema_migrations` table with checksum validation to ensure integrity.

---

## Quick Start

### Add to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "db:migrate": "npx tsx src/platform/database/migrate.ts up",
    "db:migrate:dry": "npx tsx src/platform/database/migrate.ts up:dry",
    "db:migrate:status": "npx tsx src/platform/database/migrate.ts status",
    "db:migrate:create": "npx tsx src/platform/database/migrate.ts create"
  }
}
```

### Run Migrations

```bash
# Check current status
npm run db:migrate:status

# Dry-run (see what would be applied)
npm run db:migrate:dry

# Apply pending migrations
npm run db:migrate

# Create new migration
npm run db:migrate:create add_user_roles
```

---

## Migration Framework

### Architecture

```
src/platform/database/
├── migrate.ts          # Migration runner (400+ lines)
├── migrations/         # Versioned SQL files
│   ├── 001_initial_schema.sql
│   ├── 002_add_performance_indexes.sql
│   ├── 003_csp_violations_fixed.sql
│   ├── 004_password_reset_tokens.sql
│   ├── 005_complete_schema.sql
│   ├── 006_agent_system_schema.sql
│   └── 007_missing_test_tables.sql
└── schema.sql          # Legacy (not used by migrator)
```

### Features

- **Automatic tracking** - `schema_migrations` table tracks applied migrations
- **Checksum validation** - Detects modified migrations after application
- **Transaction safety** - Atomic migrations (all-or-nothing)
- **Idempotent** - Safe to run multiple times
- **CI/CD integration** - GitHub Actions validates migrations
- **TypeScript-based** - Type-safe migration runner

---

## Creating Migrations

### Naming Convention

```
<version>_<description>.sql

Examples:
001_initial_schema.sql
002_add_performance_indexes.sql
010_add_user_roles.sql
```

**Rules:**
- Version: 3-digit zero-padded integer (001, 002, ...)
- Description: Snake_case, descriptive
- Extension: `.sql` (plain SQL, not TypeScript)

### Migration Template

```bash
npm run db:migrate:create add_citation_tags
```

Creates: `src/platform/database/migrations/008_add_citation_tags.sql`

```sql
/**
 * Migration 008: Add citation tags
 *
 * Created: 2025-11-22
 * Author: your-name
 *
 * Description:
 * Adds tagging system for citations (manual review, flagged, etc.)
 *
 * Related Issues:
 * - [Issue #45] Add tagging system for manual review
 */

-- ============================================================================
-- UP Migration
-- ============================================================================

CREATE TABLE citation_tags (
  id SERIAL PRIMARY KEY,
  citation_id INTEGER NOT NULL REFERENCES citation_analyses(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE (citation_id, tag)
);

CREATE INDEX idx_citation_tags_citation ON citation_tags(citation_id);
CREATE INDEX idx_citation_tags_tag ON citation_tags(tag);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Uncomment to verify:
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'citation_tags';

-- ============================================================================
-- Rollback Instructions
-- ============================================================================

-- To rollback, create new migration: 999_rollback_008_tags.sql
-- DROP TABLE IF EXISTS citation_tags;
```

### Best Practices

1. **One logical change per migration**
   - ✅ GOOD: One migration adds `citation_tags` table
   - ❌ BAD: One migration adds 5 unrelated tables

2. **Idempotent SQL**
   - Use `CREATE TABLE IF NOT EXISTS`
   - Use `CREATE INDEX IF NOT EXISTS`
   - Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (PL/pgSQL)

3. **Document everything**
   - Header comment with description
   - Inline comments for complex logic
   - Verification queries

4. **Test before committing**
   - Run migration on local database
   - Verify data integrity
   - Check EXPLAIN ANALYZE for index usage

5. **Never modify applied migrations**
   - Applied migrations have checksums
   - Modifying them breaks validation
   - Create new migration instead

---

## Migration Workflow

### Local Development

```bash
# 1. Create migration
npm run db:migrate:create add_feature_x

# 2. Edit SQL file
vim src/platform/database/migrations/008_add_feature_x.sql

# 3. Test dry-run
npm run db:migrate:dry

# 4. Apply migration
npm run db:migrate

# 5. Verify success
npm run db:migrate:status

# 6. Commit to git
git add src/platform/database/migrations/008_add_feature_x.sql
git commit -m "feat: Add feature X database schema"
```

### Staging/Production Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Check migration status
npm run db:migrate:status

# 3. Backup database (CRITICAL!)
pg_dump -h postgres -U marcus -d citation_integrity > backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Run migrations
npm run db:migrate

# 5. Verify application still works
curl https://marcus-staging.example.com/health

# 6. If failure, restore from backup
# psql -h postgres -U marcus -d citation_integrity < backup_20251122_143000.sql
```

---

## Troubleshooting

### Migration Failed Mid-Way

**Symptom:** Migration fails after partially applying

**Solution:**
```bash
# 1. Check which migrations were applied
npm run db:migrate:status

# 2. If migration is NOT in schema_migrations:
#    The transaction was rolled back - safe to retry
npm run db:migrate

# 3. If migration IS in schema_migrations but incomplete:
#    Manual intervention required
psql -h postgres -U marcus -d citation_integrity

# Check table state
\dt
\d table_name

# Fix manually or rollback
DELETE FROM schema_migrations WHERE version = 8;
DROP TABLE partially_created_table;

# Retry migration
npm run db:migrate
```

### Checksum Mismatch

**Symptom:** `Migration X checksum mismatch`

**Cause:** Migration file was modified after being applied

**Solution:**
```bash
# Option 1: Revert file to original (recommended)
git checkout HEAD -- src/platform/database/migrations/008_add_feature.sql

# Option 2: Create new migration with fixes
npm run db:migrate:create fix_feature_x
# Add corrective SQL

# Option 3: Update checksum (NOT RECOMMENDED - breaks audit trail)
# UPDATE schema_migrations SET checksum = 'new_checksum' WHERE version = 8;
```

### Missing Migration File

**Symptom:** `Migration X was applied but file not found`

**Cause:** Migration file deleted after being applied

**Solution:**
```bash
# Recover from git history
git log --all --full-history -- "**/migrations/008_*.sql"
git checkout <commit> -- src/platform/database/migrations/008_add_feature.sql

# If unrecoverable, remove from tracking
# (NOT RECOMMENDED - only for emergencies)
# DELETE FROM schema_migrations WHERE version = 8;
```

### Database Out of Sync

**Symptom:** Production has tables not in migrations

**Cause:** Manual schema changes applied without migrations

**Solution:**
```bash
# 1. Document current production schema
pg_dump -h prod-postgres -U marcus -d citation_integrity --schema-only > prod_schema.sql

# 2. Create migration to match production
npm run db:migrate:create sync_production_schema

# 3. Add CREATE TABLE statements for missing tables

# 4. Test on staging before applying to production
```

---

## CI/CD Integration

### GitHub Actions

Migrations are automatically validated in CI:

```yaml
# .github/workflows/validate-migrations.yml
name: Validate Database Migrations
on:
  pull_request:
    paths:
      - 'src/platform/database/migrations/**'
      - 'src/platform/database/migrate.ts'

jobs:
  validate-migrations:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
    steps:
      - name: Run migrations
        run: npm run db:migrate
      - name: Verify status
        run: npm run db:migrate:status
      - name: Test idempotency
        run: npm run db:migrate
```

**Checks:**
- ✅ Migration file naming conventions
- ✅ No version conflicts
- ✅ SQL syntax validity
- ✅ Migrations apply successfully
- ✅ Idempotency (can run twice)
- ✅ Required tables exist
- ✅ Indexes created correctly

---

## Kubernetes Deployment

### Init Container Pattern

```yaml
# k8s/orchestrator-deployment.yaml
spec:
  template:
    spec:
      initContainers:
        - name: run-migrations
          image: marcus-platform/orchestrator:v3.1.0
          command: ['npm', 'run', 'db:migrate']
          env:
            - name: POSTGRES_HOST
              valueFrom:
                configMapKeyRef:
                  name: marcus-config
                  key: POSTGRES_HOST
            # ... other env vars
      containers:
        - name: orchestrator
          # ... main container
```

**Benefits:**
- Migrations run before application starts
- Automatic on every deployment
- Fail-safe: Pod won't start if migrations fail

**Risks:**
- Multiple pods = race condition (use distributed lock)
- Long migrations delay pod startup

### Job Pattern (Recommended)

```yaml
# k8s/migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: marcus-migrate-{{ .Values.version }}
  namespace: marcus-platform
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrate
          image: marcus-platform/orchestrator:{{ .Values.version }}
          command: ['npm', 'run', 'db:migrate']
          env:
            # ... database credentials
```

**Usage:**
```bash
# Run before deploying new version
kubectl apply -f k8s/migration-job.yaml

# Wait for completion
kubectl wait --for=condition=complete job/marcus-migrate-v3.1.0 -n marcus-platform --timeout=300s

# Then deploy application
kubectl apply -f k8s/orchestrator-deployment.yaml
```

---

## Migration History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 001 | 2025-11-22 | Initial schema (users, agent_states, citation_analyses) | Marcus |
| 002 | 2025-11-22 | Performance indexes (compound, partial, GIN) | Marcus |
| 003 | 2025-11-21 | CSP violation tracking | System |
| 004 | 2025-11-21 | Password reset tokens | System |
| 005 | 2025-11-21 | Complete schema consolidation | System |
| 006 | 2025-11-21 | Agent system schema | Marcus |
| 007 | 2025-11-21 | Missing test tables | System |

---

## References

- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Zero-Downtime Migrations](https://brandur.org/postgres-atomicity)
- [Database Reliability Engineering](https://www.oreilly.com/library/view/database-reliability-engineering/9781491925935/)

---

**Last Updated:** November 22, 2025
**Contact:** marcus@platform.engineering
