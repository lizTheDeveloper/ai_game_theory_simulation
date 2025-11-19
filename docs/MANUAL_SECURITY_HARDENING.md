# Manual Security Hardening Guide

**For cases where the automated script fails due to permissions or other issues.**

## Prerequisites

- Root or sudo access to the VM
- MARCUS platform installed at: `/home/g7throwawayplz/ai_game_theory_simulation/`
- PostgreSQL and Redis running

## 1. Redis Authentication Setup

### Step 1: Generate Redis Password

```bash
# Generate a strong random password
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
echo "Generated password: $REDIS_PASSWORD"

# Save it temporarily (you'll add to .env later)
echo "$REDIS_PASSWORD" > /tmp/redis_password.txt
chmod 600 /tmp/redis_password.txt
```

### Step 2: Find Redis Configuration

```bash
# Find the Redis config file
sudo find /etc/redis -name "redis.conf"

# Common locations:
# - /etc/redis/redis.conf
# - /etc/redis.conf
```

### Step 3: Backup and Edit Redis Config

```bash
# Backup the original config
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup.$(date +%Y%m%d)

# Edit the config
sudo nano /etc/redis/redis.conf

# Add or update this line (replace with your generated password):
requirepass YOUR_GENERATED_PASSWORD_HERE
```

### Step 4: Restart Redis

```bash
# Restart Redis service
sudo systemctl restart redis-server

# Or if that doesn't work:
sudo systemctl restart redis

# Verify it's running
sudo systemctl status redis-server
```

### Step 5: Test Redis Authentication

```bash
# Read the password you generated
REDIS_PASSWORD=$(cat /tmp/redis_password.txt)

# Test connection
redis-cli -a "$REDIS_PASSWORD" PING

# Should respond: PONG
```

### Step 6: Update .env File

```bash
cd /home/g7throwawayplz/ai_game_theory_simulation

# Backup .env
cp .env .env.backup.$(date +%Y%m%d)

# Read the password
REDIS_PASSWORD=$(cat /tmp/redis_password.txt)

# Add Redis password to .env
nano .env

# Add this line (or update if it exists):
REDIS_PASSWORD=YOUR_GENERATED_PASSWORD_HERE
```

### Step 7: Restart MARCUS Service

```bash
# Restart the MARCUS platform service
sudo systemctl restart marcus-platform

# Check status
sudo systemctl status marcus-platform

# Watch logs for any Redis connection errors
sudo journalctl -u marcus-platform -f
```

### Step 8: Cleanup

```bash
# Remove temporary password file
rm /tmp/redis_password.txt
```

## 2. PostgreSQL SSL Configuration (Optional)

### Step 1: Generate SSL Certificates

```bash
# For testing/development (self-signed):
cd /etc/postgresql/14/main/

sudo openssl req -new -x509 -days 365 -nodes -text \
  -out server.crt \
  -keyout server.key \
  -subj "/CN=marcus-db"

sudo chmod 600 server.key
sudo chown postgres:postgres server.key server.crt
```

### Step 2: Enable SSL in PostgreSQL

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Find and update these lines:
ssl = on
ssl_cert_file = '/etc/postgresql/14/main/server.crt'
ssl_key_file = '/etc/postgresql/14/main/server.key'
```

### Step 3: Restart PostgreSQL

```bash
sudo systemctl restart postgresql

# Verify SSL is enabled
sudo -u postgres psql -c "SHOW ssl;"
# Should show: on
```

### Step 4: Update Connection String (Optional)

```bash
# Edit .env to use SSL
nano /home/g7throwawayplz/ai_game_theory_simulation/.env

# Add this parameter to database connection:
DATABASE_SSL=true
```

## 3. Verification Checklist

After completing the hardening steps, verify everything works:

```bash
cd /home/g7throwawayplz/ai_game_theory_simulation

# 1. Check Redis authentication
redis-cli -a "$(grep REDIS_PASSWORD .env | cut -d= -f2)" PING
# Should return: PONG

