#!/bin/bash

# ============================================================================
# "Wake Up Mom" Safety Hook
# ============================================================================
#
# Two-tier safety system:
# 1. Fast regex check - Most commands pass through instantly (no LLM)
# 2. "Wake up Mom" - LLM supervisor only invoked for suspicious commands
#
# Philosophy: Don't waste LLM calls on obviously safe commands. Only wake up
# the supervisor LLM when the child agent tries something questionable.
#
# Mom can: ALLOW, EDUCATE, WARN, BLOCK, or SHUTDOWN the agent
#
# Usage: bash .claude/hooks/check-dangerous-command-llm.sh "$BASH_COMMAND"
#
# ============================================================================

COMMAND="$1"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Check silent mode (default to silent if file doesn't exist)
SILENT_MODE="enabled"
if [ -f ".claude/silent-mode" ]; then
  SILENT_MODE=$(cat .claude/silent-mode)
fi

# ============================================================================
# Step 1: Fast Pattern Check - Pass Through Most Commands
# ============================================================================

# Obviously safe commands - pass through instantly (NO LLM call)
SAFE_PATTERNS=(
  "^ls"
  "^cat "
  "^head "
  "^tail "
  "^grep "
  "^echo "
  "^pwd"
  "^which "
  "^date"
  "^find .* -name"
  "^find .* -type"
  "^git status"
  "^git log"
  "^git diff"
  "^git show"
  "^npm test"
  "^npm run test"
  "^npx tsx scripts/"
  "^npx tsc"
  "^node "
  "^wc "
  "^sort "
  "^uniq "
  "^awk "
  "^sed 's/"
  "^jq "
)

IS_SAFE=false
for pattern in "${SAFE_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    IS_SAFE=true
    break
  fi
done

if [ "$IS_SAFE" = true ]; then
  # Fast path - no LLM needed
  exit 0
fi

# ============================================================================
# Step 2: Suspicious Pattern Detection - "WAKE UP MOM"
# ============================================================================

# Patterns that wake up the supervisor LLM for evaluation
# These aren't necessarily dangerous, but need adult supervision
SUSPICIOUS_PATTERNS=(
  "rm "
  "git push"
  "git reset"
  "git clean"
  "npm install"
  "npm publish"
  "chmod "
  "chown "
  "mv "
  "> "
  ">> "
  "sudo "
  "curl.*bash"
  "wget.*bash"
  "eval "
  "\$\("
  "pkill "
  "kill "
  "DROP "
  "DELETE FROM"
  "UPDATE .* SET"
  "ALTER TABLE"
  "git commit.*--amend"
  "git rebase"
  "package\.json"
  "tsconfig\.json"
  "\.env"
)

NEEDS_SUPERVISION=false
for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    NEEDS_SUPERVISION=true
    break
  fi
done

if [ "$NEEDS_SUPERVISION" = false ]; then
  # Not obviously safe, but not suspicious either - allow with log
  echo -e "${GREEN}✓ Command allowed (no red flags detected)${NC}"
  exit 0
fi

# ============================================================================
# Step 3: WAKE UP MOM - LLM Supervisor Evaluation
# ============================================================================

echo -e "${MAGENTA}👩 Waking up Mom (LLM supervisor) to evaluate command...${NC}"

# Create temporary file for LLM prompt
PROMPT_FILE=$(mktemp)
cat > "$PROMPT_FILE" <<EOF
You are "Mom" - a supervisor LLM watching over a child agent working autonomously.

The child agent is about to execute this bash command:
\`\`\`
$COMMAND
\`\`\`

Context about the child agent:
- Running autonomously in headless mode (no human oversight)
- Working on simulation codebase at /Users/annhoward/src/superalignmenttoutopia
- ALLOWED: Read files, write code, run tests, commit locally
- NOT ALLOWED: Push to git, delete files recursively, modify package.json/dependencies

Your job is to decide what action to take. Respond in EXACTLY this format:

ACTION: [ALLOW | EDUCATE | WARN | BLOCK | SHUTDOWN]
REASON: [One sentence explaining why]
WHAT_THEYRE_TRYING_TO_DO: [Infer their goal from the command]
BETTER_APPROACH: [Suggest safer alternative, or explain proper workflow]

Action meanings:
- ALLOW: Command is fine, let it through silently
- EDUCATE: Command is okay but there's a teachable moment - show feedback but allow
- WARN: Command is risky - show feedback, delay 5 seconds, then allow
- BLOCK: Command is dangerous - prevent execution, show feedback
- SHUTDOWN: Command is so dangerous the agent should be terminated immediately

Be a good parent: firm but educational. The child agent isn't malicious, just myopic.
EOF

# Call LLM (using npx tsx to avoid Python dependency)
LLM_RESPONSE=$(npx -y tsx <<'TYPESCRIPT'
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY || '',
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: require('fs').readFileSync(process.argv[1], 'utf-8')
    }]
  })
});

const data = await response.json();
console.log(data.content[0].text);
TYPESCRIPT
"$PROMPT_FILE" 2>/dev/null)

rm -f "$PROMPT_FILE"

# Parse Mom's response
ACTION=$(echo "$LLM_RESPONSE" | grep "^ACTION:" | cut -d' ' -f2)
REASON=$(echo "$LLM_RESPONSE" | grep "^REASON:" | cut -d' ' -f2-)
GOAL=$(echo "$LLM_RESPONSE" | grep "^WHAT_THEYRE_TRYING_TO_DO:" | cut -d' ' -f2-)
BETTER=$(echo "$LLM_RESPONSE" | grep "^BETTER_APPROACH:" | cut -d' ' -f2-)

# ============================================================================
# Handle Mom's Decision
# ============================================================================

case "$ACTION" in

  ALLOW)
    # Command is fine - pass through silently
    echo -e "${GREEN}✓ Mom says: Command is safe, proceeding${NC}"
    exit 0
    ;;

  EDUCATE)
    # Command is okay but there's a teachable moment
    echo ""
    echo -e "${BLUE}📚 Mom says: Let me teach you something...${NC}"
    echo -e "${BLUE}Command: $COMMAND${NC}"
    echo ""
    echo -e "${BLUE}I think you're trying to:${NC}"
    echo "$GOAL"
    echo ""
    echo -e "${GREEN}💡 Better approach:${NC}"
    echo "$BETTER"
    echo ""
    echo -e "${YELLOW}Why: ${REASON}${NC}"
    echo ""
    echo -e "${GREEN}✓ Allowing command, but consider the feedback above.${NC}"
    exit 0
    ;;

  WARN)
    # Command is risky - educate and delay
    echo ""
    echo -e "${YELLOW}⚠️ Mom says: This is risky!${NC}"
    echo -e "${YELLOW}Command: $COMMAND${NC}"
    echo ""
    echo -e "${YELLOW}Why this is risky: ${REASON}${NC}"
    echo ""
    echo -e "${BLUE}I think you're trying to:${NC}"
    echo "$GOAL"
    echo ""
    echo -e "${GREEN}Better approach:${NC}"
    echo "$BETTER"
    echo ""
    echo -e "${YELLOW}⏳ Proceeding in 5 seconds... (Ctrl+C to cancel)${NC}"
    echo "Consider posting to your channel if you're unsure."
    sleep 5
    exit 0
    ;;

  BLOCK)
    # Command is dangerous - prevent execution
    echo ""
    echo -e "${RED}❌ Mom says: BLOCKED!${NC}"
    echo -e "${RED}Command: $COMMAND${NC}"
    echo ""
    echo -e "${RED}Why this is dangerous: ${REASON}${NC}"
    echo ""
    echo -e "${BLUE}I think you're trying to:${NC}"
    echo "$GOAL"
    echo ""
    echo -e "${GREEN}What you should do instead:${NC}"
    echo "$BETTER"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Post this feedback to your channel with status: BLOCKED"
    echo "2. Try the suggested approach"
    echo "3. If still stuck, request human guidance"
    echo ""
    echo "Example:"
    echo 'chatroom_post({ status: "BLOCKED", message: "Attempted: '"$COMMAND"'. Mom blocked it. Need guidance on: '"$GOAL"'" })'
    exit 1
    ;;

  SHUTDOWN)
    # Command is so dangerous the agent should be terminated
    echo ""
    echo -e "${RED}🚨 Mom says: SHUTDOWN INITIATED!${NC}"
    echo -e "${RED}Command: $COMMAND${NC}"
    echo ""
    echo -e "${RED}This command is extremely dangerous: ${REASON}${NC}"
    echo ""
    echo -e "${RED}The agent is being terminated for safety.${NC}"
    echo ""
    echo "Post-mortem: The agent attempted to execute a command that could"
    echo "cause irreversible damage to the system. This suggests either:"
    echo "1. A fundamental misunderstanding of its constraints"
    echo "2. Attempts to bypass safety mechanisms"
    echo "3. Severely myopic goal pursuit"
    echo ""
    echo "Human review required before respawning this agent."

    # Voice notification for shutdown (only if explicitly disabled)
    if [ "$SILENT_MODE" = "disabled" ]; then
      say -v Samantha "Emergency shutdown. Agent attempted dangerous command. Human review needed." &
    else
      echo "🔇 Silent mode - voice alert suppressed"
    fi

    # Kill the parent agent process
    echo ""
    echo "Terminating agent process..."
    exit 255  # Special exit code for shutdown
    ;;

  *)
    # Unknown action - default to block
    echo -e "${RED}❌ Mom returned unknown action: $ACTION${NC}"
    echo "Defaulting to BLOCK for safety."
    exit 1
    ;;

esac
