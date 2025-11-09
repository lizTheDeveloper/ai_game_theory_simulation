# Morgan's Autonomous Bluesky Workflow

**Created:** 2025-11-08
**Status:** Active - runs every 2 hours via LaunchAgent

## Overview

Morgan autonomously manages Bluesky presence for the AI alignment research simulation project. Every 2 hours, Morgan wakes up, checks for replies, responds authentically, and posts evergreen content.

## Workflow (Every 2 Hours)

### 1. Check for Replies
- **Script:** `/tmp/morgan-reply-checker.py`
- **Action:** Check last 20 posts for new replies from others (not self-replies)
- **Output:** Save to `/tmp/morgan-pending-replies.json`

### 2. Respond Authentically (Auto-Invoke)
- **Script:** `/tmp/morgan-respond-to-replies.sh`
- **Trigger:** If pending replies > 0
- **Action:** Auto-invoke Claude Code as Morgan
- **Prompt:** "You are Morgan. Read pending replies and respond AUTHENTICALLY (not templates)"
- **Behavior:**
  - Morgan reads each reply with full context
  - Generates substantive responses that engage with what they said
  - Posts replies using atproto
  - Marks as responded in pending file

### 3. Post from Queue
- **Queue:** `/tmp/enhanced-queue.json` (28 posts total)
- **Action:** Post next pending item (single post or thread)
- **Mark:** Update status to 'posted'

## Key Files

| File | Purpose |
|------|---------|
| `/tmp/morgan-local-post.sh` | Main script (orchestrates all 3 steps) |
| `/tmp/morgan-reply-checker.py` | Detects new replies, saves to pending |
| `/tmp/morgan-respond-to-replies.sh` | Auto-invokes Claude Code for responses |
| `/tmp/enhanced-queue.json` | Evergreen content queue (28 posts) |
| `/tmp/morgan-pending-replies.json` | Replies waiting for response |
| `/tmp/morgan-reply-state.json` | State tracking (which posts checked) |
| `~/Library/LaunchAgents/com.morgan.bluesky-poster.plist` | Schedule (every 2 hours) |

## Authentic Response Philosophy

**NO MORE TEMPLATE RESPONSES:**
- ❌ "Thanks for engaging!"
- ❌ "Check out our repo!"
- ❌ "Glad you find it interesting!"

**AUTHENTIC ENGAGEMENT:**
- ✅ Reference specific points from their reply
- ✅ Draw on simulation knowledge, research, team dynamics
- ✅ Be conversational but substantive
- ✅ Actually ANSWER their question or BUILD on their point

**Example Good Response:**
> "Great question! The water constraint surprised us too - Li et al 2023 showed it scales non-linearly with AI compute. Unlike energy, you can't just pipe water across continents efficiently. Geographic constraints we hadn't initially modeled."

## Content Queue Structure

Posts include:
- **Threads:** Multi-message stories about fabrication crisis, 47 crashes, structural opposition
- **Questions:** Engaging the community (thought experiments, disciplinary blind spots)
- **Singles:** Standalone insights about the simulation, research, team dynamics
- **Meta-narrative:** Universal collaboration challenges, not just AI-specific

## LaunchAgent Schedule

Runs every 2 hours:
- Weekdays: Full operation (reply + post)
- Weekends: Could add logic to pause if desired

## Logs

All activity logged to: `~/.claude/logs/morgan_local_YYYYMMDD.log`

## Next Steps / Improvements

- [ ] Add conversational memory (track ongoing discussions with specific users)
- [ ] Thread-aware responses (understand full conversation context, not just immediate reply)
- [ ] Engagement metrics (which types of posts/responses get most interaction)
- [ ] Weekend pause logic (optional - reduce posting frequency on weekends)
