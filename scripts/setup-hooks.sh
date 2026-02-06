#!/bin/bash
# Setup git hooks from .githooks directory

set -e

echo "🔧 Setting up git hooks..."

# Configure git to use .githooks directory
git config core.hooksPath .githooks

# Make hooks executable
chmod +x .githooks/*

echo "✅ Git hooks configured!"
echo ""
echo "Available hooks:"
ls -1 .githooks/
echo ""
echo "Hooks will run automatically on git commit and git push."
echo "To skip hooks temporarily, use: git commit --no-verify"
