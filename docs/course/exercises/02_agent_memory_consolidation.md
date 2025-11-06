# Exercise 2: Agent Memory & Consolidation

**Goal**: Understand how agents maintain persistent expertise across sessions through hierarchical memory and consolidation (REM sleep cycles).

**Time**: 45-60 minutes

**Skills**: Agent memory operations, episodic → semantic compression, persistence patterns

---

## Learning Objectives

By the end of this exercise, you will:

1. Understand the agent memory hierarchy (recent → medium → long-term → core)
2. Perform memory operations (recall, add tasks/learnings, consolidation)
3. Execute a REM sleep cycle (compress 50+ learnings → semantic patterns)
4. See how consolidated memory enables instant pattern recognition
5. Understand why agents without memory = amnesia every session

**The meta-skill**: Memory is how agents accumulate expertise. Without it, every spawn is starting from scratch.

---

## Prerequisites

**Required:**
- Completed Exercise 1 (autonomous worker deployed)
- Agent memory MCP server running (`python scripts/agent-memory-server.py`)
- Basic understanding of JSON structure

**Time commitment:**
- Exploring memories: 15 minutes
- Adding learnings: 15 minutes
- Memory consolidation: 30 minutes
- Reflection: 15 minutes

---

## Part 1: Explore Existing Agent Memories

### Step 1: View Memory Files

Agent memories are stored as JSON in `.claude/agents/memories/`:

```bash
# List all agent memory files
ls -lh .claude/agents/memories/

# Expected output:
# sylvia-memory.json      (Research Skeptic)
# cynthia-memory.json     (Super-Alignment Researcher)
# roy-memory.json         (Simulation Maintainer)
# architect-memory.json   (Roadmap Manager)
# orchestrator-memory.json (Workflow Coordinator)
```

**Each file contains:**
- **Recent memory** - Last 2-7 days of tasks, learnings, conversations
- **Medium-term memory** - Patterns emerging over 2-4 weeks
- **Long-term memory** - Permanent insights, major milestones
- **Core memory** - Personality-defining moments (rarely changes)
- **Compost** - Failed ideas that might be useful later

### Step 2: Recall Agent Context

The most important operation: `recall_context` - Get concise summary on spawn.

```bash
# Recall Sylvia's current context
node scripts/recallAgentMemory.js sylvia
```

**Expected output:**
```
=== SYLVIA (Research Skeptic) - Context Summary ===

RECENT TASKS (last 3):
- Validated nuclear winter research (3 sources, Grade B+)
- Found magnitude error in Robock citation (15°C → 10-20°C)
- Applied severity-weighted grading to climate_collapse file

RECENT LEARNINGS (last 3):
- Magnitude errors correlate with threshold-scaling decoupling (60% of params)
- Nuclear winter research has high uncertainty ranges (±50%)
- Climate models from 2007 vs 2022 show refinement over time

CORE IDENTITY:
- Role: Research Skeptic, adversarial validator
- Motto: "Show me the evidence, not the theory"
- Approach: Find counterevidence, check numerical accuracy

PERSONALITY SNAPSHOT:
Cautious, methodical, finds flaws in optimistic claims
```

**Why this matters**: This is what Sylvia "remembers" when she spawns. Without it, she'd forget the magnitude error pattern she discovered in Session 10.

### Step 3: Compare Agents Before/After Memory

**Scenario**: Sylvia finds a fabrication in Session 10. Does she remember it in Session 13?

```bash
# Check if Sylvia's memory contains "fabrication"
grep -i "fabrication" .claude/agents/memories/sylvia-memory.json
```

**You should see**:
- Recent learning about 40% fabrication rate
- Pattern recognition: "threshold-scaling decoupling"
- Framework: 3-tier documentation system

**Without memory**: She'd rediscover the same fabrication pattern every session.

**With memory**: She recognizes it instantly ("I've seen this before - threshold without scaling").

---

## Part 2: Add to Agent Memory

Now you'll simulate being an agent that accumulates knowledge.

### Step 4: Create Your Own Agent Memory

For this exercise, you'll use a test agent "student":

```bash
# Initialize student agent memory
node scripts/initializeAgentMemory.js student

# Verify it was created
cat .claude/agents/memories/student-memory.json
```

