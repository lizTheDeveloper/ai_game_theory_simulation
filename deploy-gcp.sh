#!/bin/bash

# Deployment script for Google Cloud Platform (Cloud Run)
# Super Alignment to Utopia Simulation Dashboard

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Super Alignment to Utopia - GCP Deploy${NC}"
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

# Configuration
SERVICE_NAME="superalignment-simulation"
REGION="europe-west1"  # Belgium - 100% renewable energy (wind/solar)
# Alternative eco-friendly regions:
# - us-west1 (Oregon) - 100% renewable energy
# - europe-north1 (Finland) - 100% carbon-neutral (hydroelectric)
MEMORY="2Gi"
CPU="1"
MAX_INSTANCES="10"
MIN_INSTANCES="0"  # Scale to zero when idle to save money
PORT="3333"

echo -e "${BLUE}Deployment Configuration:${NC}"
echo "  Service name: $SERVICE_NAME"
echo "  Region: $REGION"
echo "  Memory: $MEMORY"
echo "  CPU: $CPU"
echo "  Max instances: $MAX_INSTANCES"
echo "  Min instances: $MIN_INSTANCES (scales to zero when idle)"
echo ""

# Ask for confirmation
echo -e "${YELLOW}This will deploy to Google Cloud Run.${NC}"
echo -e "${YELLOW}Estimated cost: \$10-25/month for typical classroom use${NC}"
echo -e "${YELLOW}(20-30 students, 2-4 hours/week)${NC}\n"

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

# Enable required APIs
echo -e "\n${BLUE}Enabling required APIs...${NC}"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Build and deploy
echo -e "\n${BLUE}Building and deploying to Cloud Run...${NC}"
echo -e "${YELLOW}This may take 5-10 minutes...${NC}\n"

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory "$MEMORY" \
  --cpu "$CPU" \
  --max-instances "$MAX_INSTANCES" \
  --min-instances "$MIN_INSTANCES" \
  --port "$PORT" \
  --timeout 300

# Check if deployment succeeded
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment successful! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}\n"

    # Get service URL
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)')

    echo -e "${GREEN}Your simulation is now live at:${NC}"
    echo -e "${BLUE}$SERVICE_URL${NC}\n"

    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Share the URL with your students"
    echo "2. See STUDENT_GUIDE.md for instructions to give students"
    echo "3. Monitor costs at: https://console.cloud.google.com/billing"
    echo ""
    echo -e "${YELLOW}To update the deployment:${NC}"
    echo "  ./deploy-gcp.sh"
    echo ""
    echo -e "${YELLOW}To delete the service (stop all charges):${NC}"
    echo "  gcloud run services delete $SERVICE_NAME --region $REGION"
    echo ""

    # Set up budget alert (optional)
    echo -e "${YELLOW}Budget Alert Recommendation:${NC}"
    echo "Set up a budget alert to avoid surprise costs:"
    echo "  gcloud billing budgets create \\"
    echo "    --billing-account YOUR_BILLING_ACCOUNT_ID \\"
    echo "    --display-name 'Superalignment Simulation Budget' \\"
    echo "    --budget-amount 50 \\"
    echo "    --threshold-rule percent=50 \\"
    echo "    --threshold-rule percent=90"
    echo ""

else
    echo -e "\n${RED}Deployment failed.${NC}"
    echo "Check the error messages above for details."
    exit 1
fi
