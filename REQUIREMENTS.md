# MARCUS 3.0 - System Requirements

**Last Updated:** November 21, 2025
**Purpose:** Comprehensive list of all software, tools, and dependencies required for MARCUS 3.0

---

## 📋 Core System Requirements

### Operating System
- **Ubuntu:** 22.04 LTS (Jammy) or later
- **Architecture:** x86_64 (amd64)
- **Kernel:** Linux 5.15+ recommended

### Hardware Minimum (Local Development)
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disk:** 20 GB free space

### Hardware Recommended (Production/Testing)
- **CPU:** 16 cores (e2-standard-16 or equivalent)
- **RAM:** 64 GB
- **Disk:** 40 GB+ free space

---

## 🛠️ System Packages (APT)

### Essential Build Tools
```bash
build-essential
ca-certificates
curl
gnupg
git
wget
```

### Database & Caching
```bash
postgresql (14+)
postgresql-contrib
redis-server (7.0+)
```

### Monitoring & Metrics
```bash
prometheus (2.40+)
grafana (9.0+)
prometheus-node-exporter
prometheus-postgres-exporter
```

---

## 🐳 Container & Orchestration

### Docker
- **Version:** 29.0+
- **Components:**
  - `docker-ce` - Docker Engine
  - `docker-ce-cli` - Docker CLI
  - `containerd.io` - Container runtime
  - `docker-buildx-plugin` - Build plugin
  - `docker-compose-plugin` - Compose plugin
- **Installation:**
  ```bash
  # See scripts/install_docker.sh
  ```
- **Verification:**
  ```bash
  docker --version  # Should show: Docker version 29.0+
  docker compose version  # Should show: Docker Compose version v2.40+
  ```

### Kubernetes (Optional for local development)
- **kubectl:** v1.34+
- **Purpose:** K8s manifest validation, cluster management
- **Installation:**
  ```bash
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
  ```
- **Verification:**
  ```bash
  kubectl version --client
  ```

---

## 🔧 Runtime Environments

### Node.js
- **Version:** 20.x LTS
- **Purpose:** Next.js dashboard, TypeScript API, build tools
- **Package Manager:** npm (included with Node.js)
- **Global Packages:**
  - `typescript` - TypeScript compiler
  - `tsx` - TypeScript execution
  - `next` - Next.js framework
- **Installation:**
  ```bash
  # NodeSource repository
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- **Verification:**
  ```bash
  node --version  # Should show: v20.x.x
  npm --version   # Should show: 10.x.x
  ```

### Python
- **Version:** 3.10+
- **Purpose:** Python agents, evaluation scripts, benchmarking
- **Package Manager:** pip3
- **Virtual Environment:** venv (recommended)
- **Installation:**
  ```bash
  sudo apt-get install -y python3 python3-pip python3-venv
  ```
- **Verification:**
  ```bash
  python3 --version  # Should show: Python 3.10+
  pip3 --version
  ```

---

## 📦 Python Dependencies

### Core Requirements (requirements.txt)
```
anthropic>=0.5.0
numpy>=1.24.0
pandas>=2.0.0
scipy>=1.10.0
matplotlib>=3.7.0
seaborn>=0.12.0
scikit-learn>=1.3.0
requests>=2.31.0
pydantic>=2.0.0
python-dotenv>=1.0.0
psycopg2-binary>=2.9.0
redis>=5.0.0
```

### Platform-Specific (src/platform/agents/)
```
openai>=1.0.0
tiktoken>=0.5.0
fastapi>=0.100.0
uvicorn>=0.23.0
```

### Testing & Development
```
pytest>=7.4.0
pytest-asyncio>=0.21.0
pytest-cov>=4.1.0
black>=23.7.0
flake8>=6.1.0
mypy>=1.5.0
```

### Installation:
```bash
pip3 install -r requirements.txt
```

### Verification:
```bash
python3 -c "import numpy, pandas, anthropic; print('✅ All packages available')"
```

---

## 🔍 Testing & Security Tools

### k6 (Load Testing)
- **Version:** v0.55+
- **Purpose:** API load testing, performance benchmarking
- **Installation:**
  ```bash
  # From GitHub release (recommended)
  curl -s https://github.com/grafana/k6/releases/download/v0.55.0/k6-v0.55.0-linux-amd64.tar.gz -L | \
    sudo tar -xz -C /usr/local/bin k6-v0.55.0-linux-amd64/k6 --strip-components=1
  ```
- **Verification:**
  ```bash
  k6 version  # Should show: k6 v0.55.0
  ```

### Trivy (Container Security Scanner)
- **Version:** v0.67+
- **Purpose:** Container image vulnerability scanning
- **Installation:**
  ```bash
  curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | \
    sudo sh -s -- -b /usr/local/bin
  ```
- **Verification:**
  ```bash
  trivy --version  # Should show: Version: 0.67+
  ```

### OWASP ZAP (Security Testing)
- **Version:** Latest stable
- **Purpose:** Web application security scanning
- **Installation:** Via Docker
  ```bash
  docker pull owasp/zap2docker-stable
  ```
- **Verification:**
  ```bash
  docker images | grep zap
  ```

---

## 🌐 Network & Firewall

### GCP Firewall Rules (if using GCP)
- **Tags:** http-server, https-server
- **Ports:**
  - 3000 (Next.js dashboard)
  - 3001 (MARCUS API)
  - 9090 (Prometheus)
  - 3002 (Grafana, if configured)

### Local Firewall (UFW - optional)
```bash
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 3000/tcp   # Dashboard
sudo ufw allow 3001/tcp   # API
```

---

## 📊 Service Ports Reference

| Service | Port | Protocol | Access | Purpose |
|---------|------|----------|--------|---------|
| **SSH** | 22 | TCP | External | Remote access |
| **Dashboard** | 3000 | TCP | External | Next.js UI |
| **API** | 3001 | TCP | External | MARCUS API |
| **PostgreSQL** | 5432 | TCP | Internal | Database |
| **Redis** | 6379 | TCP | Internal | Caching |
| **Prometheus** | 9090 | TCP | Internal | Metrics |
| **Grafana** | 3002* | TCP | Internal | Dashboards |
| **Node Exporter** | 9100 | TCP | Internal | System metrics |
| **Postgres Exporter** | 9187 | TCP | Internal | DB metrics |
| **Metrics Server** | 9091 | TCP | Internal | Custom metrics |

*Default Grafana port (3000) may conflict with Next.js

---

## 🔐 Environment Variables

### Required Variables (.env)
```bash
# API Keys
ANTHROPIC_API_KEY=<your-key>

