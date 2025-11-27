# MARCUS 3.0 VM Provisioning Guide

This guide explains how to provision an existing VM with MARCUS 3.0 using secure secrets management.

---

## Overview

**Two provisioning scripts are available:**

1. **`scripts/setup_marcus_vm.sh`** - Creates a NEW GCP VM and provisions it remotely
2. **`scripts/provision_marcus_vm.sh`** - Provisions an EXISTING VM you're logged into (this guide)

---

## Prerequisites

- **Ubuntu 20.04+ or Debian 11+** (tested on Ubuntu 22.04)
- **Sudo privileges** (non-root user)
- **Internet connection**
- **Anthropic API key** (from https://console.anthropic.com/)
- **At least 2GB RAM** (recommended: 4GB+)
- **10GB disk space** (recommended: 20GB+)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/404GeneNotFound/ai_game_theory_simulation.git
cd ai_game_theory_simulation
```

### 2. Switch to MARCUS Branch

```bash
git checkout claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof
```

### 3. Create Secrets File

```bash
# Copy the template
cp .env.secrets.template .env.secrets

# Edit and add your API key
nano .env.secrets
```

**In `.env.secrets`, set:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Leave the other fields empty - they'll be auto-generated with secure random values.

### 4. Run Provisioning Script

```bash
./scripts/provision_marcus_vm.sh
```

The script will:
- ✅ Install all dependencies (Node.js, PostgreSQL, Redis, Python)
- ✅ Generate secure passwords and JWT secrets
- ✅ Configure database and create schema
- ✅ Build TypeScript code
- ✅ Create admin user with random password
- ✅ Setup systemd service for auto-start
- ✅ Validate installation
- ✅ Save all credentials to a secure file

**Estimated time:** 5-10 minutes

### 5. Save Credentials

After provisioning completes, **immediately save the credentials**:

```bash
# The script outputs the credential file location
cat ~/marcus_credentials_TIMESTAMP.txt

# Copy credentials to your password manager
# Then delete the file
rm ~/marcus_credentials_TIMESTAMP.txt
```

### 6. Start the Service

```bash
sudo systemctl start marcus-platform
sudo systemctl status marcus-platform
```

### 7. Validate Installation

```bash
# Test health endpoint
curl http://localhost:3000/health

# Run comprehensive validation
./scripts/test_marcus_complete.sh
```

---

## Secrets Management

### Security Best Practices

**DO:**
- ✅ Use `.env.secrets` for sensitive values (gitignored)
- ✅ Delete credentials file after saving to password manager
- ✅ Delete `.env.secrets` after provisioning (credentials are in `.env`)
- ✅ Use `chmod 600` on all credential files
- ✅ Change admin password on first login
- ✅ Rotate JWT secrets periodically

**DON'T:**
- ❌ Commit `.env.secrets` to git (already in .gitignore)
- ❌ Pass secrets as command-line arguments (visible in `ps`)
- ❌ Store plaintext passwords in shell history
- ❌ Share credentials via unencrypted channels
- ❌ Use default/weak passwords in production

### What's Gitignored

The following files are automatically ignored by git:

- `.env.secrets` - Your secrets file
- `*_credentials.txt` - Generated credential files
- `.env` - Generated environment file
- `secrets/` - Any secrets directory

### Manual Secrets (Optional)

If you want to specify your own passwords instead of auto-generated ones:

**Edit `.env.secrets`:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
DATABASE_PASSWORD=MySecurePassword123!
JWT_SECRET=MyCustomJWTSecret64CharactersLong...
JWT_REFRESH_SECRET=MyCustomRefreshSecret64CharactersLong...
```

The script will use your provided values instead of generating new ones.

---

## Improvements Over Original Script

The new `provision_marcus_vm.sh` addresses **critical issues** identified in the architecture review:

### Security Improvements

1. **Secrets from file, not CLI** - No passwords in command history
2. **Auto-generated admin password** - No hardcoded "SecurePassword123!"
3. **Secure file permissions** - `chmod 600` on credentials
4. **Localhost-only Redis** - Prevents external access

### Reliability Improvements

5. **Idempotent operations** - Safe to run multiple times
6. **Error handling** - `set -euo pipefail` and trap handlers
7. **Rollback guidance** - Clear cleanup commands on failure
8. **Validation** - Tests database/Redis connections before reporting success

### Operational Improvements

9. **Comprehensive logging** - All output saved to timestamped log file
10. **Better error messages** - Clear guidance on what to do when errors occur
11. **Prerequisites check** - Validates secrets file exists before starting
12. **Health validation** - Tests all components after installation

---

## Troubleshooting

### Script fails with "Secrets file not found"

**Problem:** `.env.secrets` doesn't exist

**Solution:**
```bash
cp .env.secrets.template .env.secrets
nano .env.secrets  # Add your ANTHROPIC_API_KEY
```

### Database connection fails

**Problem:** PostgreSQL not running or authentication failed

**Solution:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check logs
sudo journalctl -u postgresql -n 50
```

### Redis connection fails

**Problem:** Redis not running

**Solution:**
```bash
# Check Redis status
sudo systemctl status redis-server

# Restart Redis
sudo systemctl restart redis-server

# Test connection
redis-cli ping
```

### Build fails

**Problem:** Missing dependencies or TypeScript errors

**Solution:**
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Service won't start

**Problem:** Missing files or incorrect paths

**Solution:**
```bash
# Check service status
sudo systemctl status marcus-platform

# View detailed logs
sudo journalctl -u marcus-platform -n 100

# Verify binary exists
ls -la dist/platform/startup.js
```

---

## Rollback

If provisioning fails and you need to start over:

```bash
# Remove database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS marcus_production;"
sudo -u postgres psql -c "DROP USER IF EXISTS marcus;"

# Remove service
sudo systemctl stop marcus-platform
sudo systemctl disable marcus-platform
sudo rm /etc/systemd/system/marcus-platform.service
sudo systemctl daemon-reload

# Clean project files
rm -rf node_modules dist .env

# Start fresh
./scripts/provision_marcus_vm.sh
```

---

## Architecture Review Results

The script was reviewed by the `architecture-skeptic` agent and addressed all critical issues:

### CRITICAL Issues (Fixed)

- ✅ **Project mismatch** - Script now validates it's running in correct directory
- ✅ **Missing dependencies** - Checks for `marcus-platform.service` before copying
- ✅ **Destructive operations** - Idempotent (checks if DB/user exist first)

### HIGH Priority Issues (Fixed)

- ✅ **Security vulnerabilities** - No plaintext passwords in CLI, secure file permissions
- ✅ **No rollback** - Clear rollback commands provided
- ✅ **Race conditions** - Validates connections instead of `sleep`

### MEDIUM Priority Issues (Improved)

- ✅ **Monolithic design** - Functions separated, better modularity
- ✅ **Error reporting** - Comprehensive logging and error messages

**Review document:** [`reviews/vm_provisioning_architecture_review_20251119.md`](../reviews/vm_provisioning_architecture_review_20251119.md)

---

## Next Steps

After successful provisioning:

1. **Change admin password** - Login and update password immediately
2. **Setup TLS/SSL** - Use `scripts/setup-letsencrypt.sh` for HTTPS
3. **Configure firewall** - Restrict access to necessary ports only
4. **Setup monitoring** - Configure Prometheus/Grafana (see deployment docs)
5. **Backup database** - Setup automated PostgreSQL backups
6. **Rotate secrets** - Periodically rotate JWT secrets and passwords

---

## Additional Resources

- **Setup Guide:** [`docs/MARCUS_SETUP_GUIDE.md`](MARCUS_SETUP_GUIDE.md)
- **Operational Checklist:** [`docs/MARCUS_OPERATIONAL_CHECKLIST.md`](MARCUS_OPERATIONAL_CHECKLIST.md)
- **Deployment Guide:** [`docs/MARCUS_RAPID_DEPLOYMENT.md`](MARCUS_RAPID_DEPLOYMENT.md)
- **Validation Script:** [`scripts/test_marcus_complete.sh`](../scripts/test_marcus_complete.sh)
- **Architecture Review:** [`reviews/vm_provisioning_architecture_review_20251119.md`](../reviews/vm_provisioning_architecture_review_20251119.md)

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the architecture review document
3. Check the comprehensive test validation output
4. Open an issue on GitHub
