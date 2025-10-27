#!/bin/bash
# Monitor long-term validation test progress

STDERR_LOG=$(ls -t logs/long_term_validation_50x500_stderr_*.log 2>/dev/null | head -1)
STDOUT_LOG=$(ls -t logs/long_term_validation_50x500_stdout_*.log 2>/dev/null | head -1)

if [ -z "$STDERR_LOG" ]; then
  echo "❌ No stderr log found"
  exit 1
fi

echo "📊 Long-Term Validation Monitor"
echo "================================"
echo ""
echo "📁 Logs:"
echo "   stderr: $STDERR_LOG"
echo "   stdout: $STDOUT_LOG"
echo ""

# Check if process is still running
if ps aux | grep -q "monteCarloSimulation.*--runs=50.*--max-months=500" | grep -v grep; then
  echo "✅ Test RUNNING"
else
  echo "⏹️  Test COMPLETED or STOPPED"
fi

echo ""
echo "📈 Progress:"
ls -lh "$STDERR_LOG" | awk '{print "   stderr size: " $5}'
ls -lh "$STDOUT_LOG" 2>/dev/null | awk '{print "   stdout size: " $5}'

echo ""
echo "❌ Error Summary:"
FATAL_COUNT=$(grep -c "FATAL" "$STDERR_LOG" 2>/dev/null || echo "0")
GRID_COUNT=$(grep -c "GRID MIX CORRUPTION" "$STDERR_LOG" 2>/dev/null || echo "0")
echo "   FATAL errors: $FATAL_COUNT"
echo "   Grid mix corruption: $GRID_COUNT"

if [ "$FATAL_COUNT" -gt 0 ]; then
  echo ""
  echo "🔍 Recent FATAL errors:"
  grep "FATAL" "$STDERR_LOG" | tail -5 | sed 's/^/   /'
fi

echo ""
echo "🌊 Novel Entities Logging:"
NOVEL_COUNT=$(grep -c "🧪\|♻️\|🧬\|🌊\|⚛️" "$STDERR_LOG" 2>/dev/null || echo "0")
echo "   Novel entities logs: $NOVEL_COUNT"

if [ "$NOVEL_COUNT" -gt 0 ]; then
  echo ""
  echo "   Last 3 novel entities logs:"
  grep -E "🧪|♻️|🧬|🌊|⚛️" "$STDERR_LOG" | tail -3 | sed 's/^/   /'
fi

echo ""
echo "⏱️  Estimated completion: Unknown (first run, no baseline)"
echo ""
echo "💡 Run 'bash scripts/monitor-long-test.sh' again to refresh"
