#!/bin/bash

# Setup script for GitHub Actions automated deployment
# This creates the necessary GCP resources and outputs secrets for GitHub

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}GitHub Actions Setup - GCP Resources${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not found${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}No GCP project configured.${NC}"
    echo -e "Please enter your GCP project ID:"
    read -r PROJECT_ID
    gcloud config set project "$PROJECT_ID"
fi

echo -e "${GREEN}Using project:${NC} $PROJECT_ID\n"

# Get GitHub repository
echo -e "${YELLOW}Enter your GitHub repository (format: username/repo-name):${NC}"
read -r GITHUB_REPO

if [ -z "$GITHUB_REPO" ]; then
    echo -e "${RED}Error: GitHub repository is required${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 1: Enabling required APIs...${NC}"
gcloud services enable iamcredentials.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

echo -e "\n${BLUE}Step 2: Creating service account...${NC}"
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deployment" \
  --description="Service account for automated Cloud Run deployments from GitHub" \
  2>/dev/null || echo "Service account already exists"

# Grant necessary permissions
echo -e "\n${BLUE}Step 3: Granting permissions...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin" \
  --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser" \
  --condition=None

echo -e "\n${BLUE}Step 4: Setting up Workload Identity Federation...${NC}"

# Get project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# Create Workload Identity Pool
gcloud iam workload-identity-pools create "github-actions-pool" \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  2>/dev/null || echo "Workload Identity Pool already exists"

# Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc "github-actions-provider" \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  2>/dev/null || echo "Workload Identity Provider already exists"

# Allow GitHub Actions to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding \
  "github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/${GITHUB_REPO}"

# Get the Workload Identity Provider resource name
WORKLOAD_IDENTITY_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Add these secrets to your GitHub repository:${NC}\n"

echo -e "${BLUE}1. Go to:${NC} https://github.com/$GITHUB_REPO/settings/secrets/actions"
echo -e "${BLUE}2. Click 'New repository secret'${NC}\n"

echo -e "${YELLOW}Secret 1:${NC}"
echo -e "  Name: ${GREEN}GCP_WORKLOAD_IDENTITY_PROVIDER${NC}"
echo -e "  Value:"
echo -e "  ${BLUE}$WORKLOAD_IDENTITY_PROVIDER${NC}\n"

echo -e "${YELLOW}Secret 2:${NC}"
echo -e "  Name: ${GREEN}GCP_SERVICE_ACCOUNT${NC}"
echo -e "  Value:"
echo -e "  ${BLUE}github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Add the secrets above to GitHub"
echo -e "2. Create a 'production' branch:"
echo -e "   ${BLUE}git checkout -b production${NC}"
echo -e "   ${BLUE}git push -u origin production${NC}"
echo -e "3. Push to 'production' branch to auto-deploy!"
echo -e ""
echo -e "${GREEN}See GITHUB_ACTIONS_SETUP.md for detailed instructions${NC}"
