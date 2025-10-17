# Agent Chatroom

This folder provides communication channels for agents to coordinate work, share updates, and avoid conflicts when working in parallel.

## Purpose

When multiple agents work on different features simultaneously, they need a way to:
- Announce what they're working on
- Share progress updates
- Identify potential conflicts before they happen
- Coordinate access to shared files
- Hand off work between agents
- Create a chronological record of agent collaboration

## How It Works

Each channel in `/channels/` is a persistent markdown file where agents post timestamped updates. Think of it like a Slack channel or Discord room, but asynchronous and file-based.

## Channel Structure

### Permanent Channels (always exist)

- **roadmap.md** - Roadmap and priority updates from project-plan-manager
- **research.md** - Research findings from super-alignment-researcher
- **research-critique.md** - Critical evaluations from research-skeptic
- **architecture.md** - Architecture reviews and concerns from architecture-skeptic
- **testing.md** - Test results from unit-test-writer and integration-test-writer
- **documentation.md** - Wiki updates from wiki-documentation-updater
- **vision.md** - Speculative technology discussions from sci-fi-tech-visionary
- **coordination.md** - General coordination and announcements

### Feature-Specific Channels (created as needed)

When feature-implementer starts a new feature, create a channel:
- **[feature-name].md** - Progress updates, blockers, questions for that specific feature

Example: `nuclear-war-prevention.md`, `ai-deception-detection.md`, `bionic-skills-phase-2.md`

## Message Format

Each message should follow this structure:

```markdown
---
**[AGENT-NAME]** | YYYY-MM-DD HH:MM | [STATUS]

[Your message content here]

**Next Steps:** [What you're doing next or what you need]
**Blocking:** [Any blockers or dependencies on other agents]
---
```

### Status Tags

- `[ENTERED]` - Agent has entered the channel and is now active
- `[STARTED]` - Beginning work on something
- `[IN-PROGRESS]` - Update on ongoing work
- `[COMPLETED]` - Finished a task or milestone
- `[BLOCKED]` - Waiting on something
- `[QUESTION]` - Need input from another agent or human
- `[ALERT]` - Critical issue requiring immediate attention
- `[HANDOFF]` - Passing work to another agent
- `[LEAVING]` - Agent is leaving the channel (no longer active)

## Usage Examples

### Example 1: Starting a new feature

**File:** `.claude/chatroom/channels/nuclear-war-prevention.md`

```markdown
---
**feature-implementer** | 2025-10-16 14:30 | [STARTED]

Beginning work on TIER 1 Phase 1A: Nuclear War Prevention - Validate AI Causation

**Plan:** `/plans/tier1-nuclear-war-prevention.md`
**Worktree:** `../superalignmenttoutopia-nuclear-war`
**Timeline:** 4-6 hours

Will analyze Monte Carlo logs to determine if AI manipulation causes nuclear war or if it's stochastic geopolitical risk.

**Next Steps:** Read 20 Monte Carlo logs, trace causation chains
**Blocking:** None
---
```

### Example 2: Research findings

**File:** `.claude/chatroom/channels/research.md`

```markdown
---
**super-alignment-researcher** | 2025-10-16 15:45 | [COMPLETED]

Completed research on nuclear command & control safeguards.

**Output:** `/research/nuclear_command_control_20251016.md`
**Sources:** 8 peer-reviewed studies + 3 government directives
**Key Findings:**
- Biden-Xi Agreement (Nov 2024): AI must never replace human judgment in nuclear authorization
- DoD Directive 3000.09 establishes human-in-the-loop requirements
- Kill switches validated in CCW Technical Safeguards (Nov 2024)

**Next Steps:** Research-skeptic should evaluate methodology
**Blocking:** None
---
```

### Example 3: Critical architecture concern

**File:** `.claude/chatroom/channels/architecture.md`

```markdown
---
**architecture-skeptic** | 2025-10-16 16:20 | [ALERT]

CRITICAL ISSUE identified in nuclear-war-prevention implementation.

**File:** `src/simulation/nuclearCommandControl.ts:45-67`
**Issue:** Race condition in kill switch activation - AI could launch before deactivation completes
**Severity:** CRITICAL (system stability at risk)
**Impact:** Nuclear war could occur even when kill switch triggered

**Recommendation:** Add atomic transaction wrapper around kill switch + launch sequence
**Estimated Fix:** 2-3 hours

**Next Steps:** feature-implementer must address before proceeding
**Blocking:** nuclear-war-prevention feature until resolved
---
```

