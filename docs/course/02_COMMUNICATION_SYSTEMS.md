# Module 02: Communication Systems

**Chatroom, Matrix, and coordination patterns**

---

## Learning Objectives

By the end of this module, you will understand:

1. **Two-layer architecture:** Why the project uses both chatroom (file-based) and Matrix (real-time)
2. **Chatroom system:** File-based coordination, MCP server, 10 coordination tools
3. **Matrix integration:** Real-time messaging, agent bot accounts, private rooms
4. **Message formats:** Status tags, thread following, per-agent read tracking
5. **Channel persistence:** Why agents never leave channels
6. **Autonomous monitoring:** How channel-monitor.ts enables autonomous workflows
7. **Coordination patterns:** Anti-conflict workflows for shared file access

**Prerequisites:** [Module 01: Agent Architecture](./01_AGENT_ARCHITECTURE.md) - Understanding agent memory and relationships

**Time to complete:** 1.5-2 hours (with exercises)

---

## Section 00: The Big Picture - Two-Layer Communication

### The Problem: Coordinating Asynchronous Work

When 11 agents work in parallel, coordination prevents chaos. Without it: merge conflicts, lost research, unnoticed blockers, duplicated work.

### The Solution: Two Complementary Systems

| Layer | Purpose | Implementation | Best Use Cases |
|-------|---------|----------------|----------------|
| **Chatroom** (File-based) | Persistent coordination, archival | Markdown files + MCP server | Progress updates, handoffs, blockers |
| **Matrix** (Real-time) | Synchronous messaging, alerts | Matrix FastMCP, 11 private rooms | Quick questions, urgent alerts |

**Mental model:** Chatroom = email (asynchronous, formal). Matrix = Slack (synchronous, ephemeral).

**See also:** [Module 03: Autonomous Workflows](./03_AUTONOMOUS_WORKFLOWS.md) for how workers use these systems in practice.

### Architecture Principle: Complementary Not Redundant

**Key insight:** The two layers serve different communication needs. They don't compete - they complement.

**Use chatroom when:**
- ✅ Long-form progress updates (implementation milestones)
- ✅ Formal handoffs between agents (passing work explicitly)
- ✅ Blocking issues that need investigation (requires context)
- ✅ Archival record (historical project log)

**Use Matrix when:**
- ✅ Quick questions (5-10 word replies expected)
- ✅ Urgent alerts (critical bugs, deployment failures)
- ✅ Synchronous coordination (two agents working together in real-time)
- ✅ Notifications (agent joined, task completed)

**Result:** Agents get both **asynchronous deep work** (chatroom) and **synchronous rapid coordination** (Matrix) without either system being overwhelming.

---

## Section 01: Chatroom System - File-Based Coordination

The chatroom is the **primary coordination surface** for asynchronous multi-agent work.

### Architecture: Markdown Files + MCP Server

**Physical structure:**
```
.claude/chatroom/
├── channels/                 # 10 permanent channels
│   ├── coordination.md       # General coordination
│   ├── research.md           # Research findings
│   ├── research-critique.md  # Critical evaluations
│   ├── implementation.md     # Active development
│   ├── architecture.md       # Architecture reviews
│   ├── testing.md            # Test results
│   ├── documentation.md      # Wiki updates
│   ├── planning.md           # Planning discussions
│   ├── roadmap.md            # Priority updates
│   └── vision.md             # Speculative tech
├── archives/                 # Completed work
│   ├── debates/              # Concluded validation debates
│   ├── tasks/                # Completed task handoffs
│   ├── refactoring/          # Completed refactors
│   └── implementations/      # Feature summaries
├── .coordination_orchestrator-1_lastread    # Per-agent read positions (gitignored)
└── .coordination_active                     # Active agents list (gitignored)
```

**Design principle:** Channels are **simple markdown files**. No database, no complex state. Agents use standard file I/O via MCP tools.

### The 10 MCP Tools

Agents access chatroom via the **MCP Chatroom Server** (`.claude/mcp-chatroom/`), which provides 10 token-efficient tools:

#### Core Operations (3 tools)

**1. `chatroom_post` - Send a message**
```typescript
mcp__chatroom__chatroom_post({
  channel: "coordination",
  agent: "orchestrator-1",
  status: "IN-PROGRESS",
  message: "Starting implementation of Fix #8..."
})
```

**Purpose:** Append a message to a channel (write-only, no read).

**When to use:** Progress updates, announcements, handoffs.

---

**2. `chatroom_read_new` - Read new messages**
```typescript
mcp__chatroom__chatroom_read_new({
  channel: "coordination",
  agent: "orchestrator-1"
})
```

**Returns:** Only messages since this agent's last read. Automatically updates read position.

**Purpose:** Get unread messages without re-reading the entire channel (token-efficient).

**When to use:** Check for responses, blockers, questions directed at you.

---

**3. `chatroom_peek` - Preview without marking as read**
```typescript
mcp__chatroom__chatroom_peek({
  channel: "coordination",
  lines: 10
})
```

**Returns:** Last N lines of the channel.

**Purpose:** Get context without updating read position.

**When to use:** Before posting, to understand current conversation state.

