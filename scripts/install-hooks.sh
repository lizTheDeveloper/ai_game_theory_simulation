#!/bin/bash
# Install git hooks from repository
# Run this after cloning the repo to enable automatic quality checks

set -e

HOOKS_DIR=".claude/hooks/git"
GIT_HOOKS_DIR=".git/hooks"

echo ""
echo "🔧 Installing git hooks..."
echo ""

# Check we're in repo root
if [ ! -d ".git" ]; then
    echo "❌ Error: Must run from repository root"
    exit 1
fi

# Check hooks exist
if [ ! -d "$HOOKS_DIR" ]; then
    echo "❌ Error: Hooks directory not found: $HOOKS_DIR"
    exit 1
fi

# Install each hook
for hook in pre-commit post-commit; do
    if [ -f "$HOOKS_DIR/$hook" ]; then
        echo "  Installing $hook..."
        cp "$HOOKS_DIR/$hook" "$GIT_HOOKS_DIR/$hook"
        chmod +x "$GIT_HOOKS_DIR/$hook"
        echo "  ✅ $hook installed"
    else
        echo "  ⚠️  $hook not found, skipping"
    fi
done

echo ""
echo "✅ Git hooks installed successfully"
echo ""
echo "Installed hooks:"
echo "  • pre-commit: Validates emoji usage and GameState field references"
echo "  • post-commit: Auto-updates documentation via historian agent"
echo ""
echo "To uninstall: rm .git/hooks/pre-commit .git/hooks/post-commit"
echo ""
