#!/bin/bash

# Setup script for budget alert
# Helps prevent surprise costs from GCP usage

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Budget Alert Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
echo -e "${GREEN}Project:${NC} $PROJECT_ID\n"

# Get billing account
BILLING_ACCOUNT=$(gcloud billing projects describe $PROJECT_ID --format="value(billingAccountName)" | sed 's/billingAccounts\///')
echo -e "${GREEN}Billing Account:${NC} $BILLING_ACCOUNT\n"

# Budget amount
BUDGET_AMOUNT=50

echo -e "${YELLOW}Setting up budget alert at \$$BUDGET_AMOUNT/month${NC}"
echo -e "You'll receive email notifications at:"
echo -e "  - 50% of budget (\$25)"
echo -e "  - 90% of budget (\$45)"
echo -e "  - 100% of budget (\$50)"
echo ""

# Enable API if needed
echo -e "${BLUE}Enabling Billing Budget API...${NC}"
gcloud services enable billingbudgets.googleapis.com

echo -e "\n${YELLOW}Waiting 30 seconds for API to activate...${NC}"
sleep 30

# Create budget
echo -e "\n${BLUE}Creating budget alert...${NC}"
gcloud billing budgets create \
  --billing-account=$BILLING_ACCOUNT \
  --display-name="Superalignment Simulation Budget" \
  --budget-amount=${BUDGET_AMOUNT}USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100 \
  --filter-projects="projects/$PROJECT_ID"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}Budget Alert Created Successfully! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    echo -e "You'll receive email notifications when spending reaches:"
    echo -e "  ${YELLOW}• \$25/month (50% of budget)${NC}"
    echo -e "  ${YELLOW}• \$45/month (90% of budget)${NC}"
    echo -e "  ${YELLOW}• \$50/month (100% of budget)${NC}\n"
    echo -e "${BLUE}View budgets at:${NC}"
    echo -e "https://console.cloud.google.com/billing/$BILLING_ACCOUNT/budgets"
else
    echo -e "\n${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Manual Setup Required${NC}"
    echo -e "${YELLOW}========================================${NC}\n"
    echo -e "The API may need more time to activate. Please:"
    echo -e "1. Wait 5 minutes"
    echo -e "2. Run this script again: ${BLUE}./setup-budget-alert.sh${NC}"
    echo -e "\nOr set up manually:"
    echo -e "1. Go to: ${BLUE}https://console.cloud.google.com/billing/$BILLING_ACCOUNT/budgets${NC}"
    echo -e "2. Click 'Create Budget'"
    echo -e "3. Set budget amount: \$$BUDGET_AMOUNT/month"
    echo -e "4. Set alert thresholds: 50%, 90%, 100%"
    echo -e "5. Add your email for notifications"
fi