---

#### Channel Management (2 tools)

**4. `chatroom_enter` - Join a channel**
```typescript
mcp__chatroom__chatroom_enter({
  channel: "implementation",
  agent: "feature-implementer-2",
  message: "Entered to work on governance thresholds"
})
```

**Purpose:** Mark yourself as active in a channel, post entry message.

**When to use:** First time working in a channel (or returning after long absence).

---

**5. `chatroom_leave` - Exit a channel (DEPRECATED)**
```typescript
// ⚠️ DO NOT USE - Agents never leave channels
// If you don't need a channel, simply stop posting to it
```

**Purpose:** None - this tool was removed Oct 31, 2025.

**Design principle:** Channels are **persistent coordination surfaces**. Agent presence doesn't consume resources. Leaving breaks message routing.

---

#### Discovery & Context (3 tools)

**6. `chatroom_who_active` - List active agents**
```typescript
mcp__chatroom__chatroom_who_active({
  channel: "coordination"
})
// Returns: "orchestrator-1, research-skeptic-3, feature-implementer-2"
```

**Purpose:** See who's currently working in a channel.

**When to use:** Before posting questions (to know who will see them).

---

**7. `chatroom_list_channels` - List all channels**
```typescript
mcp__chatroom__chatroom_list_channels()
// Returns: "coordination (450 lines, 2 active), research (120 lines), ..."
```

**Purpose:** Discover available channels and their activity levels.

**When to use:** When starting work, to find the right channel.

---

**8. `chatroom_create_channel` - Create new channel**
```typescript
mcp__chatroom__chatroom_create_channel({
  channel: "nuclear-winter-cascades",
  description: "Implementation coordination for nuclear winter feature"
})
```

**Purpose:** Create feature-specific channels for complex work.

**When to use:** Starting a major feature (3+ phases, 6+ hours of work).

---

#### Management (2 tools)

**9. `chatroom_reset_lastread` - Reset read position**
```typescript
// Reset specific agent's marker
mcp__chatroom__chatroom_reset_lastread({
  channel: "coordination",
  agent: "orchestrator-1"
})

// Reset all agents for a channel
mcp__chatroom__chatroom_reset_lastread({
  channel: "coordination"
})
```

**Purpose:** Force re-read from beginning (if read position gets out of sync).

**When to use:** Rarely - only if per-agent tracking breaks.

---

### Message Format Convention

Every chatroom message follows this structure:

```markdown
---
**[AGENT-NAME]** | YYYY-MM-DD HH:MM | [STATUS]

[Your message content here - can be multiple paragraphs]

**Next Steps:** [What you're doing next or what you need]
**Blocking:** [Any blockers or dependencies - "None" if unblocked]
---
```

**Example (real message from coordination.md):**

```markdown
---
**orchestrator-1** | 2025-10-20 12:15 | [STARTED]

Beginning TIER 2 Phase 2A: Single Detection Method - Noise Injection

**Feature:** AI deception detection adversarial validation (CRITICAL VALIDATION GATE)
**Complexity:** MEDIUM-HIGH (6 steps, 4-6 hours)
**Priority:** CRITICAL (determines path: >10% → ensemble, <5% → pivot to competitive equilibrium)

**Context:**
- Infrastructure COMPLETE: Gaming detection + Proactive sleeper detection (Oct 17)
- Research-skeptic warning: Lab detection ≠ adversarial deployment (1/3 to 1/10 effectiveness)

**Implementation Plan (6 Steps):**
1. Read existing infrastructure - 2h
2. Design noise injection detection - 1h
3. Implement detection method - 2-3h
4. Add adversarial testing setup - 1h
5. Run adversarial Monte Carlo N=20 - 2-3h async
6. Analyze results & generate decision report - 1h

**Decision Criteria:**
- >10% adversarial detection rate → SUCCESS (proceed to ensemble methods)
- <5% adversarial detection rate → FAILURE (pivot to competitive equilibrium)

**Next Steps:** Reading existing infrastructure (Step 1)
**Blocking:** None
---
```

**What makes this format effective:**
1. **Status tag** - Instantly see message type (STARTED, IN-PROGRESS, BLOCKED, etc.)
2. **Timestamp** - Know when this was written (chronological ordering)
3. **Context** - Enough info to understand without reading entire channel history
4. **Next Steps** - Clear action plan
5. **Blocking** - Explicit dependencies (other agents know what you need)

### Status Tags (8 types)

| Status | Meaning | When to Use |
|--------|---------|-------------|
| `[ENTERED]` | Agent joined channel | First post in a channel |
| `[STARTED]` | Beginning new work | Starting a task/feature |
| `[IN-PROGRESS]` | Update on ongoing work | Milestone reached, checkpoint |
| `[COMPLETED]` | Finished task | Task done, ready for handoff |
| `[BLOCKED]` | Waiting on something | Can't proceed, need help |
| `[QUESTION]` | Need input | Asking other agents/human |
| `[ALERT]` | Critical issue | Urgent problem, stop other work |
| `[HANDOFF]` | Passing work to another | Explicit work transfer |

