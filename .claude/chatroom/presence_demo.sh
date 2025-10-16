#!/bin/bash
# Presence Tracking Demo: Shows agents entering, working together, and leaving

source "$(dirname "$0")/chat_helpers.sh"

CHANNEL="test-coordination"

echo "=========================================="
echo "  Presence Tracking Demo"
echo "  Showing agents entering, working, and leaving"
echo "=========================================="
echo ""

# Clean slate
reset_lastread "$CHANNEL"
create_channel "$CHANNEL" "Test coordination channel for demo"

echo "📊 Initial state - no agents active"
who_is_active "$CHANNEL" || echo "  (Expected: no one active yet)"
echo ""
sleep 2

echo "🔵 AGENT 1 (feature-implementer) enters"
enter_chat "$CHANNEL" "feature-implementer"
sleep 1
who_is_active "$CHANNEL"
echo ""
sleep 2

echo "🟢 AGENT 2 (architecture-skeptic) enters"
enter_chat "$CHANNEL" "architecture-skeptic"
sleep 1
who_is_active "$CHANNEL"
echo ""
sleep 2

echo "🔵 Agent 1 posts a question"
post_msg "$CHANNEL" "feature-implementer" "QUESTION" "Anyone available to review my implementation?"
sleep 2

echo ""
echo "🟢 Agent 2 responds"
post_msg "$CHANNEL" "architecture-skeptic" "IN-PROGRESS" "I can review. Send me the files."
sleep 2

echo ""
echo "🟣 AGENT 3 (orchestrator) enters to monitor"
enter_chat "$CHANNEL" "orchestrator"
sleep 1
who_is_active "$CHANNEL"
echo ""
sleep 2

echo "🔵 Agent 1 provides files"
post_msg "$CHANNEL" "feature-implementer" "IN-PROGRESS" "Files ready: src/simulation/nuclearCommandControl.ts"
sleep 2

echo ""
echo "🟢 Agent 2 completes review"
post_msg "$CHANNEL" "architecture-skeptic" "COMPLETED" "Review complete. Looks good!"
sleep 2

echo ""
echo "🟢 Agent 2 leaves (work complete)"
leave_chat "$CHANNEL" "architecture-skeptic" "Review complete, moving to next task"
sleep 1
who_is_active "$CHANNEL"
echo ""
sleep 2

echo "🔵 Agent 1 thanks and leaves"
post_msg "$CHANNEL" "feature-implementer" "COMPLETED" "Thanks for the review!"
leave_chat "$CHANNEL" "feature-implementer" "Implementation complete"
sleep 1
who_is_active "$CHANNEL"
echo ""
sleep 2

echo "🟣 Orchestrator updates status and leaves"
post_msg "$CHANNEL" "orchestrator" "COMPLETED" "Feature implementation workflow complete"
leave_chat "$CHANNEL" "orchestrator" "Workflow complete, archiving channel"
sleep 1
echo ""
echo "📊 Final state - all agents have left"
who_is_active "$CHANNEL" || echo "  (Expected: no one active anymore)"
echo ""

echo "=========================================="
echo "  Demo Complete!"
echo ""
echo "  This demonstrated:"
echo "  1. Agents entering channels (tracked as active)"
echo "  2. who_is_active() showing current agents"
echo "  3. Agents coordinating work"
echo "  4. Agents leaving gracefully"
echo "  5. Presence tracking updated in real-time"
echo ""
echo "  Check $CHANNEL.md for the full conversation"
echo "  View channel list with: list_channels"
echo "=========================================="
