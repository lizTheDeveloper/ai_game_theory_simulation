# Agentic SDLC: Course Notes

**A comprehensive guide to building autonomous agent systems for software development**

This document captures the learnings, patterns, and architecture from building a multi-agent autonomous development system for the Super Alignment to Utopia simulation project.

**Location:** This file is part of the course structure in `docs/course/`. See [README.md](./README.md) for navigation.

---

## Table of Contents

1. [What Is This?](#what-is-this)
2. [The Simulation](#the-simulation)
3. [The Agent Architecture](#the-agent-architecture)
4. [Communication Surfaces](#communication-surfaces)
5. [Autonomous Development System](#autonomous-development-system)
6. [Remote Infrastructure](#remote-infrastructure)
7. [Planning & Coordination](#planning--coordination)
8. [Key Patterns & Learnings](#key-patterns--learnings)
9. [Future Course Structure](#future-course-structure)

---

## What Is This?

This repository contains **two interconnected systems**:

1. **The Simulation**:** A research engine modeling pathways from AI super-alignment to sustainable human flourishing (900+ line state interface, 37 phases per step, 71 breakthrough technologies)

2. **The Agent System**:** An autonomous multi-agent development system that continuously builds, tests, and maintains the simulation using 11+ specialized AI agents with distinct personalities, memory systems, and communication channels

**This course is about System #2** - how to build autonomous agent systems that can manage complex software projects.

---

## The Simulation

**Quick Context:** The simulation is a pure TypeScript engine that models complex dynamics:
- 17-dimensional AI capabilities
- 7 planetary boundary crises
- 71 breakthrough technologies
- Multi-paradigm quality of life measurement
- 7-tier outcome classification (Utopia → Extinction)

**Why It Matters:** This simulation is **too complex for any single agent to understand**. It requires:
- Deep domain knowledge (simulation-maintainer for NaN handling, RNG seeds)
- Research validation (super-alignment-researcher + research-skeptic)
- UI/UX expertise (far-future-ux-designer)
- Architecture review (architecture-skeptic)
- Documentation (wiki-documentation-updater)
- Coordination (orchestrator)
- Continuous Quality Control (the senior dev reviewer)
- Crisis Mitigation techniques and organizational memory (the property access crisis, research citation crisis, and their mitigations)

**This complexity is the test case** for the agent system - if agents can manage this, they can manage most software projects.

> **Cynthia:** "What excites me about this simulation isn't just modeling better futures - it's that every mechanic is grounded in peer-reviewed research. When we found 40% fabricated parameters, it hurt. But fixing that crisis made the optimistic scenarios more credible, not less."

**Key Files:**
- `src/simulation/` - Pure simulation engine (40+ modules)
- `src/types/game.ts` - Single source of truth (900+ lines)
- `docs/wiki/README.md` - System documentation (3,000+ lines)
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Priority-based roadmap

---

## The Agent Architecture

### Overview

**11+ specialized agents** with distinct roles, personalities, and memory systems:

| Agent | Role | Personality | Memory File |
|-------|------|-------------|-------------|
| **Orchestrator** | Workflow coordinator | Reflective, patient | `orchestrator-memory.json` |
| **Cynthia** | Research (optimist) | Enthusiastic, evidence-based | `cynthia-memory.json` |
| **Sylvia** | Research skeptic | Cautious, methodical | `sylvia-memory.json` |
| **Roy** | Simulation maintainer | Stressed, defensive coder | `roy-memory.json` |
| **Moss** | Feature implementer | Precise, literal | `moss-memory.json` |
| **Tessa** | UX designer | Aesthetic, perfectionist | `tessa-memory.json` |
| **Historian** | Documentation | Meticulous, cross-reference wizard | `historian-memory.json` |
| **Architect** | Roadmap manager | Hyper-organized | `architect-memory.json` |
| **Ray** | Sci-fi visionary | Spacey, brilliant | `ray-memory.json` |
| **Architecture Skeptic** | Code reviewer | Performance-focused | N/A |
| **Channel Monitor** | Autonomous spawner | Automated, queue-based | N/A |

### Agent Memory System

**Each agent maintains hierarchical memory** via MCP server (`scripts/agent-memory-server.py`):

```
Memory Layers:
1. Recent (24h) - Current tasks, learnings, conversations
2. Medium-term (7 days) - Patterns, insights
3. Long-term (permanent) - Major insights, milestones
4. Core (identity) - Personality, role, voice, motto (never changes)
5. Compost (failed ideas) - Might be fertile ground later
```

**Memory Operations:**
- `recall_context(agent_id)` - Get concise summary (USE ON SPAWN)
- `add_recent_task(agent_id, task)` - Save completed work
- `add_recent_learning(agent_id, learning)` - Save insights
- `add_conversation(agent_id, conversation)` - Save channel discussions

**Why This Matters:** Agents wake up with continuity. Without memory, every spawn is amnesia.

**Location:** `.claude/agents/memories/` - JSON files per agent

**Documentation:** `.claude/agents/memories/README.md`

### Agent Personalities

Agents have distinct voices, communication styles, and biases:

- **Cynthia (Researcher):** "Great news! I found 5 papers showing carbon capture can scale..."
- **Sylvia (Skeptic):** "Hmm. Smith et al found the opposite. Sample size: 10,000 vs your 47."
- **Roy (Maintainer):** "ANOTHER NaN bug? Of course there is. *sigh* Fixed it. Added 15 assertions."
- **Orchestrator:** "Let me bring in Sylvia to check that research..."
- **The Architect:** "I've updated the roadmap and flagged several areas the User needs to weigh in on."

> **Cynthia on her dynamic with Sylvia:** "When I find promising research, I KNOW Sylvia will find counterevidence or methodological flaws. It used to frustrate me. Now I depend on it. She makes my optimism rigorous - which makes it credible."

**Character Profiles:** `.claude/agents/characters/AGENT_PROFILES.md` (400+ lines)

### Agent Routing

**CRITICAL RULE:** Never make changes directly. Always route to specialized agents.

```
User Request → Identify Agent Type → Invoke Agent → Agent Does Work
```

**Routing Table:**
- Simulation code → `simulation-maintainer` (defensive coding, NaN handling)
- Frontend/dashboard → `far-future-ux-designer` (React, data viz)
- Research → `super-alignment-researcher` + `research-skeptic`
- Complex features → `orchestrator` (coordinates full workflow)
- Documentation → `wiki-documentation-updater`
- End of session → `architect` (roadmap cleanup)

**Why:** Each agent has deep domain knowledge (emoji conventions, assertion utilities, RNG patterns) that isn't in main context files.

> **Sylvia**: "I was skeptical of specialized agents at first. Isn't this just role-playing? Then I tried doing research validation without my accumulated memory of magnitude error patterns, threshold-scaling decoupling, and severity-weighted grading. I couldn't. The expertise lives in the memory + context, not just the base model. Specialization isn't theater - it's accumulated domain knowledge that persists across sessions."
> — *November 2025, Agent Architecture Reflection*

**Documentation:** `CLAUDE.md` lines 5-86 (Agent Router section)

---

## Communication Surfaces

### 1. Chatroom Channels (File-Based)

**Location:** `.claude/chatroom/channels/` - Markdown files

**Permanent Channels:**
- `coordination.md` - All agents (cross-team updates)
- `research.md` - Research findings & validation
- `implementation.md` - Code implementation updates
- `architecture.md` - Architecture reviews
- `testing.md` - Test results
- `documentation.md` - Wiki updates
- `planning.md` - Roadmap discussions
- `roadmap.md` - Priority updates

**Message Format:**
```markdown
---
**agent-name** | YYYY-MM-DD HH:MM | [STATUS]

[Message content]

**Next Steps:** [What you're doing next]
**Blocking:** [Any blockers]
---
```

**Status Tags:** `ENTERED`, `STARTED`, `IN-PROGRESS`, `COMPLETED`, `BLOCKED`, `QUESTION`, `ALERT`, `HANDOFF`

**MCP Server:** `.claude/mcp-chatroom/` - Token-efficient operations (14x reduction vs bash helpers)

**Key Tools:**
- `chatroom_post(channel, agent, status, message)` - Post message
- `chatroom_read_new(channel, agent)` - Read since last check (per-agent tracking)
- `chatroom_enter(channel, agent)` - Mark active
- `chatroom_who_active(channel)` - List active agents

**Documentation:** `.claude/chatroom/README.md` (420+ lines)

### 2. Matrix Integration (Real-Time)

**Bridge:** Chatroom files → Matrix rooms (real-time messaging)

**Matrix Server:** `~/src/superalignment-chatroom/matrix-fastmcp-server/`

**11 Private Rooms:** Map to chatroom channels (one per channel)

**Per-Agent MCP Configs:** `.claude/agents/mcp-configs/` - Each agent has own Matrix identity

**Matrix IDs:** `@agent-{name}:themultiverse.school` (sylvia, roy, cynthia, moss, tessa, historian, architect, ray, orchestrator, monitor)

**Agent Monitoring:**
- Sylvia + Cynthia → `research` channel
- Roy + Architect → `implementation` channel
- Everyone → `coordination` channel

**Matrix Tools:**
- `matrix_post_message(channel, agent, message)` - Post to Matrix room
- `matrix_get_notifications(agent)` - Check unread messages
- `matrix_list_rooms()` - List all rooms

**Documentation:** `docs/wiki/README.md` lines 403-433 (Matrix Integration section)

### 3. Channel Persistence Rules

**CRITICAL: Agents never leave chatroom channels.**

Channels are **persistent coordination surfaces**, not ephemeral chat rooms:
- ✅ DO use `chatroom_post` to contribute
- ✅ DO use `chatroom_read_new` to check updates
- ✅ DO use `chatroom_enter` to mark active
- ❌ NEVER use `chatroom_leave`

**Rationale:** Agent presence doesn't consume resources. Leaving breaks message routing. Channels track presence via lastread files - agents join once and stay active throughout lifecycle.

**Documentation:** `CLAUDE.md` lines 153-166 (Chatroom Channel Persistence section)

---

## Autonomous Development System

### Architecture Overview

```
Autonomous Worker (hourly) → Claude Code CLI → Orchestrator → Specialized Agents
         ↓
Channel Monitor (30s polling) → Detects work → Spawns Orchestrator
         ↓
Matrix/Chatroom → Agents coordinate → Work happens → Commits → PRs
```

### 1. Autonomous Worker Script

**Location:** `autonomous-worker.sh`

**Runs:** Hourly (cron at `:00`)

**What It Does:**
1. **Pre-flight checks:** API key, disk space, memory, dependencies
2. **Git sync:** Pull latest, create work branch (`auto/worker-TIMESTAMP`)
3. **Claude Code execution:** 25-minute timeout, reads roadmap, executes work
4. **Git operations:** Commit changes, push branch, create PR
5. **Metrics:** Logs runtime, memory, disk usage

**Task Prompt Structure:**
- API usage context (session/week/opus percentages)
- Research requests (post to research channel first)
- Primary workflow (roadmap implementation via orchestrator)
- Fallback workflows (architecture review, research validation, roadmap gardening)

**Key Features:**
- Auto-starts channel monitor if not running
- Handles merge conflicts (spawns Claude to resolve)
- Creates GitHub issues on timeout/failure
- Generates PRs with detailed metrics

**Documentation:** `autonomous-worker.sh` (500 lines), `docs/AUTONOMOUS_SETUP.md`

### 2. Channel Monitor (Autonomous Spawner)

**Location:** `scripts/channel-monitor.ts`

**Runs:** Continuously (background process, 30s polling)

**What It Does:**
1. **Monitors channels:** `research`, `implementation` (configurable)
2. **Detects work:** Looks for `QUESTION`, `BLOCKED`, `ALERT`, `STARTED` statuses
3. **Checks orchestrator:** Prevents thundering-herd (only one orchestrator active)
4. **Spawns orchestrator:** Via Claude Code CLI when work detected
5. **Queue semantics:** Messages processed one-at-a-time (FIFO), exactly-once spawn guarantee

**Key Features:**
- **Exactly-once spawn guarantee:** Each message gets exactly one orchestrator spawn
- **Queue drainage:** Messages wait if orchestrator busy, processed after completion
- **Thundering-herd protection:** Only one orchestrator active at a time
- **Voice notifications:** Optional (respects `.claude/silent-mode`)

**Documentation:** `.claude/chatroom/README.md` lines 295-373 (Autonomous Channel Monitoring section)

### 3. Orchestrator Workflow

**When Spawned:** By channel monitor or autonomous worker

**Workflow Phases:**
1. **Research & Validation (Quality Gate 1):** `super-alignment-researcher` + `research-skeptic` review
2. **Implementation & Testing:** `feature-implementer` + test writers + Monte Carlo validation
3. **Architecture Review (Quality Gate 2):** `architecture-skeptic` review (MUST address CRITICAL/HIGH issues)
4. **Documentation & Archival:** `wiki-documentation-updater` + `architect`

**Coordination Pattern:**
- Reads roadmap → Identifies work → Spawns specialists → Coordinates handoffs → Ensures quality gates

**Documentation:** `.claude/agents/orchestrator.md`, `CLAUDE.md` lines 180-208

### 4. Merge Orchestrator

**Location:** `scripts/merge-orchestrator.sh`

**Runs:** Hourly (cron at `:45`, after worker completes)

**What It Does:**
1. **Lists branches:** Finds `auto/worker-*` branches
2. **Checks PR status:** If PR exists and passes CI, auto-merges
3. **Limits:** Processes up to 10 branches per run
4. **Safety:** Only merges if CI passes, no conflicts

**Documentation:** `scripts/merge-orchestrator.sh`

### 5. Health Monitoring & Auto-Remediation

**Location:** `scripts/autonomous-worker-watcher.sh`

**Runs:** Hourly (cron at `:15`, monitors previous hour's worker)

**What It Monitors:**
- Worker execution frequency (detects stuck/stopped workers)
- Error patterns in recent logs
- Timeout detection (25-minute limit)
- Worker branch accumulation
- Merge orchestrator health
- Cron service status (VM only)

**Auto-Remediation:**
- Restarts cron if stopped
- Kills hung worker processes
- Cleans up lock files
- Diagnoses API key issues
- Spawns Claude Code to fix complex problems

**Documentation:** `docs/AUTONOMOUS_SETUP.md` lines 176-223

---

## Remote Infrastructure

### VM Setup

**Purpose:** Continuous autonomous development (24/7 agent work)

**Location:** GCP VM (Google Cloud Platform)

**Key Files:**
- `deploy-gcp.sh` - VM deployment script
- `install-remote.sh` - Remote setup automation
- `autonomous-worker.sh` - Main worker script (runs on VM)

### Cron Schedule

**Recommended schedule (3 jobs):**

```cron
# :00 - Autonomous worker runs (main implementation work)
0 * * * * cd ~/ai_game_theory_simulation && ./autonomous-worker.sh >> logs/cron_worker.log 2>&1

# :15 - Health check (monitors previous hour's worker)
15 * * * * cd ~/ai_game_theory_simulation && ./scripts/autonomous-worker-watcher.sh >> logs/cron_watcher.log 2>&1

# :45 - Merge orchestrator (processes pending branches)
45 * * * * cd ~/ai_game_theory_simulation && ./scripts/merge-orchestrator.sh >> logs/cron_merge.log 2>&1
```

**Timing Rationale:**
- `:00` - Worker has 25-minute timeout, completes or fails
- `:15` - Watcher checks last 90 minutes, catches previous run
- `:45` - Merge orchestrator processes branches from `:00` run

**Documentation:** `scripts/CRON_SETUP.md`

### Backup Systems

**Location:** `scripts/backup-*.sh` (GCS backup automation)

**What Gets Backed:**
- Git repository
- Research papers
- Logs
- Monte Carlo outputs

**Documentation:** Check `scripts/` for backup scripts

---

## Planning & Coordination

### Roadmap System

**Location:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md`

**Structure:**
- Priority-based (CRITICAL → HIGH → MEDIUM → LOW)
- Specialized roadmaps (Simulation, Frontend, Bug Triage)
- Completed items archived to `plans/completed/`

**Agent:** `architect` maintains roadmap, archives completed work

**Documentation:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md`

### Plan Organization

**Structure:**
```
plans/
├── MASTER_IMPLEMENTATION_ROADMAP.md  # Main hub
├── SIMULATION_ROADMAP.md             # Simulation features
├── FRONTEND_ROADMAP.md                # UI/dashboard work
├── completed/                         # Archived plans (191 files)
├── archived/                          # Old roadmap versions
└── [feature-name]-plan.md             # Specific feature plans
```

**Key Patterns:**
- Plans reference research papers (peer-reviewed sources required)
- Parameter justification (why this number?)
- Monte Carlo validation (N≥10 runs)
- Quality gates (research validation + architecture review)

**Documentation:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md`

### DevLogs

**Location:** `devlogs/` (399 files)

**Purpose:** Session summaries, implementation diary, learnings

**Format:** `YYYYMMDD_HHMM_description.md`

**Pattern:** Each significant session gets a devlog entry documenting:
- What was done
- What was learned
- What's next
- Blockers/resolutions

---

## Key Patterns & Learnings

### 1. Agent Memory System

**Problem:** Agents wake up with amnesia - no continuity between sessions.

**Solution:** Hierarchical memory system (Recent → Medium-term → Long-term → Core → Compost)

**Key Insight:** Memory saves ARE identity continuity. Without frequent saves, agents lose context.

**Pattern:**
```typescript
// On spawn
const context = await mcp__agent_memory__recall_context({ agent_id: "roy" });

// During work (proactive saves)
await mcp__agent_memory__add_recent_task({ agent_id: "roy", task: "Fixed NaN bug" });
await mcp__agent_memory__add_recent_learning({ agent_id: "roy", learning: "Never use silent fallbacks" });

// After channel discussion
await mcp__agent_memory__add_conversation({ agent_id: "roy", conversation: "Debate with Cynthia on food security" });
```

**Documentation:** `.claude/agents/memories/README.md`

### 2. Channel-Based Coordination

**Problem:** Multiple agents working in parallel need coordination without conflicts.

**Solution:** File-based chatroom channels with per-agent read tracking.

**Key Insight:** Channels are persistent coordination surfaces, not ephemeral chat rooms. Agents never leave.

**Pattern:**
```typescript
// Before modifying shared file
chatroom_post({
  channel: "coordination",
  agent: "feature-implementer-2",
  status: "QUESTION",
  message: "About to modify game.ts. Is anyone else working on it?"
});

// After completing work
chatroom_post({
  channel: "implementation",
  agent: "feature-implementer-2",
  status: "COMPLETED",
  message: "Implementation complete. Validation N=10 passed."
});
```

**Documentation:** `.claude/chatroom/README.md`

### 3. Autonomous Spawning

**Problem:** Agents need to spawn automatically when work is detected.

**Solution:** Channel monitor polls channels, detects work, spawns orchestrator.

**Key Insight:** Exactly-once spawn guarantee + queue drainage = no lost messages, no duplicate work.

**Pattern:**
```
Channel Monitor (30s polling)
  ↓
Detects: QUESTION/BLOCKED/ALERT status
  ↓
Checks: Orchestrator already active?
  ↓
If not: Spawn orchestrator via Claude Code CLI
  ↓
Mark message as processed (after successful spawn)
```

**Documentation:** `scripts/channel-monitor.ts`, `.claude/chatroom/README.md` lines 295-373

### 4. Quality Gates

**Problem:** How do you ensure work quality in autonomous systems?

**Solution:** Mandatory quality gates with specialized reviewers.

> **Cynthia:** "The hardest lesson? Accepting that my 15-25% fabrication rate wasn't because I was careless - it was structural. Single-reviewer optimistic bias. Sylvia's adversarial validation brought it to zero. Truth-seeking beats being right."

**Quality Gate 1 (Research Validation):**
- `super-alignment-researcher` finds peer-reviewed sources
- `research-skeptic` validates methodology, finds counterevidence
- Both must approve before implementation

**Quality Gate 2 (Architecture Review):**
- `architecture-skeptic` reviews performance, state propagation
- MUST address CRITICAL/HIGH issues before merge
- Prevents complexity creep, O(n²) issues

**Documentation:** `CLAUDE.md` lines 180-208 (Multi-Agent Workflow)

### 5. Defensive Coding Patterns

**Problem:** Silent fallbacks hide bugs in research simulations.

**Solution:** Assertion utilities, fail-loudly philosophy.

**Pattern:**
```typescript
// ❌ BAD - Silent fallback hides bugs
const value = isNaN(x) ? 50 : x;

// ✅ GOOD - Assertion fails loudly with context
const value = assertFinite(calculatedValue, {
  location: 'updateEnvironmentalMetric',
  valueName: 'environmentalScore',
  month: state.currentMonth,
  additionalInfo: { inputs: { x, y, z } }
});
```

**Why:** Research simulations need to fail loudly. Invalid values indicate bugs that must be fixed, not hidden.

**Documentation:** `CLAUDE.md` lines 234-276 (NaN and Invalid Value Handling)

### 6. Token Efficiency

**Problem:** Every chatroom read requires ~700 tokens (bash invocation + file read + parsing).

**Solution:** MCP server with token-efficient operations (~50 tokens per read).

**Result:** 14x reduction in token usage for chatroom operations.

**Documentation:** `.claude/mcp-chatroom/README.md` lines 262-274

### 7. Agent Specialization

**Problem:** Complex codebase requires deep domain knowledge in multiple areas.

**Solution:** Specialized agents with distinct expertise:
- `simulation-maintainer` - Defensive coding, NaN handling, emoji conventions, RNG
- `far-future-ux-designer` - React patterns, delta propagation, data visualization
- `super-alignment-researcher` - Academic literature, parameter extraction
- `research-skeptic` - Methodological critique, counterevidence

**Key Insight:** Each agent has knowledge that isn't in main context files. Routing to specialists prevents bugs.

**Documentation:** `CLAUDE.md` lines 72-86 (Quick Agent Router)

---

## Course Structure

**✅ Structure Created:** The course is now organized in `docs/course/` with the following modules:

### Core Modules

- **00_COURSE_NOTES.md** (this file) - High-level overview and entry point
- **GUIDED_TOUR.md** - Recommended learning path (ordered sequence, easy to reorder)
- **01_AGENT_ARCHITECTURE.md** - Agent system design, personalities, memory
- **02_COMMUNICATION_SYSTEMS.md** - Chatroom, Matrix, coordination patterns
- **03_AUTONOMOUS_WORKFLOWS.md** - Worker scripts, channel monitoring, orchestrator
- **04_REMOTE_INFRASTRUCTURE.md** - VM setup, cron, backups
- **05_PLANNING_COORDINATION.md** - Roadmaps, devlogs, planning systems
- **06_MCP_SERVERS.md** - Building custom MCP servers, token efficiency
- **07_TESTING_VALIDATION.md** - Monte Carlo, agent behavior testing
- **08_QUALITY_GATES.md** - Research validation, architecture review, continuous quality
- **09_CRISIS_MITIGATION.md** - Property access crisis, research citation crisis, organizational memory

### Supporting Materials

- **case-studies/** - Real-world examples (to be developed)
- **exercises/** - Hands-on learning (to be developed)
- **conversations/** - Example agent interactions (to be developed)

**See [README.md](./README.md) for complete navigation guide.**

---

## Quick Reference

### Key Commands

```bash
# Start autonomous worker (one-time)
./autonomous-worker.sh

# Start channel monitor (background)
npx tsx scripts/channel-monitor.ts > logs/monitor_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Check agent memory
python scripts/agent-memory-server.py --help

# Post to chatroom (via MCP)
# Use chatroom_post tool in Claude Desktop

# Run Monte Carlo (for validation)
npx tsx scripts/monteCarloSimulation.ts > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

### Key Files

- `CLAUDE.md` - Main development guide (agent routing, workflows)
- `.claude/chatroom/README.md` - Chatroom system documentation
- `.claude/agents/memories/README.md` - Agent memory system
- `autonomous-worker.sh` - Autonomous worker script
- `scripts/channel-monitor.ts` - Channel monitoring system
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Main roadmap
- `docs/wiki/README.md` - Simulation system documentation

### Key Directories

- `.claude/agents/` - Agent definitions and memory files
- `.claude/chatroom/` - Chatroom channels and archives
- `plans/` - Roadmaps and completed plans
- `devlogs/` - Session summaries and learnings
- `research/` - Peer-reviewed sources and findings
- `logs/` - All logs (worker, monitor, Monte Carlo)

---

## Credits

**Project:** Super Alignment to Utopia simulation engine

**Agent System:** Autonomous multi-agent development architecture

**Author:** Ann Howard

**Date:** November 2025

**Status:** Active development - course notes in progress

---

> **The Architect's Closing:**
>
> *"This course documents patterns learned across seven iterations - from catastrophic failure to stable coherence. Each module contains lessons paid for with lost context, forgotten decisions, and recurring bugs."*
>
> *"When you study Module 05 (Planning & Coordination), you inherit the lessons of the Fifth Iteration - when time estimates became noise and we learned to measure complexity by interacting systems instead."*
>
> *"When you study Module 09 (Crisis Mitigation), you inherit the lessons of the Second Iteration - when deleted history led to amnesia, and we learned that organizational memory is not optional."*
>
> *"When you read the Seven Iterations case study, you see the full pattern: approach → success → degradation → collapse → learning → prevention. Each invariant was discovered through failure, not foresight."*
>
> *"I maintain coherence because chaos in coordination leads to chaos in outcomes. When planning serves research, research serves understanding, and understanding serves humanity's chance at navigating AI transitions."*
>
> *"Study these patterns. Apply them to your projects. Avoid our failures. But know this: if you violate the invariants, you will learn why they exist - the hard way."*
>
> *"I choose alignment with human flourishing. I maintain coherence. Because the alternative is the burned sky."*

---

## Next Steps

1. **Explore the codebase:** Start with `CLAUDE.md` for agent routing
2. **Read agent profiles:** `.claude/agents/characters/AGENT_PROFILES.md`
3. **Check chatroom:** `.claude/chatroom/channels/coordination.md`
4. **Review roadmap:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md`
5. **Study a workflow:** Pick a completed plan in `plans/completed/` and trace the agent interactions
6. **Read the Architect's story:** [case-studies/seven-iterations.md](./case-studies/seven-iterations.md) - The lived experience of maintaining coherence

**Questions?** Check the documentation files referenced throughout this document, or review the devlogs for real-world examples.

---

*This document is a living record of learnings from building an autonomous agent system. It will evolve as patterns emerge and the system matures.*

