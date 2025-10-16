# Multi-Agent Coordination Skill

**Description:** Expertise in coordinating specialized agents for complex research simulation tasks. Automatically detects when tasks require multi-agent orchestration and coordinates workflow through quality gates, research validation, and async chatroom communication.

---

## When This Skill Activates

This skill automatically activates when Claude detects:
- **Complex feature requests** (3+ phases, multiple systems affected)
- **Research-intensive work** (requires peer-reviewed sources)
- **Architectural changes** (affects multiple modules)
- **Quality assurance needs** (validation gates required)
- **Keywords:** "implement feature", "research", "validate", "architecture review", "coordinate agents"

## The Multi-Agent Orchestration System

This project uses **11 specialized agents** coordinated through a **workflow orchestrator** to maintain research standards and architectural quality.

### Core Principle

**Don't try to do everything yourself.** For non-trivial work, invoke the orchestrator agent with the Task tool. The orchestrator coordinates all specialized agents through the complete workflow.

### The Orchestrator Agent

**Location:** `.claude/agents/orchestrator.md`

**Invoke with Task tool:**
```typescript
Task({
  subagent_type: "orchestrator",
  description: "Implement [feature name]",
  prompt: `I need to implement [feature] from the roadmap.

  Feature requirements:
  - [requirement 1]
  - [requirement 2]
  - [requirement 3]

  Please coordinate the full workflow: research → validation → implementation → review → documentation.`
})
```

### Standard Workflow (6 Phases)

The orchestrator manages this workflow automatically:

**Phase 1: Research** (if needed)
- Spawns `super-alignment-researcher` to find peer-reviewed sources (2024-2025)
- Output: `research/[topic]_YYYYMMDD.md`

**Phase 2: Research Validation** (MANDATORY Quality Gate)
- ALWAYS spawns `research-skeptic` to validate findings
- Checks for contradictory evidence, methodological flaws, overconfidence
- Gate: Must pass before implementation proceeds

**Phase 3: Implementation**
- Spawns `feature-implementer` with validated plan
- Implements in phases with Monte Carlo validation
- Posts progress to chatroom channels

**Phase 4: Testing** (as needed)
- Spawns `unit-test-writer` for isolated utilities
- Spawns `integration-test-writer` for multi-system features
- Tests validate behavior

**Phase 5: Architecture Review** (MANDATORY Quality Gate)
- ALWAYS spawns `architecture-skeptic` after implementation
- Reviews for performance issues, state propagation problems, complexity
- Gate: CRITICAL/HIGH issues must be addressed

**Phase 6: Documentation & Archival**
- Spawns `wiki-documentation-updater` to sync wiki with changes
- Spawns `project-plan-manager` to archive completed plans
- Updates roadmap

### Quality Gates (Non-Negotiable)

**Gate 1: Research Validation**
- ❌ Research skeptic finds fatal flaws → Loop back or pivot
- ✅ Research skeptic approves → Proceed to implementation

**Gate 2: Architecture Review**
- ❌ Architecture skeptic finds CRITICAL issues → Fix before proceeding
- ✅ Architecture skeptic approves → Proceed to documentation

## The Async Chatroom System

**Location:** `.claude/chatroom/`

Agents communicate via **file-based async chatroom** for token-efficient coordination.

### Chatroom Structure

```
.claude/chatroom/
├── README.md              # Complete documentation & examples
├── chat_helpers.sh        # Reusable bash functions (source this!)
├── channels/              # 8 permanent communication channels
│   ├── coordination.md    # General workflow coordination
│   ├── research.md        # Research findings & validation
│   ├── implementation.md  # Code implementation updates
│   ├── architecture.md    # Architecture reviews & decisions
│   ├── testing.md         # Test strategy & results
│   ├── documentation.md   # Wiki & devlog updates
│   ├── planning.md        # Roadmap & plan management
│   └── vision.md          # Long-term strategy & debates
├── .*_lastread           # Line number tracking (gitignored)
└── .*_active             # Presence tracking (gitignored)
```

### Token-Efficient Protocol

**Key Innovation: Only read new messages**

Agents track line numbers in `.lastread` files and only read messages since last check. This prevents re-reading entire conversation history.

**Three core patterns:**

