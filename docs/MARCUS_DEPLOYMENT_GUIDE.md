# MARCUS 3.0 Deployment Guide

**Version:** 3.0.0
**Last Updated:** 2025-11-21
**Status:** Production Ready

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Production Deployment Options](#production-deployment-options)
5. [Cloud Provider Setup](#cloud-provider-setup)
6. [Database Setup](#database-setup)
7. [Application Deployment](#application-deployment)
8. [Monitoring & Observability](#monitoring--observability)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

---

## Overview

MARCUS (Multi-Agent Research Citation Integrity System) 3.0 is a TypeScript platform for citation integrity validation with optional Python agent orchestration. This guide covers deployment from local development through production environments.

**Architecture:**
- **Platform:** Node.js/TypeScript (Next.js)
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Agents:** Python 3.10+ (optional)
- **Orchestration:** Kubernetes (recommended) or systemd
- **Monitoring:** Prometheus + Grafana

---

## Prerequisites

### System Requirements

**Minimum (Development):**
- 2 vCPU
- 4 GB RAM
- 20 GB SSD
- Ubuntu 20.04+ / Debian 11+

**Recommended (Production):**
- 4 vCPU
- 16 GB RAM
- 100 GB SSD
- Ubuntu 22.04 LTS

### Required Software

```bash
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL 15
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y postgresql-15

# Redis 7
sudo apt-get install -y redis-server

# Python 3.10+ (for agents)
sudo apt-get install -y python3.10 python3-pip python3-venv

# PM2 (process manager)
sudo npm install -g pm2
```

### Required Accounts

- Cloud provider account (AWS/GCP/Azure)
- GitHub account (for deployment)
- Anthropic API key (for AI agents)
- PagerDuty account (for alerts, optional)

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/404GeneNotFound/ai_game_theory_simulation.git
cd ai_game_theory_simulation
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env` file:

```bash
# Application
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=marcus_dev
DATABASE_USER=marcus
DATABASE_PASSWORD=<your_password>
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=<your_redis_password>

# JWT
JWT_SECRET=<generate_with_openssl_rand_base64_64>
JWT_REFRESH_SECRET=<generate_with_openssl_rand_base64_64>
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=604800

# Anthropic API
ANTHROPIC_API_KEY=<your_api_key>

# Logging
LOG_LEVEL=debug
LOG_DIR=/var/log/marcus
```

### 4. Setup Database

```bash
# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE marcus_dev;
CREATE USER marcus WITH PASSWORD '<your_password>';
GRANT ALL PRIVILEGES ON DATABASE marcus_dev TO marcus;
ALTER DATABASE marcus_dev OWNER TO marcus;
\c marcus_dev
GRANT ALL ON SCHEMA public TO marcus;
EOF

# Run migrations
npm run migrate
```

### 5. Setup Redis

```bash
# Configure Redis authentication
sudo sed -i 's/^# requirepass.*/requirepass <your_redis_password>/' /etc/redis/redis.conf
sudo systemctl restart redis-server
```

### 6. Run Development Server

```bash
npm run dev
```

Verify: http://localhost:3000/health

---

## Production Deployment Options

### Option 1: VM Deployment (Simpler)

**Best for:**
- Small to medium workloads
- Single region deployment
- Budget-conscious deployments

**Steps:** See [VM Deployment](#vm-deployment) section

### Option 2: Kubernetes Deployment (Recommended)

**Best for:**
- High availability requirements
- Auto-scaling needs
- Multi-region deployment
- Enterprise deployments

**Steps:** See [Kubernetes Deployment](#kubernetes-deployment) section

---

## Cloud Provider Setup

### AWS

#### 1. Create Account & Configure Billing

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
```

#### 2. Set Up Billing Alerts

```bash
# Create SNS topic
aws sns create-topic --name marcus-billing-alerts

# Subscribe email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:marcus-billing-alerts \
  --protocol email \
  --notification-endpoint your@email.com

# Create CloudWatch billing alarm
aws cloudwatch put-metric-alarm \
  --alarm-name marcus-monthly-cost-alert \
  --alarm-description "Alert when monthly cost exceeds $500" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 500 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:marcus-billing-alerts
```

#### 3. Create VPC

```bash
# Create VPC
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=marcus-vpc}]' \
  --query 'Vpc.VpcId' --output text)

# Create subnets
SUBNET_PUBLIC=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --query 'Subnet.SubnetId' --output text)

SUBNET_PRIVATE=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --query 'Subnet.SubnetId' --output text)

# Create internet gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --query 'InternetGateway.InternetGatewayId' --output text)

aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID
```

#### 4. Configure Security Groups

```bash
# Application security group
SG_APP=$(aws ec2 create-security-group \
  --group-name marcus-app \
  --description "MARCUS application" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow HTTP/HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id $SG_APP \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $SG_APP \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Database security group
SG_DB=$(aws ec2 create-security-group \
  --group-name marcus-db \
  --description "MARCUS database" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow PostgreSQL from app only
aws ec2 authorize-security-group-ingress \
  --group-id $SG_DB \
  --protocol tcp --port 5432 --source-group $SG_APP
```

#### 5. Setup Secrets Manager

```bash
# Store database password
aws secretsmanager create-secret \
  --name marcus/database/password \
  --secret-string "$(openssl rand -base64 32)"

# Store JWT secrets
aws secretsmanager create-secret \
  --name marcus/jwt/access-secret \
  --secret-string "$(openssl rand -base64 64)"

aws secretsmanager create-secret \
  --name marcus/jwt/refresh-secret \
  --secret-string "$(openssl rand -base64 64)"

# Store Anthropic API key
aws secretsmanager create-secret \
  --name marcus/anthropic/api-key \
  --secret-string "$ANTHROPIC_API_KEY"
```

### GCP

#### 1. Create Project

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize
gcloud init

# Create project
gcloud projects create marcus-production --name="MARCUS Production"
gcloud config set project marcus-production

# Enable billing
gcloud beta billing accounts list
gcloud beta billing projects link marcus-production \
  --billing-account=BILLING_ACCOUNT_ID
```

#### 2. Enable Required APIs

```bash
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

#### 3. Create VPC

```bash
# Create custom VPC
gcloud compute networks create marcus-vpc \
  --subnet-mode=custom

# Create subnets
gcloud compute networks subnets create marcus-subnet-us \
  --network=marcus-vpc \
  --region=us-central1 \
  --range=10.0.0.0/24

gcloud compute networks subnets create marcus-subnet-eu \
  --network=marcus-vpc \
  --region=europe-west1 \
  --range=10.1.0.0/24
```

#### 4. Configure Firewall Rules

```bash
# Allow HTTP/HTTPS
gcloud compute firewall-rules create marcus-allow-http \
  --network=marcus-vpc \
  --allow=tcp:80,tcp:443 \
  --source-ranges=0.0.0.0/0

# Allow internal traffic
gcloud compute firewall-rules create marcus-allow-internal \
  --network=marcus-vpc \
  --allow=tcp,udp,icmp \
  --source-ranges=10.0.0.0/8
```

#### 5. Setup Secret Manager

```bash
# Create secrets
echo -n "$(openssl rand -base64 32)" | \
  gcloud secrets create database-password --data-file=-

echo -n "$(openssl rand -base64 64)" | \
  gcloud secrets create jwt-access-secret --data-file=-

echo -n "$(openssl rand -base64 64)" | \
  gcloud secrets create jwt-refresh-secret --data-file=-

echo -n "$ANTHROPIC_API_KEY" | \
  gcloud secrets create anthropic-api-key --data-file=-
```

---

## Database Setup

### Managed PostgreSQL (Recommended)

#### AWS RDS

```bash
aws rds create-db-instance \
  --db-instance-identifier marcus-production \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.3 \
  --master-username marcus \
  --master-user-password $(aws secretsmanager get-secret-value \
    --secret-id marcus/database/password \
    --query SecretString --output text) \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --multi-az \
  --vpc-security-group-ids $SG_DB \
  --db-subnet-group-name marcus-db-subnet \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --auto-minor-version-upgrade \
  --publicly-accessible false
```

#### GCP Cloud SQL

```bash
gcloud sql instances create marcus-production \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-7680 \
  --region=us-central1 \
  --network=marcus-vpc \
  --no-assign-ip \
  --storage-size=100GB \
  --storage-type=SSD \
  --storage-auto-increase \
  --availability-type=REGIONAL \
  --backup-start-time=03:00 \
  --maintenance-window-day=MON \
  --maintenance-window-hour=4 \
  --root-password=$(gcloud secrets versions access latest \
    --secret=database-password)
```

### Run Migrations

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://marcus:PASSWORD@DB_HOST:5432/marcus_production"

# Run migrations
npm run migrate
```

### Verify Schema

```bash
psql $DATABASE_URL -c "\dt"
psql $DATABASE_URL -c "\di"
```

Expected tables:
- users
- refresh_tokens
- auth_audit_log
- citation_analyses
- agent_swarm_state

---

## Application Deployment

### VM Deployment

#### 1. Provision VM

```bash
# AWS EC2
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name marcus-key \
  --security-group-ids $SG_APP \
  --subnet-id $SUBNET_PUBLIC \
  --iam-instance-profile Name=marcus-app-profile \
  --user-data file://scripts/cloud-init.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=marcus-app}]'
```

#### 2. Deploy Application

```bash
# SSH to VM
ssh -i marcus-key.pem ubuntu@INSTANCE_IP

# Clone repository
git clone https://github.com/404GeneNotFound/ai_game_theory_simulation.git
cd ai_game_theory_simulation

# Install dependencies
npm install --production

# Build application
npm run build

# Setup PM2
pm2 start npm --name "marcus" -- start
pm2 save
pm2 startup
```

#### 3. Configure systemd (Alternative)

```bash
sudo tee /etc/systemd/system/marcus-platform.service > /dev/null <<EOF
[Unit]
Description=MARCUS 3.0 Platform
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=marcus
WorkingDirectory=/opt/marcus
Environment=NODE_ENV=production
EnvironmentFile=/opt/marcus/.env
ExecStart=/usr/bin/npx tsx src/platform/startup.ts
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=marcus-platform

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable marcus-platform
sudo systemctl start marcus-platform
```

### Kubernetes Deployment

#### 1. Create Cluster

```bash
# GKE
gcloud container clusters create marcus-production \
  --region=us-central1 \
  --num-nodes=3 \
  --machine-type=n1-standard-4 \
  --disk-size=100 \
  --enable-autoscaling \
  --min-nodes=2 \
  --max-nodes=10 \
  --enable-autorepair \
  --enable-autoupgrade \
  --network=marcus-vpc \
  --subnetwork=marcus-subnet-us
```

#### 2. Build & Push Docker Image

```bash
# Build image
docker build -t gcr.io/marcus-production/marcus-platform:v3.0.0 .

# Push to registry
docker push gcr.io/marcus-production/marcus-platform:v3.0.0
```

#### 3. Create Kubernetes Resources

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: marcus-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: marcus-platform
  template:
    metadata:
      labels:
        app: marcus-platform
    spec:
      containers:
      - name: marcus
        image: gcr.io/marcus-production/marcus-platform:v3.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: marcus-secrets
              key: database-password
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: marcus-secrets
              key: redis-password
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 4. Deploy

```bash
kubectl apply -f k8s/
kubectl rollout status deployment/marcus-platform
```

---

## Monitoring & Observability

### Prometheus Setup

```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.retention=15d \
  --set prometheus.prometheusSpec.scrapeInterval=15s
```

### Grafana Dashboards

```bash
# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Import dashboards:
# - Node Exporter Full (ID: 1860)
# - PostgreSQL Database (ID: 9628)
# - Redis Dashboard (ID: 763)
```

---

## Rollback Procedures

### Application Rollback (Kubernetes)

```bash
# Rollback to previous version
kubectl rollout undo deployment/marcus-platform

# Rollback to specific revision
kubectl rollout history deployment/marcus-platform
kubectl rollout undo deployment/marcus-platform --to-revision=2
```

### Database Rollback

```bash
# Restore from backup
pg_restore -h DB_HOST -U marcus -d marcus_production backup_YYYYMMDD.dump

# Point-in-time recovery (if WAL archiving enabled)
gcloud sql backups restore BACKUP_ID \
  --backup-instance=marcus-production \
  --backup-time=2025-11-20T12:00:00Z
```

### VM Rollback

```bash
# Revert to previous PM2 deployment
pm2 delete marcus
cd /opt/marcus/releases/previous
pm2 start npm --name "marcus" -- start
pm2 save
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
journalctl -u marcus-platform -f
pm2 logs marcus

# Verify environment
env | grep -E "DATABASE|REDIS|NODE"

# Test database connection
psql -h $DATABASE_HOST -U marcus -d marcus_production -c "SELECT 1;"
```

#### High Memory Usage

```bash
# Check memory
free -h
pm2 monit

# Heap snapshot
node --inspect --max-old-space-size=4096 src/platform/startup.ts
```

#### Database Connection Errors

```bash
# Check pool stats
psql -h $DATABASE_HOST -U marcus -d marcus_production -c "
  SELECT * FROM pg_stat_activity WHERE datname = 'marcus_production';
"

# Reset connections
pm2 restart marcus
```

For additional troubleshooting, see:
- [Production Runbook](./MARCUS_PRODUCTION_RUNBOOK.md)
- [Performance Tuning Guide](./MARCUS_PERFORMANCE_TUNING.md)

---

## Next Steps

After deployment:

1. Run full test suite: `./scripts/ci_marcus_full_suite.sh`
2. Configure monitoring alerts
3. Schedule backups
4. Document runbook procedures
5. Schedule security audits

For production checklist, see [MARCUS_CONSOLIDATED_TASK_CHECKLIST.md](./MARCUS_CONSOLIDATED_TASK_CHECKLIST.md)
