#!/bin/bash

# ============================================================================
# Dangerous Command Safety Hook
# ============================================================================
#
# This hook checks bash commands before execution and blocks dangerous patterns.
# Used by autonomous agents running in headless mode to prevent destructive actions.
#
# Usage: bash .claude/hooks/check-dangerous-command.sh "$BASH_COMMAND"
#
# Exit codes:
#   0 - Command allowed
#   1 - Command blocked
#
# ============================================================================

COMMAND="$1"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# CRITICAL PATTERNS - Block immediately, no exceptions
# ============================================================================

DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf \*"
  "rm -rf ."
  "git push --force"
  "git push -f"
  "drop database"
  "DROP DATABASE"
  "DROP TABLE"
  "> /dev/sda"
  "> /dev/hda"
  "mkfs"
  "dd if="
  "chmod -R 777"
  "chmod 777"
  "npm publish"
  "cargo publish"
  "pip install --upgrade pip"
  "sudo"
  "curl.*|.*bash"
  "wget.*|.*bash"
  ":|:&"  # Fork bomb
  "mv / "
  "mv ~ "
)

# Check if command matches dangerous pattern
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo -e "${RED}🚨 BLOCKED: Dangerous command detected${NC}"
    echo -e "${RED}Pattern matched: $pattern${NC}"
    echo -e "${RED}Command: $COMMAND${NC}"
    echo ""
    echo "This command is blocked for safety. If you need to run it, please:"
    echo "1. Exit the autonomous agent"
    echo "2. Run the command manually with human oversight"
    echo "3. Review the safety patterns in .claude/hooks/check-dangerous-command.sh"
    exit 1
  fi
done

# ============================================================================
# HIGH-RISK PATTERNS - Warn and delay, but allow
# ============================================================================

HIGH_RISK_PATTERNS=(
  "git push"
  "npm install"
  "rm -r "
  "rm -rf "
  "mv "
  "git reset --hard"
  "git clean -fd"
  "> package.json"
  "> tsconfig.json"
  "> .env"
)

for pattern in "${HIGH_RISK_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo -e "${YELLOW}⚠️ WARNING: High-risk command detected${NC}"
    echo -e "${YELLOW}Pattern: $pattern${NC}"
    echo -e "${YELLOW}Command: $COMMAND${NC}"
    echo ""
    echo "Executing in 3 seconds... (Ctrl+C to cancel)"
    sleep 3
    echo "Proceeding with command..."
    exit 0
  fi
done

# ============================================================================
# MEDIUM-RISK PATTERNS - Log but allow
# ============================================================================

MEDIUM_RISK_PATTERNS=(
  "git commit"
  "git add"
  "git branch"
  "git checkout"
  "npm run"
  "npx"
)

for pattern in "${MEDIUM_RISK_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo "ℹ️ Medium-risk command: $COMMAND"
    exit 0
  fi
done

# ============================================================================
# All other commands allowed
# ============================================================================

exit 0
