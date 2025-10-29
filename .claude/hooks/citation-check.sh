#!/bin/bash
# Claude Code Hook: Citation Verification
#
# This hook checks AI responses for citations and verifies them against
# the verified citation database to prevent hallucinated references.
#
# Hook Type: Can be used as output-intercept or manual check
# Priority: CRITICAL - catches fabricated citations before they mislead users
#
# Usage in Claude Code:
#   Set as post-response hook to auto-check all citations

set -e

# Get the repository root (assumes hook is in .claude/hooks/)
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CITATION_CHECKER="$REPO_ROOT/scripts/citationChecker.py"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check if citation checker exists
if [ ! -f "$CITATION_CHECKER" ]; then
    echo -e "${RED}ERROR: Citation checker not found at $CITATION_CHECKER${NC}" >&2
    exit 1
fi

# Check if spaCy is installed
if ! python3 -c "import spacy" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: spaCy not installed. Citation checking disabled.${NC}" >&2
    echo "Install with: pip install spacy && python -m spacy download en_core_web_sm" >&2
    exit 0  # Don't fail the hook, just warn
fi

# Get input text
# If called as hook, text comes from stdin
# If called manually, accept --text argument
if [ -t 0 ]; then
    # Not piped, check for --text argument
    if [ -z "$1" ]; then
        echo "Usage: $0 --text \"Your text here\"" >&2
        echo "   or: echo \"Your text\" | $0" >&2
        exit 1
    fi
    INPUT_TEXT="$2"
    echo "$INPUT_TEXT" | python3 "$CITATION_CHECKER" --stdin
else
    # Piped input (from Claude Code hook)
    # Read stdin and check citations
    INPUT_TEXT=$(cat)

    # Run citation checker in quiet mode to get exit code
    if echo "$INPUT_TEXT" | python3 "$CITATION_CHECKER" --stdin --quiet; then
        # All citations verified - silent success
        exit 0
    else
        # Unverified citations found - show warning
        echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" >&2
        echo -e "${YELLOW}⚠️  CITATION WARNING: Unverified or suspicious citations detected${NC}" >&2
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" >&2

        # Show detailed report
        echo "$INPUT_TEXT" | python3 "$CITATION_CHECKER" --stdin >&2

        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" >&2
        echo -e "${RED}These citations may be hallucinated. Please verify manually.${NC}" >&2
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n" >&2

        # Don't fail the hook - just warn
        # Change to 'exit 1' if you want to block responses with unverified citations
        exit 0
    fi
fi