# Database
DATABASE_URL=postgresql://marcus:password@localhost:5432/marcus_production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marcus_production
DB_USER=marcus
DB_PASSWORD=<secure-password>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<secure-password>

# JWT Authentication
JWT_SECRET=<256-bit-random>
JWT_REFRESH_SECRET=<256-bit-random>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Platform
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Monitoring
PROMETHEUS_PORT=9090
METRICS_PORT=9091
```

### Secrets Management
- **File:** `.env.secrets` (not committed to git)
- **Template:** `.env.secrets.template`
- **Security:** Never expose on command line, use file-based loading

---

## ✅ Verification Script

### Quick Check: `scripts/check_requirements.sh`

This script verifies all requirements are met:

```bash
#!/bin/bash
# Usage: ./scripts/check_requirements.sh
# Returns: 0 if all requirements met, 1 otherwise
```

**Checks:**
- [ ] Operating system version
- [ ] Required system packages
- [ ] Node.js version
- [ ] Python version
- [ ] Docker installation
- [ ] kubectl installation (optional)
- [ ] k6 installation
- [ ] Trivy installation
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] Python packages (numpy, pandas, etc.)
- [ ] NPM packages installed
- [ ] Environment variables set
- [ ] Required ports available

**Usage:**
```bash
./scripts/check_requirements.sh
# Or source it in other scripts:
source scripts/check_requirements.sh
```

---

## 📦 Installation Scripts

### Full VM Provisioning
```bash
./scripts/provision_marcus_vm.sh
```
**Installs:** All system packages, runtimes, tools, and services

### Individual Component Scripts
```bash
./scripts/install_docker.sh          # Docker + Docker Compose
./scripts/install_k6.sh              # k6 load testing
./scripts/install_trivy.sh           # Trivy security scanner
./scripts/install_kubectl.sh         # kubectl (optional)
```

---

## 🔄 Update & Maintenance

### System Updates
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Node.js Updates
```bash
npm install -g npm@latest
npm update
```

### Python Package Updates
```bash
pip3 install --upgrade pip
pip3 install -r requirements.txt --upgrade
```

### Docker Image Updates
```bash
docker pull owasp/zap2docker-stable
docker system prune -a  # Clean old images
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** `command not found: docker`
**Solution:**
```bash
# Verify Docker installed
docker --version
# If not installed, run:
./scripts/install_docker.sh
# Add user to docker group:
sudo usermod -aG docker $USER
newgrp docker
```

**Issue:** `ImportError: No module named 'numpy'`
**Solution:**
```bash
pip3 install -r requirements.txt
```

**Issue:** `Cannot connect to PostgreSQL`
**Solution:**
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
# Verify port:
sudo -u postgres psql -tAc "SHOW port;"
```

**Issue:** `k6: command not found`
**Solution:**
```bash
./scripts/install_k6.sh
# Or manual install:
curl -s https://github.com/grafana/k6/releases/download/v0.55.0/k6-v0.55.0-linux-amd64.tar.gz -L | \
  sudo tar -xz -C /usr/local/bin k6-v0.55.0-linux-amd64/k6 --strip-components=1
```

---

## 📚 References

**Installation Documentation:**
- Docker: https://docs.docker.com/engine/install/ubuntu/
- Node.js: https://github.com/nodesource/distributions
- k6: https://k6.io/docs/get-started/installation/
- Trivy: https://aquasecurity.github.io/trivy/latest/getting-started/installation/
- kubectl: https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/

**MARCUS Documentation:**
- `docs/MARCUS_SETUP_GUIDE.md` - Complete setup guide
- `docs/MARCUS_DEPLOYMENT_CHECKLIST.md` - Pre-deployment validation
- `GCP_INFRASTRUCTURE_ASSESSMENT.md` - GCP-specific setup

---

## 🎯 Quick Reference

**Check all requirements:**
```bash
./scripts/check_requirements.sh
```

**Install all tools:**
```bash
./scripts/provision_marcus_vm.sh
```

**Verify services:**
```bash
systemctl status postgresql redis-server prometheus grafana-server
```

**Verify installations:**
```bash
node --version && npm --version
python3 --version && pip3 --version
docker --version && docker compose version
k6 version
trivy --version
kubectl version --client
```

---

**Document Version:** 1.0
**Last Updated:** November 21, 2025
**Maintainer:** 404GeneNotFound