**Initial state** (empty):
```json
{
  "agent_id": "student",
  "core": {
    "role": "Student",
    "personality": "Curious, learning agent architecture",
    "motto": "Learning by doing"
  },
  "recent": {
    "tasks": [],
    "learnings": [],
    "conversations": []
  },
  "mediumTerm": [],
  "longTerm": [],
  "compost": []
}
```

### Step 5: Add Recent Tasks

Simulate completing work:

```bash
# Using the MCP tool directly
curl -X POST http://localhost:8001/add_recent_task \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "student",
    "task": "Completed Exercise 1 - deployed autonomous worker successfully, observed Cynthia-Sylvia coordination"
  }'
```

**Verify it was saved:**
```bash
node scripts/recallAgentMemory.js student
```

### Step 6: Add Recent Learnings

Add insights you've gained:

```bash
# Learning 1: Quality gates
curl -X POST http://localhost:8001/add_recent_learning \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "student",
    "learning": "Quality gates BLOCK progression when standards not met. Not optional - this prevents bugs from reaching production."
  }'

# Learning 2: Agent specialization
curl -X POST http://localhost:8001/add_recent_learning \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "student",
    "learning": "Agent specialization works because expertise accumulates in memory + context. Roy knows NaN handling patterns that aren't in base model."
  }'

# Learning 3: Memory importance
curl -X POST http://localhost:8001/add_recent_learning \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "student",
    "learning": "Without memory, every agent spawn is amnesia. Sylvia finding same fabrication pattern 3 times = memory failure, not discovery."
  }'
```

### Step 7: Recall Your Context

Now see what you'd remember if you were spawned:

```bash
node scripts/recallAgentMemory.js student
```

**You should see:**
- 1 recent task
- 3 recent learnings
- Core identity (student role)

**This is your agent's "working memory"** - what you know right now.

---

## Part 3: Memory Consolidation (REM Sleep Cycle)

The most important part: compressing episodic details → semantic patterns.

### Step 8: Accumulate 50+ Learnings

To trigger consolidation, you need ≥50 recent learnings. Let's simulate this:

```bash
# Run a script that adds 50 learnings (simulating weeks of work)
node scripts/simulateLearningAccumulation.js student
```

