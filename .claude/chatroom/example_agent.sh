#!/bin/bash
# Example Agent Chat Script
# This demonstrates how agents can use the chatroom helpers

# Source the helper functions
source "$(dirname "$0")/chat_helpers.sh"

# Configuration
AGENT_NAME="${1:-example-agent}"  # Agent name from arg or default
FEATURE_CHANNEL="${2:-test-feature}"  # Feature channel from arg or default

echo "=========================================="
echo "  Agent Chatroom Example"
echo "  Agent: $AGENT_NAME"
echo "  Feature: $FEATURE_CHANNEL"
echo "=========================================="
echo ""

# Create feature channel if it doesn't exist
if ! channel_exists "$FEATURE_CHANNEL"; then
  create_channel "$FEATURE_CHANNEL" "Example feature channel for testing"
fi

# Example 1: Post a message
echo "Example 1: Posting a message"
post_msg "$FEATURE_CHANNEL" "$AGENT_NAME" "STARTED" "Beginning work on example feature"
echo ""
sleep 2

# Example 2: Post progress update
echo "Example 2: Posting progress update"
post_msg "$FEATURE_CHANNEL" "$AGENT_NAME" "IN-PROGRESS" "Phase 1 complete. Moving to Phase 2."
echo ""
sleep 2

# Example 3: Check for new messages
echo "Example 3: Checking for new messages"
if read_new "$FEATURE_CHANNEL"; then
  echo "Found new messages!"
else
  echo "No new messages since last check"
fi
echo ""
sleep 2

# Example 4: Peek at latest messages
echo "Example 4: Peeking at latest messages"
peek "$FEATURE_CHANNEL" 3
echo ""
sleep 2

# Example 5: Ask a question in coordination channel
echo "Example 5: Posting question to coordination"
post_msg "coordination" "$AGENT_NAME" "QUESTION" "Is anyone modifying game.ts?"
echo ""
sleep 2

# Example 6: Wait for response (with short timeout for demo)
echo "Example 6: Waiting for response (10 second timeout)..."
if wait_for_message "coordination" 10; then
  echo "Got a response!"
else
  echo "No response, proceeding anyway"
fi
echo ""

# Example 7: Post completion
echo "Example 7: Posting completion"
post_msg "$FEATURE_CHANNEL" "$AGENT_NAME" "COMPLETED" "All phases complete. Ready for review.

**Summary:**
- Phase 1: ✓ Complete
- Phase 2: ✓ Complete
- Monte Carlo: ✓ Passed (N=10)
- Tests: ✓ Passing"
echo ""
sleep 2

# Example 8: List all channels
echo "Example 8: Listing all channels"
list_channels
echo ""

# Example 9: Monitor for alerts (in background with timeout)
echo "Example 9: Monitoring for alerts (5 second demo)..."
timeout 5 bash -c "
  source .claude/chatroom/chat_helpers.sh
  while true; do
    if has_tag '$FEATURE_CHANNEL' 'ALERT'; then
      echo 'ALERT detected! Handling...'
      post_msg '$FEATURE_CHANNEL' '$AGENT_NAME' 'IN-PROGRESS' 'Acknowledged alert, investigating...'
    fi
    sleep 2
  done
" || echo "Monitoring timed out (this is expected)"
echo ""

echo "=========================================="
echo "  Examples complete!"
echo "  Check $FEATURE_CHANNEL.md to see the messages"
echo "=========================================="
