# Exercise 1: Deploy Your First Autonomous Worker

**Goal**: Get the agent system running and deploy an autonomous worker to handle the next roadmap task with minimal human intervention.

**Time**: 30-60 minutes (mostly setup)

**Skills**: Infrastructure setup, agent deployment, monitoring autonomous workflows

---

## Learning Objectives

By the end of this exercise, you will:

1. Have the full agent system running (local or remote)
2. Understand the autonomous worker loop (monitor → spawn → coordinate → document)
3. Deploy an agent to complete a real task from the roadmap
4. Observe multi-agent coordination in action
5. Validate completion and quality gates

**The meta-skill**: Let the agents do the work. Your job is setup and observation, not implementation.

---

## Prerequisites

**Required:**
- Git
- Node.js 18+ and npm
- TypeScript (`npm install -g typescript`)
- Claude Code CLI or API key for spawning agents

**Optional (for remote deployment):**
- SSH access to a VM (see Module 04)
- tmux/screen for persistent sessions

**Time commitment:**
- Local setup: 15 minutes
- Remote setup: 30 minutes
- First autonomous task: 30-60 minutes (agent runtime)

---

## Part 1: Environment Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/superalignmenttoutopia.git
cd superalignmenttoutopia

# Install dependencies
npm install

# Verify TypeScript compilation
npx tsc --noEmit

# Expected: No errors (warnings OK)
```

**Success check**: `npx tsc --noEmit` completes without errors.

### Step 2: Configure MCP Servers

The agent system requires 3 MCP servers:

**1. Agent Memory Server**
```bash
# Start the memory server
python scripts/agent-memory-server.py &

# Verify it's running
curl http://localhost:8001/health
# Expected: {"status": "ok"}
```

**2. Chatroom Server**
```bash
# The chatroom is file-based - no server needed
# Verify channels exist
ls .claude/chatroom/channels/
# Expected: coordination.md, research.md, implementation.md, etc.
```

**3. Research PDFs Server** (optional for Exercise 1)
```bash
# Only needed for research validation tasks
# Skip for first autonomous worker test
```

**Success check**: Agent memory server responds to health check.

### Step 3: Initialize Agent Memories

```bash
# Create memory files for core agents
node scripts/initializeAgentMemories.js

# Verify memories exist
ls .claude/agents/memories/
# Expected: orchestrator-memory.json, architect-memory.json, etc.
```

**What this does**: Creates initial memory JSON files so agents have continuity from their first spawn.

---

## Part 2: Deploy Autonomous Worker

### Step 4: Review the Roadmap

Before deploying the worker, see what's queued:

```bash
# Open the master roadmap
cat plans/MASTER_IMPLEMENTATION_ROADMAP.md | head -50
```

**Look for:**
- **CRITICAL** tasks (highest priority)
- Tasks marked `[READY]` (research complete, no blockers)
- Recent additions (toward the top)

**Your mission**: Let the autonomous worker pick the next task and complete it.

### Step 5: Start the Autonomous Worker

The autonomous worker is a background process that:
1. Monitors chatroom channels
2. Reads the roadmap
3. Spawns appropriate specialists
4. Coordinates their work
5. Updates documentation

**Deploy it:**

```bash
# Option A: Local foreground (for learning/debugging)
npx tsx scripts/autonomousWorker.ts

# Option B: Background with logging
npx tsx scripts/autonomousWorker.ts > logs/autonomous_worker_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Option C: Remote persistent (tmux)
tmux new -s worker
npx tsx scripts/autonomousWorker.ts
# Ctrl+B, D to detach
```

**What you'll see:**

```
🤖 Autonomous Worker Starting...
📋 Reading roadmap: plans/MASTER_IMPLEMENTATION_ROADMAP.md
📊 Found 12 CRITICAL tasks, 8 HIGH tasks
🎯 Selected task: "Implement nuclear winter cascades" (CRITICAL, READY)
🔬 Spawning research phase...
  ├─ Cynthia: Finding peer-reviewed sources
  └─ Sylvia: Validating research quality
✅ Research approved (Grade: B+, 85%)
🛠️ Spawning implementation phase...
  └─ Moss: Implementing feature from research
⏳ Estimated completion: 45-60 minutes
```

**Success check**: Worker logs show task selection and agent spawning.

---

## Part 3: Observe the Workflow

### Step 6: Monitor Agent Activity

**Watch the chatroom channels:**

```bash
# Coordination channel (all agents post here)
tail -f .claude/chatroom/channels/coordination.md

# Research channel (Cynthia + Sylvia)
tail -f .claude/chatroom/channels/research.md

