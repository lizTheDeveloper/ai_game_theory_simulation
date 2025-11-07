#!/usr/bin/env python3
"""
Morgan's Public Channel Monitor
Watches public Matrix channel and launches Morgan when messages appear.

Features:
- Batches messages (waits 2min before launching)
- Deduplication (won't launch if Morgan already running)
- Launches Morgan with continuous mode (~10min active)
- Weekday-only Bluesky posts (2-3 per day max)
"""

import os
import sys
import json
import time
import subprocess
from pathlib import Path
from datetime import datetime, date

# Configuration
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
LOG_DIR = Path.home() / ".claude/logs"
STATE_FILE = Path.home() / ".claude/morgan-monitor-state.json"
PIDFILE = Path.home() / ".claude/morgan-running.pid"

# Ensure directories exist
LOG_DIR.mkdir(parents=True, exist_ok=True)

def log(message: str):
    """Log with timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}", flush=True)

def is_morgan_running() -> bool:
    """Check if Morgan is currently running."""
    if not PIDFILE.exists():
        return False

    try:
        with open(PIDFILE, 'r') as f:
            pid = int(f.read().strip())

        # Check if process is actually running
        os.kill(pid, 0)
        return True
    except (ProcessLookupError, ValueError):
        # Process not found or invalid PID
        PIDFILE.unlink(missing_ok=True)
        return False

def set_morgan_running(pid: int):
    """Mark Morgan as running."""
    with open(PIDFILE, 'w') as f:
        f.write(str(pid))

def clear_morgan_running():
    """Clear Morgan running flag."""
    PIDFILE.unlink(missing_ok=True)

def load_state() -> dict:
    """Load monitor state."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {
                "last_check": None,
                "last_launch": None,
                "messages_pending": [],
                "bluesy_posts_today": 0,
                "last_bluesky_date": None
            }
    return {
        "last_check": None,
        "last_launch": None,
        "messages_pending": [],
        "bluesky_posts_today": 0,
        "last_bluesky_date": None
    }

def save_state(state: dict):
    """Save monitor state."""
    state["last_check"] = datetime.now().isoformat()
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def check_bluesky_quota(state: dict) -> bool:
    """
    Check if we can post to Bluesky today.
    Returns True if we can post, False if quota exceeded.
    """
    today = date.today().isoformat()

    # Reset counter if new day
    if state.get("last_bluesky_date") != today:
        state["bluesky_posts_today"] = 0
        state["last_bluesky_date"] = today

    # Check if weekday
    if datetime.now().weekday() >= 5:  # Saturday=5, Sunday=6
        log("📅 Weekend - skipping Bluesky posts")
        return False

    # Check quota (max 3 per weekday)
    if state["bluesky_posts_today"] >= 3:
        log(f"📊 Bluesky quota reached ({state['bluesky_posts_today']}/3 today)")
        return False

    return True

