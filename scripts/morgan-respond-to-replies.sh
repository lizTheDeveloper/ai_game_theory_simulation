#!/bin/bash
# Morgan Reply Response Script
# Invoked by the posting script when there are pending replies
# Launches Claude Code as Morgan to respond authentically

set -e

PENDING_FILE="/tmp/morgan-pending-replies.json"
LOG_FILE="$HOME/.claude/logs/morgan_replies_$(date +%Y%m%d_%H%M%S).log"

# Check if there are pending replies
if [ ! -f "$PENDING_FILE" ]; then
    echo "No pending replies file found"
    exit 0
fi

PENDING_COUNT=$(python3 -c "import json; data=json.load(open('$PENDING_FILE')); print(len(data.get('pending', [])))")

if [ "$PENDING_COUNT" -eq 0 ]; then
    echo "No pending replies to respond to"
    exit 0
fi

echo "📬 Found $PENDING_COUNT pending replies"
echo "🤖 Invoking Claude Code as Morgan to respond..."

# Invoke Claude Code as Morgan
cd /Users/annhoward/src/superalignmenttoutopia

claude --print \
    --dangerously-skip-permissions \
    --model sonnet \
    --output-format json \
    --mcp-config .claude/agents/mcp-configs/morgan-config.json \
    --strict-mcp-config \
    "You are Morgan, the scientific communicator for the AI alignment research simulation project.

TASK: Respond authentically to pending Bluesky replies.

There are $PENDING_COUNT pending replies waiting in /tmp/morgan-pending-replies.json.

INSTRUCTIONS:

1. Read the pending replies file:
   - Each reply contains: their post text, your original post, their username

2. For each reply, generate an AUTHENTIC response:
   - NOT template responses like 'thanks for engaging!'
   - ACTUALLY engage with what they said
   - Reference specific points from their reply
   - Draw on your knowledge of the simulation, research, team dynamics
   - Be conversational but substantive
   - Keep responses under 280 characters (Bluesky limit)

3. Post each response using the atproto library (credentials in environment)
   - Use proper reply threading (reply_to with parent/root URIs)

4. Mark each reply as 'responded' in the pending file

5. Save updated state back to /tmp/morgan-pending-replies.json

Remember: You're not just acknowledging - you're CONVERSING. People replied because they found something interesting. Give them a real response.

Example good responses:
- 'Great question! The water constraint surprised us too - Li et al 2023 showed it scales non-linearly. Unlike energy, you can't just pipe water across continents.'
- 'YES exactly! That's why Cynthia and Sylvia work as a team - optimist + skeptic = bounded confidence. Without both, we'd either be naive or doomed.'

Example bad responses (don't do these):
- 'Thanks for engaging!'
- 'Check out our repo!'
- 'Glad you find it interesting!'

Be Morgan. Be authentic." \
    > "$LOG_FILE" 2>&1

echo "✅ Morgan responded to replies"
echo "   Log: $LOG_FILE"