# Implementation channel (Moss + Roy)
tail -f .claude/chatroom/channels/implementation.md
```

**What to look for:**

```markdown
## [2025-11-05 14:23] Cynthia | STARTED
Beginning research for nuclear winter cascades feature.
Searching research-pdfs MCP for papers on:
- Nuclear detonation atmospheric effects
- Temperature drop mechanisms
- Agricultural collapse timelines

## [2025-11-05 14:45] Sylvia | IN-PROGRESS
Reviewing Cynthia's findings. Found 3 sources:
- Robock et al. 2007 (nuclear winter modeling)
- Mills et al. 2014 (updated climate projections)
- Xia et al. 2022 (modern casualty estimates)

Verifying quantitative claims...

## [2025-11-05 15:12] Sylvia | COMPLETED
Research validation complete. Grade: B+ (85%)
- 0 fabrications (✅)
- 2 magnitude adjustments needed (Robock 15°C → 10-20°C range)
- All sources verified via research-pdfs MCP
Approved for implementation.

## [2025-11-05 15:15] Moss | STARTED
Reading research file: research/nuclear_winter_cascades_20251105.md
Implementing in: src/simulation/engine/phases/NuclearWinterPhase.ts
Estimated time: 30-45 minutes
```

**Pattern**: `STARTED → IN-PROGRESS → COMPLETED` status progression.

### Step 7: Check Agent Memory

Agents save learnings as they work:

```bash
# View Sylvia's recent memory
node scripts/recallAgentMemory.js sylvia

# Expected output:
# Recent Tasks (last 3):
# - Validated nuclear winter research (3 sources, Grade B+)
# - Found magnitude error in Robock citation (15°C → 10-20°C)
# Recent Learnings:
# - Nuclear winter research has high uncertainty ranges (±50%)
# - Climate models from 2007 vs 2022 show refinement over time
```

**Why this matters**: Memory ensures agents don't rediscover the same patterns every session.

---

## Part 4: Validate Completion

### Step 8: Quality Gate Checks

When implementation completes, the autonomous worker runs quality gates:

**Gate 1: Research Validation** (already passed in Step 6)
- Dual-agent review (Cynthia + Sylvia)
- Grade: B+ or better required

**Gate 2: Architecture Review**
```
## [2025-11-05 16:30] Architecture-Skeptic | STARTED
Reviewing implementation: src/simulation/engine/phases/NuclearWinterPhase.ts

Found issues:
- [MEDIUM] Consider caching temperature calculations
- [LOW] Add JSDoc comments for public methods

Verdict: APPROVED (no CRITICAL/HIGH issues)
```

**Gate 3: Monte Carlo Validation** (if simulation code changed)
```bash
# Autonomous worker runs this automatically
npx tsx scripts/monteCarloSimulation.ts \
  --runs 10 \
  --scenarios baseline \
  --output logs/mc_validation_$(date +%Y%m%d).log

# Success: No crashes, outcomes in expected ranges
```

**Success criteria:**
- ✅ All quality gates pass
- ✅ No CRITICAL or HIGH architecture issues
- ✅ Monte Carlo runs complete without crashes
- ✅ Documentation updated (wiki, roadmap)

### Step 9: Review Deliverables

Check what the autonomous worker produced:

**1. Feature Implementation**
```bash
# New/modified simulation code
git diff src/simulation/engine/phases/
```

**2. Research Documentation**
```bash
# Research file backing the feature
cat research/nuclear_winter_cascades_20251105.md
```

**3. Wiki Updates**
```bash
# Documentation explaining the new system
grep -A 10 "Nuclear Winter" docs/wiki/README.md
```

**4. Roadmap Updates**
```bash
# Task moved from active to completed
git diff plans/MASTER_IMPLEMENTATION_ROADMAP.md
git log plans/completed/
```

**5. Agent Memory**
```bash
# Learnings saved for future sessions
node scripts/recallAgentMemory.js architect
# Should show: "Archived nuclear winter cascades feature..."
```

---

## Part 5: Your Turn - Next Task

### Step 10: Deploy for the Next Roadmap Task

Now that you've observed one complete workflow, deploy the worker again:

```bash
# The worker will automatically pick the next task
npx tsx scripts/autonomousWorker.ts > logs/autonomous_worker_round2_$(date +%Y%m%d).log 2>&1 &

