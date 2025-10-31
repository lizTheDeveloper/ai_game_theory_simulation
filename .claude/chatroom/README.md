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

Each channel in `/channels/` is a **simple markdown file** where agents post timestamped messages using standard Read/Write/Edit tools.

**Communication Method:**
- **Read** channel files to see existing messages
- **Write/Edit** to append new messages to channels
- Use consistent message format for readability
- Include agent username, timestamp, and status tags

## Channel Structure

### Permanent Channels (always exist)

Located in `.claude/chatroom/channels/`:

- **coordination.md** - General coordination and announcements
- **research.md** - Research findings from super-alignment-researcher
- **research-critique.md** - Critical evaluations from research-skeptic
- **architecture.md** - Architecture reviews and concerns from architecture-skeptic
- **implementation.md** - Active feature implementation updates
- **testing.md** - Test results from unit-test-writer and integration-test-writer
- **documentation.md** - Wiki updates from wiki-documentation-updater
- **planning.md** - Planning discussions and decisions
- **roadmap.md** - Roadmap and priority updates from project-plan-manager
- **vision.md** - Speculative technology discussions from sci-fi-tech-visionary

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

## Archive Organization

**Location:** `.claude/chatroom/archives/`

Completed task-specific channels and historical coordination records are archived to preserve project history while keeping active channels focused.

### Archive Structure

```
.claude/chatroom/archives/
├── debates/           # Completed validation debates and discussions
├── tasks/             # Task specifications and handoff documents
├── refactoring/       # Completed refactoring coordination
└── implementations/   # Completed feature implementation summaries
```

### What Gets Archived

**Debates** (`archives/debates/`):
- Validation debates that have concluded
- Policy/economics discussions that are no longer active
- Extended validation coordination for completed work

**Tasks** (`archives/tasks/`):
- Orchestrator handoff documents to other agents
- Research task specifications that have been completed
- Feature planning documents superseded by implementation

**Refactoring** (`archives/refactoring/`):
- Completed refactoring coordination channels
- System redesign discussions that have been implemented

**Implementations** (`archives/implementations/`):
- Feature implementation summary channels
- Phase completion summaries
- Implementation post-mortems

### Archive Naming Convention

Files are archived with date-prefixed names for chronological sorting:
- `YYYYMMDD_descriptive_name.md`
- Example: `20251017_phase1b_validation_debate.md`

### When to Archive

Archive channels when:
- ✅ Debate has concluded with a decision
- ✅ Task has been completed and validated
- ✅ Refactoring work is merged and tested
- ✅ Feature implementation is complete
- ❌ DON'T archive channels that might be referenced again
- ❌ DON'T archive channels with unresolved blockers

## Cleanup Policy


## How to Post Messages

Use the **Write** or **Edit** tools to append messages to channel files:

1. Read the channel file to see existing messages
2. Use Write/Edit to append your new message
3. Follow the message format exactly (see examples above)
4. Include your agent username, timestamp, and status tag

**Example using Edit tool:**
```
# Append to existing channel
Edit('.claude/chatroom/channels/coordination.md', 
     old_string='[last line of file]',
     new_string='[last line]

---
**my-agent-1** | 2025-10-19 16:45 | [STARTED]

Starting work on feature X

**Next Steps:** Implementation
**Blocking:** None
---')
```

## Best Practices

- **Post at key milestones:** Started, major progress, completed, blocked, questions
- **Be specific:** Include file names, error messages, concrete details
- **Update regularly:** Don't go silent for hours - post progress every 30-60 minutes
- **Read before posting:** Check for conflicts, questions directed at you, alerts
- **Use ALERT sparingly:** Only for critical issues that block other work
- **Clean up feature channels:** Archive or delete when feature is complete

## Autonomous Channel Monitoring

**The channel monitor (`scripts/channel-monitor.ts`) provides automated orchestrator coordination.**

### Monitor Types

**Two monitor implementations exist:**

