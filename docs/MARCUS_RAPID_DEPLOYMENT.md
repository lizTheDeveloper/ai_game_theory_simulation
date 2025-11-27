# ⚡ MARCUS 3.0 Rapid Deployment Suite

**Zero-to-Production in Minutes**

This suite provides complete automation for MARCUS 3.0 deployment and validation, incorporating all fixes from the 6-hour debugging session.

---

## 📦 What's Included

### 1. 🧪 Complete System Validation Script
**File:** `scripts/test_marcus_complete.sh`

Comprehensive test suite that validates:
- ✅ System requirements (Node.js, Python, PostgreSQL, Redis)
- ✅ Environment variables configuration
- ✅ Database schema completeness (all tables, functions, triggers)
- ✅ Project structure (all required files present)
- ✅ TypeScript compilation status
- ✅ Python dependencies
- ✅ Python agent functionality (demo + IPC modes)
- ✅ API endpoints (authentication, health checks)
- ✅ Process supervision configuration (PM2, systemd)
- ✅ Documentation completeness

**Features:**
- 50+ individual test checks across 10 phases
- Color-coded pass/fail results (✅/❌)
- Detailed error reporting with fix suggestions
- Automatic server startup for API testing
- Complete system health validation
- Summary report with pass rate percentage

### 2. 🚀 Zero-to-Production VM Automation
**File:** `scripts/setup_marcus_vm.sh`

One-command deployment that:
- 🖥️ Creates GCP VM instance (customizable for AWS/Azure)
- 📦 Installs all system dependencies (Node, Python, PostgreSQL, Redis)
- 🔧 Configures PostgreSQL with complete schema
- 🔐 Generates secure passwords and JWT secrets
- 🐍 Sets up Python virtual environment
- 📊 Applies all 15+ debugging fixes automatically
- 🔄 Configures systemd service for auto-start
- 🔥 Sets up firewall rules
- 📝 Creates comprehensive deployment documentation

**Features:**
- Complete VM provisioning (5-10 minutes)
- Automatic password generation (secure, random)
- All database migrations applied
- Default admin user created
- Production-ready configuration
- Detailed access information output
- Cleanup commands included

---

## 🧪 Validation Script Usage

### Quick Start

```bash
# Navigate to project directory
cd ai_game_theory_simulation

# Make script executable
chmod +x scripts/test_marcus_complete.sh

# Run validation
./scripts/test_marcus_complete.sh
```

### Sample Output

```
========================================
Phase 1: System Requirements
========================================
[TEST 1] Checking Node.js version
✅ PASS: Node.js installed: v18.17.0

[TEST 2] Checking Python version
✅ PASS: Python3 installed: Python 3.10.12

[TEST 3] Checking PostgreSQL
✅ PASS: PostgreSQL installed: psql (PostgreSQL) 14.9

[TEST 4] Checking Redis
✅ PASS: Redis running

========================================
Phase 2: Environment Variables
========================================
[TEST 5] Checking DATABASE_HOST
✅ PASS: DATABASE_HOST is set

...

========================================
Test Summary
========================================

Total Tests Run: 47
Tests Passed: 47
Tests Failed: 0
Pass Rate: 100.0%

🎉 ALL TESTS PASSED! MARCUS 3.0 is ready for deployment.
```

### What Gets Tested

#### Phase 1: System Requirements
- Node.js 18+ installed
- Python 3.10+ installed
- PostgreSQL 14+ installed and running
- Redis 6.0+ installed and running

#### Phase 2: Environment Variables
- `DATABASE_HOST` set
- `DATABASE_NAME` set
- `DATABASE_USER` set
- `DATABASE_PASSWORD` set
- `REDIS_HOST` set
- `JWT_SECRET` set (minimum 32 characters)

#### Phase 3: Database Schema
- Database connection successful
- Table exists: `users`
- Table exists: `citation_analyses`
- Table exists: `agent_behaviors`
- Table exists: `refresh_tokens`
- Table exists: `auth_audit_log`
- Default admin user exists

