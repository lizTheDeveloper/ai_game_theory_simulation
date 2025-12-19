# MARCUS 3.0 Platform Setup Guide

**Version:** 3.0.0
**Last Updated:** 2025-11-18
**Status:** Production-Ready

This guide walks through the complete setup of MARCUS 3.0 (Multi-Agent Recursive Citation Understanding System) from local development to production deployment.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Summary](#architecture-summary)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Production Deployment](#production-deployment)
6. [Configuration Reference](#configuration-reference)
7. [Troubleshooting](#troubleshooting)

---

## Overview

MARCUS 3.0 is a multi-agent citation integrity platform that combines:
- **TypeScript/Node.js orchestration layer** for HTTP API and agent coordination
- **Python agents** for citation analysis with 9 behavioral patterns (honest, sloppy, biased, etc.)
- **PostgreSQL** for persistent storage of citations, agent states, and audit logs
- **Redis** for rate limiting, session management, and caching
- **Kubernetes + Istio** for distributed deployment and service mesh

**Key capabilities:**
- Citation integrity analysis with multi-agent consensus (9 agents)
- Code attribution and plagiarism detection (10 agent behaviors)
- OWASP-compliant security (RBAC, rate limiting, input validation, CSP)
- Distributed tracing and monitoring (Prometheus/Grafana/Jaeger)

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                       Load Balancer                          │
│                    (HTTPS Termination)                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 Istio Service Mesh                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │   API Server (Node.js/TypeScript)                  │    │
│  │   - Express.js HTTP server                         │    │
│  │   - JWT authentication                             │    │
│  │   - Rate limiting (Redis)                          │    │
│  │   - Input validation                               │    │
│  │   - CSP headers                                    │    │
│  └───────────────┬────────────────────────────────────┘    │
│                  │                                           │
│                  ▼                                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Citation Agent Orchestrator                      │    │
│  │   - Manages 9 Python agent processes               │    │
│  │   - Consensus algorithm (mean + median)            │    │
│  │   - State management                               │    │
│  └───────────────┬────────────────────────────────────┘    │
└──────────────────┼─────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐   ┌─────────────────┐
│  PostgreSQL     │   │  Redis Cluster   │
│  (Multi-AZ)     │   │  (Rate Limiting) │
│  - Read replica │   │  - Sessions      │
│  - Auto-backup  │   │  - Cache         │
└─────────────────┘   └─────────────────┘
```

---

## Prerequisites

### System Requirements

**Development Environment:**
- OS: macOS, Linux, or Windows (with WSL2)
- RAM: 8 GB minimum, 16 GB recommended
- Disk: 10 GB free space
- CPU: 2+ cores

**Production Environment:**
- Kubernetes cluster (1.24+) with 3+ nodes
- Node size: 4 vCPU, 16 GB RAM minimum
- Cloud provider: AWS / GCP / Azure
- Managed PostgreSQL (15+): db.t3.medium or equivalent
- Managed Redis (7.0+): cache.t3.medium or equivalent

### Required Software (Development)

1. **Node.js** (18.x or 20.x LTS)
   ```bash
   # Check version
   node --version  # Should be v18.x or v20.x
   npm --version   # Should be 9.x or 10.x
   ```

2. **Python** (3.10+)
   ```bash
   # Check version
   python3 --version  # Should be 3.10 or higher
   ```

3. **Docker** (for local database)
   ```bash
   # Check version
   docker --version  # Should be 20.x or higher
   docker-compose --version  # Should be 2.x or higher
   ```

4. **PostgreSQL client** (psql)
   ```bash
   # Check version
   psql --version  # Should be 15.x or higher
   ```

5. **Git**
   ```bash
   git --version  # Any recent version
   ```

### Required Software (Production)

1. **kubectl** (Kubernetes CLI)
   ```bash
   kubectl version --client
   ```

2. **helm** (Kubernetes package manager)
   ```bash
   helm version
   ```

3. **istioctl** (Istio service mesh CLI)
   ```bash
   istioctl version
   ```

4. **Cloud provider CLI**
   - AWS: `aws` CLI
   - GCP: `gcloud` CLI
   - Azure: `az` CLI

---

## Local Development Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/404GeneNotFound/ai_game_theory_simulation.git
cd ai_game_theory_simulation

# Checkout main branch
git checkout main
```

### Step 2: Install Dependencies

#### TypeScript/Node.js Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify TypeScript compilation works
npx tsc --noEmit
```

#### Python Dependencies
```bash
# Create Python virtual environment
cd src/platform/integration/agents
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python -c "import anthropic; print('Anthropic SDK installed')"
```

### Step 3: Set Up Local Database

#### Option A: Docker Compose (Recommended)
```bash
# Create docker-compose.yml in project root
cat > docker-compose.yml <<'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: marcus_dev
      POSTGRES_USER: marcus
      POSTGRES_PASSWORD: marcus_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

# Start database services
docker-compose up -d

# Verify services are running
docker-compose ps
```

#### Option B: Manual Installation
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb marcus_dev

# Install Redis
brew install redis
brew services start redis
```

### Step 4: Run Database Migrations

```bash
# Set environment variables
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_NAME=marcus_dev
export DATABASE_USER=marcus
export DATABASE_PASSWORD=marcus_dev_password

# Run migrations in order
psql -h localhost -U marcus -d marcus_dev -f src/platform/database/migrations/001_initial_schema.sql
psql -h localhost -U marcus -d marcus_dev -f src/platform/database/migrations/002_agent_state_management.sql
psql -h localhost -U marcus -d marcus_dev -f src/platform/database/migrations/003_csp_violations.sql
psql -h localhost -U marcus -d marcus_dev -f src/platform/database/migrations/004_password_reset_tokens.sql

# Verify tables were created
psql -h localhost -U marcus -d marcus_dev -c "\dt"
```

Expected output:
```
               List of relations
 Schema |          Name          | Type  | Owner
--------+------------------------+-------+--------
 public | agent_states           | table | marcus
 public | audit_logs             | table | marcus
 public | citation_analyses      | table | marcus
 public | code_attributions      | table | marcus
 public | csp_violations         | table | marcus
 public | password_reset_tokens  | table | marcus
 public | users                  | table | marcus
(7 rows)
```

### Step 5: Configure Environment Variables

```bash
# Create .env file in project root
cat > .env <<'EOF'
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=marcus_dev
DATABASE_USER=marcus
DATABASE_PASSWORD=marcus_dev_password
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-dev-secret-key-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Agent Configuration
ENABLE_AGENTS=true
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Logging
LOG_LEVEL=debug
EOF

# IMPORTANT: Replace with your actual Anthropic API key
# Get one at: https://console.anthropic.com/
```

### Step 6: Start Development Server

```bash
# Terminal 1: Start API server
npm run dev
```

Expected output:
```
🚀 MARCUS 3.0 Platform Server starting...
✅ Database connected
✅ Redis connected
✅ Citation Agent Orchestrator initialized (9 agents)
🌐 Server listening on http://localhost:3000
📊 Metrics available at http://localhost:9090/metrics
```

```bash
# Terminal 2: Test health endpoint
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T12:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "agents": "initialized"
  }
}
```

### Step 7: Test Citation Analysis

```bash
# Register a test user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'

# Login to get JWT token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }' | jq -r '.accessToken')

# Analyze a citation
curl -X POST http://localhost:3000/api/citations/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "According to recent studies, AI will achieve human-level intelligence by 2030.",
    "claimedSource": "Smith et al. (2024), Nature",
    "actualSource": "Jones et al. (2023), arXiv preprint",
    "metadata": {
      "domain": "AI safety",
      "context": "Research paper introduction"
    }
  }'
```

Expected response:
```json
{
  "integrity": {
    "score": 45.2,
    "consensus": "medium",
    "interpretation": "Moderate integrity concerns - source mismatch detected"
  },
  "analysis": {
    "numAgents": 9,
    "behaviorDistribution": {
      "honest": 3,
      "sloppy": 2,
      "biased": 2,
      "fabricator": 1,
      "plagiarist": 1
    }
  },
  "results": [...]
}
```

### Step 8: Run Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

---

## Production Deployment

### Step 1: Prepare Cloud Infrastructure

#### Choose Cloud Provider

**AWS Example:**
```bash
# Set up AWS CLI
aws configure

# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=marcus-vpc}]'

# Create subnets (public and private in 3 AZs)
# ... (see AWS documentation for complete VPC setup)
```

**GCP Example:**
```bash
# Set up gcloud CLI
gcloud init

# Create VPC network
gcloud compute networks create marcus-vpc --subnet-mode=custom

# Create subnets
gcloud compute networks subnets create marcus-subnet-us-central1 \
  --network=marcus-vpc \
  --region=us-central1 \
  --range=10.0.0.0/24
```

**Azure Example:**
```bash
# Set up Azure CLI
az login

# Create resource group
az group create --name marcus-rg --location eastus

# Create virtual network
az network vnet create \
  --resource-group marcus-rg \
  --name marcus-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name marcus-subnet \
  --subnet-prefix 10.0.0.0/24
```

### Step 2: Provision Kubernetes Cluster

#### AWS (EKS)
```bash
# Create EKS cluster
eksctl create cluster \
  --name marcus-production \
  --version 1.28 \
  --region us-east-1 \
  --nodegroup-name marcus-nodes \
  --node-type t3.xlarge \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --with-oidc \
  --managed

# Configure kubectl
aws eks update-kubeconfig --name marcus-production --region us-east-1

# Verify cluster access
kubectl get nodes
```

#### GCP (GKE)
```bash
# Create GKE cluster
gcloud container clusters create marcus-production \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-4 \
  --enable-autoscaling \
  --min-nodes 3 \
  --max-nodes 10 \
  --enable-stackdriver-kubernetes

# Configure kubectl
gcloud container clusters get-credentials marcus-production --zone us-central1-a

# Verify cluster access
kubectl get nodes
```

#### Azure (AKS)
```bash
# Create AKS cluster
az aks create \
  --resource-group marcus-rg \
  --name marcus-production \
  --node-count 3 \
  --enable-addons monitoring \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10 \
  --node-vm-size Standard_D4s_v3 \
  --generate-ssh-keys

# Configure kubectl
az aks get-credentials --resource-group marcus-rg --name marcus-production

# Verify cluster access
kubectl get nodes
```

### Step 3: Install Istio Service Mesh

```bash
# Download Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH

# Install Istio with production profile
istioctl install --set profile=production -y

# Enable automatic sidecar injection for default namespace
kubectl label namespace default istio-injection=enabled

# Verify Istio installation
kubectl get pods -n istio-system
```

### Step 4: Provision Managed Databases

#### PostgreSQL (AWS RDS)
```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name marcus-db-subnet \
  --db-subnet-group-description "Subnet group for MARCUS DB" \
  --subnet-ids subnet-xxxxx subnet-yyyyy subnet-zzzzz

# Create PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier marcus-production-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username marcus_admin \
  --master-user-password 'SecurePassword123!' \
  --allocated-storage 100 \
  --storage-type gp3 \
  --multi-az \
  --db-subnet-group-name marcus-db-subnet \
  --vpc-security-group-ids sg-xxxxx \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00"

# Create read replica
aws rds create-db-instance-read-replica \
  --db-instance-identifier marcus-production-db-replica \
  --source-db-instance-identifier marcus-production-db \
  --db-instance-class db.t3.medium

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier marcus-production-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

#### Redis (AWS ElastiCache)
```bash
# Create subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name marcus-redis-subnet \
  --cache-subnet-group-description "Subnet group for MARCUS Redis" \
  --subnet-ids subnet-xxxxx subnet-yyyyy subnet-zzzzz

# Create Redis replication group
aws elasticache create-replication-group \
  --replication-group-id marcus-redis \
  --replication-group-description "MARCUS Redis cluster" \
  --engine redis \
  --engine-version 7.0 \
  --cache-node-type cache.t3.medium \
  --num-cache-clusters 3 \
  --cache-subnet-group-name marcus-redis-subnet \
  --security-group-ids sg-xxxxx \
  --automatic-failover-enabled \
  --multi-az-enabled

# Get endpoint
aws elasticache describe-replication-groups \
  --replication-group-id marcus-redis \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address' \
  --output text
```

### Step 5: Configure Secrets

```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name marcus/jwt-secret \
  --secret-string "$(openssl rand -hex 32)"

aws secretsmanager create-secret \
  --name marcus/db-password \
  --secret-string "SecurePassword123!"

aws secretsmanager create-secret \
  --name marcus/anthropic-api-key \
  --secret-string "sk-ant-xxxxx"

# Create Kubernetes secrets from AWS Secrets Manager
kubectl create secret generic marcus-secrets \
  --from-literal=JWT_SECRET="$(aws secretsmanager get-secret-value --secret-id marcus/jwt-secret --query SecretString --output text)" \
  --from-literal=DATABASE_PASSWORD="$(aws secretsmanager get-secret-value --secret-id marcus/db-password --query SecretString --output text)" \
  --from-literal=ANTHROPIC_API_KEY="$(aws secretsmanager get-secret-value --secret-id marcus/anthropic-api-key --query SecretString --output text)"
```

### Step 6: Run Database Migrations

```bash
# Get database endpoint
DB_HOST=$(aws rds describe-db-instances \
  --db-instance-identifier marcus-production-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

# Run migrations
psql -h $DB_HOST -U marcus_admin -d postgres -c "CREATE DATABASE marcus_production;"

psql -h $DB_HOST -U marcus_admin -d marcus_production -f src/platform/database/migrations/001_initial_schema.sql
psql -h $DB_HOST -U marcus_admin -d marcus_production -f src/platform/database/migrations/002_agent_state_management.sql
psql -h $DB_HOST -U marcus_admin -d marcus_production -f src/platform/database/migrations/003_csp_violations.sql
psql -h $DB_HOST -U marcus_admin -d marcus_production -f src/platform/database/migrations/004_password_reset_tokens.sql

# Create application user with restricted permissions
psql -h $DB_HOST -U marcus_admin -d marcus_production <<EOF
CREATE USER marcus_app WITH PASSWORD 'app_user_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO marcus_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO marcus_app;
EOF
```

### Step 7: Build and Push Docker Images

```bash
# Build API server image
docker build -t marcus-platform:v3.0.0 -f src/platform/Dockerfile .

# Build Python agents image
docker build -t marcus-python-agents:v3.0.0 -f src/platform/integration/agents/Dockerfile .

# Tag for your container registry
# AWS ECR example:
aws ecr create-repository --repository-name marcus-platform
aws ecr create-repository --repository-name marcus-python-agents

ECR_URL=$(aws ecr describe-repositories --repository-names marcus-platform --query 'repositories[0].repositoryUri' --output text | cut -d'/' -f1)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URL

docker tag marcus-platform:v3.0.0 $ECR_URL/marcus-platform:v3.0.0
docker tag marcus-python-agents:v3.0.0 $ECR_URL/marcus-python-agents:v3.0.0

docker push $ECR_URL/marcus-platform:v3.0.0
docker push $ECR_URL/marcus-python-agents:v3.0.0
```

### Step 8: Deploy to Kubernetes

```bash
# Create ConfigMap for non-sensitive configuration
kubectl create configmap marcus-config \
  --from-literal=NODE_ENV=production \
  --from-literal=PORT=3000 \
  --from-literal=DATABASE_HOST=$DB_HOST \
  --from-literal=DATABASE_PORT=5432 \
  --from-literal=DATABASE_NAME=marcus_production \
  --from-literal=DATABASE_USER=marcus_app \
  --from-literal=REDIS_HOST=$REDIS_HOST \
  --from-literal=REDIS_PORT=6379

# Deploy API server
kubectl apply -f k8s/marcus-deployment.yaml

# Deploy Python agents
kubectl apply -f k8s/python-agents-deployment.yaml

# Create service
kubectl apply -f k8s/marcus-service.yaml

# Create ingress with SSL
kubectl apply -f k8s/marcus-ingress.yaml

# Verify deployment
kubectl get pods
kubectl logs -f deployment/marcus-platform
```

### Step 9: Deploy Monitoring Stack

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.retention=15d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=50Gi

# Install Jaeger
kubectl create namespace observability
kubectl create -f https://github.com/jaegertracing/jaeger-operator/releases/download/v1.49.0/jaeger-operator.yaml -n observability

# Apply Jaeger instance
kubectl apply -f k8s/jaeger-instance.yaml

# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Open http://localhost:3000 (default credentials: admin/prom-operator)
```

### Step 10: Verify Deployment

```bash
# Check pod status
kubectl get pods
# All pods should be Running

# Check service endpoints
kubectl get svc
# marcus-platform service should have a ClusterIP

# Check ingress
kubectl get ingress
# Should show external IP/hostname

# Test health endpoint
curl https://marcus.yourdomain.com/health
# Should return {"status": "healthy", ...}

# Check metrics
curl https://marcus.yourdomain.com/metrics
# Should return Prometheus metrics

# Check logs for errors
kubectl logs -f deployment/marcus-platform --tail=100
# Should not show any errors
```

---

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | - | Environment: `development`, `production`, `test` |
| `PORT` | No | `3000` | HTTP server port |
| `DATABASE_HOST` | Yes | - | PostgreSQL hostname |
| `DATABASE_PORT` | No | `5432` | PostgreSQL port |
| `DATABASE_NAME` | Yes | - | Database name |
| `DATABASE_USER` | Yes | - | Database username |
| `DATABASE_PASSWORD` | Yes | - | Database password (use secrets manager!) |
| `DATABASE_POOL_MIN` | No | `2` | Minimum connection pool size |
| `DATABASE_POOL_MAX` | No | `10` | Maximum connection pool size |
| `REDIS_HOST` | Yes | - | Redis hostname |
| `REDIS_PORT` | No | `6379` | Redis port |
| `REDIS_DB` | No | `0` | Redis database number |
| `JWT_SECRET` | Yes | - | JWT signing key (min 32 chars, random) |
| `JWT_EXPIRY` | No | `15m` | Access token expiry (e.g., `15m`, `1h`) |
| `JWT_REFRESH_EXPIRY` | No | `7d` | Refresh token expiry (e.g., `7d`, `30d`) |
| `RATE_LIMIT_WINDOW_MS` | No | `60000` | Rate limit window in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window per IP |
| `ENABLE_AGENTS` | No | `true` | Enable Python agent orchestration |
| `ANTHROPIC_API_KEY` | Yes (if agents enabled) | - | Anthropic API key for agents |
| `ENABLE_METRICS` | No | `true` | Enable Prometheus metrics |
| `METRICS_PORT` | No | `9090` | Prometheus metrics port |
| `LOG_LEVEL` | No | `info` | Log level: `debug`, `info`, `warn`, `error` |

### Database Connection Strings

**Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
```

**Example (development):**
```
postgresql://marcus:marcus_dev_password@localhost:5432/marcus_dev
```

**Example (production):**
```
postgresql://marcus_app:SecurePassword123!@marcus-db.xxxxx.us-east-1.rds.amazonaws.com:5432/marcus_production?sslmode=require
```

### Redis Connection

**Format:**
```
redis://[host]:[port]/[db]
```

**Example (development):**
```
redis://localhost:6379/0
```

**Example (production with password):**
```
redis://:password@marcus-redis.xxxxx.cache.amazonaws.com:6379/0
```

---

## Troubleshooting

### Common Issues

#### Issue: "Database connection failed"
**Symptoms:** API server fails to start with error "Error: connect ECONNREFUSED"

**Solutions:**
1. Verify database is running:
   ```bash
   # Development
   docker-compose ps
   # OR
   pg_isready -h localhost -p 5432
   ```

2. Check connection credentials:
   ```bash
   psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME
   ```

3. Check network security groups (production):
   - Ensure Kubernetes cluster can reach database
   - Verify security group allows inbound traffic on port 5432

#### Issue: "Redis connection timeout"
**Symptoms:** Rate limiting doesn't work, sessions fail

**Solutions:**
1. Verify Redis is running:
   ```bash
   # Development
   redis-cli ping  # Should return PONG

   # Production
   redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
   ```

2. Check Redis memory:
   ```bash
   redis-cli info memory
   ```
   If `used_memory_human` is near `maxmemory`, increase instance size.

3. Check Redis logs for errors:
   ```bash
   # AWS ElastiCache
   aws elasticache describe-events --source-identifier marcus-redis
   ```

#### Issue: "Python agents not initializing"
**Symptoms:** Citation analysis returns error "Orchestrator not initialized"

**Solutions:**
1. Verify `ENABLE_AGENTS=true` in environment

2. Check Anthropic API key is set:
   ```bash
   kubectl get secret marcus-secrets -o jsonpath='{.data.ANTHROPIC_API_KEY}' | base64 -d
   ```

3. Check agent logs:
   ```bash
   kubectl logs deployment/marcus-python-agents --tail=100
   ```

4. Verify Python dependencies installed:
   ```bash
   kubectl exec -it <python-agent-pod> -- pip list | grep anthropic
   ```

#### Issue: "High latency (P95 >1 second)"
**Symptoms:** API requests are slow

**Solutions:**
1. Check database query performance:
   ```sql
   -- Identify slow queries
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

2. Add missing indexes:
   ```sql
   -- Example: if filtering by user_id is slow
   CREATE INDEX idx_citations_user_id ON citation_analyses(user_id);
   ```

3. Check database connection pool:
   ```bash
   # If all connections are in use, increase pool size
   DATABASE_POOL_MAX=20  # Increase from default 10
   ```

4. Enable Redis caching for frequently accessed data

5. Check if auto-scaling is working:
   ```bash
   kubectl get hpa  # Should show current replicas increasing under load
   ```

#### Issue: "Rate limiting not working"
**Symptoms:** Users can make >100 requests/minute

**Solutions:**
1. Verify Redis is accessible (see Redis troubleshooting above)

2. Check trusted proxies configuration if behind load balancer:
   ```typescript
   // In src/platform/middleware/rateLimiter.ts
   const trustedProxies = ['10.0.0.0/8'];  // Your load balancer CIDR
   ```

3. Verify X-Forwarded-For header is set by load balancer:
   ```bash
   curl -H "X-Forwarded-For: 1.2.3.4" https://marcus.yourdomain.com/health -v
   # Should see X-Forwarded-For in request headers
   ```

#### Issue: "JWT authentication fails"
**Symptoms:** Requests return 401 Unauthorized even with valid token

**Solutions:**
1. Verify JWT_SECRET is same across all pods:
   ```bash
   kubectl get secret marcus-secrets -o jsonpath='{.data.JWT_SECRET}' | base64 -d
   ```

2. Check token hasn't expired:
   ```bash
   # Decode JWT at https://jwt.io
   # Check "exp" claim is in the future
   ```

3. Verify Authorization header format:
   ```bash
   curl -H "Authorization: Bearer <token>" https://marcus.yourdomain.com/api/citations/analyze
   # NOT "Authorization: <token>" (missing "Bearer")
   ```

### Performance Tuning

#### Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM citation_analyses WHERE user_id = 123;

-- Create covering index for common query
CREATE INDEX idx_citations_user_created ON citation_analyses(user_id, created_at);

-- Increase shared_buffers (PostgreSQL config)
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
SELECT pg_reload_conf();
```

#### Application Tuning
```javascript
// Increase Node.js max old space size if running out of memory
// In k8s/marcus-deployment.yaml:
env:
  - name: NODE_OPTIONS
    value: "--max-old-space-size=4096"  // 4 GB

// Enable cluster mode for multi-core usage
// In src/platform/server.ts:
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  startServer();
}
```

#### Redis Optimization
```bash
# Increase max memory and enable eviction
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Enable persistence for durability
redis-cli CONFIG SET save "900 1 300 10 60 10000"
redis-cli CONFIG SET appendonly yes
```

### Getting Help

**Documentation:**
- API Documentation: `/docs/api/openapi.yaml`
- Operator Runbook: `/docs/OPERATOR_RUNBOOK.md`
- Launch Checklist: `/docs/LAUNCH_CHECKLIST.md`
- Operational Checklist: `/docs/MARCUS_OPERATIONAL_CHECKLIST.md`

**Logs:**
```bash
# Application logs
kubectl logs -f deployment/marcus-platform --tail=100

# Database logs (AWS RDS)
aws rds download-db-log-file-portion \
  --db-instance-identifier marcus-production-db \
  --log-file-name error/postgresql.log.2025-11-18-12

# Redis logs (AWS ElastiCache)
aws elasticache describe-events \
  --source-identifier marcus-redis \
  --start-time 2025-11-18T00:00:00Z
```

**Monitoring Dashboards:**
- Grafana: `http://localhost:3000` (port-forward to access)
- Prometheus: `http://localhost:9090` (port-forward to access)
- Jaeger: `http://localhost:16686` (port-forward to access)

**Support Escalation:**
- DevOps team: For infrastructure issues
- Database team: For query performance issues
- Security team: For authentication/authorization issues
- Development team: For application bugs

---

## Next Steps

After completing local development setup:
1. **Read API documentation:** `/docs/api/openapi.yaml`
2. **Explore example requests:** Try citation analysis and code attribution APIs
3. **Run tests:** `npm test` to verify everything works
4. **Join beta program:** Contact team for production access

After completing production deployment:
1. **Follow operational checklist:** `/docs/MARCUS_OPERATIONAL_CHECKLIST.md`
2. **Complete 7-day pilot:** Task 7.7 in operational checklist
3. **Run load tests:** Task 7.8 in operational checklist
4. **Security review:** Task 7.9 in operational checklist
5. **Launch:** Follow `/docs/LAUNCH_CHECKLIST.md`

---

**Version History:**
- v3.0.0 (2025-11-18): Production-ready release with OWASP security, multi-agent orchestration, distributed deployment
- v2.0.0 (2025-10-15): Added code attribution domain
- v1.0.0 (2025-09-01): Initial citation integrity MVP
