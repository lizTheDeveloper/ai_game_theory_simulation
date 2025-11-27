#!/bin/bash
# Debug test database setup

echo "🔍 Diagnosing test database setup..."
echo ""

# Check if database exists
echo "1️⃣ Checking if marcus_test database exists..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw marcus_test; then
    echo "✅ Database 'marcus_test' exists"
else
    echo "❌ Database 'marcus_test' does not exist"
fi

# Check if user exists
echo ""
echo "2️⃣ Checking if marcus user exists..."
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='marcus'" | grep -q 1; then
    echo "✅ User 'marcus' exists"
else
    echo "❌ User 'marcus' does not exist"
fi

# Check pg_hba.conf for marcus_test rules
echo ""
echo "3️⃣ Checking pg_hba.conf for marcus_test authentication rules..."
if sudo grep -q "marcus_test" /etc/postgresql/*/main/pg_hba.conf 2>/dev/null; then
    echo "✅ Found marcus_test rules:"
    sudo grep "marcus_test" /etc/postgresql/*/main/pg_hba.conf
else
    echo "❌ No marcus_test rules found in pg_hba.conf"
    echo ""
    echo "Current pg_hba.conf (first 30 lines):"
    sudo head -30 /etc/postgresql/*/main/pg_hba.conf
fi

# Test peer authentication (as postgres user)
echo ""
echo "4️⃣ Testing peer authentication (as postgres)..."
if sudo -u postgres psql -d marcus_test -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Peer auth works (postgres user can connect)"
else
    echo "❌ Peer auth failed"
fi

# Test password authentication
echo ""
echo "5️⃣ Testing password authentication (as marcus)..."
if PGPASSWORD=marcus_dev_password psql -h localhost -U marcus -d marcus_test -c "SELECT 1;" 2>&1 | head -5; then
    echo "✅ Password auth works"
else
    echo "❌ Password auth failed (see error above)"
fi

# Show what needs to be added to pg_hba.conf
echo ""
echo "📋 Required pg_hba.conf entries:"
echo "host    marcus_test     marcus          127.0.0.1/32            md5"
echo "host    marcus_test     marcus          ::1/128                 md5"
