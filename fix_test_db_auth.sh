#!/bin/bash
# Manually fix test database authentication

echo "🔧 Fixing test database authentication..."

# Find pg_hba.conf file
PG_HBA=$(sudo find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)

if [ -z "$PG_HBA" ]; then
    echo "❌ Could not find pg_hba.conf"
    exit 1
fi

echo "Found pg_hba.conf at: $PG_HBA"
echo ""

# Check if rules already exist
if sudo grep -q "host.*marcus_test.*marcus.*127.0.0.1/32.*md5" "$PG_HBA"; then
    echo "✅ Rules already exist in pg_hba.conf"
else
    echo "Adding authentication rules..."
    
    # Backup original file
    sudo cp "$PG_HBA" "$PG_HBA.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backed up to $PG_HBA.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Add rules at the beginning (before other host rules)
    sudo sed -i '1a # MARCUS test database\nhost    marcus_test     marcus          127.0.0.1/32            md5\nhost    marcus_test     marcus          ::1/128                 md5' "$PG_HBA"
    
    echo "✅ Added authentication rules"
fi

echo ""
echo "Current pg_hba.conf (first 20 lines):"
sudo head -20 "$PG_HBA"

echo ""
echo "Reloading PostgreSQL configuration..."
sudo systemctl reload postgresql
sleep 2

echo ""
echo "Testing connection..."
if PGPASSWORD=marcus_dev_password psql -h localhost -U marcus -d marcus_test -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Test database connection successful!"
else
    echo "❌ Test database connection failed"
    echo ""
    echo "Try connecting manually:"
    echo "PGPASSWORD=marcus_dev_password psql -h localhost -U marcus -d marcus_test"
fi
