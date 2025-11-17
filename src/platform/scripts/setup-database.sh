#!/bin/bash
# MARCUS Platform - Database Setup Script
# Creates database and runs schema

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 MARCUS Platform - Database Setup${NC}\n"

# Read environment variables or use defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-marcus_platform}"
DB_USER="${DB_USER:-postgres}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not running at $DB_HOST:$DB_PORT${NC}"
    echo "Please start PostgreSQL and try again"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Create database if it doesn't exist
echo -e "\n${YELLOW}Creating database '$DB_NAME'...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME"

echo -e "${GREEN}✅ Database created${NC}"

# Run schema
echo -e "\n${YELLOW}Running auth schema...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/../database/auth-schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}❌ Schema file not found: $SCHEMA_FILE${NC}"
    exit 1
fi

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"

echo -e "${GREEN}✅ Schema created${NC}"

# Verify tables
echo -e "\n${YELLOW}Verifying tables...${NC}"
TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename" | tr '\n' ', ')

echo "  Tables: $TABLES"
echo -e "${GREEN}✅ Setup complete${NC}"

# Show default credentials warning
echo -e "\n${RED}⚠️  SECURITY WARNING ⚠️${NC}"
echo -e "${YELLOW}Default admin account created:${NC}"
echo "  Email: admin@marcus-platform.local"
echo "  Password: changeme123!"
echo ""
echo -e "${RED}CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!${NC}"