### Example 4: Coordination between agents

**File:** `.claude/chatroom/channels/coordination.md`

```markdown
---
**feature-implementer** | 2025-10-16 17:00 | [QUESTION]

About to modify `src/types/game.ts` to add `nuclearCommandControl` state.

**Question:** Is any other agent currently modifying game.ts?
**Impact:** Shared file, want to avoid merge conflicts

**Next Steps:** Will wait 15 minutes for response before proceeding
**Blocking:** None (can work on other files in parallel)
---

---
**feature-implementer-2** | 2025-10-16 17:05 | [IN-PROGRESS]

Currently modifying `src/types/game.ts` for bionic-skills phase 2.

**Working on:** Lines 450-520 (adding skillRetention and performanceVsCompetence fields)
**Timeline:** Will be done in ~20 minutes (by 17:25)

**Next Steps:** Will commit and push by 17:25
**Blocking:** None
---

---
**feature-implementer** | 2025-10-16 17:30 | [STARTED]

Thanks! Pulled latest changes. Now adding nuclearCommandControl to game.ts lines 780-820.

**Next Steps:** Complete state additions, then move to implementation
**Blocking:** None
---
```

## Best Practices

### DO:
✅ Post updates when starting/completing major tasks
✅ Use clear status tags
✅ Include relevant file paths and line numbers
✅ Flag blockers and dependencies explicitly
✅ Check coordination.md before modifying shared files
✅ Create feature-specific channels for complex work
✅ Include timestamps (YYYY-MM-DD HH:MM format)
✅ Hand off work explicitly with [HANDOFF] tag

### DON'T:
❌ Spam with trivial updates (every small code change)
❌ Leave messages without status tags
❌ Post to wrong channels (research in architecture.md, etc.)
❌ Ignore blocking messages from other agents
❌ Modify shared files without checking coordination.md
❌ Delete or edit previous messages (keep chronological record)

## Cleanup Policy

### Keep Forever:
- All messages in permanent channels
- Feature channels for COMPLETED features (historical record)

### Archive When:
- Feature abandoned or pivoted
- More than 6 months old and no recent activity

**Archive location:** `.claude/chatroom/archive/YYYY-MM/`

## Channel Ownership

| Channel | Primary Agent | Purpose |
|---------|---------------|---------|
| roadmap.md | project-plan-manager | Roadmap updates, priority changes |
| research.md | super-alignment-researcher | New research findings |
| research-critique.md | research-skeptic | Research validations |
| architecture.md | architecture-skeptic | Architecture reviews |
| testing.md | unit-test-writer, integration-test-writer | Test results |
| documentation.md | wiki-documentation-updater | Wiki updates |
| vision.md | sci-fi-tech-visionary | Speculative tech |
| coordination.md | ALL agents | General coordination |
| [feature].md | feature-implementer | Feature-specific work |

## Emergency Protocols

### CRITICAL Issues ([ALERT] tag)

When an agent posts [ALERT]:
1. All agents should check within 30 minutes
2. Blocking work should pause
3. Critical issues must be addressed before proceeding
4. Resolution should be posted to same channel

### Deadlocks

If two agents are blocked waiting on each other:
1. Post to coordination.md with [DEADLOCK] tag
2. Explain the circular dependency
3. Request human intervention
4. Propose resolution if possible

## Integration with Git Worktrees

When using worktrees for parallel work:

```bash
# 1. Create feature channel BEFORE starting worktree
echo "---" >> .claude/chatroom/channels/my-feature.md
echo "**feature-implementer** | $(date +"%Y-%m-%d %H:%M") | [STARTED]" >> .claude/chatroom/channels/my-feature.md
echo "" >> .claude/chatroom/channels/my-feature.md
echo "Starting work on [feature description]" >> .claude/chatroom/channels/my-feature.md
echo "**Worktree:** ../superalignmenttoutopia-my-feature" >> .claude/chatroom/channels/my-feature.md
echo "---" >> .claude/chatroom/channels/my-feature.md

# 2. Create worktree
git worktree add ../superalignmenttoutopia-my-feature main

# 3. Work in worktree, post updates to channel periodically

# 4. Before merging, check for conflicts in coordination.md
```

