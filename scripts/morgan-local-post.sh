#!/bin/bash
# Morgan Local Posting Script - Runs every 2 hours on local Mac
# 1. Check for replies and respond authentically (auto-invoke Claude Code)
# 2. Post next item from queue

set -e

LOG_FILE="$HOME/.claude/logs/morgan_local_$(date +%Y%m%d).log"
QUEUE_FILE="$HOME/src/superalignmenttoutopia/.claude/agents/morgan-bluesky-queue.json"
VENV_PATH="/tmp/morgan-venv"
REPO_DIR="$HOME/src/superalignmenttoutopia"

mkdir -p "$HOME/.claude/logs"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🤖 Morgan waking up for 2-hour cycle"

# Activate venv
source "$VENV_PATH/bin/activate"

# STEP 1: Check for replies
log "👀 Checking for replies..."
python3 "$REPO_DIR/scripts/morgan-reply-checker.py" 2>&1 | tee -a "$LOG_FILE"

# STEP 2: If there are pending replies, invoke Claude Code to respond
PENDING_FILE="/tmp/morgan-pending-replies.json"
if [ -f "$PENDING_FILE" ]; then
    PENDING_COUNT=$(python3 -c "import json; data=json.load(open('$PENDING_FILE')); print(len(data.get('pending', [])))" 2>/dev/null || echo "0")

    if [ "$PENDING_COUNT" -gt 0 ]; then
        log "📬 $PENDING_COUNT pending replies - invoking Claude Code for authentic responses"
        bash "$REPO_DIR/scripts/morgan-respond-to-replies.sh" 2>&1 | tee -a "$LOG_FILE"
    fi
fi

# STEP 3: Post next item from queue
log "📤 Posting next queued item..."

python3 << 'PYEOF'
import json
import os
from pathlib import Path
from datetime import datetime
from atproto import Client
import time

queue_file = Path(os.path.expanduser('~/src/superalignmenttoutopia/.claude/agents/morgan-bluesky-queue.json'))
data = json.loads(queue_file.read_text())

# Find next pending post
next_post = None
for post in data['queue']:
    if post['status'] == 'pending':
        next_post = post
        break

if not next_post:
    print('📭 No pending posts in queue')
    exit(0)

print(f"📤 Posting #{next_post['id']} (type: {next_post.get('type', 'single')})")

# Login to Bluesky
client = Client()
client.login('aethrix.bsky.social', '67 ether matrix seraph escape')

# Post based on type
post_type = next_post.get('type', 'single')

if post_type == 'thread':
    messages = next_post.get('thread', [])
    root = client.send_post(text=messages[0][:300])
    parent = root

    for msg in messages[1:]:
        time.sleep(2)
        parent = client.send_post(
            text=msg[:300],
            reply_to={
                'parent': {'cid': parent.cid, 'uri': parent.uri},
                'root': {'cid': root.cid, 'uri': root.uri}
            }
        )
    print(f'✅ Posted thread ({len(messages)} posts)')
else:
    text = next_post.get('text', '')
    response = client.send_post(text=text[:300])
    print('✅ Posted to Bluesky')

# Mark as posted
next_post['status'] = 'posted'
next_post['posted_at'] = datetime.now().isoformat()
data['metadata']['postsPublished'] = sum(1 for p in data['queue'] if p['status'] == 'posted')
data['metadata']['lastPostedIndex'] = next_post['id'] - 1

queue_file.write_text(json.dumps(data, indent=2))
print(f"✅ Marked post #{next_post['id']} as posted")
PYEOF

log "✅ 2-hour cycle complete"