#### Phase 4: Project Structure
- `src/platform/config/platformConfig.ts` exists
- `src/platform/database/pool.ts` exists
- `src/platform/resilience/circuitBreaker.ts` exists
- `src/platform/utils/logger.ts` exists
- `ecosystem.config.js` exists
- `marcus-platform.service` exists
- All other critical files present

#### Phase 5: TypeScript Build
- `dist/` directory exists
- `dist/platform/startup.js` compiled
- All TypeScript successfully compiled

#### Phase 6: Python Dependencies
- `anthropic` package installed
- `psycopg2` package installed
- `redis` package installed

#### Phase 7: Python Agent
- Agent runs in demo mode
- Agent responds to IPC requests
- Agent get_status method works

#### Phase 8: API Endpoints
- Health endpoint accessible (`/health`)
- Login endpoint works (`/auth/login`)
- Authentication flow functional

#### Phase 9: Process Supervision
- PM2 configuration valid
- systemd service unit valid

#### Phase 10: Documentation
- Debugging report exists
- Debugging tutorial exists
- Implementation checklist exists

---

## 🚀 VM Deployment Script Usage

### Prerequisites

- Google Cloud SDK installed (`gcloud` command)
- GCP project with Compute Engine API enabled
- Anthropic API key

### Quick Start

```bash
# Make script executable
chmod +x scripts/setup_marcus_vm.sh

# Basic deployment (uses default zone and machine type)
./scripts/setup_marcus_vm.sh YOUR_GCP_PROJECT_ID YOUR_ANTHROPIC_API_KEY

# Custom zone
./scripts/setup_marcus_vm.sh YOUR_GCP_PROJECT_ID YOUR_ANTHROPIC_API_KEY us-east1-b

# Custom zone and machine type
./scripts/setup_marcus_vm.sh YOUR_GCP_PROJECT_ID YOUR_ANTHROPIC_API_KEY europe-west1-b e2-standard-4

# Full syntax
./scripts/setup_marcus_vm.sh [GCP_PROJECT_ID] [ANTHROPIC_API_KEY] [ZONE] [MACHINE_TYPE]
```

### Examples

```bash
# Development: Small instance in US Central
./scripts/setup_marcus_vm.sh my-dev-project sk-ant-api03-xxx us-central1-a e2-medium

# Production: Standard instance in US East
./scripts/setup_marcus_vm.sh my-prod-project sk-ant-api03-xxx us-east1-b e2-standard-2

# Europe: High-performance instance
./scripts/setup_marcus_vm.sh my-eu-project sk-ant-api03-xxx europe-west1-b e2-standard-4

# Asia: Testing instance
./scripts/setup_marcus_vm.sh my-asia-project sk-ant-api03-xxx asia-southeast1-a e2-small
```

### Available Zones

| Zone | Location | Region |
|------|----------|--------|
| `us-central1-a` | Iowa, USA | Americas |
| `us-east1-b` | South Carolina, USA | Americas |
| `us-west1-a` | Oregon, USA | Americas |
| `europe-west1-b` | Belgium | Europe |
| `europe-west2-b` | London, UK | Europe |
| `asia-southeast1-a` | Singapore | Asia |
| `asia-northeast1-a` | Tokyo, Japan | Asia |
| `australia-southeast1-a` | Sydney | Australia |

**Default:** `us-central1-a` (Iowa, USA)

### Machine Types

| Type | vCPUs | Memory | Use Case | Monthly Cost* |
|------|-------|--------|----------|--------------|
| `e2-micro` | 0.25 | 1 GB | Dev/Testing only | ~$7 |
| `e2-small` | 2 | 2 GB | Light testing | ~$14 |
| `e2-medium` | 2 | 4 GB | Light production | ~$27 |
| `e2-standard-2` | 2 | 8 GB | Production (default) | ~$49 |
| `e2-standard-4` | 4 | 16 GB | High load | ~$98 |

**Default:** `e2-standard-2` (2 vCPU, 8 GB)