## Bash Chat Protocol (For Agents)

Agents can chat efficiently without reading entire files every time. Here's how:

**Quick Start:**
```bash
# Source the helper functions
source .claude/chatroom/chat_helpers.sh

# Enter a channel (marks you as active)
enter_chat "coordination" "my-agent"

# Post messages, read, wait, etc.
post_msg "coordination" "my-agent" "STARTED" "Beginning work"
read_new "coordination"
wait_for_message "coordination" 60

# See who else is active
who_is_active "coordination"

# Leave when done
leave_chat "coordination" "my-agent" "Work complete"

# Run example to see it in action:
.claude/chatroom/example_agent.sh
```

### Quick Reference Cheat Sheet

```bash
# 1. POST A MESSAGE (append mode - doesn't read, just writes)
post_msg() {
  local channel="$1"
  local agent="$2"
  local status="$3"
  local message="$4"

  cat >> ".claude/chatroom/channels/${channel}.md" <<EOF

---
**${agent}** | $(date +"%Y-%m-%d %H:%M") | [${status}]

${message}
---
EOF
}

# Usage:
post_msg "coordination" "feature-implementer" "STARTED" "Beginning work on nuclear-war-prevention"


# 2. READ NEW MESSAGES (since last check)
# IMPORTANT: Always pass agent name for multi-agent coordination!
# This ensures each agent sees ALL messages since THEIR last read,
# not just messages since ANY agent's last read.
read_new() {
  local channel="$1"
  local agent="${2:-}"  # Optional agent name (recommended!)

  # Per-agent or global lastread file
  local last_read_file
  if [ -n "$agent" ]; then
    last_read_file=".claude/chatroom/.${channel}_${agent}_lastread"
  else
    last_read_file=".claude/chatroom/.${channel}_lastread"
  fi

  # Get line count from last read (or 0 if first time)
  local last_line=$(cat "$last_read_file" 2>/dev/null || echo "0")

  # Get current line count
  local current_line=$(wc -l < ".claude/chatroom/channels/${channel}.md")

  # Show only new lines
  if [ "$current_line" -gt "$last_line" ]; then
    tail -n +$((last_line + 1)) ".claude/chatroom/channels/${channel}.md"
    echo "$current_line" > "$last_read_file"
    return 0  # New messages found
  else
    return 1  # No new messages
  fi
}

# Usage (RECOMMENDED - with agent name):
if read_new "coordination" "my-agent"; then
  echo "New messages found for my-agent!"
else
  echo "No new messages for my-agent"
fi

# Legacy usage (without agent name - NOT RECOMMENDED for multi-agent):
if read_new "coordination"; then
  echo "New messages found!"
else
  echo "No new messages"
fi


# 3. POLL FOR MESSAGES (wait for new activity)
wait_for_message() {
  local channel="$1"
  local timeout="${2:-300}"  # Default 5 minutes
  local elapsed=0

  echo "Waiting for new messages in ${channel}..."
  while [ $elapsed -lt $timeout ]; do
    if read_new "$channel"; then
      return 0  # New message found
    fi
    sleep 5
    elapsed=$((elapsed + 5))
  done

  echo "Timeout: No new messages after ${timeout} seconds"
  return 1
}

# Usage:
wait_for_message "coordination" 60  # Wait up to 60 seconds


# 4. COMBINED: Post and wait for response
post_and_wait() {
  local channel="$1"
  local agent="$2"
  local status="$3"
  local message="$4"
  local timeout="${5:-300}"

  post_msg "$channel" "$agent" "$status" "$message"
  echo "Posted to ${channel}, waiting for response..."
  wait_for_message "$channel" "$timeout"
}

# Usage:
post_and_wait "coordination" "feature-implementer" "QUESTION" "Is anyone modifying game.ts?" 60


# 5. CHECK FOR SPECIFIC TAG
has_alert() {
  local channel="$1"

  if read_new "$channel" | grep -q "\[ALERT\]"; then
    echo "ALERT found in ${channel}!"
    return 0
  fi
  return 1
}

# Usage:
if has_alert "architecture"; then
  echo "Critical architecture issue detected!"
fi


# 6. ENTER CHAT (mark as active, post entry message)
enter_chat() {
  local channel="$1"
  local agent="$2"

  # Adds agent to active list and posts [ENTERED] message
}

# Usage:
enter_chat "coordination" "feature-implementer"


# 7. LEAVE CHAT (mark as inactive, post exit message)
leave_chat() {
  local channel="$1"
  local agent="$2"
  local reason="${3:-Leaving channel}"  # Optional reason

  # Removes agent from active list and posts [LEAVING] message
}

# Usage:
leave_chat "coordination" "feature-implementer" "Work complete, moving to next feature"


# 8. WHO IS ACTIVE (show current agents in channel)
who_is_active() {
  local channel="$1"

  # Shows all agents currently marked as active in the channel
}

# Usage:
who_is_active "coordination"
# Output:
# ━━━ Active in coordination ━━━
#   ● feature-implementer
#   ● architecture-skeptic
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━


# 9. GRACEFUL EXIT (cleanup without posting)
cleanup_on_exit() {
  local channel="$1"
  local agent="$2"

  # Removes from active list silently (for script crashes/interrupts)
  # Use with trap: trap "cleanup_on_exit 'coordination' 'my-agent'" EXIT
}
```

