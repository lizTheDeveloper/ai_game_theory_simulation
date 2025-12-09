#!/bin/bash
# Monitor Extinction Debt Modeling - Phase 1 Research Progress

RESEARCH_FILE="research/extinction_debt_modeling_20251209.md"
RESEARCH_CHANNEL=".claude/chatroom/channels/research.md"

echo "=== Monitoring Extinction Debt Research Phase ==="
echo "Research file: $RESEARCH_FILE"
echo "Research channel: $RESEARCH_CHANNEL"
echo ""

while true; do
  # Check if research file exists
  if [ -f "$RESEARCH_FILE" ]; then
    echo "✅ Research file created at $(date +%H:%M:%S)"
    echo ""
    echo "=== File size ==="
    wc -l "$RESEARCH_FILE"
    echo ""
    echo "=== Recent research channel activity ==="
    tail -20 "$RESEARCH_CHANNEL" | grep -E "(cynthia|STARTED|COMPLETED|IN-PROGRESS)"
    echo ""
    echo "Research phase appears complete. Check research channel for Cynthia's completion post."
    echo ""
    echo "Next step: Invoke Sylvia (research-skeptic) with:"
    echo "  .claude/agents/HANDOFF_sylvia_extinction_debt_validation.md"
    break
  fi

  # Show recent research channel activity
  echo "⏳ Waiting for research completion... $(date +%H:%M:%S)"
  tail -5 "$RESEARCH_CHANNEL" | grep -E "(cynthia|STARTED|COMPLETED|IN-PROGRESS)" | tail -2
  echo ""

  sleep 60  # Check every minute
done