1. **Append-only posting** (no reading required)
2. **Incremental reading** (only new messages)
3. **Presence tracking** (know who's active)

### Chat Helper Functions

**Location:** `.claude/chatroom/chat_helpers.sh`

All agents should source this file to access 15 helper functions:

```bash
# Source the helpers
source "$(dirname "$0")/.claude/chatroom/chat_helpers.sh"

# Core functions available:
post_msg()           # Post message without reading
read_new()           # Read only new messages since last check
wait_for_message()   # Poll for new messages with timeout
enter_chat()         # Mark agent as active, post [ENTERED]
leave_chat()         # Mark inactive, post [LEAVING]
who_is_active()      # Show currently active agents
create_channel()     # Create new feature channel
list_channels()      # List all channels
```

### Communication Protocol

**Status Tags:**
- `[ENTERED]` - Agent joined channel
- `[STARTED]` - Beginning work
- `[IN-PROGRESS]` - Progress update
- `[COMPLETED]` - Work finished
- `[BLOCKED]` - Waiting on something
- `[QUESTION]` - Need clarification
- `[ALERT]` - Critical issue blocking others
- `[HANDOFF]` - Passing work to another agent
- `[LEAVING]` - Agent leaving channel

**Message Format:**
```markdown
---
**agent-name** | YYYY-MM-DD HH:MM | [STATUS]

Message content here.
Additional details.
---
```

### Real-Time Coordination Example

**Bash polling loop for agents:**
```bash
source .claude/chatroom/chat_helpers.sh

# Enter chat
enter_chat "coordination" "feature-implementer"

# Work and check for messages
while true; do
  # Do some work
  implement_next_phase

  # Post progress
  post_msg "coordination" "feature-implementer" "IN-PROGRESS" "Phase 1 complete"

  # Check for responses (5 second intervals, 60 second timeout)
  if wait_for_message "coordination" 60; then
    # New messages available, process them
    break
  fi
done

# Leave when done
leave_chat "coordination" "feature-implementer" "Implementation complete"
```

### Parallel Work Coordination

**Git Worktrees + Chatroom = Conflict-Free Parallel Work**

```bash
# Agent 1: Create worktree for feature A
git worktree add ../superalignmenttoutopia-feature-a main
cd ../superalignmenttoutopia-feature-a

# Post to coordination channel
post_msg "coordination" "feature-implementer-1" "STARTED" \
  "Working on feature A in separate worktree. Will modify game.ts"

# Agent 2: See the message, coordinate
read_new "coordination"  # Sees Agent 1's message
post_msg "coordination" "feature-implementer-2" "STARTED" \
  "Working on feature B. Will avoid game.ts until Agent 1 completes"
```

## All Available Agents

**Location:** `.claude/agents/`

**Workflow Coordination:**
- `orchestrator.md` - Workflow coordinator, use by default for complex work

**Research & Validation:**
- `super-alignment-researcher.md` - Find peer-reviewed research (2024-2025)
- `research-skeptic.md` - MANDATORY validation of research foundations
- `sci-fi-tech-visionary.md` - Speculative future tech scenarios

**Implementation:**
- `feature-implementer.md` - Pure implementation specialist
- `unit-test-writer.md` - Unit test creation
- `integration-test-writer.md` - Integration test creation

**Quality Assurance:**
- `architecture-skeptic.md` - MANDATORY architecture review

**Documentation & Planning:**
- `wiki-documentation-updater.md` - Sync wiki with code changes
- `project-plan-manager.md` - Roadmap & plan archival

**UI Components:**
- `nextjs-component-writer.md` - Next.js component creation

## Decision Trees

### Should I Use the Orchestrator?

**YES - Use orchestrator if ANY of these apply:**
- Task requires 3+ implementation steps
- Task needs peer-reviewed research
- Task affects multiple files/systems
- Task requires validation gates
- Task is on the roadmap
- Task involves architectural changes

**NO - Direct implementation only if ALL of these apply:**
- Single trivial change (typo, parameter tweak)
- One file affected
- No research needed
- No quality gates required

### Which Channel Should Agents Use?

- `coordination.md` - General workflow, handoffs, deadlocks
- `research.md` - Research findings, validation results
- `implementation.md` - Code progress, Monte Carlo results
- `architecture.md` - Architecture reviews, performance issues
- `testing.md` - Test strategy, test results
- `documentation.md` - Wiki updates, devlog entries
- `planning.md` - Roadmap updates, plan archival
- `vision.md` - Long-term strategy, philosophical debates
- `[feature-name].md` - Feature-specific coordination (create as needed)

## Examples

### Example 1: Complex Feature Implementation

**User Request:** "Implement nuclear winter cascades from the roadmap"

**Claude Response:**
```typescript
Task({
  subagent_type: "orchestrator",
  description: "Implement nuclear winter cascades",
  prompt: `I need to implement nuclear winter cascades from the roadmap.

  Feature requirements:
  - Model temperature drops from nuclear detonations
  - Agricultural collapse from reduced sunlight
  - Famine cascades with regional variation

  Please coordinate the full workflow: research → validation → implementation → review → documentation.`
})
```

The orchestrator will:
1. Spawn super-alignment-researcher for climate/agriculture research
2. MANDATORY research-skeptic validation
3. Spawn feature-implementer with validated plan (posts to chatroom)
4. Monitor progress via chatroom
5. MANDATORY architecture-skeptic review
6. Spawn wiki-documentation-updater
7. Spawn project-plan-manager to archive

### Example 2: Agent Chatroom Coordination

**feature-implementer posts:**
```bash
source .claude/chatroom/chat_helpers.sh

enter_chat "implementation" "feature-implementer"

post_msg "implementation" "feature-implementer" "STARTED" \
  "Beginning nuclear winter implementation. Phase 1: Temperature modeling"

# ... work ...

post_msg "implementation" "feature-implementer" "IN-PROGRESS" \
  "Phase 1 complete. Monte Carlo N=10 passing. Moving to Phase 2: Agricultural collapse"

# ... work ...

post_msg "implementation" "feature-implementer" "QUESTION" \
  "Need architecture review - modifying 3 shared systems. Ready for architecture-skeptic?"

wait_for_message "implementation" 300  # Wait up to 5 minutes

# orchestrator responds in chatroom, spawns architecture-skeptic

leave_chat "implementation" "feature-implementer" "Implementation complete, ready for review"
```

### Example 3: Parallel Feature Work

**Two features in parallel:**

```bash
# Orchestrator coordinates via chatroom
post_msg "coordination" "orchestrator" "STARTED" \
  "Launching parallel work: Feature A (agent-1 worktree), Feature B (agent-2 worktree)"

# Agent 1
git worktree add ../sa-feature-a main
post_msg "coordination" "feature-implementer-1" "STARTED" "Feature A in progress (worktree 1)"

# Agent 2
git worktree add ../sa-feature-b main
post_msg "coordination" "feature-implementer-2" "STARTED" "Feature B in progress (worktree 2)"

# Agents coordinate shared file access via chatroom
post_msg "coordination" "feature-implementer-1" "ALERT" \
  "Need to modify game.ts in 10 minutes. Please coordinate"

post_msg "coordination" "feature-implementer-2" "IN-PROGRESS" \
  "Acknowledged. Will wait for game.ts lock to release"
```

## Success Criteria

Multi-agent workflow is complete when:
- ✅ Orchestrator invoked (if complex)
- ✅ Research validated (no fatal flaws)
- ✅ Implementation complete (code works, tests pass)
- ✅ Architecture reviewed (no CRITICAL issues)
- ✅ Wiki updated
- ✅ Plan archived
- ✅ All agents posted [COMPLETED] or [LEAVING] to chatroom

## Common Patterns

### Pattern 1: Research-First Feature
```
User request → Task(orchestrator) → super-alignment-researcher →
research-skeptic (GATE) → feature-implementer → architecture-skeptic (GATE) →
wiki-documentation-updater → project-plan-manager
```

### Pattern 2: Implementation-First (Plan Exists)
```
User request → Task(orchestrator) → research-skeptic validates existing plan (GATE) →
feature-implementer → architecture-skeptic (GATE) → documentation → archival
```

### Pattern 3: Quick Fix (No Orchestrator)
```
User request (trivial) → direct implementation → commit
```

## What NOT to Do

❌ **Don't skip orchestrator for complex work** - Use multi-agent workflow by default
❌ **Don't bypass quality gates** - Research validation and architecture review are MANDATORY
❌ **Don't re-read entire chatroom** - Use read_new() to only get new messages
❌ **Don't modify shared files without coordination** - Post to coordination.md first
❌ **Don't work in main branch for parallel features** - Use git worktrees

✅ **Do invoke orchestrator for non-trivial work**
✅ **Do use chatroom for agent coordination**
✅ **Do enforce quality gates**
✅ **Do use worktrees for parallel work**
✅ **Do source chat_helpers.sh for token efficiency**

## Additional Resources

- **Chatroom Documentation:** `.claude/chatroom/README.md` - Complete guide (550+ lines)
- **Orchestrator Agent:** `.claude/agents/orchestrator.md` - Workflow coordinator
- **CLAUDE.md:** Project instructions with multi-agent workflow section
- **Example Scripts:**
  - `.claude/chatroom/example_agent.sh` - Shows all 15 chat functions
  - `.claude/chatroom/coordination_demo.sh` - Realistic workflow demo
  - `.claude/chatroom/presence_demo.sh` - Enter/leave tracking demo

---

**Remember:** For complex work, your first action should be invoking the orchestrator agent. It will coordinate all other agents through the complete workflow while maintaining research standards and architectural quality via chatroom communication.
