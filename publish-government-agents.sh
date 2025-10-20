#!/bin/bash
# Publish government-agents package to separate GitHub repo using git subtree
# This keeps the package in your monorepo but also publishes it independently

set -e  # Exit on error

echo "📦 Publishing government-agents to separate GitHub repo"
echo ""

# Check we're in the simulation root
if [ ! -d "packages/government-agents" ]; then
    echo "❌ Error: Run this script from the simulation root directory"
    exit 1
fi

# Step 1: Create a subtree split of the package
echo "1️⃣  Creating subtree split of packages/government-agents..."
git subtree split --prefix=packages/government-agents -b government-agents-publish

# Step 2: Create temporary directory for the standalone repo
echo "2️⃣  Creating temporary directory..."
TEMP_DIR=$(mktemp -d)
echo "   Temp dir: $TEMP_DIR"

# Step 3: Initialize new git repo in temp directory
cd "$TEMP_DIR"
git init
git pull /Users/annhoward/src/superalignmenttoutopia government-agents-publish

# Step 4: Create GitHub repo (if it doesn't exist)
echo "3️⃣  Creating GitHub repository..."
if gh repo view lizthedeveloper/government-agents > /dev/null 2>&1; then
    echo "   Repository already exists, skipping creation"
else
    gh repo create lizthedeveloper/government-agents \
        --public \
        --description "Government modeling framework with coalition formation and policy response - From The Multiverse School" \
        --source=.
fi

# Step 5: Push to GitHub
echo "4️⃣  Pushing to GitHub..."
git remote add origin https://github.com/lizthedeveloper/government-agents.git || true
git branch -M main
git push -u origin main --force

# Step 6: Clean up
echo "5️⃣  Cleaning up..."
cd /Users/annhoward/src/superalignmenttoutopia
git branch -D government-agents-publish
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Successfully published to https://github.com/lizthedeveloper/government-agents"
echo ""
echo "📝 Next steps:"
echo "1. Visit: https://github.com/lizthedeveloper/government-agents"
echo "2. Verify the README displays correctly"
echo "3. Publish to npm: cd packages/government-agents && npm publish --access public"
echo ""
echo "🔄 To update the GitHub repo in the future, run this script again"