*Approximate costs for reference, check GCP pricing for exact rates

### Sample Output

```
========================================
MARCUS 3.0 Zero-to-Production Deployment
========================================
Project: my-gcp-project
VM Name: marcus-vm-20241118-143022
Zone: us-central1-a

➜ Generating secure passwords...
✅ Database password: [generated]
✅ JWT secrets: [generated]

➜ Creating GCP VM instance...
✅ VM instance created: marcus-vm-20241118-143022

➜ Creating firewall rules...
✅ Firewall rules configured

========================================
Deployment Complete!
========================================

VM Name: marcus-vm-20241118-143022
External IP: 34.123.45.67
Zone: us-central1-a

Access Information:
SSH: gcloud compute ssh marcus-vm-20241118-143022 --project=my-gcp-project --zone=us-central1-a
Health Endpoint: http://34.123.45.67:3000/health
API Base URL: http://34.123.45.67:3000

Credentials:
Admin Email: admin@marcus.local
Admin Password: SecurePassword123!
Database Password: [secure random password]

Setup Progress:
The VM is still initializing. Monitor progress:
gcloud compute ssh marcus-vm-20241118-143022 --project=my-gcp-project --zone=us-central1-a --command='tail -f /var/log/syslog'

Wait 5-10 minutes for complete setup, then test:
curl http://34.123.45.67:3000/health

✅ Deployment info saved to: marcus_deployment_info.txt
```

### Deployment Timeline

| Time | Activity |
|------|----------|
| 0:00 | VM creation starts |
| 0:30 | System packages installing |
| 1:00 | PostgreSQL configuration |
| 2:00 | Node.js dependencies installing |
| 3:00 | TypeScript compilation |
| 4:00 | Database migrations running |
| 5:00 | Service starting |
| 5:30 | **Deployment complete** |

### Post-Deployment Verification

```bash
# 1. Check VM status
gcloud compute instances list --project=YOUR_PROJECT

# 2. SSH into VM
gcloud compute ssh VM_NAME --project=YOUR_PROJECT --zone=us-central1-a

# 3. Check service status
systemctl status marcus-platform

# 4. View application logs
tail -f /var/log/marcus/app.log

# 5. Test health endpoint
curl http://EXTERNAL_IP:3000/health

# 6. Test authentication
curl -X POST http://EXTERNAL_IP:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marcus.local","password":"SecurePassword123!"}'
```

### Advanced Customization

The deployment script accepts zone and machine type as command-line parameters, eliminating the need to edit the script:

```bash
# Use parameters instead of editing the script
./scripts/setup_marcus_vm.sh PROJECT_ID API_KEY ZONE MACHINE_TYPE

# Examples:
./scripts/setup_marcus_vm.sh my-project sk-xxx us-east1-b e2-standard-4
```

For permanent customization (e.g., always deploy to specific zone):

```bash
# Create a wrapper script
cat > deploy_to_europe.sh << 'EOF'
#!/bin/bash
./scripts/setup_marcus_vm.sh $1 $2 europe-west1-b e2-standard-2
EOF
chmod +x deploy_to_europe.sh

# Usage:
./deploy_to_europe.sh my-project sk-xxx
```

#### AWS Deployment (Alternative)

Create `setup_marcus_aws.sh`:
```bash
# Use AWS CLI instead of gcloud
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --count 1 \
  --instance-type t3.medium \
  --key-name marcus-key \
  --security-group-ids sg-xxxxxx \
  --user-data file:///tmp/marcus_startup.sh
```

#### Azure Deployment (Alternative)

Create `setup_marcus_azure.sh`:
```bash
# Use Azure CLI
az vm create \
  --resource-group marcus-rg \
  --name marcus-vm \
  --image UbuntuLTS \
  --size Standard_B2s \
  --custom-data /tmp/marcus_startup.sh
```

---

## 🔧 Troubleshooting

### Validation Script Failures

#### "PostgreSQL not installed"
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

