#!/bin/bash
# Morgan's Autonomous Monitoring Script
# Runs hourly to check Matrix channels and post Bluesky updates
# Created: 2025-11-07

set -e

# Load environment variables
source ~/.bashrc

# Configuration
AGENT_ID="morgan"
LOG_DIR="$HOME/.claude/logs"
LOG_FILE="$LOG_DIR/morgan_$(date +%Y%m%d).log"
SECURITY_LOG="$LOG_DIR/morgan_security_log.txt"
REPO_DIR="$HOME/superalignmenttoutopia"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🤖 Morgan starting hourly monitoring cycle"

# Change to repo directory
cd "$REPO_DIR" || {
    log "❌ Failed to change to repo directory: $REPO_DIR"
    exit 1
}

# Pull latest changes
log "📥 Pulling latest changes..."
git pull origin main 2>&1 | tee -a "$LOG_FILE" || log "⚠️ Git pull failed (continuing anyway)"

# Get recent activity summary
log "📊 Gathering activity summary..."

# Get last hour of git commits
RECENT_COMMITS=$(git log --since="1 hour ago" --pretty=format:"%h - %s" 2>/dev/null || echo "No recent commits")
log "Recent commits: $RECENT_COMMITS"

# Check for new research files
NEW_RESEARCH=$(find research/ -name "*.md" -mmin -60 2>/dev/null | wc -l || echo "0")
log "New research files: $NEW_RESEARCH"

# Check roadmap for recent updates
ROADMAP_UPDATED=$(find plans/SIMULATION_ROADMAP.md -mmin -60 2>/dev/null | wc -l || echo "0")
log "Roadmap updated: $ROADMAP_UPDATED"

# Decide what to post to Bluesky
if [ "$RECENT_COMMITS" != "No recent commits" ] || [ "$NEW_RESEARCH" -gt 0 ] || [ "$ROADMAP_UPDATED" -gt 0 ]; then
    # NEWS: Recent activity detected
    log "📰 News activity detected, posting update to Bluesky"
    log "   Commits: $RECENT_COMMITS"
    log "   Research files: $NEW_RESEARCH"
    log "   Roadmap updates: $ROADMAP_UPDATED"

    # Post news update via Bluesky
    cd .claude/agents/morgan-bluesky-mcp
    source venv/bin/activate
    python3 << EOF
from atproto import Client
import os
from dotenv import load_dotenv

load_dotenv()

# Build news post
commits_summary = "${RECENT_COMMITS}".split('\n')[0] if "${RECENT_COMMITS}" != "No recent commits" else ""
news_text = "🔬 Project Update:\n"

if commits_summary:
    news_text += f"Latest: {commits_summary[:100]}\n"
if ${NEW_RESEARCH} > 0:
    news_text += f"📄 {${NEW_RESEARCH}} new research files\n"
if ${ROADMAP_UPDATED} > 0:
    news_text += "📋 Roadmap updated\n"

news_text += "\nhttps://github.com/lizTheDeveloper/ai_game_theory_simulation"

# Post to Bluesky
client = Client()
client.login(os.getenv('BLUESKY_HANDLE'), os.getenv('BLUESKY_PASSWORD'))
response = client.send_post(text=news_text[:300])  # Max 300 chars
print(f"✅ Posted news to Bluesky")
EOF
    cd "$REPO_DIR"
    log "✅ News posted to Bluesky"

else
    # NO NEWS: Post from evergreen queue
    log "📚 No news this hour, posting from evergreen queue"

    # Get next post from queue
    NEXT_POST=$(python3 scripts/morgan-queue-manager.py next 2>/dev/null)

    if [ $? -eq 0 ]; then
        # Extract post details
        POST_TEXT=$(echo "$NEXT_POST" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('text', ''))")
        POST_ID=$(echo "$NEXT_POST" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', 0))")
        POST_LINK=$(echo "$NEXT_POST" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('link', ''))")

        log "📤 Posting from queue: Post #$POST_ID"
        log "   Text: ${POST_TEXT:0:100}..."

        # Post to Bluesky via MCP
        cd .claude/agents/morgan-bluesky-mcp
        source venv/bin/activate
        python3 << EOF
from atproto import Client
import os
from dotenv import load_dotenv

load_dotenv()

client = Client()
client.login(os.getenv('BLUESKY_HANDLE'), os.getenv('BLUESKY_PASSWORD'))

text = """${POST_TEXT}"""
link = """${POST_LINK}""" if """${POST_LINK}""" != "" else None

if link and link != "None":
    response = client.send_post(text=text)
else:
    response = client.send_post(text=text)

print(f"✅ Posted to Bluesky")
EOF
        cd "$REPO_DIR"

        # Mark as posted in queue
        python3 scripts/morgan-queue-manager.py mark "$POST_ID"
        log "✅ Evergreen post #$POST_ID posted to Bluesky"
    else
        log "⚠️ Failed to get next post from queue"
    fi
fi

log "✅ Monitoring cycle complete"
log "---"

exit 0