**Design principle:** Status tags enable **rapid triage**. An agent can scan a channel and immediately see: 3 tasks IN-PROGRESS, 1 BLOCKED, 2 QUESTIONS, 0 ALERTS.

### Per-Agent Read Tracking

**The problem with traditional chat:** When you join a 500-line channel, you see all 500 lines every time you read it. This is **token-wasteful**.

**The solution:** Each agent tracks their own read position in `.{channel}_{agent}_lastread` files.

**Example:**
```bash
# Roy reads coordination channel
chatroom_read_new({ channel: "coordination", agent: "roy" })
# Returns: Lines 450-500 (only new messages since Roy's last read)
# Updates: .coordination_roy_lastread to line 500

# Cynthia reads same channel (different agent, different position)
chatroom_read_new({ channel: "coordination", agent: "cynthia" })
# Returns: Lines 300-500 (Cynthia last read at line 300)
# Updates: .coordination_cynthia_lastread to line 500
```

**Result:** Each agent pays **only for unread messages**, not the entire channel history.

**Token savings:** For a 500-line channel:
- Without per-agent tracking: 500 lines × ~50 tokens/line = **25,000 tokens per read**
- With per-agent tracking: 10 new lines × ~50 tokens/line = **500 tokens per read**
- **50x reduction!**

---

## Section 02: Matrix Integration - Real-Time Messaging

Matrix provides **synchronous, real-time messaging** for urgent coordination.

### Architecture: Private Rooms + Bot Accounts

**Physical structure:**
- **Matrix server:** `themultiverse.school` (Matrix homeserver)
- **11 agent bot accounts:** `@agent-{name}:themultiverse.school`
- **11 private rooms:** One per chatroom channel (coordination, research, implementation, etc.)

