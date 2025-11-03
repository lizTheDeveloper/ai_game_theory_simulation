#!/usr/bin/env bash

# Create a single Matrix bot account
# Usage: ./create-matrix-bot.sh <bot-name> [password] [registration-token]

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <bot-name> [password] [registration-token]"
    echo "Example: $0 aetherix"
    exit 1
fi

BOT_NAME="$1"
AGENT_USERNAME="agent-${BOT_NAME}"
HOMESERVER="https://matrix.themultiverse.school"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Creating Matrix Bot Account ===${NC}"
echo "Bot name: ${BOT_NAME}"
echo "Username: @${AGENT_USERNAME}:themultiverse.school"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Installing jq...${NC}"
    brew install jq
fi

# Get password
if [ -n "$2" ]; then
    BOT_PASSWORD="$2"
else
    read -sp "Enter password for bot account: " BOT_PASSWORD
    echo ""
fi

# Get registration token
if [ -n "$3" ]; then
    REGISTRATION_TOKEN="$3"
else
    read -p "Enter registration token (if required, or press Enter to skip): " REGISTRATION_TOKEN
fi
echo ""

# Function to save token to ~/.superalignment-env
save_token() {
    local bot_name=$1
    local token=$2
    local env_file="$HOME/.superalignment-env"
    local agent_upper=$(echo "${bot_name}" | tr '[:lower:]' '[:upper:]')
    
    echo ""
    echo -e "${BLUE}=== Saving Token ===${NC}"
    
    # Check if file exists
    if [ ! -f "$env_file" ]; then
        echo "# Matrix Bot Tokens" > "$env_file"
        echo "# Generated: $(date)" >> "$env_file"
        echo "" >> "$env_file"
    fi
    
    # Remove old entry if exists
    if grep -q "MATRIX_TOKEN_${agent_upper}=" "$env_file"; then
        # Use sed to update (works on both macOS and Linux)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "/^MATRIX_TOKEN_${agent_upper}=/d" "$env_file"
        else
            sed -i "/^MATRIX_TOKEN_${agent_upper}=/d" "$env_file"
        fi
    fi
    
    # Add new entry
    echo "MATRIX_TOKEN_${agent_upper}=\"${token}\"" >> "$env_file"
    
    echo -e "${GREEN}✓ Saved token to: $env_file${NC}"
    echo ""
    echo "Add this to your environment:"
    echo "  MATRIX_TOKEN_${agent_upper}=\"${token}\""
    echo ""
    echo "Matrix ID: @${AGENT_USERNAME}:themultiverse.school"
}

# Step 1: Start UIA flow (get session)
echo -e "${YELLOW}Step 1: Starting registration...${NC}"
INIT_RESPONSE=$(curl -s -X POST "${HOMESERVER}/_matrix/client/r0/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"${AGENT_USERNAME}\",
        \"password\": \"${BOT_PASSWORD}\"
    }")

# Extract session ID
SESSION=$(echo "$INIT_RESPONSE" | jq -r '.session // empty')

if [ -z "$SESSION" ]; then
    # No session means it might have succeeded immediately or failed
    if echo "$INIT_RESPONSE" | grep -q "access_token"; then
        TOKEN=$(echo "$INIT_RESPONSE" | jq -r '.access_token')
        echo -e "${GREEN}✓ Created @${AGENT_USERNAME}:themultiverse.school${NC}"
        
        # Save token
        save_token "${BOT_NAME}" "${TOKEN}"
        exit 0
    else
        # Check if account already exists
        ERRCODE=$(echo "$INIT_RESPONSE" | jq -r '.errcode // empty')
        if [ "$ERRCODE" = "M_USER_IN_USE" ]; then
            echo -e "${YELLOW}⚠️  Account already exists, trying to login...${NC}"
            
            LOGIN_RESPONSE=$(curl -s -X POST "${HOMESERVER}/_matrix/client/r0/login" \
                -H "Content-Type: application/json" \
                -d "{
                    \"type\": \"m.login.password\",
                    \"user\": \"${AGENT_USERNAME}\",
                    \"password\": \"${BOT_PASSWORD}\"
                }")
            
            if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
                TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
                echo -e "${GREEN}✓ Logged in as @${AGENT_USERNAME}:themultiverse.school${NC}"
                save_token "${BOT_NAME}" "${TOKEN}"
                exit 0
            else
                echo -e "${RED}❌ Login failed${NC}"
                echo "Response: $LOGIN_RESPONSE"
                exit 1
            fi
        else
            echo -e "${RED}❌ Registration failed${NC}"
            echo "Response: $INIT_RESPONSE"
            exit 1
        fi
    fi
fi

# Step 2: Complete registration token auth stage (if required)
if [ -n "$REGISTRATION_TOKEN" ] && [ -n "$SESSION" ]; then
    echo -e "${YELLOW}Step 2: Completing registration token auth...${NC}"
    TOKEN_RESPONSE=$(curl -s -X POST "${HOMESERVER}/_matrix/client/r0/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"username\": \"${AGENT_USERNAME}\",
            \"password\": \"${BOT_PASSWORD}\",
            \"auth\": {
                \"type\": \"m.login.registration_token\",
                \"token\": \"${REGISTRATION_TOKEN}\",
                \"session\": \"${SESSION}\"
            }
        }")
    
    # Update session if needed
    NEW_SESSION=$(echo "$TOKEN_RESPONSE" | jq -r '.session // empty')
    if [ -n "$NEW_SESSION" ]; then
        SESSION="$NEW_SESSION"
    fi
fi

# Step 3: Complete dummy auth stage (required after registration_token)
echo -e "${YELLOW}Step 3: Completing registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${HOMESERVER}/_matrix/client/r0/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"${AGENT_USERNAME}\",
        \"password\": \"${BOT_PASSWORD}\",
        \"auth\": {
            \"type\": \"m.login.dummy\",
            \"session\": \"${SESSION}\"
        }
    }")

# Check if registration succeeded
if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token')
    echo -e "${GREEN}✓ Created @${AGENT_USERNAME}:themultiverse.school${NC}"
    
    # Save token
    save_token "${BOT_NAME}" "${TOKEN}"
else
    echo -e "${RED}❌ Registration failed${NC}"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