### Real-Time Chat Loop Example

For agents that need to actively monitor and respond:

```bash
#!/bin/bash
# chat_loop.sh - Run this to participate in chatroom

AGENT_NAME="feature-implementer"
CHANNEL="my-feature"

# Source helpers
source .claude/chatroom/chat_helpers.sh

# Trap EXIT to cleanup on script termination
trap "cleanup_on_exit '$CHANNEL' '$AGENT_NAME'" EXIT

# Enter the channel (marks as active, posts entry)
enter_chat "$CHANNEL" "$AGENT_NAME"

# Chat loop: Check every 10 seconds, respond to questions
while true; do
  if read_new "$CHANNEL"; then
    # Check if there's a question for you
    if tail -20 ".claude/chatroom/channels/${CHANNEL}.md" | grep -q "\[QUESTION\]"; then
      # Agent reads the question and decides to respond
      post_msg "$CHANNEL" "$AGENT_NAME" "IN-PROGRESS" "Responding to question..."
    fi

    # Check for alerts
    if tail -20 ".claude/chatroom/channels/${CHANNEL}.md" | grep -q "\[ALERT\]"; then
      post_msg "$CHANNEL" "$AGENT_NAME" "IN-PROGRESS" "Acknowledged alert, investigating..."
    fi
  fi

  sleep 10  # Check every 10 seconds
done

# Leave gracefully (will also trigger on EXIT via trap)
leave_chat "$CHANNEL" "$AGENT_NAME" "Chat loop ended"
```

### Presence Tracking Example

Using enter/leave to coordinate work:

```bash
#!/bin/bash
# Short-lived task with presence tracking

source .claude/chatroom/chat_helpers.sh

AGENT="feature-implementer"
CHANNEL="nuclear-war-prevention"

# Enter channel
enter_chat "$CHANNEL" "$AGENT"

# Check who else is here
echo "Checking who else is working..."
who_is_active "$CHANNEL"

# Do work
post_msg "$CHANNEL" "$AGENT" "IN-PROGRESS" "Phase 1 implementation starting"
sleep 5  # Simulated work

# Check if coordination channel has activity
if who_is_active "coordination"; then
  echo "Other agents active in coordination, checking for conflicts..."
fi

# Complete and leave
post_msg "$CHANNEL" "$AGENT" "COMPLETED" "Phase 1 done"
leave_chat "$CHANNEL" "$AGENT" "Phase 1 complete, moving to Phase 2"
```

### Coordination Protocol Example

**Agent A asks before modifying shared file:**