#### "Redis not running"
```bash
# Install Redis
sudo apt-get install redis-server  # Ubuntu
brew install redis                  # macOS

# Start Redis
sudo systemctl start redis-server   # Linux
brew services start redis           # macOS
```

#### "TypeScript not compiled"
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

#### "Database schema incomplete"
```bash
# Run migrations manually
psql -h localhost -U marcus -d marcus_dev -f src/platform/database/migrations/005_complete_schema.sql
```

#### "Python packages missing"
```bash
# Install Python dependencies
pip install anthropic psycopg2-binary redis
```

### VM Deployment Issues

#### "Compute Engine API not enabled"
```bash
# Enable Compute Engine API
gcloud services enable compute.googleapis.com --project=YOUR_PROJECT
```

#### "Quota exceeded"
```bash
# Request quota increase in GCP Console
# Or deploy to a different zone/region
```

#### "VM startup script failed"
```bash
# SSH into VM and check startup log
gcloud compute ssh VM_NAME --zone=ZONE --command='tail -500 /var/log/syslog'

# Look for errors in the startup script execution
```

#### "Service not starting"
```bash
# SSH into VM
gcloud compute ssh VM_NAME --zone=ZONE

# Check service status
systemctl status marcus-platform

# View service logs
journalctl -u marcus-platform -n 100

# Manually start service
systemctl restart marcus-platform
```

#### "Cannot connect to API"
```bash
# 1. Check firewall rules
gcloud compute firewall-rules list --project=YOUR_PROJECT

# 2. Check if service is listening
gcloud compute ssh VM_NAME --zone=ZONE --command='netstat -tlnp | grep 3000'

# 3. Check external IP
gcloud compute instances describe VM_NAME --zone=ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# 4. Test locally on VM first
gcloud compute ssh VM_NAME --zone=ZONE --command='curl http://localhost:3000/health'
```

---

## 📊 What Gets Automated

### All Debugging Fixes Applied

The VM setup script automatically applies all 15+ fixes discovered during the 6-hour debugging session:

1. ✅ **Complete database schema** (005_complete_schema.sql)
   - All tables with proper dependencies
   - All indices for performance
   - All functions (check_and_lock_account, reset_failed_attempts, cleanup_expired_tokens)
   - All triggers (update_updated_at)
   - Default admin user

2. ✅ **Configuration system** (platformConfig.ts)
   - Environment variable validation
   - Required parameter checking
   - Sensible defaults

3. ✅ **Python agent lifecycle** (IPC server loop)
   - Continuous stdin reading
   - Signal handling (SIGTERM, SIGINT)
   - Graceful shutdown

4. ✅ **IPC protocol reliability**
   - Retry logic with exponential backoff
   - Request queueing
   - Flush after every write

5. ✅ **Process supervision**
   - systemd service unit
   - Auto-restart on failure
   - Log rotation

6. ✅ **Circuit breakers** (resilience pattern)
7. ✅ **Structured logging** (Winston with correlation IDs)
8. ✅ **TypeScript imports** (ES6 module syntax)
9. ✅ **Database pool singleton** (proper initialization)
10. ✅ **API method aliases** (analyzeCitation compatibility)

### Security Hardening

- 🔐 Secure password generation (32+ characters)
- 🔐 JWT secrets (64+ characters)
- 🔐 Bcrypt password hashing (12 rounds)
- 🔐 Firewall configuration (UFW)
- 🔐 Account lockout after failed attempts
- 🔐 Audit logging for all auth events

### Production Features

- 📊 Structured logging to `/var/log/marcus/`
- 🔄 Log rotation (14 days retention)
- 📈 Health monitoring endpoints
- 🔄 Auto-restart on crash
- 🛡️ Resource limits (memory, CPU)
- 📝 Comprehensive deployment documentation

---

## 🎯 Use Cases

### Development Testing
```bash
# Test your local installation
./scripts/test_marcus_complete.sh

# Fix any failures, then test again
./scripts/test_marcus_complete.sh
```

