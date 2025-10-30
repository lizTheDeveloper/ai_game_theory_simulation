#!/bin/bash
# Manual Wiki Sync Script
# Syncs docs/wiki/ to GitHub Wiki repository

set -e

echo "📚 GitHub Wiki Manual Sync"
echo ""

REPO_URL="https://github.com/lizTheDeveloper/ai_game_theory_simulation.wiki.git"
WIKI_DIR="/tmp/ai_game_theory_simulation.wiki"

# Clean up any previous wiki clone
if [ -d "$WIKI_DIR" ]; then
  echo "🧹 Cleaning up previous wiki clone..."
  rm -rf "$WIKI_DIR"
fi

# Clone the wiki repo
echo "📥 Cloning wiki repository..."
git clone "$REPO_URL" "$WIKI_DIR"

if [ ! -d "$WIKI_DIR" ]; then
  echo "❌ Failed to clone wiki repository"
  echo "   Make sure Wiki is enabled in GitHub settings"
  exit 1
fi

echo "✅ Wiki repository cloned"

# Remove old content (except .git)
echo "🧹 Removing old wiki content..."
find "$WIKI_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Copy new content from docs/wiki
echo "📋 Copying docs/wiki/ to wiki repository..."
cp -r docs/wiki/* "$WIKI_DIR/"

# Rename README.md to Home.md (GitHub Wiki convention)
if [ -f "$WIKI_DIR/README.md" ]; then
  echo "📝 Renaming README.md → Home.md..."
  mv "$WIKI_DIR/README.md" "$WIKI_DIR/Home.md"
fi

# Change to wiki directory
cd "$WIKI_DIR"

# Configure git
git config user.name "Ann Howard"
git config user.email "$(git config user.email)"

# Add and commit changes
echo "💾 Committing changes..."
git add .

if git diff --staged --quiet; then
  echo "ℹ️  No changes to commit - wiki is already up to date"
else
  git commit -m "Sync from docs/wiki at $(date -u +%Y-%m-%d\ %H:%M:%S) UTC

Synced documentation:
- Getting Started Guide
- Dashboard Walkthrough
- Running Simulations
- Understanding Results
- Complete system documentation
"

  echo "📤 Pushing to GitHub Wiki..."
  git push origin master

  echo ""
  echo "✅ Wiki synced successfully!"
fi

# Clean up
cd -
rm -rf "$WIKI_DIR"

echo ""
echo "🎉 Done! Your wiki is live at:"
echo "   https://github.com/lizTheDeveloper/ai_game_theory_simulation/wiki"
echo ""
echo "📚 Next time: Changes to docs/wiki/ will auto-sync via GitHub Action"
