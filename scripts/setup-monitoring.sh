#!/bin/bash
#
# MARCUS 3.0 - Monitoring Setup Script
# Phase 3.2: Monitoring Setup
#
# Installs and configures Prometheus + Grafana monitoring stack
#
# What it installs:
# - Prometheus (metrics collection)
# - Grafana (dashboards and visualization)
# - Node Exporter (system metrics)
# - PostgreSQL Exporter (database metrics)
# - Redis Exporter (cache metrics)
#
# Usage:
#   sudo ./scripts/setup-monitoring.sh

set -euo pipefail

echo "🔍 MARCUS 3.0 - Monitoring Setup"
echo "================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: This script must be run with sudo"
  exit 1
fi

# ============================================================================
# 1. Install Prometheus
# ============================================================================

echo "📊 Installing Prometheus..."

apt-get update -qq
apt-get install -y prometheus

# Copy Prometheus configuration
cp monitoring/prometheus/prometheus.yml /etc/prometheus/prometheus.yml
cp monitoring/alerting/marcus-platform.yml /etc/prometheus/alerts/marcus-platform.yml

# Create JWT token file for Prometheus authentication
echo "Generating JWT token for Prometheus..."
# TODO: Replace with actual admin token generation
# For now, create placeholder
echo "# Replace with actual JWT token" > /etc/prometheus/marcus_token.txt
chmod 600 /etc/prometheus/marcus_token.txt

# Enable and start Prometheus
systemctl enable prometheus
systemctl restart prometheus

echo "✅ Prometheus installed and configured"
echo "   Web UI: http://localhost:9090"
echo ""

# ============================================================================
# 2. Install Grafana
# ============================================================================

echo "📊 Installing Grafana..."

# Add Grafana APT repository
apt-get install -y software-properties-common
add-apt-repository -y "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -

apt-get update -qq
apt-get install -y grafana

# Copy Grafana dashboards
mkdir -p /var/lib/grafana/dashboards
cp monitoring/grafana/dashboards/*.json /var/lib/grafana/dashboards/
chown -R grafana:grafana /var/lib/grafana/dashboards

# Enable and start Grafana
systemctl enable grafana-server
systemctl restart grafana-server

echo "✅ Grafana installed"
echo "   Web UI: http://localhost:3000"
echo "   Default credentials: admin/admin (change on first login)"
echo ""

# ============================================================================
# 3. Install Node Exporter (System Metrics)
# ============================================================================

echo "📊 Installing Node Exporter..."

apt-get install -y prometheus-node-exporter

systemctl enable prometheus-node-exporter
systemctl restart prometheus-node-exporter

echo "✅ Node Exporter installed"
echo "   Metrics: http://localhost:9100/metrics"
echo ""

# ============================================================================
# 4. Install PostgreSQL Exporter
# ============================================================================

echo "📊 Installing PostgreSQL Exporter..."

apt-get install -y prometheus-postgres-exporter

# Configure PostgreSQL exporter
cat > /etc/default/prometheus-postgres-exporter <<EOF
# PostgreSQL connection string
DATA_SOURCE_NAME="postgresql://marcus:${DATABASE_PASSWORD:-}@localhost:5432/marcus_test?sslmode=disable"

# Additional options
PG_EXPORTER_WEB_LISTEN_ADDRESS=":9187"
PG_EXPORTER_WEB_TELEMETRY_PATH="/metrics"
EOF

systemctl enable prometheus-postgres-exporter
systemctl restart prometheus-postgres-exporter

echo "✅ PostgreSQL Exporter installed"
echo "   Metrics: http://localhost:9187/metrics"
echo ""

# ============================================================================
# 5. Install Redis Exporter
# ============================================================================

echo "📊 Installing Redis Exporter..."

# Download and install redis_exporter
REDIS_EXPORTER_VERSION="1.55.0"
wget -q "https://github.com/oliver006/redis_exporter/releases/download/v${REDIS_EXPORTER_VERSION}/redis_exporter-v${REDIS_EXPORTER_VERSION}.linux-amd64.tar.gz"
tar xzf "redis_exporter-v${REDIS_EXPORTER_VERSION}.linux-amd64.tar.gz"
mv redis_exporter-v${REDIS_EXPORTER_VERSION}.linux-amd64/redis_exporter /usr/local/bin/
rm -rf redis_exporter-v${REDIS_EXPORTER_VERSION}*

# Create systemd service
cat > /etc/systemd/system/redis-exporter.service <<EOF
[Unit]
Description=Redis Exporter
After=network.target redis.service

[Service]
Type=simple
User=nobody
Group=nogroup
ExecStart=/usr/local/bin/redis_exporter \\
  --redis.addr=localhost:6379 \\
  --redis.password=${REDIS_PASSWORD:-} \\
  --web.listen-address=:9121 \\
  --web.telemetry-path=/metrics
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable redis-exporter
systemctl start redis-exporter

echo "✅ Redis Exporter installed"
echo "   Metrics: http://localhost:9121/metrics"
echo ""

# ============================================================================
# 6. Verify Installation
# ============================================================================

echo "🔍 Verifying installation..."
echo ""

# Check Prometheus
if systemctl is-active --quiet prometheus; then
  echo "✅ Prometheus: Running"
else
  echo "❌ Prometheus: Not running"
fi

# Check Grafana
if systemctl is-active --quiet grafana-server; then
  echo "✅ Grafana: Running"
else
  echo "❌ Grafana: Not running"
fi

# Check Node Exporter
if systemctl is-active --quiet prometheus-node-exporter; then
  echo "✅ Node Exporter: Running"
else
  echo "❌ Node Exporter: Not running"
fi

# Check PostgreSQL Exporter
if systemctl is-active --quiet prometheus-postgres-exporter; then
  echo "✅ PostgreSQL Exporter: Running"
else
  echo "❌ PostgreSQL Exporter: Not running"
fi

# Check Redis Exporter
if systemctl is-active --quiet redis-exporter; then
  echo "✅ Redis Exporter: Running"
else
  echo "❌ Redis Exporter: Not running"
fi

echo ""
echo "✅ Monitoring setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure Grafana data source:"
echo "   - Open http://localhost:3000"
echo "   - Login with admin/admin"
echo "   - Add Prometheus data source: http://localhost:9090"
echo ""
echo "2. Import dashboards:"
echo "   - Dashboard files: /var/lib/grafana/dashboards/*.json"
echo "   - Or use Grafana UI to import from /var/lib/grafana/dashboards/"
echo ""
echo "3. Generate JWT token for Prometheus:"
echo "   - Login to MARCUS platform"
echo "   - Copy access token"
echo "   - Save to: /etc/prometheus/marcus_token.txt"
echo ""
echo "4. Verify metrics:"
echo "   - Prometheus targets: http://localhost:9090/targets"
echo "   - Grafana dashboards: http://localhost:3000/dashboards"
echo ""
