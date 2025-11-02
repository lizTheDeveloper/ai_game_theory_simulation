# Deployment Guide - Google Cloud Platform

## Overview

This guide explains how to deploy the Super Alignment to Utopia simulation dashboard on Google Cloud Platform (GCP) for student access.

## Cost Estimates (Google Cloud Platform)

### Option 1: Cloud Run (Recommended for Classroom Use)

**Best for:** Small to medium classes (5-50 students), pay-per-use pricing

**Specifications:**
- Service: Cloud Run (fully managed, serverless)
- Container: Next.js app (auto-scales)
- CPU: 1 vCPU
- Memory: 2 GiB
- Auto-scaling: 0-10 instances

**Monthly Costs (Estimated):**

| Usage Pattern | Monthly Cost |
|---------------|--------------|
| **Light** (5-10 students, 2 hours/week) | **$5-10/month** |
| **Medium** (20-30 students, 4 hours/week) | **$15-25/month** |
| **Heavy** (40-50 students, 8 hours/week) | **$30-50/month** |

**Cost Breakdown:**
- CPU time: $0.00002400 per vCPU-second
- Memory: $0.00000250 per GiB-second
- Requests: $0.40 per million requests
- **Free tier**: 2 million requests/month, 360,000 GiB-seconds/month, 180,000 vCPU-seconds/month

**Pros:**
- ✅ Pay only when students use it (scales to zero when idle)
- ✅ Automatic HTTPS
- ✅ No server management
- ✅ Auto-scaling for class peaks
- ✅ Free tier covers light usage

**Cons:**
- ❌ Cold start delays (~2-5 seconds after idle)
- ❌ Not suitable for 24/7 heavy load

---

### Option 2: Compute Engine (VM Instance)

**Best for:** Larger classes (50+ students), consistent usage, more control

**Specifications:**
- Service: Compute Engine (virtual machine)
- Machine type: **e2-small** (2 vCPUs, 2 GB RAM)
- Region: us-central1 (Iowa) - cheapest
- Disk: 10 GB standard persistent disk
- Network: Standard tier

**Monthly Costs (Estimated):**

| Instance Type | vCPUs | RAM | Monthly Cost | Use Case |
|---------------|-------|-----|--------------|----------|
| **e2-micro** | 2 shared | 1 GB | **$7/month** | Very small class (5-10 students) |
| **e2-small** | 2 shared | 2 GB | **$14/month** | Small class (10-20 students) |
| **e2-medium** | 2 | 4 GB | **$28/month** | Medium class (20-50 students) |
| **e2-standard-2** | 2 | 8 GB | **$50/month** | Large class (50+ students) |

**Additional Costs:**
- Disk: ~$0.40/month (10 GB standard)
- Network egress: ~$0.12/GB (first 1 GB/month free)
- Static IP (optional): $3/month

**Total estimated: $15-55/month** depending on class size

**Pros:**
- ✅ No cold starts (always running)
- ✅ Predictable pricing
- ✅ Full control over environment
- ✅ Can run Monte Carlo simulations on server

**Cons:**
- ❌ Pay even when idle
- ❌ Requires more setup/management
- ❌ Manual scaling for traffic spikes

---

### Option 3: Google Kubernetes Engine (GKE) - Autopilot

**Best for:** Multiple classes, institutional use, high availability

**Specifications:**
- Service: GKE Autopilot (managed Kubernetes)
- Resources: 1 vCPU, 2 GiB RAM
- Auto-scaling based on load

**Monthly Costs (Estimated):**
- **$35-70/month** for small deployment
- Management fee: $0.10 per cluster per hour (~$73/month)
- Compute: ~$0.045 per vCPU hour

**Total: $70-150/month**

**Pros:**
- ✅ Enterprise-grade reliability
- ✅ Advanced auto-scaling
- ✅ Multi-region deployment

**Cons:**
- ❌ More expensive for small use
- ❌ Overkill for single class
- ❌ Complex setup

---

### Option 4: Free Tier (Temporary Testing)

**Best for:** Proof of concept, single session demo

**Specifications:**
- Service: Cloud Run (free tier)
- Limitations: 2M requests/month, 360K GiB-seconds/month

**Monthly Cost: $0** (within free tier limits)

**Pros:**
- ✅ Completely free for light testing
- ✅ Perfect for semester pilot

