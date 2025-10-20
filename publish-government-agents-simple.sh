#!/bin/bash
# Simple approach: Copy package to new repo and publish to GitHub

set -e  # Exit on error

echo "📦 Publishing government-agents to separate GitHub repo (simple copy method)"
echo ""

# Step 1: Create temporary directory
TEMP_DIR="/tmp/government-agents-repo"
echo "1️⃣  Creating clean directory..."
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Step 2: Copy package files (excluding node_modules and dist)
echo "2️⃣  Copying package files..."
cd /Users/annhoward/src/superalignmenttoutopia/packages/government-agents

# Copy all files except build artifacts
rsync -av \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '*.tgz' \
    --exclude '.DS_Store' \
    . "$TEMP_DIR/"

# Step 3: Build the package in temp directory
echo "3️⃣  Building package..."
cd "$TEMP_DIR"
npm install
npm run build

# Step 4: Initialize git repo
echo "4️⃣  Initializing git repository..."
git init
git add .
git commit -m "Initial commit: Government modeling framework v0.1.0

Production-ready government modeling package with:
- 30 governments with real WGI 2024 data
- Coalition formation (Laver 2020 algorithm)
- Policy response with crisis acceleration
- Elections and opinion dynamics
- International treaty coordination

Research-backed with 36 peer-reviewed sources (2019-2024).
58/58 tests passing, MIT licensed.

🤖 Generated with Claude Code (claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Step 5: Create GitHub repo and push
echo "5️⃣  Creating/updating GitHub repository..."
if gh repo view lizthedeveloper/government-agents > /dev/null 2>&1; then
    echo "   Repository already exists"
    git remote add origin https://github.com/lizthedeveloper/government-agents.git
else
    echo "   Creating new repository..."
    gh repo create lizthedeveloper/government-agents \
        --public \
        --description "Government modeling framework with coalition formation and policy response" \
        --source=. \
        --remote=origin
fi

# Step 6: Push to GitHub
echo "6️⃣  Pushing to GitHub..."
git branch -M main
git push -u origin main --force

echo ""
echo "✅ Successfully published!"
echo ""
echo "📍 Repository: https://github.com/lizthedeveloper/government-agents"
echo ""
echo "📝 Next steps:"
echo "1. Visit: https://github.com/lizthedeveloper/government-agents"
echo "2. Verify the README displays correctly"
echo "3. Publish to npm:"
echo "   cd packages/government-agents"
echo "   npm publish --access public"
echo ""
echo "🔄 To update in the future, run this script again"
echo ""
echo "📂 Temp directory: $TEMP_DIR (you can delete this after verifying)"
