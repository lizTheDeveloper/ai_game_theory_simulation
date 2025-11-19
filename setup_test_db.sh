#!/bin/bash
# Setup test database for integration tests

set -e

echo "🗄️  Setting up test database..."

# Database credentials from test configuration
TEST_DB="marcus_test"
TEST_USER="marcus"
TEST_PASSWORD="marcus_dev_password"

# Create test database and user
sudo -u postgres psql << SQL
-- Create user if doesn't exist
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$TEST_USER') THEN
    CREATE USER $TEST_USER WITH PASSWORD '$TEST_PASSWORD';
  ELSE
    ALTER USER $TEST_USER WITH PASSWORD '$TEST_PASSWORD';
  END IF;
END
\$\$;

-- Drop existing test database if exists
DROP DATABASE IF EXISTS $TEST_DB;

-- Create test database
CREATE DATABASE $TEST_DB OWNER $TEST_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $TEST_DB TO $TEST_USER;

SQL

# Configure PostgreSQL to allow password authentication for test user
if ! sudo grep -q "host.*marcus_test.*marcus.*md5" /etc/postgresql/*/main/pg_hba.conf 2>/dev/null; then
    echo "Configuring PostgreSQL authentication..."
    sudo sed -i "/^# Database administrative login by Unix domain socket/i # MARCUS test database\nhost    marcus_test     marcus          127.0.0.1/32            md5\nhost    marcus_test     marcus          ::1/128                 md5\n" /etc/postgresql/*/main/pg_hba.conf

    # Reload PostgreSQL to apply changes
    sudo systemctl reload postgresql

    # Wait for reload to complete
    sleep 2
fi

# Test connection
echo "Testing database connection..."
if PGPASSWORD=$TEST_PASSWORD psql -h localhost -U $TEST_USER -d $TEST_DB -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Test database connection successful"
else
    echo "❌ Test database connection failed"
    exit 1
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis connection successful"
else
    echo "❌ Redis not running - start with: sudo systemctl start redis"
    exit 1
fi

echo ""
echo "✅ Test database setup complete!"
echo ""
echo "Database: $TEST_DB"
echo "User: $TEST_USER"
echo "Password: $TEST_PASSWORD"
echo ""
echo "Run integration tests with:"
echo "  npm test -- authFlow.test.ts"
