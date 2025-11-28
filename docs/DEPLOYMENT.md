# Deployment Guide

## Current Deployment Status

**Service:** superalignment-simulation
**Platform:** Google Cloud Run
**Region:** europe-west1 (Belgium - 100% renewable energy)
**URL:** https://superalignment-simulation-159845081866.europe-west1.run.app
**Last Deploy:** 2025-10-29 (via GitHub Actions)

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

Automatic deployment when pushing to `production` branch:

```bash
# Ensure main branch is ready
git checkout main
git pull origin main

# Verify build passes locally
npm run build
npm test

# Push to production branch (triggers deploy)
git checkout production
git merge main
git push origin production
```

GitHub Actions will:
1. Build the Next.js app
2. Deploy to Cloud Run (europe-west1)
3. Update service URL
4. Report status

**Workflow file:** `.github/workflows/deploy-production.yml`

### Method 2: Manual Deploy Script

Use the manual deployment script:

```bash
./deploy-gcp.sh
```

This script:
- Confirms GCP project (multiverseschool)
- Builds and deploys to Cloud Run
- Provides service URL
- Estimates costs ($10-25/month for classroom use)

**Requirements:**
- `gcloud` CLI installed
- Authenticated to GCP project
- Billing enabled

## Service Configuration

**Resources:**
- Memory: 2Gi
- CPU: 1 vCPU
- Max instances: 10
- Min instances: 0 (scales to zero when idle)
- Port: 3333
- Timeout: 300s

**Permissions:**
- Allow unauthenticated access (public game)

## Cost Monitoring

**Estimated costs:** $10-25/month (typical classroom use, 20-30 students, 2-4 hours/week)

**Set up budget alerts:**
```bash
gcloud billing budgets create \
  --billing-account YOUR_BILLING_ACCOUNT_ID \
  --display-name 'Superalignment Simulation Budget' \
  --budget-amount 50 \
  --threshold-rule percent=50 \
  --threshold-rule percent=90
```

**Monitor costs:**
https://console.cloud.google.com/billing

## Updating Deployment

### Quick Update (No Code Changes)
If the service exists but needs restart/reconfiguration:

```bash
gcloud run services update superalignment-simulation \
  --region europe-west1 \
  --memory 2Gi \
  --cpu 1 \
  --max-instances 10
```

### Full Redeploy
To redeploy with latest code:

```bash
# Option A: Via GitHub Actions
git push origin production

# Option B: Via script
./deploy-gcp.sh

# Option C: Direct gcloud command
gcloud run deploy superalignment-simulation \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 3333 \
  --timeout 300
```

## Deleting Service (Stop All Charges)

To completely remove the service:

```bash
gcloud run services delete superalignment-simulation --region europe-west1
```

## Troubleshooting

### Build Warnings
Current known warning (non-blocking):
- `@google-cloud/storage` not found in `gcsExport.ts` - this is for LLM log export API route, doesn't affect main game

### Deployment Fails
1. Check GCP credentials: `gcloud auth list`
2. Verify project: `gcloud config get-value project`
3. Check Cloud Build API is enabled
4. Review logs: `gcloud builds list --limit=5`

### Service Not Responding
1. Check service status: `gcloud run services describe superalignment-simulation --region europe-west1`
2. View logs: `gcloud run services logs read superalignment-simulation --region europe-west1`
3. Test locally first: `npm run dev` (port 3333)

## Production Branch Strategy

**Main branch:** Development and testing
**Production branch:** Live deployment trigger

Workflow:
1. Develop/fix on feature branches
2. Merge to `main` when ready
3. Test on main
4. Merge main → production when stable
5. Push production branch to deploy

This prevents accidental deployments from WIP commits.

## Environment Variables

Cloud Run service doesn't require environment variables for basic operation. If needed in future:

```bash
gcloud run services update superalignment-simulation \
  --region europe-west1 \
  --set-env-vars KEY=value
```

## Monitoring Service Health

Check service status:
```bash
# Service details
gcloud run services describe superalignment-simulation --region europe-west1

# Recent logs
gcloud run services logs read superalignment-simulation --region europe-west1 --limit 50

# Live logs
gcloud run services logs tail superalignment-simulation --region europe-west1
```

## Student Access

Once deployed, share this URL with students:
https://superalignment-simulation-159845081866.europe-west1.run.app

See `STUDENT_GUIDE.md` for student instructions.
