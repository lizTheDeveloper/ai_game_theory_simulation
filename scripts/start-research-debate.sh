#!/bin/bash
# Quick start for research debate system

echo "🚀 Starting Research Debate System"
echo ""

# Check if already running
if [ -f .research-watcher.pid ]; then
    OLD_PID=$(cat .research-watcher.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "⚠️  Research watcher already running (PID $OLD_PID)"
        echo "Stop it first with: kill $(cat .research-watcher.pid)"
        exit 1
    fi
fi

echo "📋 System: Antagonistic debate until consensus"
echo "👥 Agents: Cynthia (optimist) + Sylvia (skeptic)"
echo "📂 Channel: research"
echo ""
echo "How it works:"
echo "  1. You post research question"
echo "  2. Cynthia researches and posts findings"
echo "  3. Sylvia critiques with counterevidence"
echo "  4. They debate back-and-forth"
echo "  5. Continue until consensus file created"
echo ""

read -p "Start the watcher? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

# Create logs directory
mkdir -p logs

# Start watcher in background
bash scripts/watch-research.sh > logs/research-watcher.log 2>&1 &
PID=$!

# Save PID
echo $PID > .research-watcher.pid

echo "✅ Research watcher started (PID $PID)"
echo ""
echo "📊 Monitor logs: tail -f logs/research-watcher.log"
echo "🛑 Stop watcher: kill $(cat .research-watcher.pid)"
echo ""
echo "Try posting to #research:"
echo '  "Can someone research climate tipping points? Need 2024 papers."'
echo ""
echo "Watch Cynthia and Sylvia debate until they agree! 🎭"