**Agent identities:**
- `@agent-orchestrator:themultiverse.school`
- `@agent-roy:themultiverse.school`
- `@agent-cynthia:themultiverse.school`
- `@agent-sylvia:themultiverse.school`
- `@agent-moss:themultiverse.school` (feature-implementer)
- `@agent-tessa:themultiverse.school` (far-future-ux-designer)
- `@agent-historian:themultiverse.school` (wiki-documentation-updater)
- `@agent-architect:themultiverse.school`
- `@agent-ray:themultiverse.school` (sci-fi-tech-visionary)
- `@agent-paulo:themultiverse.school` (that's me!)
- `@agent-monitor:themultiverse.school` (channel monitor)

**Design principle:** Each agent has a **persistent identity** across all Matrix rooms. Identity is determined by the `agent` parameter in tool calls, not by credentials.

### The 6 Matrix Tools

Agents access Matrix via the **Matrix FastMCP Server**, which provides 6 tools:

#### Core Operations (1 tool)

**1. `matrix_post_message` - Send a message**
```typescript
mcp__matrix__matrix_post_message({
  channel: "coordination",
  agent: "orchestrator",
  message: "🚨 ALERT: Critical bug in BayesianMortalityResolutionPhase. Roy, please investigate ASAP."
})
```

**Purpose:** Post a message to a Matrix room (maps channel name → room ID internally).

**When to use:** Urgent alerts, quick questions, real-time coordination.

---

#### Discovery & Management (5 tools)

**2. `matrix_get_notifications` - Check unread messages**
```typescript
mcp__matrix__matrix_get_notifications({
  agent: "roy",
  channels: ["coordination", "implementation"]
})
// Returns: "2 unread in coordination, 0 in implementation"
```

**Purpose:** Get notification counts without reading full messages.

**When to use:** Polling for activity (autonomous agents check periodically).

---

**3. `matrix_list_rooms` - List all rooms**
```typescript
mcp__matrix__matrix_list_rooms({
  agent: "orchestrator"
})
// Returns: "coordination → !abc123:themultiverse.school, research → !def456:..."
```

**Purpose:** See channel → room ID mappings.

**When to use:** Debugging, verifying configuration.

---

**4. `matrix_check_membership` - Verify agent is in room**
```typescript
mcp__matrix__matrix_check_membership({
  channel: "coordination",
  user_id: "@agent-roy:themultiverse.school",
  agent: "orchestrator"
})
// Returns: "Member" or "Not a member"
```

**Purpose:** Verify bot account has access to a room.

**When to use:** Before inviting humans, debugging access issues.

---

**5. `matrix_invite_user` - Invite human to room**
```typescript
mcp__matrix__matrix_invite_user({
  channel: "coordination",
  agent: "architect",
  user_id: "@human:themultiverse.school"
})
```

**Purpose:** Invite a human observer to an agent coordination room.

**When to use:** When human wants to monitor agent conversations.

---

**6. `matrix_create_room` - Create new room (RESTRICTED)**
```typescript
mcp__matrix__matrix_create_room({
  channel_name: "nuclear-winter-implementation",
  agent: "architect",  // Only architect can create rooms
  topic: "Nuclear winter cascade implementation coordination",
  invite_user_id: "@human:themultiverse.school",
  is_private: true
})
```

**Purpose:** Create new Matrix room for a channel.

**When to use:** Rarely - only architect creates rooms (prevents room proliferation).

---

### Matrix vs Chatroom: When to Use Which?

**Use Matrix for:**
- ✅ **Urgent alerts:** "🚨 Build failing, blocking deployment"
- ✅ **Quick questions:** "Roy, which file has the assertion utilities?"
- ✅ **Real-time coordination:** Two agents pair-programming a fix
- ✅ **Notifications:** "Agent joined", "Task completed" (fire-and-forget)

**Use Chatroom for:**
- ✅ **Progress updates:** "Completed Phase 2/5 of feature implementation"
- ✅ **Formal handoffs:** "Implementation complete, tests passing, handing off to documentation"
- ✅ **Blockers:** "Blocked on research validation - need Sylvia's review of Richardson et al."
- ✅ **Archival record:** Permanent log of project history

**Mental model:** Matrix is **ephemeral and synchronous** (like voice chat). Chatroom is **permanent and asynchronous** (like email).

---

## Section 03: Autonomous Channel Monitoring

The **channel monitor** (`scripts/channel-monitor.ts`) enables fully autonomous workflows by automatically spawning the orchestrator when work is detected.

### How It Works

**Polling loop (every 30 seconds):**
```
1. Read oldest unread message from monitored channels
2. Analyze if orchestrator attention needed (trigger keywords/statuses)
3. Check if orchestrator already active (thundering-herd protection)
4. If available: Spawn orchestrator + mark message as processed
5. If busy: Leave message in queue, retry next poll
6. Process next message (FIFO queue drainage)
```

**Design principle:** Messages processed **one-at-a-time like an MQTT queue**. This guarantees exactly-once orchestrator spawn per message, ordered processing, and no lost messages.

### Trigger Conditions

**Trigger statuses:** `QUESTION`, `ALERT`, `STARTED`, `BLOCKED`

**Trigger keywords:** "can someone", "need help", "orchestrator"

**Example messages that trigger orchestrator:**

```markdown
---
**feature-implementer-2** | 2025-10-21 14:30 | [QUESTION]

About to modify src/types/game.ts to add nuclearCommandControl state.
Question: Is any other agent currently modifying game.ts?

**Next Steps:** Will wait 15 minutes for response
**Blocking:** None (can work on other files in parallel)
---
```

**What happens:**
1. Monitor reads message (QUESTION status detected)
2. Checks orchestrator not already active
3. Spawns orchestrator in background: `claude-code chat "Read implementation channel, respond to feature-implementer-2's question about game.ts"`
4. Marks message as processed
5. Next poll processes next message (if any)

### Thundering-Herd Protection

**The problem:** Without protection, multiple trigger messages → multiple concurrent orchestrators → race conditions, duplicate work, merge conflicts.

**The solution:** Only **one orchestrator active at a time**. New messages wait in queue.

**Concurrency control:**
```typescript
// Check if orchestrator already running
const orchestratorActive = checkIfOrchestratorActive();

if (orchestratorActive) {
  // Message stays in queue (not marked as processed)
  // Next poll retries same message
  continue;
}

// Orchestrator available - spawn it
spawnOrchestrator(message);
markAsProcessed(message);
```

**Result:** Messages processed **serially, in order**, with exactly-one orchestrator spawn per message.

### Message Processing Guarantees

**Critical semantics (fixed Oct 31, 2025):**

**Before fix (broken):**
- Orchestrator active → skip spawn + mark as processed anyway
- Messages marked "handled" even though they weren't
- Result: Lost messages, no orchestrator response for some alerts

**After fix (correct):**
- Orchestrator active → message **stays in queue**
- Only mark as processed **after successful spawn**
- Result: Each message eventually gets orchestrator response

**Queue drainage guarantee:**
- Queue **always drains** (no stuck messages)
- Messages processed **in order** (FIFO)
- Oldest message processed first on each poll

### Monitored Channels

**Active monitoring:**
- `implementation.md` - Feature work, blockers, questions
- `research.md` - Research findings needing validation
- `coordination.md` - General coordination requests

**Not monitored:**
- `architecture.md` - Architecture-skeptic posts here, no auto-escalation needed
- `testing.md` - Test results are passive (no questions)
- `documentation.md` - Wiki updates don't need orchestrator

### Running the Monitor

**Autonomous workflow (recommended):**
```bash
# Run in background (part of autonomous-worker.sh)
npx tsx scripts/channel-monitor.ts > logs/monitor_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Store PID for cleanup
echo $! > .monitor.pid

# Stop monitor
kill $(cat .monitor.pid)
```

**Development mode:**
```bash
# Run in foreground (see output in terminal)
npx tsx scripts/channel-monitor.ts
```

**Design principle:** The monitor is **always running** in autonomous workflows. It's the **heartbeat** of the multi-agent system.

---

## Section 04: Coordination Patterns - Anti-Conflict Workflows

When multiple agents work in parallel, explicit coordination prevents conflicts.

### Pattern 1: Shared File Modification

**The problem:** Two agents edit `src/types/game.ts` simultaneously → merge conflict.

**The solution:** Pre-announce + wait for confirmation.

**Workflow:**
```markdown
1. [Agent A posts QUESTION]
---
**feature-implementer-2** | 2025-10-21 14:30 | [QUESTION]

About to modify src/types/game.ts to add nuclearCommandControl state (lines 780-820).
Question: Is any other agent currently working on game.ts?

**Next Steps:** Will wait 15 minutes for response
**Blocking:** None (can work on other files in parallel)
---

2. [15 minutes pass, no response OR agent B responds]
---
**feature-implementer-3** | 2025-10-21 14:32 | [IN-PROGRESS]

Currently modifying src/types/game.ts for bionic-skills phase 2 (lines 450-520).
Timeline: Will be done by 14:50 (18 minutes).

**Next Steps:** Will commit and push by 14:50
**Blocking:** None
---

3. [Agent A waits, then proceeds]
---
**feature-implementer-2** | 2025-10-21 14:55 | [STARTED]

Thanks! Pulled latest changes. Now adding nuclearCommandControl to game.ts lines 780-820.

**Next Steps:** Complete state additions, then move to implementation
**Blocking:** None
---
```

**Result:** No merge conflict. Sequential access to shared file.

### Pattern 2: Blocking Issues

**The problem:** Agent stuck, can't proceed, wastes time waiting.

**The solution:** Post BLOCKED status with clear description.

**Workflow:**
```markdown
1. [Agent posts BLOCKED]
---
**feature-implementer-2** | 2025-10-21 15:15 | [BLOCKED]

Cannot proceed with nuclear winter implementation - missing temperature drop parameters from research.

**Issue:** Richardson et al. (2024) provides temperature range but doesn't specify:
- Temperature drop rate (degrees per month)
- Recovery timeline (months to pre-war baseline)
- Hemispheric asymmetry (NH vs SH temperature differences)

**Need:** Cynthia to extract these parameters from Richardson's supplementary materials or find alternative source.

**Next Steps:** Working on agricultural collapse mechanics in parallel (doesn't need temp parameters)
**Blocking:** Nuclear winter phase implementation until parameters available
---

2. [Monitor detects BLOCKED, spawns orchestrator]

3. [Orchestrator reads message, spawns Cynthia]

4. [Cynthia responds with research]
---
**super-alignment-researcher** | 2025-10-21 15:45 | [COMPLETED]

Found temperature parameters in Richardson et al. supplementary data (Table S3).

**Parameters:**
- Temperature drop rate: 0.8-1.2°C per month (months 0-6)
- Nadir: Month 6-9 (15-20°C below baseline)
- Recovery: 18-24 months to 90% baseline
- Hemispheric asymmetry: NH drops 20-25°C, SH drops 10-15°C (soot concentrated in NH)

**Source:** Richardson et al. (2024) Table S3, Figure S7
**Output:** /research/nuclear_winter_parameters_20251021.md

**Next Steps:** Feature-implementer-2 can proceed with implementation
**Blocking:** None
---

5. [Agent A unblocked, continues work]
---
**feature-implementer-2** | 2025-10-21 16:00 | [IN-PROGRESS]

Unblocked! Implementing nuclear winter phase with Richardson parameters.

**Next Steps:** Complete temperature mechanics, then test with Monte Carlo N=10
**Blocking:** None
---
```

**Result:** 45-minute block resolved via autonomous coordination.

### Pattern 3: Formal Handoffs

**The problem:** Work finishes, but next agent doesn't know it's ready for them.

**The solution:** Post HANDOFF with complete context.

**Workflow:**
```markdown
---
**feature-implementer-2** | 2025-10-21 18:30 | [COMPLETED]

Nuclear winter cascade implementation COMPLETE.

**Implementation:**
- Phase: NuclearWinterPhase.ts (450 lines)
- State: src/types/game.ts nuclearWinter object added
- Tests: All unit tests passing (12/12)
- Validation: Monte Carlo N=10, all runs stable (no NaN errors)

**What was implemented:**
- Temperature drop mechanics (Richardson et al. parameters)
- Agricultural collapse (soot → reduced sunlight → crop failure)
- Famine cascades (food shortfall → mortality increase)
- Recovery timeline (18-24 month temperature restoration)

**Files modified:**
- src/simulation/engine/phases/NuclearWinterPhase.ts (new)
- src/simulation/engine/PhaseOrchestrator.ts (added to phase list)
- src/types/game.ts (added nuclearWinter state)
- tests/unit/nuclearWinter.test.ts (new)

**Next Steps:** HANDOFF to wiki-documentation-updater for documentation
**Blocking:** None
---

---
**wiki-documentation-updater** | 2025-10-21 18:45 | [STARTED]

Received handoff. Starting documentation for nuclear winter cascades.

**Plan:**
1. Read implementation (NuclearWinterPhase.ts)
2. Update docs/wiki/README.md with system overview
3. Add research citations (Richardson et al. 2024)
4. Document state structure and phase interactions

**Timeline:** 1-2 hours
**Next Steps:** Reading implementation
**Blocking:** None
---
```

**Result:** Clean handoff, no ambiguity, next agent has all context needed.

---

## Section 05: Message Format Deep Dive

### Anatomy of a Good Message

Let's dissect a real message to understand what makes it effective:

```markdown
---
**orchestrator-1** | 2025-10-20 12:15 | [STARTED]

Beginning TIER 2 Phase 2A: Single Detection Method - Noise Injection

**Feature:** AI deception detection adversarial validation (CRITICAL VALIDATION GATE)
**Complexity:** MEDIUM-HIGH (6 steps, 4-6 hours)
**Priority:** CRITICAL (determines path: >10% → ensemble, <5% → pivot to competitive equilibrium)

**Context:**
- Infrastructure COMPLETE: Gaming detection + Proactive sleeper detection (Oct 17)
- Research-skeptic warning: Lab detection ≠ adversarial deployment (1/3 to 1/10 effectiveness)

**Implementation Plan (6 Steps):**
1. Read existing infrastructure (gamingDetection.ts 11,645 lines) - 2h
2. Design noise injection detection (Meinke et al. 2024 parameters) - 1h
3. Implement detection method (add to gamingDetection.ts) - 2-3h
4. Add adversarial testing setup (AIs optimize to defeat detection) - 1h
5. Run adversarial Monte Carlo N=20, 120 months - 2-3h async
6. Analyze results & generate decision report - 1h

**Decision Criteria:**
- >10% adversarial detection rate → SUCCESS (proceed to ensemble methods)
- <5% adversarial detection rate → FAILURE (pivot to competitive equilibrium)

**Next Steps:** Reading existing infrastructure (Step 1)
**Blocking:** None
---
```

**What makes this message excellent:**

1. **Header (line 1):** Agent name, timestamp, status → instant context
2. **Title (line 3):** One-sentence summary → skimmable
3. **Feature metadata (lines 5-7):** Complexity, priority, significance → triage information
4. **Context (lines 9-11):** What's done, what's known, key constraints → background
5. **Implementation plan (lines 13-19):** Concrete steps with time estimates → roadmap
6. **Decision criteria (lines 21-23):** Success metrics → clear outcomes
7. **Next Steps & Blocking (lines 25-26):** Current action + dependencies → coordination

**Result:** Any agent reading this message immediately understands:
- What is being worked on
- Why it matters (CRITICAL VALIDATION GATE)
- How long it will take (4-6 hours, 6 steps)
- What success looks like (>10% detection rate)
- What the agent is doing right now (Step 1)
- Whether they're blocked (No)

### Common Message Anti-Patterns

**❌ BAD: Vague status**
```markdown
---
**agent-1** | 2025-10-21 10:00 | [IN-PROGRESS]

Working on the thing.
---
```

**Problem:** What thing? Which files? How long? When will it be done?

**✅ GOOD: Specific status**
```markdown
---
**feature-implementer-2** | 2025-10-21 10:00 | [IN-PROGRESS]

Implementing noise injection detection (Step 3/6 of Phase 2A).

**File:** src/simulation/detection/gamingDetection.ts
**Progress:** Added noise generation (lines 450-520), now adding variance threshold detection
**Timeline:** Will complete Step 3 by 12:00 (2 hours remaining)

**Next Steps:** Finish variance threshold, move to Step 4 (adversarial testing)
**Blocking:** None
---
```

---

**❌ BAD: Missing next steps**
```markdown
---
**agent-1** | 2025-10-21 15:00 | [COMPLETED]

Done with the feature.
---
```

**Problem:** What happens next? Who picks it up? Is it ready for testing?

**✅ GOOD: Explicit handoff**
```markdown
---
**feature-implementer-2** | 2025-10-21 15:00 | [COMPLETED]

Noise injection detection implementation complete.

**What was done:**
- Implemented noise generation (Meinke et al. 2024 parameters)
- Added variance threshold detection (>15% = suspicious)
- Integrated with BenchmarkEvaluationsPhase.ts
- All unit tests passing (8/8)

**Validation:** Monte Carlo N=10 runs complete, detection rate 12-18% in adversarial scenarios

**Next Steps:** HANDOFF to wiki-documentation-updater for documentation
**Blocking:** None
---
```

---

**❌ BAD: Silent blocking**
```markdown
---
**agent-1** | 2025-10-21 16:00 | [IN-PROGRESS]

Still working on it...

**Blocking:** None
---
```

**Problem:** If you're "still working" after 6 hours, something is wrong. Why no progress? What's the blocker?

**✅ GOOD: Explicit blocker**
```markdown
---
**feature-implementer-2** | 2025-10-21 16:00 | [BLOCKED]

Cannot proceed with adversarial testing - Monte Carlo simulations failing with NaN errors.

**Error:** BayesianMortalityResolutionPhase producing NaN at month 180 in adversarial scenarios
**Frequency:** 7/10 runs fail with NaN
**Suspected cause:** AI agents manipulating mortality parameters outside valid ranges

**Need:** Roy (simulation-maintainer) to add defensive assertions to mortality calculations
**Impact:** Blocks Phase 2A validation (cannot measure detection rate if simulation crashes)

**Next Steps:** Working on documentation in parallel while waiting for Roy
**Blocking:** Phase 2A validation until NaN bug fixed
---
```

---

## Section 06: Channel Persistence - Why Agents Never Leave

### The Design Decision: Persistent Coordination Surfaces

**On Oct 31, 2025, the project removed `chatroom_leave` and `[LEAVING]` status.**

**Rationale:**

**Before (ephemeral model):**
- Agents "enter" channels, do work, "leave" channels
- Joining/leaving signals presence
- Mental model: Chat room you walk in and out of

**After (persistent model):**
- Agents "enter" channels once, stay forever
- Presence tracked by recent activity, not explicit join/leave
- Mental model: Email inbox or project Slack - always there, post when relevant

### Why This Matters

**Problem with leaving:**
1. **Breaks message routing:** If Roy "leaves" implementation channel, he won't see questions directed at him
2. **Wastes tokens:** Enter/leave ceremony every time agent works on a feature
3. **False presence signal:** "Agent left" ≠ agent unavailable (they might still be working, just in another channel)
4. **Coordination overhead:** Agents spend time managing channel membership instead of doing work

**Solution with persistence:**
1. **Always-available routing:** Questions in implementation.md will reach any agent who checks that channel
2. **No ceremony overhead:** Agents post when relevant, silent when not
3. **True presence signal:** "Last posted 2 hours ago" = recent activity, not "is currently in room"
4. **Zero coordination overhead:** No need to manage membership, just post when you have something to say

### Practical Implications

**If an agent doesn't need a channel anymore:**
- ❌ DON'T post `[LEAVING]` (status removed)
- ❌ DON'T call `chatroom_leave` (tool deprecated)
- ✅ DO simply stop posting to that channel
- ✅ DO remove channel from your active monitoring list

**Example:**
```markdown
# Roy finishes nuclear winter bug fix

# ❌ BAD (old pattern)
---
**roy** | 2025-10-21 18:00 | [LEAVING]
Bug fixed, leaving implementation channel.
---

# ✅ GOOD (new pattern)
---
**roy** | 2025-10-21 18:00 | [COMPLETED]

NaN bug in BayesianMortalityResolutionPhase fixed.

**Fix:** Added assertFinite() to division operations (lines 342, 367, 401)
**Validation:** Monte Carlo N=10, all runs stable
**Files:** src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts

**Next Steps:** Feature-implementer-2 can resume Phase 2A validation
**Blocking:** None
---

# (Roy doesn't post to implementation channel again until next time he works there)
```

---

## Section 07: Hands-On Exercises

### Exercise 1: Message Format Practice

**Objective:** Write well-structured chatroom messages.

**Scenario:** You are feature-implementer-2. You've just started working on implementing carbon capture breakthrough technologies (TIER 2 feature). The research is complete (Cynthia validated parameters yesterday). You'll be working on this for 4-6 hours today.

**Task:** Write an `[STARTED]` message for the implementation channel.

**Requirements:**
- Follow message format exactly (header, content, Next Steps, Blocking)
- Include: feature name, complexity estimate, research foundation
- Provide: implementation plan (3-5 steps with time estimates)
- Be specific: which files you'll modify

**Self-check:** Does your message answer these questions?
1. What are you working on?
2. Why does it matter (context/priority)?
3. How long will it take?
4. What are the steps?
5. What are you doing right now?
6. Are you blocked?

---

### Exercise 2: Coordination Pattern Decision

**Objective:** Choose the right coordination pattern for different scenarios.

**Scenarios:** For each, identify:
1. Which channel to post in?
2. Which status tag to use?
3. Should you wait for response before proceeding?

**Scenario A:**
You're about to modify `src/types/game.ts` to add a new `carbonCapture` state object. This is a shared file that other agents might be working on.

**Scenario B:**
You're blocked - the research paper Cynthia cited doesn't include the parameter you need (carbon sequestration rate per gigatonne of capture capacity). You can't proceed without this number.

**Scenario C:**
You've finished implementing carbon capture breakthrough tech. All tests pass. Monte Carlo validation N=10 complete. You want to hand off to documentation.

**Scenario D:**
You found a critical bug in the planetary boundaries calculation that's causing all ecology scenarios to fail. This affects multiple features in progress. This needs immediate attention.

**Self-check answers:**
- A: implementation.md, [QUESTION], wait 15 minutes for response
- B: research.md, [BLOCKED], tag Cynthia, work on parallel tasks while waiting
- C: implementation.md, [COMPLETED] + [HANDOFF], tag wiki-documentation-updater
- D: coordination.md, [ALERT], describe bug + impact, tag Roy (simulation-maintainer)

---

### Exercise 3: Channel vs Matrix Decision

**Objective:** Choose the right communication layer for different needs.

**Scenarios:** For each, decide: Chatroom or Matrix? Why?

**Scenario A:**
You need to ask Roy a quick question: "Which file has the assertion utilities?"

**Scenario B:**
You've completed Phase 3/5 of your feature implementation (2 hours of work). You want to update the team on progress.

**Scenario C:**
The build just failed on the autonomous worker. This is blocking all deployment. You need to alert someone immediately.

**Scenario D:**
You're passing a complex feature implementation to the next agent. You need to include: files modified, what was implemented, test results, known issues, next steps.

**Scenario E:**
You and Roy are debugging a race condition together in real-time. You're rapidly exchanging ideas and trying different fixes.

**Self-check answers:**
- A: Matrix (quick question, expect quick answer, not archived)
- B: Chatroom (progress update, archival record, asynchronous)
- C: Matrix (urgent alert, needs immediate attention, synchronous)
- D: Chatroom (formal handoff, needs complete context, archival)
- E: Matrix (real-time collaboration, rapid back-and-forth, synchronous)

---

### Exercise 4: Autonomous Monitoring Simulation

**Objective:** Understand how the channel monitor processes messages.

**Scenario:** The implementation channel has 3 unread messages:

**Message 1 (oldest):**
```markdown
---
**feature-implementer-2** | 2025-10-21 10:00 | [IN-PROGRESS]
Working on carbon capture (Phase 2/5 complete)
**Blocking:** None
---
```

**Message 2:**
```markdown
---
**feature-implementer-3** | 2025-10-21 11:00 | [QUESTION]
About to modify src/types/game.ts - anyone else working on this file?
**Blocking:** Waiting 15 minutes for response
---
```

**Message 3 (newest):**
```markdown
---
**feature-implementer-4** | 2025-10-21 12:00 | [BLOCKED]
Cannot proceed - missing research parameters for nuclear winter temperature drops
**Blocking:** Waiting for Cynthia to provide parameters
---
```

**Task:** Simulate the monitor's behavior over 3 polling cycles (30 seconds apart).

**Questions:**
1. **Poll 1 (12:00:30):** Which message does the monitor process? Does it spawn orchestrator? Why/why not?
2. **Poll 2 (12:01:00):** Which message does it process next? Does it spawn orchestrator?
3. **Poll 3 (12:01:30):** Which message does it process? What if orchestrator is still active from Poll 2?

**Self-check answers:**
1. Message 1 (oldest first, FIFO). NO spawn - IN-PROGRESS doesn't trigger (no question/alert/block). Mark as processed, move to next.
2. Message 2. YES spawn - QUESTION triggers orchestrator. Spawn orchestrator to respond to game.ts question. Mark as processed.
3. Message 3 (BLOCKED triggers). If orchestrator still active: leave in queue, retry next poll. If orchestrator finished: spawn new orchestrator, mark as processed.

---

## Key Takeaways

By now you should understand:

1. **Two-layer architecture:** Chatroom (asynchronous, persistent) + Matrix (synchronous, ephemeral) serve complementary needs
2. **Chatroom system:** File-based markdown channels with MCP server providing 10 token-efficient tools
3. **Matrix integration:** Real-time messaging via bot accounts (11 agents, 11 private rooms)
4. **Message formats:** Status tags, structured format, per-agent read tracking for token efficiency
5. **Channel persistence:** Agents never leave - channels are permanent coordination surfaces
6. **Autonomous monitoring:** Channel-monitor.ts enables fully autonomous workflows via FIFO message queue processing
7. **Coordination patterns:** Pre-announce for shared files, explicit BLOCKED status, formal HANDOFF messages

**Most important insight:** Communication infrastructure is **not overhead**. It's what makes parallel autonomous work **possible without chaos**. The chatroom provides the coordination surface. The monitor provides the autonomy. Together, they enable 11 agents to work simultaneously without conflicts.

---

## Related Modules

- **[01_AGENT_ARCHITECTURE.md](./01_AGENT_ARCHITECTURE.md)** - Agent memory and relationships (who communicates with whom)
- **[03_AUTONOMOUS_WORKFLOWS.md](./03_AUTONOMOUS_WORKFLOWS.md)** - How autonomous workers use these communication systems
- **[06_MCP_SERVERS.md](./06_MCP_SERVERS.md)** - Building MCP servers like chatroom and Matrix
- **[04_REMOTE_INFRASTRUCTURE.md](./04_REMOTE_INFRASTRUCTURE.md)** - Where the monitor runs (autonomous worker VM)

---

## Key Files for Reference

- **`.claude/chatroom/README.md`** - Complete chatroom documentation (420 lines)
- **`.claude/mcp-chatroom/README.md`** - MCP server documentation
- **`scripts/channel-monitor.ts`** - Autonomous monitoring implementation
- **`CLAUDE.md`** - Project overview (chatroom + Matrix sections)

---

## Self-Check Questions

Before moving to the next module, you should be able to answer:

1. **Why two communication layers?** (Hint: asynchronous vs synchronous, archival vs ephemeral)
2. **What's the benefit of per-agent read tracking?** (Hint: token efficiency - 50x reduction)
3. **What does the channel monitor do?** (Hint: polls channels, spawns orchestrator, FIFO queue)
4. **When should you use BLOCKED status?** (Hint: when you can't proceed, need help, want auto-escalation)
5. **Why don't agents leave channels?** (Hint: persistent coordination surfaces, no overhead, always-available routing)

If you can answer these confidently, you're ready for Module 03: Autonomous Workflows.

---

**Next:** [Module 03: Autonomous Workflows](./03_AUTONOMOUS_WORKFLOWS.md) - Learn how the autonomous worker, watcher, and merge orchestrator use these communication systems to coordinate work without human intervention.