**Cons:**
- ❌ Limited to ~10-20 students for brief sessions
- ❌ Unreliable for regular class use

---

## Recommended Setup for Classroom Use

### For Small Classes (5-20 students): **Cloud Run**

**Estimated cost: $5-20/month**

**Why:**
- Pay only during class sessions
- Auto-scales for student load
- Minimal management overhead
- Free tier covers most light usage

### For Medium Classes (20-50 students): **e2-small Compute Engine VM**

**Estimated cost: $15-30/month**

**Why:**
- Predictable costs
- No cold starts during class
- Can handle concurrent student load
- Easy to monitor and debug

### For Large Classes (50+ students): **e2-medium or e2-standard-2 VM**

**Estimated cost: $30-55/month**

**Why:**
- Guaranteed performance for large groups
- Can run background Monte Carlo simulations
- Sufficient resources for concurrent interactions

---

## Deployment Instructions

### Cloud Run Deployment (Recommended)

**Prerequisites:**
- Google Cloud account with billing enabled
- `gcloud` CLI installed ([Install guide](https://cloud.google.com/sdk/docs/install))

**Steps:**

1. **Authenticate with Google Cloud:**
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

2. **Enable required APIs:**
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

3. **Build and deploy:**
```bash
cd /path/to/superalignmenttoutopia

# Build Next.js app
npm install
npm run build

# Deploy to Cloud Run (eco-friendly region)
gcloud run deploy superalignment-simulation \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 3333
```

**Eco-Friendly Region Options:**
- **europe-west1** (Belgium) - 100% renewable energy (wind/solar) ⚡🌱
- **us-west1** (Oregon) - 100% renewable energy 🌲
- **europe-north1** (Finland) - 100% carbon-neutral (hydroelectric) 💧

4. **Get your URL:**
```bash
# Cloud Run will output a URL like:
# https://superalignment-simulation-XXXXXX-uc.a.run.app
```

**Cost optimization flags:**
- `--min-instances 0`: Scale to zero when idle (save money)
- `--max-instances 10`: Limit scaling (prevent cost spikes)
- `--cpu-throttling`: Throttle CPU when idle (default, saves money)

**Estimated deployment time:** 5-10 minutes

---

### Compute Engine VM Deployment

**Steps:**

1. **Create VM instance:**
```bash
gcloud compute instances create superalignment-vm \
  --machine-type e2-small \
  --zone us-central1-a \
  --image-family ubuntu-2204-lts \
  --image-project ubuntu-os-cloud \
  --boot-disk-size 10GB \
  --boot-disk-type pd-standard \
  --tags http-server
```

2. **Create firewall rule:**
```bash
gcloud compute firewall-rules create allow-3333 \
  --allow tcp:3333 \
  --target-tags http-server \
  --description "Allow access to Next.js on port 3333"
```

3. **SSH into the VM:**
```bash
gcloud compute ssh superalignment-vm --zone us-central1-a
```

4. **Install dependencies on VM:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Clone repository
git clone YOUR_REPO_URL
cd superalignmenttoutopia

# Install dependencies
npm install

# Build Next.js
npm run build
```

5. **Run as background service:**
```bash
# Install PM2 (process manager)
sudo npm install -g pm2

# Start Next.js
pm2 start npm --name "superalignment" -- start

# Make it persist on reboot
pm2 startup
pm2 save
```

6. **Get external IP:**
```bash
gcloud compute instances describe superalignment-vm \
  --zone us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

7. **Access at:** `http://EXTERNAL_IP:3333`

**Estimated deployment time:** 15-20 minutes

---

## Cost Monitoring & Alerts

### Set Budget Alert (Highly Recommended!)

```bash
# Create budget alert at $50/month
gcloud billing budgets create \
  --billing-account YOUR_BILLING_ACCOUNT_ID \
  --display-name "Superalignment Simulation Budget" \
  --budget-amount 50 \
  --threshold-rule percent=50 \
  --threshold-rule percent=90 \
  --threshold-rule percent=100
```

This will email you at 50%, 90%, and 100% of budget.

### Monitor Costs in Real-Time

**Cloud Console:**
1. Go to [console.cloud.google.com/billing](https://console.cloud.google.com/billing)
2. Select your project
3. View "Reports" for detailed cost breakdown

**CLI:**
```bash
# Check current month costs
gcloud billing accounts list
gcloud billing projects describe YOUR_PROJECT_ID
```

---

## Security Recommendations

### 1. **Authentication (Optional)**

If you want to restrict access to enrolled students only:

**Option A: Identity-Aware Proxy (IAP)**
- Free for up to 50 users
- Requires Google accounts
- Students sign in with their school email

**Option B: Basic Auth**
- Simple username/password
- Add to Next.js middleware

### 2. **Rate Limiting**

Prevent abuse by limiting requests per student:
- Cloud Armor (GCP's WAF): $0.75/month + $0.75/million requests
- Or use Next.js middleware

### 3. **HTTPS (Automatic on Cloud Run)**

Cloud Run provides automatic HTTPS. For Compute Engine:
- Use Cloudflare (free tier) as proxy
- Or set up Let's Encrypt (free, requires domain)

---

## Scaling for Different Class Sizes

### 5-10 Students
- **Cloud Run**: min-instances=0, max-instances=3
- **Cost**: ~$5-10/month

### 10-20 Students
- **Cloud Run**: min-instances=1, max-instances=5
- **Cost**: ~$15-20/month

### 20-50 Students
- **Compute Engine**: e2-small or e2-medium
- **Cost**: ~$15-30/month

### 50+ Students
- **Compute Engine**: e2-standard-2
- **Load balancer** (optional): $18/month
- **Cost**: ~$50-70/month

---

## Shutdown Instructions (Save Money When Class Ends)

### Cloud Run (Auto-scales to zero)
```bash
# Optional: Delete service entirely
gcloud run services delete superalignment-simulation --region us-central1
```

### Compute Engine (Pay when running)
```bash
# Stop VM (keep disk, pay $0.40/month for storage)
gcloud compute instances stop superalignment-vm --zone us-central1-a

# Delete VM entirely (no ongoing costs)
gcloud compute instances delete superalignment-vm --zone us-central1-a
```

### Delete Everything
```bash
# Delete all resources in project
gcloud projects delete YOUR_PROJECT_ID
```

---

## Troubleshooting

### Students can't access the URL
- Check firewall rules: `gcloud compute firewall-rules list`
- Verify VM is running: `gcloud compute instances list`
- Test from server: `curl http://localhost:3333`

### Out of memory errors
- Increase memory: `--memory 4Gi` (Cloud Run) or upgrade VM type
- Check logs: `gcloud run logs read --service superalignment-simulation`

### High costs
- Check budget alerts: [console.cloud.google.com/billing/budgets](https://console.cloud.google.com/billing/budgets)
- Review usage: "Reports" in billing console
- Reduce max-instances or stop VM when not in use

### Cold starts (Cloud Run)
- Set `--min-instances 1` to keep one instance warm (~$5-10/month extra)
- Or accept 2-5 second delay after idle periods

---

## FAQ

### Can students run Monte Carlo simulations?
- **Cloud Run**: No (timeout limits)
- **Compute Engine**: Yes, but may slow down for other students
- **Recommended**: Run Monte Carlo locally or on separate compute instance

### Can I use a custom domain?
- **Yes**: Both Cloud Run and Compute Engine support custom domains
- Point DNS to service URL (Cloud Run) or external IP (Compute Engine)

### What if I exceed budget?
- Set up budget alerts (see "Cost Monitoring" section)
- GCP will NOT auto-stop services (you must manually stop/delete)
- Consider setting max-instances limits on Cloud Run

### Can I deploy to other cloud providers?
- **Yes**: This Next.js app works on AWS, Azure, Vercel, Netlify, Railway, etc.
- Cost comparison: Vercel/Netlify have generous free tiers for static sites

---

## Summary Recommendation

**For most classroom use, we recommend:**

**Cloud Run** with these settings:
```bash
gcloud run deploy superalignment-simulation \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --max-instances 5 \
  --min-instances 0 \
  --port 3333
```

**Expected cost: $10-25/month** for typical class usage (20-30 students, 2-4 hours/week)

**Why:**
- ✅ Automatic scaling for class sessions
- ✅ Pay only when students use it
- ✅ Free HTTPS and domain
- ✅ No server management
- ✅ Easy to deploy and update
- ✅ Budget-friendly for academic use

---

**Questions?** Check the [Google Cloud documentation](https://cloud.google.com/run/docs) or contact your IT department for institutional pricing options.