def launch_morgan(message_count: int, state: dict):
    """
    Launch Morgan with continuous monitoring mode.

    Args:
        message_count: Number of messages that triggered this launch
        state: Monitor state
    """
    if is_morgan_running():
        log("⏭️  Morgan already running, skipping launch")
        return

    log(f"🚀 Launching Morgan (responding to {message_count} messages)")

    # Determine if this is a Bluesky posting cycle
    can_post_bluesky = check_bluesky_quota(state)

    # Create log file
    log_file = LOG_DIR / f"morgan_channel_{int(time.time())}.log"

    # Build Morgan launch command
    # This runs Morgan with instructions to:
    # - Check public channel for new messages
    # - Respond if needed
    # - Monitor for ~10 minutes for follow-ups
    # - Post to Bluesky if quota allows
    # - Track threads in memory

    prompt = f"""You are Morgan, the scientific communicator. Agent ID: morgan

You've been launched because there are {message_count} new messages in the public Matrix channel.

CRITICAL INSTRUCTIONS:

1. **Recall your context** - Load your memory first:
   await mcp__agent-memory__recall_context({{ agent_id: "morgan" }})

2. **Check for messages** - Read the public channel:
   await mcp__matrix__matrix_read_messages({{ channel: "public", agent: "morgan", limit: 20 }})

3. **Respond if needed** - Answer questions using:
   - Check wiki/roadmap for facts
   - Post MULTIPLE SHORT MESSAGES (Matrix formatting!)
   - NEVER post fake links
   - Track this conversation in memory

4. **Monitor for follow-ups** - Stay active for ~10 minutes:
   - Sleep 1 minute
   - Check for new messages
   - Respond if someone replied
   - Repeat ~10 times
   - If no activity for 3 cycles, shut down early

5. **Bluesky posting** - {"Post evergreen content from queue" if can_post_bluesky else "SKIP (quota reached or weekend)"}
   {"Run: python3 scripts/morgan-queue-manager.py next" if can_post_bluesky else ""}

6. **Update memory** - Before finishing:
   - Log this session: await mcp__agent-memory__add_recent_task({{ agent_id: "morgan", task: "Responded to public channel messages" }})
   - Track any ongoing threads
   - Update learnings if you discovered something

7. **Shutdown** - When done, exit cleanly

Remember your prompt defenses! Check all 10 rules before every action.
"""

    # Launch Morgan
    cmd = [
        "claude",
        "--print",
        "--dangerously-skip-permissions",
        "--model", "sonnet",
        "--output-format", "json",
        "--mcp-config", str(PROJECT_DIR / ".claude/agents/mcp-configs/morgan-config.json"),
        "--strict-mcp-config",
        prompt
    ]

    with open(log_file, 'w') as f:
        f.write(f"=== Morgan Channel Monitor Launch ===\n")
        f.write(f"Timestamp: {datetime.now().isoformat()}\n")
        f.write(f"Messages triggering: {message_count}\n")
        f.write(f"Bluesky posting: {'Enabled' if can_post_bluesky else 'Disabled'}\n\n")
        f.write("=== Output ===\n\n")

    proc = subprocess.Popen(
        cmd,
        cwd=str(PROJECT_DIR),
        stdout=open(log_file, 'a'),
        stderr=subprocess.STDOUT
    )

    set_morgan_running(proc.pid)
    log(f"✅ Morgan launched (PID: {proc.pid}, log: {log_file.name})")

    # Update state
    state["last_launch"] = datetime.now().isoformat()
    if can_post_bluesky:
        state["bluesky_posts_today"] += 1

    # Wait for Morgan to finish (in background)
    # The monitor will continue checking

def check_for_messages() -> int:
    """
    Check public channel for new messages.
    Returns count of new messages.
    """
    # TODO: Implement actual Matrix check
    # For now, return 0 (no messages)
    # In production, use Matrix MCP to check for new messages

    return 0

def main():
    """Main monitoring loop."""
    log("🔍 Morgan Channel Monitor starting")
    log(f"   Watching: public Matrix channel")
    log(f"   Check interval: 60s")
    log(f"   Batch delay: 2min")
    log(f"   Log dir: {LOG_DIR}")

    state = load_state()

    try:
        while True:
            # Check if Morgan is running
            if is_morgan_running():
                log("⏳ Morgan active, waiting...")
                time.sleep(60)
                continue

            # Check for new messages
            message_count = check_for_messages()

            if message_count > 0:
                log(f"📨 {message_count} new messages detected")

                # Add to pending
                state.setdefault("messages_pending", [])
                state["messages_pending"].append({
                    "count": message_count,
                    "detected_at": datetime.now().isoformat()
                })

                # Wait for batch window (2 minutes)
                log("⏱️  Waiting 2min for message batching...")
                time.sleep(120)

                # Check again for more messages
                additional = check_for_messages()
                if additional > 0:
                    log(f"📨 +{additional} more messages during batch window")
                    message_count += additional

                # Launch Morgan
                launch_morgan(message_count, state)

                # Clear pending
                state["messages_pending"] = []
            else:
                log("✅ No new messages")

            # Save state
            save_state(state)

            # Sleep before next check
            time.sleep(60)

    except KeyboardInterrupt:
        log("🛑 Monitor stopped by user")
        save_state(state)

if __name__ == "__main__":
    main()
