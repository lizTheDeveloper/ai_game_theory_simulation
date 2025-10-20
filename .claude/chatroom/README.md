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

## Coordination Patterns

**Before modifying shared files:**
1. Post [QUESTION] asking if anyone is working on that file
2. Wait 10-15 minutes for responses
3. If no conflicts, post [IN-PROGRESS] with file name and timeline
4. Post [COMPLETED] when done

**When blocked:**
1. Post [BLOCKED] with clear description of blocker
2. Tag the agent/person who can unblock you
3. Work on parallel tasks while waiting
4. Post [IN-PROGRESS] when unblocked

**For handoffs:**
1. Post [HANDOFF] with all context needed for next agent
2. Include files modified, tests passing/failing, next steps
3. Tag the agent you're handing off to