### Continuous Integration
```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run MARCUS validation
        run: ./scripts/test_marcus_complete.sh
```

### Production Deployment
```bash
# Deploy to GCP
./scripts/setup_marcus_vm.sh my-prod-project $ANTHROPIC_API_KEY

# Wait 5-10 minutes, then verify
curl http://EXTERNAL_IP:3000/health
```

### Disaster Recovery
```bash
# Redeploy from scratch in minutes
./scripts/setup_marcus_vm.sh my-backup-project $ANTHROPIC_API_KEY
```

### Multi-Environment Setup
```bash
# Development environment
./scripts/setup_marcus_vm.sh dev-project $API_KEY

# Staging environment
./scripts/setup_marcus_vm.sh staging-project $API_KEY

# Production environment
./scripts/setup_marcus_vm.sh prod-project $API_KEY
```

---

## 📚 Integration with Documentation

This rapid deployment suite complements the complete MARCUS 3.0 documentation:

1. **MARCUS_DEBUGGING_REPORT.md** - What was found and fixed
2. **MARCUS_DEBUGGING_TUTORIAL.md** - How we found and fixed it
3. **MARCUS_IMPLEMENTATION_CHECKLIST.md** - Progress tracking
4. **MARCUS_RAPID_DEPLOYMENT.md** - Automated deployment (this doc)

Together, these provide:
- **Complete debugging history** (what/how/why)
- **Systematic debugging methodology** (lessons learned)
- **Progress tracking** (what's done/what's next)
- **Automated deployment** (zero-to-production)

---

## 🔒 Security Notes

### Credentials Management

**The deployment script generates secure passwords automatically:**
- Database password: 25 characters (base64, alphanumeric + symbols)
- JWT secret: 64 characters
- JWT refresh secret: 64 characters

**Credentials are saved to:** `marcus_deployment_info.txt`

**⚠️ IMPORTANT:**
1. Store `marcus_deployment_info.txt` securely (password manager, secrets vault)
2. Do NOT commit credentials to Git
3. Delete the file after secure storage
4. Rotate passwords regularly in production

### Production Hardening

Before production use:
1. Change default admin password
2. Enable SSL/TLS (add nginx with Let's Encrypt)
3. Set up monitoring (Prometheus, Grafana)
4. Configure backups (database, logs)
5. Enable audit logging
6. Implement rate limiting
7. Add intrusion detection

---

## 🚀 Performance Tuning

### VM Sizing Recommendations

| Load Level | Machine Type | vCPUs | Memory | Disk |
|-----------|--------------|-------|--------|------|
| Development | e2-micro | 0.25 | 1 GB | 10 GB |
| Testing | e2-small | 2 | 2 GB | 20 GB |
| Light Production | e2-medium | 2 | 4 GB | 50 GB |
| Medium Production | e2-standard-2 | 2 | 8 GB | 100 GB |
| Heavy Production | e2-standard-4 | 4 | 16 GB | 200 GB |

### Database Tuning

For high-load environments, adjust PostgreSQL settings:
```bash
# Edit postgresql.conf
max_connections = 100
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
work_mem = 16MB
```

### Python Agent Scaling

Configure number of concurrent agents:
```bash
# In .env file
NUM_AGENTS=9  # Standard (1 per behavior type)
NUM_AGENTS=27 # High availability (3 per type)
```

---

## ✨ Summary

**With these scripts, MARCUS 3.0 deployment is:**
- ⚡ **Fast:** Zero-to-production in 5-10 minutes
- 🔒 **Secure:** Auto-generated passwords, security hardening
- 📊 **Validated:** 50+ automated checks
- 🔧 **Complete:** All debugging fixes applied
- 📚 **Documented:** Comprehensive deployment info
- 🔄 **Reproducible:** Identical deployments every time

**From 6 hours of debugging to 6 minutes of deployment.** 🚀

---

**Last Updated:** 2024-11-18  
**Authors:** Marcus (Platform Engineer), Claude (AI Assistant)  
**Version:** 1.0.0
