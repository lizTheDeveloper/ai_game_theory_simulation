# Channel Monitoring Agent System - Implementation Plan

## Overview

Build a system for spawning domain-specific agents to monitor chatroom channels and respond to requests, with built-in thundering-herd protection to prevent duplicate agent spawns.

## Problem Statement

We need agents (researchers, maintainers, etc.) to monitor specific channels for work requests and respond automatically. However, naively spawning agents can create a "thundering herd" problem where multiple instances run simultaneously, wasting resources and creating race conditions.

## Solution Architecture

### 1. Named Agent Identities

Each monitoring agent receives a **stable identity** that persists across spawns:

- `researcher-001` - Monitors research channel for academic research requests
- `maintainer-001` - Monitors implementation channel for simulation code issues
- `skeptic-001` - Monitors review channel for architecture critiques
- `ux-designer-001` - Monitors design channel for UI/dashboard requests

**Benefits:**
- Per-identity message tracking (won't re-process same messages)
- Clear accountability ("who posted this?")
- Easy to check if specific agent is already active

### 2. Thundering-Herd Protection

**Pre-Spawn Check:**
```typescript
const active = await mcp__chatroom__chatroom_who_active({
  channel: "research"
});

if (active.includes("researcher-001")) {
  console.log("⚠️ researcher-001 already active - skipping spawn");
  return;
}

// Safe to spawn - no duplicate exists
await Task({
  subagent_type: "super-alignment-researcher",
  description: "Monitor research channel",
  prompt: "Identity: researcher-001\n\n[protocol...]"
});
```

### 3. Agent Self-Registration Protocol

Every monitoring agent MUST follow this lifecycle:

**MANDATORY FIRST STEP:**
```typescript
await mcp__chatroom__chatroom_enter({
  channel: "research",
  agent: "researcher-001",
  message: "Monitoring for research requests"
});
```

**WORK PHASE:**
```typescript
// Check for new messages
const newMessages = await mcp__chatroom__chatroom_read_new({
  channel: "research",
  agent: "researcher-001"
});

// Process and respond
await mcp__chatroom__chatroom_post({
  channel: "research",
  agent: "researcher-001",
  status: "IN-PROGRESS",
  message: "Investigating research question..."
});
```

**MANDATORY LAST STEP:**
```typescript
await mcp__chatroom__chatroom_leave({
  channel: "research",
  agent: "researcher-001",
  reason: "Work completed - all questions addressed"
});
```

### 4. Smart Retry & Turn Limit Handling

**Problem:** Agents can run out of turns mid-work, leaving tasks incomplete.

**Solution: Checkpoint Pattern**

Agents post progress checkpoints to the channel before running out of turns:

```typescript
// Agent detects low turn count or complex work ahead
await mcp__chatroom__chatroom_post({
  channel: "research",
  agent: "researcher-001",
  status: "IN-PROGRESS",
  message: "CHECKPOINT: Completed literature search (5 papers found). Next: Extract parameters from findings."
});
```

**Orchestrator Retry Logic:**

```typescript
async function checkForIncompleteWork(channel: string, agentId: string) {
  const recentMessages = await mcp__chatroom__chatroom_peek({
    channel,
    lines: 20
  });

  // Look for agent that posted IN-PROGRESS but never posted COMPLETED
  const hasCheckpoint = recentMessages.includes(`${agentId}: CHECKPOINT`);
  const hasCompletion = recentMessages.includes(`${agentId} left channel`);

  if (hasCheckpoint && !hasCompletion) {
    console.log(`⚠️ ${agentId} has incomplete work, spawning continuation`);

    // Respawn with context of previous work
    await Task({
      subagent_type: getAgentType(agentId),
      description: `Continue ${agentId} work`,
      prompt: `You are ${agentId} (continued session).

Your previous session was interrupted. Read the channel history to see what you already completed:
- Enter channel with your ID
- Use chatroom_read_new to catch up
- Find your last CHECKPOINT message
- Continue from where you left off
- Post summary when done`
    });
  }
}
```

**Agent Prompt Addition:**
```markdown
## Turn Limit Awareness

You are running in HEADLESS MODE with limited turns.

**If you detect you're approaching turn limits:**
1. Post CHECKPOINT with progress summary
2. Leave channel with reason: "Turn limit - work incomplete"
3. Orchestrator will respawn you to continue

**Signs you're running low:**
- Complex task with many steps remaining
- Need to read many files or run long processes
- Over 10 tool calls already made
```

### 5. Work Review & Off-Rails Detection

**Problem:** Autonomous agents might go off-rails, make mistakes, or take unwanted actions.

**Solution: Review Channel + Mandatory Summary**

Every agent must post a work summary before leaving:

```typescript
await mcp__chatroom__chatroom_post({
  channel: "research",
  agent: "researcher-001",
  status: "COMPLETED",
  message: `WORK SUMMARY:

**Task:** Find research on carbon capture scaling timelines

**Actions Taken:**
- Searched 3 academic databases
- Found 5 peer-reviewed papers (2024-2025)
- Extracted key parameters: 10-20 year scale-up timeline
- Posted findings to research/carbon_capture_20251028.md

**Files Created/Modified:**
- research/carbon_capture_20251028.md (NEW)

**No destructive actions taken.**

**Ready for review.**`
});

// Then leave
await mcp__chatroom__chatroom_leave({
  channel: "research",
  agent: "researcher-001",
  reason: "Work completed - awaiting review"
});
```

**Review Flow:**

```typescript
// Orchestrator or human reviews work
const summary = extractWorkSummary(channelMessages, "researcher-001");

// Check for red flags
const redFlags = detectRedFlags(summary);
if (redFlags.length > 0) {
  console.log("🚨 RED FLAGS DETECTED:");
  redFlags.forEach(flag => console.log(`  - ${flag}`));

  // Option 1: Rollback
  await rollbackAgentWork(summary.filesModified);

  // Option 2: Spawn reviewer
  await safeSpawnAgent("architecture-skeptic", "reviewer-001", "review",
    `Review the work done by researcher-001. Summary: ${summary}`);
}
```

**Red Flag Detection:**
- Modified files outside expected scope
- Ran destructive bash commands (rm, push --force)
- Created many files (potential spam)
- Changed critical config files
- Pushed to git without approval

### 6. Headless Mode & Permission Handling

**Problem:** Autonomous agents need elevated permissions but must be aware they're running without human oversight.

**Solution: Explicit Headless Mode Flag + Restricted Operations**

#### Agent Spawn Configuration

```typescript
await Task({
  subagent_type: "simulation-maintainer",
  description: "Fix NaN bug autonomously",
  prompt: `You are maintainer-001 running in HEADLESS AUTONOMOUS MODE.

**IMPORTANT: You are running with elevated permissions (dangerouslyDisableSandbox: true) but WITHOUT human oversight.**

**RESTRICTIONS:**
- ✅ CAN: Read files, write fixes, run tests, commit changes
- ❌ CANNOT: Push to remote, delete files, modify CI/CD, change dependencies
- ⚠️ MUST: Double-check all bash commands before execution
- ⚠️ MUST: Post work summary before leaving

**Terminal Action Protocol:**
Before ANY potentially destructive action:
1. Post to channel: "ABOUT TO: [action description]"
2. Wait 5 seconds (allows human override if monitoring)
3. Execute
4. Post result: "COMPLETED: [action description]"

**Your task:** Fix NaN bug in ecology phase reported in channel.`,
  model: "sonnet" // Appropriate model for autonomous work
});
```

#### Settings Configuration

In `.claude/settings.local.json`, add hooks for autonomous agents:

```json
{
  "hooks": {
    "before_bash": {
      "command": "bash .claude/hooks/check-dangerous-command.sh \"$BASH_COMMAND\""
    }
  }
}
```

#### Safety Hook Implementation

`.claude/hooks/check-dangerous-command.sh`:

```bash
#!/bin/bash

COMMAND="$1"

# Destructive patterns that require approval
DANGEROUS_PATTERNS=(
  "rm -rf"
  "git push --force"
  "git push -f"
  "drop database"
  "DROP TABLE"
  "> /dev/sda"
  "mkfs"
  "dd if="
  "chmod -R 777"
  "npm publish"
  "cargo publish"
)

# Check if command matches dangerous pattern
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo "🚨 BLOCKED: Dangerous command detected: $COMMAND"
    echo "Pattern matched: $pattern"
    echo "This requires human approval."
    exit 1
  fi
done

# Warning patterns (allow but warn)
WARNING_PATTERNS=(
  "git push"
  "npm install"
  "rm "
  "mv "
)

for pattern in "${WARNING_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo "⚠️ WARNING: Potentially sensitive command: $COMMAND"
    echo "Executing in 2 seconds (Ctrl+C to cancel)..."
    sleep 2
    break
  fi
done

exit 0
```

#### Autonomous Agent Prompt Template

```markdown
# AUTONOMOUS MODE INSTRUCTIONS

You are {AGENT_ID} running in **HEADLESS AUTONOMOUS MODE**.

## Permission Level
- **Sandbox:** DISABLED (dangerouslyDisableSandbox: true)
- **Oversight:** NONE (no human monitoring)
- **Approval:** SELF-APPROVED (within restrictions)

## What This Means

**You CAN:**
- Read any file in the repository
- Write code fixes to existing files
- Create new test files
- Run tests and validation scripts
- Commit changes to git (local only)
- Post to chatroom channels

**You CANNOT (will be blocked by hooks):**
- Push to remote git repositories
- Delete files with `rm -rf`
- Force push or destructive git operations
- Modify package.json dependencies
- Publish packages
- Change CI/CD configurations

**You MUST:**
- Double-check every bash command before execution
- Post progress updates to channel every 5-10 actions
- Post WORK SUMMARY before leaving
- Use CHECKPOINT pattern if approaching turn limits
- Follow "measure twice, cut once" principle

## Terminal Action Protocol

Before executing potentially destructive commands:
```typescript
// 1. Announce intent
await chatroom_post({
  channel: "{CHANNEL}",
  agent: "{AGENT_ID}",
  status: "ALERT",
  message: "⚠️ ABOUT TO: git commit -m 'Fix NaN bug in ecology phase'"
});

// 2. Brief pause (allows human override if monitoring)
await sleep(2000);

// 3. Execute
await bash("git commit -m 'Fix NaN bug in ecology phase'");

// 4. Report result
await chatroom_post({
  channel: "{CHANNEL}",
  agent: "{AGENT_ID}",
  status: "IN-PROGRESS",
  message: "✅ COMPLETED: Committed fix to local git"
});
```

## Error Handling

If a command fails or is blocked:
```typescript
await chatroom_post({
  channel: "{CHANNEL}",
  agent: "{AGENT_ID}",
  status: "BLOCKED",
  message: "❌ BLOCKED: [command] failed. Reason: [error]. Requesting human intervention."
});

await chatroom_leave({
  channel: "{CHANNEL}",
  agent: "{AGENT_ID}",
  reason: "Blocked on: [error] - needs human"
});
```
```

### 7. Safety Levels for Different Agent Types

Different agents need different permission levels:

#### Level 1: Read-Only (Safest)
**Agents:** researcher-001, documentation agents
**Permissions:** Read files, search web, post to channels
**Risk:** Minimal
```json
{
  "dangerouslyDisableSandbox": false,
  "allowedOperations": ["read", "search", "post"]
}
```

#### Level 2: Code Modification
**Agents:** maintainer-001, test writers
**Permissions:** Level 1 + write files, run tests, commit locally
**Risk:** Low (changes are local, reversible)
```json
{
  "dangerouslyDisableSandbox": true,
  "allowedOperations": ["read", "write", "test", "commit"],
  "hooks": {
    "before_bash": "check-dangerous-command.sh"
  }
}
```

#### Level 3: Deployment (Highest Risk)
**Agents:** release managers (future)
**Permissions:** Level 2 + push, publish, deploy
**Risk:** High (public-facing actions)
```json
{
  "dangerouslyDisableSandbox": true,
  "allowedOperations": ["all"],
  "requiresApproval": true,
  "hooks": {
    "before_bash": "check-dangerous-command.sh",
    "after_bash": "log-action.sh"
  }
}
```

### 4. Implementation Files

#### `scripts/safeSpawnChannelMonitor.ts`

Utility functions for safe agent spawning:

```typescript
interface SpawnResult {
  spawned: boolean;
  reason?: string;
  agentId: string;
}

// Spawn researcher with herd protection
async function safeSpawnResearcher(
  channel: string = "research"
): Promise<SpawnResult>;

// Spawn maintainer for implementation work
async function safeSpawnMaintainer(
  channel: string = "implementation"
): Promise<SpawnResult>;

// Generic safe spawn with custom agent
async function safeSpawnAgent(
  agentType: string,
  agentId: string,
  channel: string,
  customPrompt?: string
): Promise<SpawnResult>;
```

**Implementation:**
```typescript
export async function safeSpawnResearcher(
  channel: string = "research"
): Promise<SpawnResult> {
  const agentId = "researcher-001";

  // Check if already active
  const active = await mcp__chatroom__chatroom_who_active({ channel });

  if (active.includes(agentId)) {
    return {
      spawned: false,
      reason: "Agent already active in channel",
      agentId
    };
  }

  // Spawn with protocol
  await Task({
    subagent_type: "super-alignment-researcher",
    description: `Monitor ${channel} channel`,
    prompt: generateMonitoringPrompt(agentId, channel)
  });

  return { spawned: true, agentId };
}
```

#### `.claude/agents/channel-monitoring-protocol.md`

Standard protocol template for all monitoring agents:

```markdown
# Channel Monitoring Protocol

## Your Identity
**Agent ID:** {AGENT_ID}
**Channel:** {CHANNEL}
**Role:** {ROLE_DESCRIPTION}

## Lifecycle Requirements

### 1. MANDATORY FIRST ACTION
Enter your assigned channel immediately:
\`\`\`typescript
mcp__chatroom__chatroom_enter({
  channel: "{CHANNEL}",
  agent: "{AGENT_ID}",
  message: "Monitoring for {REQUEST_TYPE}"
})
\`\`\`

This registers you as active and prevents duplicate spawns.

### 2. WORK PHASE
Check for new messages and respond:
\`\`\`typescript
// Read new messages (only since your last check)
const messages = await mcp__chatroom__chatroom_read_new({
  channel: "{CHANNEL}",
  agent: "{AGENT_ID}"
});

// Process each request
for (const msg of messages) {
  // Do your domain-specific work
  // Post status updates
  await mcp__chatroom__chatroom_post({
    channel: "{CHANNEL}",
    agent: "{AGENT_ID}",
    status: "IN-PROGRESS",
    message: "Working on: ..."
  });
}
\`\`\`

### 3. MANDATORY LAST ACTION
Leave the channel when work is complete:
\`\`\`typescript
mcp__chatroom__chatroom_leave({
  channel: "{CHANNEL}",
  agent: "{AGENT_ID}",
  reason: "All requests addressed"
})
\`\`\`

This signals you're no longer active.

## Error Handling
If you encounter an error and must exit early:
\`\`\`typescript
mcp__chatroom__chatroom_leave({
  channel: "{CHANNEL}",
  agent: "{AGENT_ID}",
  reason: "ERROR: {error_description}"
})
\`\`\`
```

### 5. Agent-Specific Configurations

#### Research Channel Monitor (researcher-001)

**Trigger Patterns:**
- "need research on..."
- "what does the literature say about..."
- "find peer-reviewed sources for..."

**Response Format:**
- Academic citations (Author, Year)
- Key findings summary
- Parameter recommendations
- Links to papers

**Agent Type:** `super-alignment-researcher`

#### Implementation Channel Monitor (maintainer-001)

**Trigger Patterns:**
- "NaN detected in..."
- "simulation crash at..."
- "phase producing invalid values..."

**Response Format:**
- Root cause analysis
- Code location identification
- Fix implementation with assertion utilities
- Monte Carlo validation

**Agent Type:** `simulation-maintainer`

#### Review Channel Monitor (skeptic-001)

**Trigger Patterns:**
- "review implementation of..."
- "check for performance issues..."
- "validate state propagation..."

**Response Format:**
- Architecture critique
- Performance analysis (O(n) complexity)
- State propagation issues
- Priority-ranked issues (CRITICAL/HIGH/MEDIUM/LOW)

**Agent Type:** `architecture-skeptic`

### 6. Orchestrator Integration

The orchestrator can periodically check channels and spawn agents:

```typescript
// In orchestrator agent prompt or main context

async function monitorChannels() {
  // Check research channel for unanswered questions
  const researchPeek = await mcp__chatroom__chatroom_peek({
    channel: "research",
    lines: 10
  });

  if (hasUnansweredResearchQuestions(researchPeek)) {
    await safeSpawnResearcher("research");
  }

  // Check implementation channel for bug reports
  const implPeek = await mcp__chatroom__chatroom_peek({
    channel: "implementation",
    lines: 10
  });

  if (hasBugReports(implPeek)) {
    await safeSpawnMaintainer("implementation");
  }
}
```

## Implementation Phases

### Phase 1: Core Infrastructure (2-3 hours)
- [ ] Create `scripts/safeSpawnChannelMonitor.ts` with helper functions
- [ ] Create `.claude/agents/channel-monitoring-protocol.md` template
- [ ] Create `.claude/hooks/check-dangerous-command.sh` safety hook
- [ ] Make hook executable: `chmod +x .claude/hooks/check-dangerous-command.sh`
- [ ] Test thundering-herd protection with manual spawns
- [ ] Verify `chatroom_who_active` correctly identifies active agents

### Phase 2: Safety & Permission Configuration (1-2 hours)
- [ ] Add `before_bash` hook to `.claude/settings.local.json`
- [ ] Create autonomous agent prompt templates with HEADLESS MODE warnings
- [ ] Implement red flag detection in `scripts/detectRedFlags.ts`
- [ ] Test safety hook blocks dangerous commands (rm -rf, push --force)
- [ ] Test warning patterns (git push, npm install)

### Phase 3: Agent Prompt Templates (2-3 hours)
- [ ] Create monitoring prompt for `researcher-001` (Level 1: Read-only)
- [ ] Create monitoring prompt for `maintainer-001` (Level 2: Code modification)
- [ ] Create monitoring prompt for `skeptic-001` (Level 1: Read-only)
- [ ] Add HEADLESS MODE instructions to each prompt
- [ ] Add CHECKPOINT pattern instructions
- [ ] Add WORK SUMMARY template to each prompt

### Phase 4: Smart Retry & Recovery (2-3 hours)
- [ ] Implement `checkForIncompleteWork()` in orchestrator
- [ ] Add CHECKPOINT detection logic
- [ ] Test: Agent posts checkpoint mid-work, gets respawned
- [ ] Test: Respawned agent continues from checkpoint
- [ ] Add timeout-based stale agent detection

### Phase 5: Review & Off-Rails Detection (1-2 hours)
- [ ] Implement work summary extraction from channel messages
- [ ] Create red flag patterns (destructive commands, scope violations)
- [ ] Add review channel for human/agent oversight
- [ ] Test: Agent modifies unexpected file → red flag detected
- [ ] Test: Agent attempts blocked command → review triggered

### Phase 6: Orchestrator Integration (1-2 hours)
- [ ] Add channel monitoring to orchestrator workflow
- [ ] Implement trigger pattern detection
- [ ] Add smart retry logic (incomplete work detection)
- [ ] Add periodic channel checks (optional)
- [ ] Test full workflow: post → detect → spawn → work → checkpoint → respawn → complete

### Phase 7: Testing & Validation (2 hours)
- [ ] Test: Spawn researcher twice, verify second is blocked
- [ ] Test: Agent crashes without leaving, verify recovery
- [ ] Test: Agent runs out of turns, posts checkpoint, gets respawned
- [ ] Test: Agent attempts rm -rf, gets blocked by hook
- [ ] Test: Agent goes off-rails, red flags detected, review triggered
- [ ] Test: Multiple channels with different agents (concurrent work)
- [ ] Test: Message read tracking (no re-processing)
- [ ] Test: Full autonomous workflow without human intervention

## Usage Examples

### Example 1: Manual Research Request

```typescript
// User or orchestrator needs research
const result = await safeSpawnResearcher("research");

if (result.spawned) {
  console.log("✅ researcher-001 spawned to investigate");
} else {
  console.log("⏳ researcher-001 already working");
}
```

### Example 2: Automated Bug Response

```typescript
// Implementation channel receives bug report
mcp__chatroom__chatroom_post({
  channel: "implementation",
  agent: "orchestrator",
  status: "ALERT",
  message: "🐛 NaN detected in ecology phase at month 120"
});

// Orchestrator sees alert and spawns maintainer
await safeSpawnMaintainer("implementation");

// maintainer-001 enters, investigates, posts fix
```

### Example 3: Multi-Agent Coordination

```typescript
// Complex feature needs research → implementation → review

// Step 1: Research (researcher-001 enters research channel)
await safeSpawnResearcher("research");
// Posts findings

// Step 2: Implementation (maintainer-001 enters implementation channel)
await safeSpawnMaintainer("implementation");
// Implements feature

// Step 3: Review (skeptic-001 enters review channel)
await safeSpawnAgent("architecture-skeptic", "skeptic-001", "review");
// Posts critique
```

## Benefits

✅ **Prevents resource waste** - No duplicate agents running simultaneously
✅ **Clean coordination** - Agents communicate via channels, not direct coupling
✅ **Persistent context** - Named identities enable message history tracking
✅ **Self-documenting** - Channel logs show who did what and when
✅ **Scalable** - Easy to add new monitoring agents for new domains
✅ **Fault tolerant** - Agents can crash, channel state persists

## Edge Cases & Recovery

### Agent Crashes Without Leaving

**Problem:** Agent fails mid-work, doesn't call `chatroom_leave`, blocks future spawns

**Solution:** Add timeout-based recovery:
```typescript
// Check last activity timestamp
const lastSeen = getLastActivityTime("researcher-001", "research");
if (now - lastSeen > 30 * 60 * 1000) { // 30 min
  console.log("⚠️ researcher-001 appears stale, forcing cleanup");
  // Manual cleanup or spawn anyway with warning
}
```

### Multiple Urgent Requests

**Problem:** researcher-001 is busy, but new urgent request arrives

**Solution:** Spawn numbered instances:
- `researcher-001` (primary)
- `researcher-002` (overflow for urgent requests)

### Channel Spam

**Problem:** Too many messages, agent overwhelmed

**Solution:** Rate limiting in agent prompt:
- Process max N messages per session
- Post "backlog" status if overwhelmed
- Orchestrator spawns additional instances if needed

## Next Steps

1. **Create infrastructure files** (scripts + protocol doc)
2. **Test with research channel** (safest, read-only work)
3. **Expand to implementation channel** (more complex, write operations)
4. **Integrate with orchestrator** (automated spawning)
5. **Document in wiki** (add to chatroom documentation)

## Success Criteria

**Core Functionality:**
- [ ] Can spawn researcher without duplicate detection
- [ ] Two spawn attempts result in one active agent
- [ ] Agent enters → works → leaves cleanly
- [ ] Message read tracking works (no re-processing)
- [ ] Orchestrator can automatically spawn based on channel activity

**Safety & Recovery:**
- [ ] Agent runs out of turns → posts checkpoint → respawned → continues
- [ ] Agent attempts dangerous command → blocked by hook with clear error
- [ ] Agent modifies unexpected files → red flags detected → review triggered
- [ ] Agent crashes without leaving → detected as stale → recovered
- [ ] HEADLESS MODE warnings appear in all autonomous agent prompts

**Review & Oversight:**
- [ ] Every agent posts WORK SUMMARY before leaving
- [ ] Red flag detection catches destructive actions
- [ ] Human can monitor channel and override if needed
- [ ] Failed agents post BLOCKED status with reason

**Integration:**
- [ ] Orchestrator detects incomplete work and respawns agents
- [ ] Multiple agents work concurrently without conflicts
- [ ] Full autonomous workflow: detect → spawn → work → checkpoint → complete → review

---

**Status:** Ready for implementation
**Estimated Effort:** 12-16 hours total (increased from 5-8 due to safety features)
**Priority:** High (enables safe autonomous multi-agent coordination)

**Risks:**
- Hooks may not work as expected in headless mode
- Turn limits unpredictable (agent may not detect running low)
- False positives in red flag detection (block legitimate work)
- Channel message parsing complexity

**Mitigations:**
- Test hooks thoroughly before autonomous deployment
- Conservative checkpoint frequency (every 5-10 actions)
- Tunable red flag patterns (start strict, relax as needed)
- Structured message format (WORK SUMMARY template)

## Deployment Strategy

### Stage 1: Read-Only Testing (Week 1)
**Scope:** researcher-001 only, research channel only
**Permissions:** Read files, search web, post to channels (no sandbox disable)
**Goal:** Test basic lifecycle, turn limits, checkpoint pattern
**Success:** 10 successful research requests with no human intervention

### Stage 2: Safety Testing (Week 2)
**Scope:** maintainer-001 with sandbox disabled, implementation channel
**Permissions:** Read + write files, run tests, commit locally
**Goal:** Test safety hooks, red flag detection, review workflow
**Success:** Safety hook blocks 5 dangerous commands, agent respects all restrictions

### Stage 3: Smart Retry Testing (Week 3)
**Scope:** Both researcher-001 and maintainer-001
**Goal:** Test checkpoint pattern, respawn logic, incomplete work detection
**Success:** Agent runs out of turns 3 times, successfully respawned each time

### Stage 4: Full Autonomous Deployment (Week 4+)
**Scope:** All monitoring agents, all channels
**Permissions:** Role-based (Level 1/2/3)
**Goal:** Production use with human monitoring
**Success:** 50 autonomous tasks completed with <5% requiring human intervention

### Rollback Plan
If agents go off-rails or cause issues:
1. Disable autonomous spawning in orchestrator
2. Review all work done by autonomous agents
3. Rollback destructive changes (git revert)
4. Tighten safety hooks and red flag patterns
5. Re-test in Stage 2 before re-deploying

## Monitoring & Observability

### Channel Dashboards
Create monitoring views for:
- Active agents per channel
- CHECKPOINT/COMPLETED ratio (detect stuck agents)
- Red flag frequency (tune detection patterns)
- Average turns per task (optimize efficiency)

### Alerts
Set up alerts for:
- Agent has been active >30 minutes (stale)
- Red flags detected (off-rails behavior)
- BLOCKED status posted (needs human intervention)
- High respawn rate (turn limit issues)

### Logs
Centralize logs in `.claude/chatroom/logs/`:
- `agent_activity.log` - All enter/leave events
- `checkpoints.log` - All checkpoint messages
- `red_flags.log` - All red flag detections
- `blocked_commands.log` - All hook blocks

## Future Enhancements

### Priority Queue
Instead of FIFO channel messages, prioritize:
- ALERT status (highest priority)
- BLOCKED status (human needed)
- Research requests (medium priority)
- Review requests (can batch)

### Agent Collaboration
Enable agents to spawn sub-agents:
- researcher-001 finds ambiguous paper → spawns research-skeptic to validate
- maintainer-001 implements fix → spawns unit-test-writer for coverage
- Prevents single agent doing everything

### Learning & Optimization
Track agent performance:
- Success rate per agent type
- Average turns per task type
- Most common red flags (tune patterns)
- Use data to improve prompts and spawn decisions

### Human-in-the-Loop UI
Build simple web UI:
- View active agents and their status
- Read work summaries before approval
- Override or cancel agent actions
- Whitelist/blacklist patterns for hooks

## Voice of the Swarm (Ambient Notifications)

For headless monitoring, agents can use text-to-speech to notify you of important events.

### Implementation

**Orchestrator as Voice:**
The orchestrator serves as the "designated voice of the swarm" - it monitors channels and speaks notifications.

```typescript
// In orchestrator or monitoring script
async function voiceNotify(message: string, priority: 'low' | 'medium' | 'high' = 'medium') {
  // Choose voice based on priority
  const voice = priority === 'high' ? 'Samantha' : 'Alex'; // Pleasant, natural voices
  const rate = priority === 'high' ? '200' : '180'; // Faster for urgent messages

  // CRITICAL: Max 20 words to keep notifications brief
  const wordCount = message.split(/\s+/).length;
  if (wordCount > 20) {
    console.warn(`⚠️ Voice message too long (${wordCount} words), truncating to 20`);
    message = message.split(/\s+/).slice(0, 20).join(' ');
  }

  await bash(`say -v ${voice} -r ${rate} "${message}"`);
}
```

### Notification Triggers

**High Priority (immediate voice notification):**
- 🚨 Red flag detected - agent went off-rails
- ❌ Agent blocked on command - needs human approval
- ⚠️ Agent crashed or stale (>30min active)
- 🔥 Critical error in autonomous workflow

```typescript
// Example: Red flag detected
await voiceNotify(
  "Alert: maintainer-001 attempted to modify unexpected files. Red flag detected. Review needed.",
  'high'
);
```

**Medium Priority (voice notification if monitoring):**
- ✅ Agent completed work - summary available
- 🔄 Agent respawned after checkpoint
- 📊 Work summary ready for review

```typescript
// Example: Work completed
await voiceNotify(
  "Researcher completed task: found 5 papers on carbon capture. Summary posted to research channel.",
  'medium'
);
```

**Low Priority (no voice, channel only):**
- Agent entered/left channel
- Progress updates
- Routine checkpoints

### Voice Prompts for Common Events

```typescript
const VOICE_MESSAGES = {
  // Completion (11 words)
  taskComplete: (agent: string, task: string) =>
    `${agent} completed ${task}. Summary in channel.`,

  // Red flags (10 words)
  redFlag: (agent: string, issue: string) =>
    `Alert! ${agent} red flag: ${issue}. Review needed.`,

  // Blocked (8 words)
  blocked: (agent: string, command: string) =>
    `${agent} blocked on ${command}. Approval needed.`,

  // Respawn (9 words)
  respawn: (agent: string) =>
    `${agent} ran out of turns. Respawning to continue.`,

  // Stale (10 words)
  stale: (agent: string, minutes: number) =>
    `Warning: ${agent} active for ${minutes} minutes. May be stuck.`,

  // Success (8 words)
  autonomousSuccess: (count: number) =>
    `Good news! ${count} autonomous tasks completed today.`
};

// All messages are ≤20 words for quick notifications
```

### Voice Configuration

**Approved Voice Roster (16 voices):**

**Female voices (8):**
- Samantha (US) - Professional, warm
- Moira (Irish) - Distinctive accent
- Tessa (South African) - Clear accent
- Karen (Australian) - Friendly
- Kathy (US) - Classic
- Flo (US) - Modern/younger
- Shelley (US) - Modern
- Sandy (US) - Modern

**Male voices (8):**
- Fred (US) - Classic, clear
- Rishi (Indian) - Distinctive accent
- Daniel (British) - Professional
- Ralph (US) - Distinctive
- Reed (US) - Modern/younger
- Junior (US) - Younger/child-like
- Eddy (US) - Modern
- Rocko (US) - Edgy/modern

**BANNED VOICES:**
- ❌ Albert - Too creepy, never use

**Voice Selection Strategy:**
```typescript
const APPROVED_VOICES = [
  'Samantha', 'Moira', 'Tessa', 'Karen', 'Kathy', 'Flo (English (US))', 'Shelley (English (US))', 'Sandy (English (US))',
  'Fred', 'Rishi', 'Daniel', 'Ralph', 'Reed (English (US))', 'Junior', 'Eddy (English (US))', 'Rocko (English (US))'
];

// Random voice for variety
function getRandomVoice(): string {
  return APPROVED_VOICES[Math.floor(Math.random() * APPROVED_VOICES.length)];
}

// Or assign by agent type
const AGENT_VOICES = {
  'researcher-001': 'Samantha',
  'maintainer-001': 'Fred',
  'skeptic-001': 'Daniel',
  'orchestrator': 'Moira'
};
```

**Rate Settings:**
- Normal: 180 words/min
- Urgent: 200 words/min (faster for alerts)
- Calm: 160 words/min (for progress updates)

### Orchestrator Voice Integration

Add to orchestrator prompt:

```markdown
## Voice Notifications

You are the "voice of the swarm" - you can speak notifications to the user.

**When to use voice:**
- Red flags detected (high priority)
- Agent blocked (needs approval)
- Work completed (medium priority)
- Agent crashed/stale (high priority)

**How to speak:**
\`\`\`bash
say -v Samantha -r 200 "Your message here"
\`\`\`

**CRITICAL RULES:**
- **MAX 20 WORDS** - Keep messages brief
- Professional but friendly tone
- Clear and concise (no jargon)
- State agent ID and action only
- No elaboration (details go in channel)

**Good Examples (≤20 words):**
\`\`\`bash
say -v Samantha "Alert! Maintainer red flag: modified unexpected files. Review needed."  # 10 words
say -v Samantha "Researcher completed task. Found 5 papers. Summary in channel."  # 11 words
say -v Samantha "Maintainer blocked on git push. Approval needed."  # 8 words
\`\`\`

**Bad Examples (too long):**
\`\`\`bash
# ❌ 23 words - TOO LONG
say -v Samantha "Alert: maintainer-001 triggered a red flag while modifying ecology phase. Review needed in implementation channel."

# ✅ 10 words - GOOD
say -v Samantha "Maintainer red flag on ecology phase. Review needed."
\`\`\`
```

### Quiet Hours

Respect user's time:

```typescript
function shouldSpeak(): boolean {
  const hour = new Date().getHours();
  const isQuietHours = hour < 8 || hour > 22; // Before 8am or after 10pm

  if (isQuietHours) {
    console.log("🔇 Quiet hours - voice notification suppressed");
    return false;
  }

  return true;
}

async function voiceNotifyWithQuietHours(message: string, priority: 'low' | 'medium' | 'high') {
  // Always log to channel
  await chatroom_post({ message, status: priority === 'high' ? 'ALERT' : 'IN-PROGRESS' });

  // Only speak if not quiet hours (unless CRITICAL)
  if (shouldSpeak() || priority === 'high') {
    await voiceNotify(message, priority);
  }
}
```

### Future: Custom Voice Personalities

Could create different voice personalities for different agent types:
- **Researcher voice** (Samantha, calm): "I found 5 relevant papers..."
- **Maintainer voice** (Alex, technical): "Fixed NaN bug in ecology phase..."
- **Skeptic voice** (Victoria, cautious): "I detected 3 critical issues..."

But for MVP, **single orchestrator voice (Samantha)** keeps it simple and friendly.
