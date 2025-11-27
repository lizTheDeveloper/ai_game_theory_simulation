# Local Benchmark Testing Setup

This guide explains how to run MARCUS benchmarks locally instead of waiting for CI.

## Prerequisites

### 1. Install PostgreSQL and Redis

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib redis-server python3-pip

# Start services
sudo systemctl start postgresql redis-server
sudo systemctl enable postgresql redis-server
```

### 2. Create Database and User

```bash
# Create benchmark user and database
sudo -u postgres psql -c "CREATE USER benchmark_user WITH PASSWORD 'benchmark_pass';"
sudo -u postgres psql -c "CREATE DATABASE benchmark_db OWNER benchmark_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE benchmark_db TO benchmark_user;"
```

### 3. Apply Database Migrations

```bash
# Apply migrations in order
PGPASSWORD=benchmark_pass psql -h localhost -U benchmark_user -d benchmark_db \
  -f src/platform/database/migrations/001_initial_schema.sql

PGPASSWORD=benchmark_pass psql -h localhost -U benchmark_user -d benchmark_db \
  -f src/platform/database/migrations/005_complete_schema.sql

PGPASSWORD=benchmark_pass psql -h localhost -U benchmark_user -d benchmark_db \
  -f src/platform/database/migrations/006_agent_system_schema.sql
```

### 4. Install Python Dependencies

```bash
pip3 install psycopg2-binary redis numpy pandas scikit-learn tqdm python-dotenv requests
```

### 5. Install Node Dependencies

```bash
npm ci
```

## Environment Configuration

### Create `.env.local` from template:

```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### Required Environment Variables:

```bash
# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
POSTGRES_DB=benchmark_db
POSTGRES_USER=benchmark_user
POSTGRES_PASSWORD=benchmark_pass

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running Benchmarks Locally

### Load environment and run:

```bash
# Load .env.local
set -a && source .env.local && set +a

# Create output directory
mkdir -p benchmark_results

# Run Python benchmarks
python src/platform/evaluation/citation_evaluation_benchmarks.py

# Run TypeScript benchmarks
npx tsx src/platform/evaluation/citationBenchmarks.ts
```

### Watch logs in real-time:

```bash
# In another terminal
tail -f benchmark_results/*.log
```

## Troubleshooting

### "database does not exist"
- Check POSTGRES_DB matches your created database
- Verify migrations were applied

### "column X does not exist"
- Re-run migrations, especially 006_agent_system_schema.sql
- Check if migration has the latest schema updates

### "password authentication failed"
- Check POSTGRES_USER and POSTGRES_PASSWORD match
- Verify pg_hba.conf allows local connections

### Redis connection refused
- Check Redis is running: `redis-cli ping`
- Verify REDIS_HOST and REDIS_PORT

## CI vs Local

The CI workflow (`.github/workflows/marcus-benchmark.yml`) does the same steps automatically:
1. Starts PostgreSQL/Redis services
2. Creates database with `benchmark_user`
3. Applies migrations
4. Runs benchmarks

Local testing lets you see errors immediately without waiting for CI.