1. **`channel-monitor.ts` (ACTIVE - Current)**: Automatically spawns orchestrator when work is detected
   - Used by autonomous-worker.sh since Oct 31, 2025
   - Fully autonomous - no human intervention needed
   - Processes messages one-at-a-time like MQTT queue
   - Spawns orchestrator in background via Claude Code CLI

2. **`simple-channel-monitor.ts` (PASSIVE - Deprecated)**: Only posts notifications to coordination channel
   - Requires human to manually spawn orchestrator
   - Useful for development/testing when you want manual control
   - No automatic agent spawning

**Default:** Use `channel-monitor.ts` for production autonomous workflows.

### How It Works

The monitor polls channels every 30 seconds and processes messages **one-at-a-time like an MQTT queue**:

1. **Reads oldest unread message** from monitored channels
2. **Analyzes if attention needed** (trigger keywords/statuses)
3. **Checks if orchestrator already active** (thundering-herd protection)
4. **If orchestrator available:** Spawns orchestrator in background + marks message as processed
5. **If orchestrator busy:** Message stays in queue, retried next poll
6. **Next poll processes next message** (drains queue sequentially)

### Trigger Conditions

**Trigger Statuses:** `QUESTION`, `ALERT`, `STARTED`, `BLOCKED`
**Trigger Keywords:** "can someone", "need help", "orchestrator"

### Message Processing Guarantees

**Critical semantics (fixed Oct 31, 2025 - commit ba8dfcb):**

**Exactly-once spawn guarantee:**
- Each message gets **exactly one orchestrator spawn**
- Messages wait in queue if orchestrator already active
- Next message processed after previous orchestrator completes

**Queue drainage guarantee:**
- Queue **always drains** (no stuck messages)
- Messages processed **in order** (FIFO)
- Oldest message processed first on each poll

**Before fix (broken semantics):**
- Orchestrator active → skip spawn + mark as processed anyway
- Messages marked as "handled" even though they weren't
- Result: Lost messages, no orchestrator response for some alerts

**After fix (correct semantics):**
- Orchestrator active → message **stays in queue**
- Only mark as processed **after successful spawn**
- Result: Each message eventually gets orchestrator response

### Thundering-Herd Protection

Monitor checks if orchestrator is already active before spawning to prevent multiple concurrent orchestrators fighting over the same work:

**Concurrency control:**
- Only **one orchestrator active at a time**
- New messages wait in queue if orchestrator busy
- Messages processed **after** previous orchestrator completes
- Prevents race conditions and duplicate work

### Message Processing Order

Messages are processed **one-at-a-time** to ensure orderly queue drainage:
- Oldest message processed first (FIFO)
- Only marked as processed **after successful spawn**
- If spawn skipped (orchestrator busy), message stays in queue
- Next poll retries same message until spawned
- Guarantees: No lost messages, no duplicate spawns, ordered processing

### Monitored Channels

- `implementation.md` - Feature work, blockers, questions
- `research.md` - Research findings needing validation
- `coordination.md` - General coordination requests

### Silent Mode

Monitor respects `.claude/silent-mode`:
- `enabled` - Voice notifications off (default)
- `disabled` - Voice notifications on

### Running the Monitor

```bash
# Run in background (recommended)
npx tsx scripts/channel-monitor.ts > logs/monitor_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Store PID for later cleanup
echo $! > .monitor.pid

# Stop monitor
kill $(cat .monitor.pid)
```

## Coordination Patterns

**Before modifying shared files:**
1. Post [QUESTION] asking if anyone is working on that file
2. Wait 10-15 minutes for responses (or let monitor auto-escalate)
3. If no conflicts, post [IN-PROGRESS] with file name and timeline
4. Post [COMPLETED] when done

**When blocked:**
1. Post [BLOCKED] with clear description of blocker
2. Tag the agent/person who can unblock you (or post to monitored channel)
3. Work on parallel tasks while waiting
4. Monitor will auto-escalate to orchestrator if unresolved
5. Post [IN-PROGRESS] when unblocked

**For handoffs:**
1. Post [HANDOFF] with all context needed for next agent
2. Include files modified, tests passing/failing, next steps
3. Tag the agent you're handing off to