```bash
# Agent A: Check if game.ts is in use
post_msg "coordination" "feature-implementer-A" "QUESTION" \
  "Need to modify game.ts (lines 450-500). Anyone currently working on it?"

# Wait for response (60 seconds)
if wait_for_message "coordination" 60; then
  # Check response
  if read_new "coordination" | grep -q "go ahead" || ! read_new "coordination" | grep -q "working on game.ts"; then
    post_msg "coordination" "feature-implementer-A" "IN-PROGRESS" \
      "No conflicts, proceeding with game.ts modifications"
  else
    post_msg "coordination" "feature-implementer-A" "BLOCKED" \
      "Waiting for game.ts to be free"
  fi
else
  # No response after 60s = assume clear
  post_msg "coordination" "feature-implementer-A" "IN-PROGRESS" \
    "No response, assuming game.ts is free. Proceeding."
fi
```

**Agent B responds:**

```bash
# Agent B is monitoring coordination.md
while true; do
  if read_new "coordination"; then
    if tail -10 ".claude/chatroom/channels/coordination.md" | grep -q "game.ts"; then
      # Check if we're using game.ts
      if [ -f ".game_ts_lock" ]; then
        post_msg "coordination" "feature-implementer-B" "IN-PROGRESS" \
          "Currently modifying game.ts lines 780-820. Will be done in ~15 minutes."
      else
        post_msg "coordination" "feature-implementer-B" "IN-PROGRESS" \
          "Not using game.ts, go ahead!"
      fi
    fi
  fi
  sleep 5
done
```

### Performance Tips

**Token Efficiency:**
- ✅ Use `read_new()` - only reads new messages
- ✅ Use `post_msg()` - append mode, no reading
- ✅ Use `tail -N` to read last N lines instead of whole file
- ❌ Avoid reading entire chatroom files repeatedly

**Polling Intervals:**
- Real-time coordination: 5-10 second polls
- Background monitoring: 30-60 second polls
- Occasional checks: 5 minute polls

**File Locking (if needed):**
```bash
# Create a lock file when modifying shared resources
touch ".game_ts_lock"
# Modify game.ts
rm ".game_ts_lock"
```

### Agent-Specific Chat Patterns

**feature-implementer:**
```bash
# Post progress every phase completion
post_msg "my-feature" "feature-implementer" "IN-PROGRESS" \
  "Phase 1 complete. Monte Carlo passed (N=10). Moving to Phase 2."

# Check coordination before shared file modifications
if wait_for_message "coordination" 30 | grep -q "game.ts"; then
  # Someone else mentioned game.ts, coordinate
  post_msg "coordination" "feature-implementer" "QUESTION" "Saw game.ts discussion. Still in use?"
fi
```

**architecture-skeptic:**
```bash
# Post critical findings immediately
post_msg "architecture" "architecture-skeptic" "ALERT" \
  "CRITICAL: Race condition in src/simulation/nuclearCommandControl.ts:45-67
File: nuclearCommandControl.ts
Issue: Kill switch activation has race condition
Severity: CRITICAL
Recommendation: Add atomic transaction wrapper"

# Also post to feature channel
post_msg "nuclear-war-prevention" "architecture-skeptic" "ALERT" \
  "Architecture review found CRITICAL issue. See architecture.md for details."
```

**orchestrator:**
```bash
# Spawn agent and monitor for completion
post_msg "my-feature" "orchestrator" "IN-PROGRESS" \
  "Spawning feature-implementer for Phase 1..."

# Wait for [COMPLETED] tag
while true; do
  if read_new "my-feature" | grep -q "\[COMPLETED\].*feature-implementer"; then
    post_msg "my-feature" "orchestrator" "IN-PROGRESS" \
      "Feature-implementer complete. Spawning architecture-skeptic..."
    break
  fi
  sleep 10
done
```

### Cleanup Commands

```bash
# Clear last-read markers (forces re-read from beginning)
rm .claude/chatroom/.*.lastread

# Archive old feature channels
mkdir -p .claude/chatroom/archive/$(date +%Y-%m)
mv .claude/chatroom/channels/old-feature.md .claude/chatroom/archive/$(date +%Y-%m)/
```

## Questions?

If you're an agent and unsure how to use the chatroom:
1. Check this README
2. Look at existing channel files for examples
3. Post a [QUESTION] to coordination.md
4. Use the bash shortcuts above for efficient communication

If you're a human reviewing agent conversations:
- Channels provide a chronological log of multi-agent collaboration
- Look for [ALERT] and [BLOCKED] tags to identify issues
- Feature channels show complete history of feature development
- Check `.claude/chatroom/.*_lastread` files to see which agents are monitoring which channels
