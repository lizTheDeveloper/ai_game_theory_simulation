# GitHub Actions Setup Guide

## Automated Deployment to Google Cloud Run

This guide explains how to set up automated deployment to Google Cloud Run whenever you push to the `production` branch.

## Overview

When you push code to the `production` branch, GitHub Actions will automatically:
1. Build your Next.js application
2. Create a Docker container
3. Deploy to Google Cloud Run (europe-west1, 100% renewable energy)
4. Output the deployment URL

## Setup Instructions

### Step 1: Enable Required Google Cloud APIs

```bash
gcloud services enable iamcredentials.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Step 2: Create a Service Account

```bash
# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deployment" \
  --description="Service account for automated Cloud Run deployments from GitHub"

# Get your project ID
PROJECT_ID=$(gcloud config get-value project)

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### Step 3: Set Up Workload Identity Federation

This is the **secure, recommended way** (no JSON key files needed):

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Create Workload Identity Pool
gcloud iam workload-identity-pools create "github-actions-pool" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc "github-actions-provider" \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Get your GitHub repository (replace with your actual repo)
GITHUB_REPO="YOUR_GITHUB_USERNAME/superalignmenttoutopia"

# Allow GitHub Actions to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding \
  "github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/${GITHUB_REPO}"

# Get the Workload Identity Provider resource name
WORKLOAD_IDENTITY_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider"

echo ""
echo "========================================="
echo "Add these secrets to your GitHub repo:"
echo "========================================="
echo ""
echo "GCP_WORKLOAD_IDENTITY_PROVIDER:"
echo "$WORKLOAD_IDENTITY_PROVIDER"
echo ""
echo "GCP_SERVICE_ACCOUNT:"
echo "github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
```

### Step 4: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:

**Secret 1:**
- Name: `GCP_WORKLOAD_IDENTITY_PROVIDER`
- Value: (copy from Step 3 output)

**Secret 2:**
- Name: `GCP_SERVICE_ACCOUNT`
- Value: `github-actions-deploy@YOUR_PROJECT_ID.iam.gserviceaccount.com`

### Step 5: Create Production Branch

```bash
# Create and push production branch
git checkout -b production
git push -u origin production
```

## How to Use

### Deploy to Production

Simply push to the `production` branch:

```bash
# Make changes on main branch
git checkout main
# ... make changes ...
git add .
git commit -m "Your changes"

# Merge to production to trigger deployment
git checkout production
git merge main
git push origin production
```

GitHub Actions will automatically deploy to Cloud Run!

### View Deployment Status

1. Go to your GitHub repository
2. Click **Actions** tab
3. See the latest workflow run
4. The deployment URL will be shown in the summary

## Alternative: Manual Secret (Less Secure)

If you can't use Workload Identity Federation, you can use a JSON key file (not recommended):

```bash
# Create JSON key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com

# Copy the contents of key.json
cat key.json
```

Then add to GitHub:
- Name: `GCP_SERVICE_ACCOUNT_KEY`
- Value: (paste entire contents of key.json)

**⚠️ Warning:** Keep this file secure and delete it after adding to GitHub!

And update the workflow to use:

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}
```

## Monitoring Deployments

### View Logs

```bash
# View Cloud Run logs
gcloud run services logs read superalignment-simulation \
  --region europe-west1 \
  --limit 50
```

### Check Service Status

```bash
# Get service details
gcloud run services describe superalignment-simulation \
  --region europe-west1
```

### View Cost

```bash
# Go to Cloud Console billing
# https://console.cloud.google.com/billing
```

## Troubleshooting

### "Permission denied" errors

Make sure the service account has all required roles:
```bash
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"
```

### Deployment fails

Check GitHub Actions logs:
1. Go to Actions tab
2. Click the failed run
3. Expand the failing step

Common issues:
- Wrong project ID in workflow file
- Missing permissions on service account
- Incorrect Workload Identity Provider name
- Repository name mismatch in IAM binding

### Want to deploy to different region?

Edit `.github/workflows/deploy-production.yml`:
```yaml
env:
  REGION: us-west1  # Change to desired region
```

## Security Best Practices

1. ✅ **Use Workload Identity Federation** (no JSON keys)
2. ✅ **Limit service account permissions** (only what's needed)
3. ✅ **Protect production branch** (Settings → Branches → Add rule)
4. ✅ **Require pull request reviews** before merging to production
5. ✅ **Set up budget alerts** to prevent surprise costs

## Cost Implications

GitHub Actions is free for public repositories and has 2,000 minutes/month for private repos.

Cloud Run deployment costs remain the same (~$10-25/month for classroom use).

## Disable Auto-Deploy

To temporarily disable auto-deploy without deleting the workflow:

1. Go to repository Settings → Actions → General
2. Set "Actions permissions" to "Disable Actions"

Or delete the workflow file:
```bash
git rm .github/workflows/deploy-production.yml
git commit -m "Disable auto-deploy"
git push
```

---

**Questions?** Check the [Google Cloud Run documentation](https://cloud.google.com/run/docs/deploying) or [GitHub Actions documentation](https://docs.github.com/en/actions).
