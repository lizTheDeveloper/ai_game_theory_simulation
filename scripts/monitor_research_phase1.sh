#!/bin/bash
# Monitor for Phase 1 research completion
# Checks for research file creation and research channel updates

RESEARCH_FILE="research/config_parameters_justification_20251209.md"
RESEARCH_CHANNEL=".claude/chatroom/channels/research.md"

echo "=== Monitoring Phase 1 Research Progress ==="
echo "Research file: $RESEARCH_FILE"
echo "Research channel: $RESEARCH_CHANNEL"
echo ""

if [ -f "$RESEARCH_FILE" ]; then
  echo "✅ Research file EXISTS"
  wc -l "$RESEARCH_FILE"
  echo ""
  echo "=== Recent updates ==="
  tail -50 "$RESEARCH_FILE"
else
  echo "⏳ Research file not yet created"
fi

echo ""
echo "=== Research Channel Updates ==="
echo "(Last 20 lines)"
tail -20 "$RESEARCH_CHANNEL"

echo ""
echo "=== Next Steps ==="
if [ -f "$RESEARCH_FILE" ]; then
  echo "1. Review research file completeness"
  echo "2. Spawn research-skeptic (Sylvia) for Quality Gate 1"
  echo "3. Command: See orchestrator handoff for Sylvia"
else
  echo "1. Wait for Cynthia to complete research"
  echo "2. Check research channel for progress updates"
  echo "3. Estimated completion: ~11:00-13:00"
fi