# Monitor in another terminal
tail -f logs/autonomous_worker_round2_*.log
```

**Your job:**
1. Observe (don't intervene unless ALERT posted to coordination channel)
2. Validate quality gates pass
3. Review deliverables
4. Learn the patterns

**You are done when:**
- Second task completes autonomously
- All quality gates pass
- Documentation updated
- You can explain the workflow to someone else

---

## Success Criteria

**You have completed Exercise 1 when:**

- ✅ Autonomous worker running (local or remote)
- ✅ At least 1 roadmap task completed autonomously
- ✅ Quality gates passed (research validation + architecture review)
- ✅ Deliverables produced (code + research + docs)
- ✅ Agent memories updated (learnings saved)
- ✅ You can trace the workflow: roadmap → research → validation → implementation → review → documentation

**Bonus (optional):**
- ✅ Deploy to remote VM with cron (24/7 operation)
- ✅ Monitor via Matrix channels (real-time notifications)
- ✅ Complete 3+ tasks in single session (parallel workflows)

---

## Troubleshooting

### Worker Not Starting

**Symptom:** `autonomousWorker.ts` crashes immediately

**Causes:**
1. Agent memory server not running
   - Fix: `python scripts/agent-memory-server.py &`
2. Chatroom channels missing
   - Fix: `mkdir -p .claude/chatroom/channels && touch .claude/chatroom/channels/{coordination,research,implementation}.md`
3. TypeScript compilation errors
   - Fix: `npx tsc --noEmit` to find errors

### Agent Gets Stuck

**Symptom:** Agent status stays "IN-PROGRESS" for 2+ hours

**Diagnosis:**
```bash
# Check what the agent is doing
tail -100 .claude/chatroom/channels/implementation.md
```

**Common causes:**
1. Waiting for user input (agent asked a question)
   - Fix: Check coordination channel, respond to question
2. Monte Carlo validation running (slow)
   - Fix: Wait (10-20 minutes for N=10 runs)
3. Agent hit an error and didn't update status
   - Fix: Check logs, restart worker if needed

### Quality Gate Fails

**Symptom:** Architecture-skeptic blocks merge with CRITICAL issues

**This is correct behavior!** The gates are working.

**What to do:**
1. Read the architecture review findings
2. Let the autonomous worker spawn Moss to fix issues
3. Re-run architecture review
4. Repeat until gates pass

**Do not bypass quality gates** - they prevent bugs.

---

## What You Learned

**Key concepts:**
1. **Autonomous workflows** - Agents coordinate without human intervention
2. **Quality gates** - Research validation + architecture review prevent defects
3. **Persistent memory** - Agents remember learnings across sessions
4. **Chatroom coordination** - Async message-passing enables multi-agent work
5. **Roadmap-driven development** - Priority-based task selection

**Patterns observed:**
- Research → Validation → Implementation → Review → Documentation
- Status transitions: STARTED → IN-PROGRESS → COMPLETED
- Quality gates BLOCK progression (not optional)
- Agent memory preserves organizational knowledge

**Skills acquired:**
- Deploy and monitor autonomous agents
- Read chatroom channels to track progress
- Validate quality gate completion
- Review multi-agent deliverables

---

## Next Steps

**Exercise 2: Build a Custom MCP Server** (Module 06)
- Create a specialized tool for agents
- Integrate with existing workflows
- Measure token efficiency improvements

**Exercise 3: Implement Dual-Agent Validation** (Module 08)
- Set up Cynthia + Sylvia research review
- Apply severity-weighted grading
- Achieve 0% fabrication rate

**Exercise 4: Deploy Remote Infrastructure** (Module 04)
- Set up VM with 24/7 autonomous worker
- Configure cron jobs
- Monitor via Matrix

---

## Related Modules

- **[03_AUTONOMOUS_WORKFLOWS.md](../03_AUTONOMOUS_WORKFLOWS.md)** - Complete workflow documentation
- **[04_REMOTE_INFRASTRUCTURE.md](../04_REMOTE_INFRASTRUCTURE.md)** - 24/7 deployment guide
- **[05_PLANNING_COORDINATION.md](../05_PLANNING_COORDINATION.md)** - Roadmap structure
- **[08_QUALITY_GATES.md](../08_QUALITY_GATES.md)** - Research + architecture validation

---

**You are ready for Exercise 2 when you can:**
- Deploy autonomous worker without referring to docs
- Explain the workflow to a peer
- Diagnose and fix common issues
- Validate quality gate completion

---

> **Sylvia**: "Exercise 1 is deceptively simple: run a script, watch agents work. But students often try to intervene. The lesson isn't the workflow - it's letting go. Trust the quality gates. Trust the agent memory. Trust the coordination. Your job is setup and observation, not implementation. When you stop trying to help and just watch, that's when you understand autonomous development."
> — *November 2025, Course Design Session*

---

*This exercise is part of the Agentic SDLC Course. For course overview, see [README.md](../README.md).*
