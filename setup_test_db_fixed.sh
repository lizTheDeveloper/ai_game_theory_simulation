#!/bin/bash
# Setup test database for integration tests (auto-detect PostgreSQL port)

set -e

echo "🗄️ Setting up test database..."

# Detect PostgreSQL port
PG_PORT=$(sudo -u postgres psql -tAc "SHOW port;" 2>/dev/null || echo "5432")
echo "PostgreSQL is running on port: $PG_PORT"

# Database credentials from test configuration
TEST_DB="marcus_test"
TEST_USER="marcus"
TEST_PASSWORD="marcus_dev_password"

# Create test database and user
sudo -u postgres psql -p $PG_PORT << SQL
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

echo "✅ Database and user created"

# Find pg_hba.conf
PG_HBA=$(sudo find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)
echo "Found pg_hba.conf at: $PG_HBA"

# Add authentication rules if they don't exist
if ! sudo grep -q "host.*marcus_test.*marcus.*127.0.0.1/32.*md5" "$PG_HBA" 2>/dev/null; then
    echo "Adding authentication rules to pg_hba.conf..."
    sudo cp "$PG_HBA" "$PG_HBA.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Add rules at line 2 (after first line)
    sudo sed -i '1a # MARCUS test database\nhost    marcus_test     marcus          127.0.0.1/32            md5\nhost    marcus_test     marcus          ::1/128                 md5' "$PG_HBA"
    
    echo "✅ Added authentication rules"
    
    # Reload PostgreSQL
    sudo systemctl reload postgresql
    sleep 2
fi

# Test connection
echo ""
echo "Testing database connection on port $PG_PORT..."
if PGPASSWORD=$TEST_PASSWORD psql -h localhost -p $PG_PORT -U $TEST_USER -d $TEST_DB -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Test database connection successful"
else
    echo "❌ Test database connection failed"
    echo ""
    echo "Trying to diagnose..."
    
    # Check if PostgreSQL is listening on TCP
    if sudo ss -tlnp | grep -q ":$PG_PORT"; then
        echo "✅ PostgreSQL is listening on port $PG_PORT"
    else
        echo "❌ PostgreSQL is NOT listening on TCP port $PG_PORT"
        echo "   Enabling listen_addresses in postgresql.conf..."
        
        PG_CONF=$(dirname "$PG_HBA")/postgresql.conf
        sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "$PG_CONF"
        sudo sed -i "s/listen_addresses = ''/listen_addresses = 'localhost'/" "$PG_CONF"
        
        echo "   Restarting PostgreSQL..."
        sudo systemctl restart postgresql
        sleep 3
        
        # Try again
        if PGPASSWORD=$TEST_PASSWORD psql -h localhost -p $PG_PORT -U $TEST_USER -d $TEST_DB -c "SELECT 1;" > /dev/null 2>&1; then
            echo "✅ Test database connection successful after restart"
        else
            echo "❌ Still failing. Manual troubleshooting needed."
            exit 1
        fi
    fi
fi

# Check Redis
echo ""
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis connection successful"
else
    echo "❌ Redis not running - start with: sudo systemctl start redis"
    exit 1
fi

echo ""
echo "✅ Test database setup complete!"
echo ""
echo "Database: $TEST_DB (port $PG_PORT)"
echo "User: $TEST_USER"
echo "Password: $TEST_PASSWORD"
echo ""
echo "Update test configuration to use port $PG_PORT"
echo "Export environment variable before running tests:"
echo "  export TEST_DB_PORT=$PG_PORT"
echo "  npm test -- authFlow.test.ts"