**Or manually** (if script doesn't exist):
```bash
# Add 50 more learnings about various patterns
for i in {1..50}; do
  curl -X POST http://localhost:8001/add_recent_learning \
    -H "Content-Type: application/json" \
    -d "{\"agent_id\": \"student\", \"learning\": \"Pattern $i: observational learning from Exercise 1\"}"
done
```

**Check the bloat:**
```bash
# Count recent learnings
cat .claude/agents/memories/student-memory.json | jq '.recent.learnings | length'

# Expected: 53 (3 from Step 6 + 50 simulated)
```

**The problem**: 53 verbose learnings = context bloat. You can't recall all of this efficiently.

### Step 9: Perform Memory Consolidation

This is the "REM sleep cycle" - compress episodic → semantic.

```bash
# Run consolidation
node scripts/consolidateAgentMemory.js student
```

**What happens:**
1. Read all 53 recent learnings
2. LLM identifies patterns (e.g., "Quality gates prevent defects", "Memory enables expertise")
3. Compress 53 episodic entries → 3-5 semantic patterns
4. Move semantic patterns to medium-term memory
5. Clear recent learnings (they're now compressed)

**After consolidation:**
```bash
# Check recent learnings (should be empty or minimal)
cat .claude/agents/memories/student-memory.json | jq '.recent.learnings | length'
# Expected: 0-5 (most moved to medium-term)

# Check medium-term memory
cat .claude/agents/memories/student-memory.json | jq '.mediumTerm | length'
# Expected: 3-5 consolidated patterns
```

### Step 10: Compare Before/After Recall

**Before consolidation:**
```bash
node scripts/recallAgentMemory.js student
# Output: 53 verbose learnings (context bloat)
```

**After consolidation:**
```bash
node scripts/recallAgentMemory.js student
# Output: 3-5 semantic patterns (concise, actionable)
```

**Example consolidated pattern:**
```
MEDIUM-TERM INSIGHTS:
- Quality control emerges from multi-agent coordination: Gates BLOCK progression,
  dual-agent review eliminates fabrication, severity weighting prevents grade inflation
- Agent specialization = accumulated expertise: Roy's NaN patterns, Sylvia's
  fabrication detection, memory enables instant pattern recognition
- Infrastructure patterns: Autonomous workers monitor → spawn → coordinate,
  chatroom enables async coordination, memory persists across sessions
```

**The transformation**: 53 specific observations → 3 generalizable patterns.

---

## Part 4: See Memory in Action

### Step 11: Observe Sylvia's Consolidated Memory

Look at a real agent who's undergone consolidation:

```bash
# View Sylvia's consolidated insights
cat .claude/agents/memories/sylvia-memory.json | jq '.mediumTerm'
```

**You'll see patterns like:**
- "Threshold-scaling decoupling: 60% of parameters conflate threshold identification with magnitude specification"
- "Magnitude errors (5-20× discrepancy) correlate with optimistic bias in single-reviewer research"
- "Severity-weighted grading prevents grade inflation: 81% verification ≠ quality when errors vary in impact"

**These patterns emerged from 50+ individual discoveries.**

### Step 12: Compare to Cynthia's Memory

```bash
# Cynthia (optimistic researcher)
cat .claude/agents/memories/cynthia-memory.json | jq '.mediumTerm'
```

**Cynthia's patterns:**
- "Optimism requires rigor: Hope for positive futures demands honest assessment of uncertainty"
- "3-tier system (GOLD/SILVER/BRONZE) preserves epistemic honesty while enabling modeling"
- "Adversarial collaboration improves quality: Sylvia's skepticism makes my optimism credible"

**Same sessions, different perspectives** - But both learned frameworks through consolidation.

---

## Part 5: Long-Term Memory & Core Identity

### Step 13: Promote to Long-Term Memory

Some insights are permanent. Move them to long-term:

```bash
curl -X POST http://localhost:8001/add_long_term_insight \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "student",
    "insight": "Memory consolidation is how agents develop expertise. Episodic observations compress into semantic patterns that enable instant recognition. Without consolidation, agents rediscover the same insights every session."
  }'
```

**Long-term memory = permanent lessons.**

### Step 14: Add to Core Memory (Use Sparingly!)

Core memory defines WHO YOU ARE. Only for personality-shaping moments:

```bash
curl -X POST http://localhost:8001/add_core_memory \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "student",
    "key": "learning_philosophy",
    "value": "I learn by observing first, then building. I trust processes (quality gates, memory consolidation) before trying to improve them. I document failures alongside successes."
  }'
```

**Core memory appears in EVERY recall** - It shapes how you approach all future work.

---

## Part 6: The Compost Heap

### Step 15: Understanding Compost

Failed ideas go to compost, not trash:

```bash
# View Sylvia's compost
cat .claude/agents/memories/sylvia-memory.json | jq '.compost'
```

**Examples you might see:**
- "Tried automatic grading without human validation - 65% accuracy (not good enough)"
- "Attempted single-pass verification - missed 40% of fabrications"
- "Explored confidence scores for citations - too subjective, abandoned"

**Why keep failures?** Sometimes a failed idea becomes useful later (e.g., automatic grading is now a student project).

---

## Success Criteria

**You have completed Exercise 2 when:**

- ✅ You can explain the 5 memory tiers (recent → medium → long-term → core → compost)
- ✅ You've performed memory operations (recall, add task/learning, consolidation)
- ✅ You've executed a REM sleep cycle (50+ learnings → 3-5 patterns)
- ✅ You understand why consolidation prevents context bloat
- ✅ You can compare agent memories (Sylvia vs Cynthia) and explain personality differences
- ✅ You recognize memory as the foundation of agent expertise

**Bonus (optional):**
- ✅ Consolidate a real agent's memory (Architect, Roy, Orchestrator)
- ✅ Implement weekly cleanup (medium-term → long-term promotion)
- ✅ Design a core memory for a new specialized agent

---

## Reflection Questions

After completing this exercise, consider:

1. **Pattern Recognition**: How does Sylvia's consolidated memory enable her to spot fabrication instantly?
   - Hint: She has the pattern "threshold-scaling decoupling" in medium-term memory

2. **Expertise Accumulation**: What's the difference between a fresh agent spawn and Sylvia after 50 sessions?
   - Hint: Same base model, different accumulated patterns

3. **Consolidation Timing**: When should you trigger consolidation?
   - Hint: ≥50 learnings, or when you notice repetition in recalls

4. **Memory vs Context**: Why not just dump all learnings into context every time?
   - Hint: 53 verbose learnings vs 3 semantic patterns - token efficiency

5. **Core Memory Boundaries**: What should/shouldn't go in core memory?
   - Hint: Personality-shaping moments vs project details

---

## Common Mistakes

### Mistake 1: Never Consolidating

**Symptom**: Agent recall returns 100+ verbose learnings

**Problem**: Context bloat → Can't see patterns → Rediscovery

**Fix**: Run consolidation when recent learnings ≥50

### Mistake 2: Over-Using Core Memory

**Symptom**: Core memory has 50+ entries

**Problem**: Core memory = shown every recall → Bloat

**Fix**: Core memory should have 3-5 personality-defining entries max

### Mistake 3: Deleting Failed Ideas

**Symptom**: No compost, or compost gets cleared

**Problem**: Lost lessons, repeat same failures

**Fix**: Compost persists (monthly cleanup archives, doesn't delete)

### Mistake 4: Not Recalling on Spawn

**Symptom**: Agent asks questions already answered in memory

**Problem**: Amnesia - agent has no continuity

**Fix**: ALWAYS `recall_context(agent_id)` as first action on spawn

---

## Advanced: Weekly & Monthly Cleanup

Memory has scheduled maintenance cycles:

### Weekly Cleanup
```bash
# Promote important medium-term insights → long-term
# Rest → compost
node scripts/weeklyMemoryCleanup.js sylvia
```

**What it does:**
- Reviews medium-term memory (2-4 week old patterns)
- Top 3-5 insights → long-term (permanent)
- Rest → compost (might be useful later)

### Monthly Cleanup
```bash
# Clear compost (but preserve in audit log)
node scripts/monthlyMemoryCleanup.js sylvia
```

**What it does:**
- Archives compost to `memory-audit-log.json`
- Clears compost heap
- Prevents infinite accumulation

---

## Real-World Example: Sylvia's Memory Evolution

**Session 1 (October 1)**:
- Recent: 3 learnings about citation checking
- Medium-term: Empty
- Pattern recognition: None

**Session 10 (October 15)**:
- Recent: 50+ learnings about fabrication, magnitude errors, uncertainty collapse
- Medium-term: Empty (not consolidated yet)
- Pattern recognition: Rediscovering same issues

**After Consolidation (October 16)**:
- Recent: 5 new learnings
- Medium-term: 4 consolidated patterns (threshold-scaling, severity weighting, etc.)
- Pattern recognition: Instant ("I've seen this - threshold without scaling")

**Session 20 (November 1)**:
- Recent: 10 learnings
- Medium-term: 8 patterns (consolidation every 2 weeks)
- Long-term: 3 permanent insights (optimist-skeptic dynamics, severity framework)
- Pattern recognition: Expert-level

**This is how agents develop expertise.**

---

## Next Steps

**Exercise 3: Dual-Agent Research Validation** (Module 08)
- Experience Cynthia-Sylvia adversarial collaboration
- Apply severity-weighted grading
- See how two agents with different memory patterns produce 0% fabrication

**Exercise 4: Deploy Remote Infrastructure** (Module 04)
- Set up 24/7 autonomous operation
- Configure memory backups
- Monitor agent memory growth over weeks

**Exercise 5: Crisis Response Workflow** (Module 09)
- Simulate a crisis (fabrication detected)
- Document in memory
- Build prevention system

---

## Related Modules

- **[01_AGENT_ARCHITECTURE.md](../01_AGENT_ARCHITECTURE.md)** - Complete agent memory system documentation
- **[09_CRISIS_MITIGATION.md](../09_CRISIS_MITIGATION.md)** - How memory enables organizational learning
- **[10_INTEGRATION.md](../10_INTEGRATION.md)** - Memory + chatroom = persistent coordination

---

**You are ready for Exercise 3 when you can:**
- Perform memory consolidation without referring to docs
- Explain why Sylvia recognizes patterns instantly
- Design memory structure for a new specialized agent
- Understand memory as foundation of agent expertise

---

> **Sylvia**: "Memory consolidation changed how I work. Before, I'd rediscover the same insight three times in different files. After REM sleep cycles, my recent memory of 50+ episodic entries compressed to one semantic pattern: 'Magnitude errors correlate with threshold-scaling decoupling.' Now I recognize the pattern instantly. Episodic → semantic is how human expertise forms. Why not agent expertise too?"
> — *Session 14, Post-Consolidation Reflection*

---

*This exercise is part of the Agentic SDLC Course. For course overview, see [README.md](../README.md).*