# 2. Check PostgreSQL connection
PGPASSWORD=$(grep DATABASE_PASSWORD .env | cut -d= -f2) \
  psql -h localhost -U marcus -d marcus_production -c "SELECT 1;"
# Should return: 1 row

# 3. Check MARCUS service
sudo systemctl status marcus-platform
# Should show: active (running)

# 4. Test API endpoint
curl http://localhost:3000/health
# Should return JSON health status

# 5. Check service logs
sudo journalctl -u marcus-platform -n 50
# Should show no Redis/database connection errors
```

## 4. Troubleshooting

### Redis Connection Refused

```bash
# Check if Redis is running
sudo systemctl status redis-server

# Check Redis logs
sudo journalctl -u redis-server -n 50

# Test basic connection
redis-cli ping
# If it returns PONG, password is not set
# If it returns "NOAUTH Authentication required", password is set correctly
```

### PostgreSQL SSL Errors

```bash
# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Verify certificate permissions
ls -l /etc/postgresql/14/main/server.*
# Should show: -rw------- 1 postgres postgres

# Test SSL connection
psql "sslmode=require host=localhost dbname=marcus_production user=marcus"
```

### MARCUS Service Won't Start

```bash
# Check detailed logs
sudo journalctl -u marcus-platform -xe

# Common issues:
# - Wrong Redis password in .env
# - Database connection failure
# - Missing environment variables

# Verify .env file
grep -v "^#" /home/g7throwawayplz/ai_game_theory_simulation/.env | grep -v "^$"

# Test environment loading
cd /home/g7throwawayplz/ai_game_theory_simulation
source .env
echo $REDIS_PASSWORD
```

## 5. Security Best Practices

### Password Requirements

- **Redis Password**: Minimum 32 characters, use openssl rand
- **JWT Secret**: Minimum 32 characters, cryptographically random
- **Database Password**: Strong password, avoid dictionary words

### File Permissions

```bash
# Secure .env file
chmod 600 /home/g7throwawayplz/ai_game_theory_simulation/.env
chown g7throwawayplz:g7throwawayplz /home/g7throwawayplz/ai_game_theory_simulation/.env

# Secure credentials files
find /home/g7throwawayplz -name "*credentials*" -exec chmod 600 {} \;
find /home/g7throwawayplz -name "*password*" -exec chmod 600 {} \;
```

### Regular Updates

```bash
# Keep system updated
sudo apt update && sudo apt upgrade -y

# Update npm packages
cd /home/g7throwawayplz/ai_game_theory_simulation
npm audit
npm audit fix
```

## 6. Production-Grade SSL (Beyond Scope)

For production deployments, use proper SSL certificates from a Certificate Authority:

1. **Let's Encrypt** (Free, automated)
   - Use certbot for automatic certificate management
   - Renews every 90 days automatically

2. **Commercial CA**
   - DigiCert, Comodo, etc.
   - Extended validation available
   - Longer validity periods

3. **Internal CA**
   - For private networks
   - Requires PKI infrastructure
   - Full control over certificate lifecycle

## 7. Additional Hardening (Optional)

### Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3000/tcp  # MARCUS API
sudo ufw enable

# Restrict PostgreSQL to localhost only
sudo ufw deny 5433/tcp

# Restrict Redis to localhost only
sudo ufw deny 6379/tcp
```

### Fail2Ban Setup

```bash
# Install fail2ban to prevent brute force attacks
sudo apt install fail2ban

# Configure for SSH
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### System Resource Limits

Already configured in `marcus-platform.service`:
- `LimitNOFILE=65536` - Max open files
- `LimitNPROC=4096` - Max processes

## Support

If you encounter issues:

1. Check logs: `sudo journalctl -u marcus-platform -f`
2. Verify configuration: `./scripts/verify_security.sh`
3. Review service status: `sudo systemctl status marcus-platform`
4. Test API: `curl http://localhost:3000/health`

---

**Last Updated**: 2025-11-19
**MARCUS Version**: 3.0
**Platform**: Ubuntu 22.04 LTS
